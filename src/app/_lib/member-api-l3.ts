import { NextResponse } from "next/server";

import { checkRateLimit } from "@/_lib/rate-limit-memory";

/**
 * L3 (application) controls for member APIs — abuse and burst protection.
 * L2 remains Privy bearer + server-only Supabase; L1 remains on-chain PHR/DAO checks where used.
 */

export type MemberL3Kind = "read" | "write" | "sync" | "quiz";

const LIMITS: Record<MemberL3Kind, { max: number; windowMs: number }> = {
  read: { max: 120, windowMs: 60_000 },
  write: { max: 40, windowMs: 60_000 },
  sync: { max: 20, windowMs: 60_000 },
  quiz: { max: 45, windowMs: 60_000 },
};

function clientIpKey(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return `ip:${xf.split(",")[0]?.trim() || "unknown"}`;
  const rip = request.headers.get("x-real-ip");
  if (rip) return `ip:${rip.trim()}`;
  return "ip:unknown";
}

const rateLimited = () =>
  NextResponse.json(
    { ok: false, error: "rate_limited", message: "Too many requests. Please wait to try again." },
    { status: 429 },
  );

/**
 * Per-IP ceiling (even before user id) + per-user per-route limits after auth.
 * `route` should be stable (e.g. `members_me`, `onboarding_sync`).
 */
export function memberL3RateLimit(request: Request, privyUserId: string, route: string, kind: MemberL3Kind): NextResponse | null {
  const ip = clientIpKey(request);
  if (!checkRateLimit(`member_l3:ip:${ip}`, 500, 60_000)) {
    return rateLimited();
  }
  const { max, windowMs } = LIMITS[kind];
  if (!checkRateLimit(`member_l3:user:${privyUserId}:${route}`, max, windowMs)) {
    return rateLimited();
  }
  return null;
}
