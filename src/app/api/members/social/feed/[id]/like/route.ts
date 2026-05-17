import { NextResponse } from "next/server";

import { requireMember } from "@/_lib/member-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Ctx) {
  const auth = await requireMember(request, { l3Route: "members_social_like", l3Kind: "write" });
  if (auth instanceof NextResponse) return auth;

  const { id: postId } = await context.params;
  const { supabase, member } = auth;

  const { data: existing } = await supabase
    .from("social_post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("member_id", member.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("social_post_likes").delete().eq("post_id", postId).eq("member_id", member.id);
    return NextResponse.json({ ok: true, liked: false });
  }

  const { error } = await supabase.from("social_post_likes").insert({ post_id: postId, member_id: member.id });
  if (error) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, liked: true });
}
