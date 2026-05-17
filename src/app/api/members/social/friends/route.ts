import { NextResponse } from "next/server";

import { requireMember } from "@/_lib/member-auth";

export async function GET(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_social_friends", l3Kind: "read" });
  if (auth instanceof NextResponse) return auth;

  const { supabase, member } = auth;
  const { data: rows, error } = await supabase
    .from("friendships")
    .select("id, member_a_id, member_b_id, created_at")
    .or(`member_a_id.eq.${member.id},member_b_id.eq.${member.id}`);

  if (error) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const otherIds = (rows ?? []).map((r) => (r.member_a_id === member.id ? r.member_b_id : r.member_a_id));
  if (!otherIds.length) {
    return NextResponse.json({ ok: true, friends: [] });
  }

  const { data: profiles, error: pErr } = await supabase
    .from("members")
    .select("id, username, display_name, avatar_url, membership_tier")
    .in("id", otherIds);

  if (pErr) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, friends: profiles ?? [] });
}
