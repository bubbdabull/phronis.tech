import { NextResponse } from "next/server";

import type { FeedComment, MemberLite } from "@/_lib/member-social-types";
import { friendIdsForMember } from "@/_lib/member-social-feed";
import { postCommentSchema } from "@/_lib/schemas/member-social";
import { requireMember } from "@/_lib/member-auth";

type Ctx = { params: Promise<{ id: string }> };

async function canViewPost(
  supabase: Parameters<typeof friendIdsForMember>[0],
  postId: string,
  viewerId: string,
): Promise<boolean> {
  const { data: post } = await supabase
    .from("social_posts")
    .select("member_id, visibility")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return false;
  if (post.member_id === viewerId) return true;
  if (post.visibility === "public") return true;
  const friends = await friendIdsForMember(supabase, viewerId);
  return post.visibility === "friends" && friends.includes(post.member_id);
}

export async function GET(request: Request, context: Ctx) {
  const auth = await requireMember(request, { l3Route: "members_social_comments", l3Kind: "read" });
  if (auth instanceof NextResponse) return auth;

  const { id: postId } = await context.params;
  const { supabase, member } = auth;

  if (!(await canViewPost(supabase, postId, member.id))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { data: rows, error } = await supabase
    .from("social_post_comments")
    .select("id, post_id, member_id, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const authorIds = [...new Set((rows ?? []).map((r) => r.member_id))];
  const { data: authors } = authorIds.length
    ? await supabase.from("members").select("id, username, display_name, avatar_url, membership_tier").in("id", authorIds)
    : { data: [] };

  const authorMap = new Map((authors ?? []).map((a) => [a.id, a as MemberLite]));

  const comments: FeedComment[] = (rows ?? []).map((r) => ({
    ...r,
    author: authorMap.get(r.member_id) ?? {
      id: r.member_id,
      username: null,
      display_name: null,
      avatar_url: null,
      membership_tier: null,
    },
  }));

  return NextResponse.json({ ok: true, comments });
}

export async function POST(request: Request, context: Ctx) {
  const auth = await requireMember(request, { l3Route: "members_social_comments_post", l3Kind: "write" });
  if (auth instanceof NextResponse) return auth;

  const { id: postId } = await context.params;
  const { supabase, member } = auth;

  if (!(await canViewPost(supabase, postId, member.id))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = postCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });
  }

  const { data: inserted, error } = await supabase
    .from("social_post_comments")
    .insert({ post_id: postId, member_id: member.id, body: parsed.data.body })
    .select("id, post_id, member_id, body, created_at")
    .single();

  if (error || !inserted) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const { data: author } = await supabase
    .from("members")
    .select("id, username, display_name, avatar_url, membership_tier")
    .eq("id", member.id)
    .single();

  const comment: FeedComment = {
    ...inserted,
    author: (author as MemberLite) ?? {
      id: member.id,
      username: null,
      display_name: null,
      avatar_url: null,
      membership_tier: null,
    },
  };

  return NextResponse.json({ ok: true, comment });
}
