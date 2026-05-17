import { NextResponse } from "next/server";

import { requireMember } from "@/_lib/member-auth";
import { tradeLogSchema } from "@/_lib/schemas/member-social";

export async function GET(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_trades_get", l3Kind: "read" });
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 40));

  const { supabase, member } = auth;
  let q = supabase
    .from("member_trade_events")
    .select("id, wallet_address, side, signature, mint_in, mint_out, amount_note, meta, created_at")
    .eq("member_id", member.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    q = q.lt("created_at", cursor);
  }

  const { data: rows, error } = await q;
  if (error) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const list = rows ?? [];
  return NextResponse.json({
    ok: true,
    trades: list,
    nextCursor: list.length ? (list[list.length - 1].created_at as string) : null,
  });
}

export async function POST(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_trades_post", l3Kind: "write" });
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = tradeLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const { supabase, member } = auth;
  const d = parsed.data;
  const { data: inserted, error } = await supabase
    .from("member_trade_events")
    .insert({
      member_id: member.id,
      wallet_address: d.wallet_address,
      side: d.side,
      signature: d.signature ?? null,
      mint_in: d.mint_in ?? null,
      mint_out: d.mint_out ?? null,
      amount_note: d.amount_note ?? null,
      meta: d.meta ?? {},
    })
    .select("id, wallet_address, side, signature, mint_in, mint_out, amount_note, meta, created_at")
    .single();

  if (error || !inserted) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, trade: inserted });
}
