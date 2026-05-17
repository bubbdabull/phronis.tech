import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDeskMember } from "@/_lib/desk/desk-member-auth";
import { checkRateLimit } from "@/_lib/rate-limit-memory";

const postSchema = z.object({
  solana_address: z.string().trim().min(32).max(64),
  display_label: z.string().max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  tags: z.array(z.string().max(40)).max(20).optional(),
});

/** List or add tracked Solana wallets for smart-wallet follow mode. */
export async function GET(request: Request) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;

  const { data, error } = await ctx.supabase
    .from("tracked_wallets")
    .select("*")
    .eq("member_id", ctx.memberId)
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const url = new URL(request.url);
  const recentFor = url.searchParams.get("recent")?.trim();
  let recentSigs: { signature: string; slot?: number; err?: string }[] = [];
  if (recentFor && recentFor.length >= 32) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`desk_wallet_recent:${ip}:${ctx.privyUserId}`, 30, 60_000)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }
    try {
      const { Connection, PublicKey } = await import("@solana/web3.js");
      const { getDeskSolanaRpcUrl } = await import("@/_lib/desk/solana-rpc");
      const rpc = getDeskSolanaRpcUrl();
      if (rpc) {
        const conn = new Connection(rpc, "confirmed");
        const sigs = await conn.getSignaturesForAddress(new PublicKey(recentFor), { limit: 8 });
        recentSigs = sigs.map((s) => ({ signature: s.signature, slot: s.slot }));
      }
    } catch {
      recentSigs = [{ signature: "", err: "Could not load recent signatures." }];
    }
  }

  return NextResponse.json({ ok: true, wallets: data ?? [], recentSigs });
}

export async function POST(request: Request) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });
  }

  try {
    const { PublicKey } = await import("@solana/web3.js");
    new PublicKey(parsed.data.solana_address);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_solana_address" }, { status: 400 });
  }

  const row = {
    member_id: ctx.memberId,
    solana_address: parsed.data.solana_address,
    display_label: parsed.data.display_label ?? null,
    notes: parsed.data.notes ?? null,
    tags: parsed.data.tags ?? [],
  };

  const { data, error } = await ctx.supabase.from("tracked_wallets").insert(row).select("*").single();
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: false, error: "already_tracked" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, wallet: data });
}
