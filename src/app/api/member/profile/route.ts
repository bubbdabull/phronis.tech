import { NextResponse } from "next/server";

import type { MemberProfileRow } from "@/_types/member-profile";
import { memberL3RateLimit } from "@/_lib/member-api-l3";
import { requirePrivySession } from "@/_lib/member-auth";

export async function GET(request: Request) {
  const session = await requirePrivySession(request);
  if (session instanceof NextResponse) return session;
  const rl = memberL3RateLimit(request, session.userId, "member_profile_get", "read");
  if (rl) return rl;

  const { supabase, userId } = session;
  const { data, error } = await supabase
    .from("member_profiles")
    .select("*")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    profile: (data as MemberProfileRow | null) ?? null,
  });
}
