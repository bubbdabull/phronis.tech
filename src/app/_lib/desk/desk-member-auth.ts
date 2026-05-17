import { NextResponse } from "next/server";

import { getPrivyServerClient } from "@/_lib/privy-server";
import { getBearerToken, verifyPrivyAccessToken } from "@/_lib/privy-verify-bearer";
import { getSupabaseAdmin } from "@/_lib/supabase-admin";
import type { MemberRow } from "@/_types/onboarding";
import type { SupabaseClient } from "@supabase/supabase-js";

export type DeskAuthContext = {
  privyUserId: string;
  memberId: string;
  member: MemberRow;
  supabase: SupabaseClient;
};

/** Privy JWT + Supabase member row (Terminal APIs require onboarding). */
export async function requireDeskMember(request: Request): Promise<DeskAuthContext | NextResponse> {
  const privy = getPrivyServerClient();
  const supabase = getSupabaseAdmin();
  if (!privy) {
    return NextResponse.json({ ok: false, error: "privy_server_not_configured" }, { status: 503 });
  }
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" }, { status: 503 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ ok: false, error: "missing_authorization" }, { status: 401 });
  }

  let privyUserId: string;
  try {
    const claims = await verifyPrivyAccessToken(privy, token);
    privyUserId = claims.userId;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 401 });
  }

  const { data: member, error } = await supabase.from("members").select("*").eq("privy_id", privyUserId).maybeSingle();
  if (error || !member) {
    return NextResponse.json(
      {
        ok: false,
        error: "member_required",
        message: "Finish onboarding (Welcome) so a member record exists before using the desk.",
      },
      { status: 400 },
    );
  }

  return {
    privyUserId,
    memberId: member.id,
    member: member as MemberRow,
    supabase,
  };
}
