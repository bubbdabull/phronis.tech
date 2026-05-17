import { NextResponse } from "next/server";
import { z } from "zod";

import { buildRugScan } from "@/_lib/desk/build-rug-scan";
import { requireDeskMember } from "@/_lib/desk/desk-member-auth";
import { checkRateLimit } from "@/_lib/rate-limit-memory";

const bodySchema = z.object({
  mint: z.string().trim().min(32).max(64),
});

/** GET recent cached rug scans (global). POST runs live scan and persists token_risk_scores. */
export async function GET(request: Request) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;

  const url = new URL(request.url);
  const limit = Math.min(80, Math.max(1, Number(url.searchParams.get("limit")) || 40));

  const { data, error } = await ctx.supabase
    .from("token_risk_scores")
    .select("id,mint_address,rug_probability,threat_level,signals,computed_at")
    .order("computed_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  return NextResponse.json({ ok: true, scans: data ?? [] });
}

export async function POST(request: Request) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`desk_rug_scan:${ip}:${ctx.privyUserId}`, 25, 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });

  try {
    const result = await buildRugScan(parsed.data.mint);
    const { data: row, error } = await ctx.supabase
      .from("token_risk_scores")
      .insert({
        mint_address: result.mint,
        rug_probability: result.rugProbabilityPct,
        threat_level: result.threatLevel,
        signals: {
          warnings: result.warnings,
          metrics: result.signals,
          mintAuthorityRelinquished: result.mintAuthorityRelinquished,
          freezeAuthorityEnabled: result.freezeAuthorityEnabled,
          dexLiquidityUsd: result.dexLiquidityUsd,
        },
      })
      .select("id,computed_at")
      .single();
    if (error && process.env.NODE_ENV !== "production") console.error("[rug-scan insert]", error);
    return NextResponse.json({ ok: true, result, persisted: row ?? null });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("[api/desk/rug-scan]", e);
    return NextResponse.json({ ok: false, error: "rug_scan_failed" }, { status: 500 });
  }
}
