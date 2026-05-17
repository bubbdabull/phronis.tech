import { NextResponse } from "next/server";

import { buildDeskSummary } from "@/_lib/desk/build-desk-summary";
import { getPrivyServerClient } from "@/_lib/privy-server";
import { getBearerToken, verifyPrivyAccessToken } from "@/_lib/privy-verify-bearer";
import { getSupabaseAdmin } from "@/_lib/supabase-admin";

/** GET /api/desk/summary — live desk home (DexScreener + Supabase + Helius/SOLANA RPC when configured). */
export async function GET(request: Request) {
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

  try {
    const summary = await buildDeskSummary(supabase, userId);
    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[api/desk/summary]", e);
    }
    return NextResponse.json({ ok: false, error: "desk_summary_failed" }, { status: 500 });
  }
}
