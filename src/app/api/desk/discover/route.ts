import { NextResponse } from "next/server";

import { dexscreenerSearchPairs } from "@/_lib/desk/dexscreener";
import { requireDeskMember } from "@/_lib/desk/desk-member-auth";
import { checkRateLimit } from "@/_lib/rate-limit-memory";

/** DexScreener search (Solana pairs), sorted by 24h volume. */
export async function GET(request: Request) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`desk_discover:${ip}:${ctx.privyUserId}`, 40, 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ ok: false, error: "query_too_short" }, { status: 400 });
  }

  try {
    const pairs = await dexscreenerSearchPairs(q, 30);
    return NextResponse.json({ ok: true, pairs });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("[api/desk/discover]", e);
    return NextResponse.json({ ok: false, error: "discover_failed" }, { status: 500 });
  }
}
