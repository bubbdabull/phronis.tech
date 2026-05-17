import { NextResponse } from "next/server";

import { requireMember } from "@/_lib/member-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Ctx) {
  const auth = await requireMember(request, { l3Route: "members_social_groups_join", l3Kind: "write" });
  if (auth instanceof NextResponse) return auth;

  const { id: groupId } = await context.params;
  if (!groupId) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  const { supabase, member } = auth;
  const { data: g } = await supabase.from("study_groups").select("id").eq("id", groupId).maybeSingle();
  if (!g) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("study_group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("member_id", member.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, joined: true });
  }

  const { error } = await supabase.from("study_group_members").insert({
    group_id: groupId,
    member_id: member.id,
    role: "member",
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, joined: true });
}
