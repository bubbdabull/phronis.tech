import { NextResponse } from "next/server";

import { friendIdsForMember, enrichPosts } from "@/_lib/member-social-feed";
import { postCreateSchema } from "@/_lib/schemas/member-social";
import { requireMember } from "@/_lib/member-auth";

export async function GET(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_social_feed", l3Kind: "read" });
  if (auth instanceof NextResponse) return auth;

  const { supabase, member } = auth;
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit")) || 20));

  const friendIds = await friendIdsForMember(supabase, member.id);
  const visibleAuthors = [member.id, ...friendIds];

  let q = supabase
    .from("social_posts")
    .select("id, member_id, body, visibility, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    q = q.lt("created_at", cursor);
  }

  const { data: raw, error } = await q;
  if (error) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const filtered = (raw ?? []).filter((p) => {
    if (p.member_id === member.id) return true;
    if (p.visibility === "public") return true;
    return p.visibility === "friends" && visibleAuthors.includes(p.member_id);
  });

  const posts = await enrichPosts(supabase, filtered, member.id);
  const nextCursor = filtered.length ? filtered[filtered.length - 1].created_at : null;

  const me = {
    id: member.id,
    username: member.username,
    display_name: member.display_name,
    avatar_url: member.avatar_url,
    membership_tier: member.membership_tier,
  };

  return NextResponse.json({ ok: true, posts, nextCursor, me });
}

export async function POST(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_social_feed_post", l3Kind: "write" });
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = postCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });
  }

  const { supabase, member } = auth;
  const { data: inserted, error } = await supabase
    .from("social_posts")
    .insert({
      member_id: member.id,
      body: parsed.data.body,
      visibility: parsed.data.visibility,
    })
    .select("id, member_id, body, visibility, created_at")
    .single();

  if (error || !inserted) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const [post] = await enrichPosts(supabase, [inserted], member.id);
  return NextResponse.json({ ok: true, post });
}
