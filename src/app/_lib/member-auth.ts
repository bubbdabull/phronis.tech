import { NextResponse } from "next/server";

import type { MemberRow } from "@/_types/onboarding";
import { memberL3RateLimit, type MemberL3Kind } from "@/_lib/member-api-l3";
import { getPrivyServerClient } from "@/_lib/privy-server";
import { getBearerToken, verifyPrivyAccessToken } from "@/_lib/privy-verify-bearer";
import { getSupabaseAdmin } from "@/_lib/supabase-admin";

export type PrivySessionOk = {
  privy: NonNullable<ReturnType<typeof getPrivyServerClient>>;
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>;
  userId: string;
};

export type MemberAuthOk = {
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>;
  member: MemberRow;
};

export type RequireMemberOptions = {
  /** Stable label for rate-limit buckets (default `member`). */
  l3Route?: string;
  l3Kind?: MemberL3Kind;
};

/** L2: Privy bearer verified + Supabase admin client available (no member row required). */
export async function requirePrivySession(request: Request): Promise<PrivySessionOk | NextResponse> {
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

  let userId: string;
  try {
    const claims = await verifyPrivyAccessToken(privy, token);
    userId = claims.userId;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 401 });
  }

  return { privy, supabase, userId };
}

/** Privy bearer + Supabase member row (503/401/404 as NextResponse). L2 + L3. */
export async function requireMember(request: Request, opts?: RequireMemberOptions): Promise<MemberAuthOk | NextResponse> {
  const base = await requirePrivySession(request);
  if (base instanceof NextResponse) return base;

  const l3Route = opts?.l3Route ?? "member";
  const l3Kind = opts?.l3Kind ?? "read";
  const rl = memberL3RateLimit(request, base.userId, l3Route, l3Kind);
  if (rl) return rl;

  const { data: member, error } = await base.supabase.from("members").select("*").eq("privy_id", base.userId).maybeSingle();
  if (error) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json({ ok: false, error: "member_not_found", hint: "Complete onboarding sync first." }, { status: 404 });
  }

  return { supabase: base.supabase, member: member as MemberRow };
}
