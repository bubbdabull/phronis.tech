import { NextResponse } from "next/server";
import { z } from "zod";

import { buildDeskAnalyze } from "@/_lib/desk/build-desk-analyze";
import { getPrivyServerClient } from "@/_lib/privy-server";
import { getBearerToken, verifyPrivyAccessToken } from "@/_lib/privy-verify-bearer";
import { checkRateLimit } from "@/_lib/rate-limit-memory";

const bodySchema = z.object({
  mint: z.string().trim().min(32).max(64),
});

/**
 * POST /api/desk/analyze — live CA read from DexScreener (+ Birdeye when BIRDEYE_API_KEY is set).
 * Rate-limited per IP + user.
 */
export async function POST(request: Request) {
  const privy = getPrivyServerClient();
  if (!privy) {
    return NextResponse.json({ ok: false, error: "privy_server_not_configured" }, { status: 503 });
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

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`desk_analyze:${ip}:${userId}`, 20, 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });
  }

  try {
    const result = await buildDeskAnalyze(parsed.data.mint);
    if (!result) {
      return NextResponse.json(
        { ok: false, error: "no_market_data", message: "No DexScreener pairs and no Birdeye overview for this mint." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[api/desk/analyze]", e);
    }
    return NextResponse.json({ ok: false, error: "analyze_failed" }, { status: 500 });
  }
}
