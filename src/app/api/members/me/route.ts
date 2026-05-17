import { NextResponse } from "next/server";

import type { MemberRow, TransactionRow, WalletRow } from "@/_types/onboarding";
import { memberL3RateLimit } from "@/_lib/member-api-l3";
import { requirePrivySession } from "@/_lib/member-auth";

/** Maps PostgREST / Postgres errors from `members` select to a stable client `error` code. */
function memberSelectErrorCode(err: { code?: string; message?: string }): string {
  if (err.code === "PGRST116") return "member_multiple_rows";
  const msg = (err.message ?? "").toLowerCase();
  if (err.code === "42P01" || msg.includes("does not exist")) {
    return "member_table_missing";
  }
  if (msg.includes("invalid api key") || (msg.includes("jwt") && msg.includes("invalid"))) {
    return "supabase_invalid_api_key";
  }
  return "database_error";
}

export async function GET(request: Request) {
  const session = await requirePrivySession(request);
  if (session instanceof NextResponse) return session;
  const rl = memberL3RateLimit(request, session.userId, "members_me", "read");
  if (rl) return rl;

  const { supabase, userId } = session;

  const { data: member, error: mErr } = await supabase.from("members").select("*").eq("privy_id", userId).maybeSingle();
  if (mErr) {
    const code = memberSelectErrorCode(mErr);
    if (process.env.NODE_ENV !== "production") {
      console.error("[api/members/me] members select failed", { userId, supabaseCode: mErr.code, message: mErr.message });
    }
    return NextResponse.json(
      {
        ok: false,
        error: code,
        ...(process.env.NODE_ENV !== "production" ? { debug: mErr.message } : {}),
      },
      { status: 500 },
    );
  }

  if (!member) {
    return NextResponse.json({ ok: true, member: null, wallets: [], transactions: [] });
  }

  const { data: walletsRaw } = await supabase.from("wallets").select("*").eq("member_id", member.id);
  const memberWallet = String((member as MemberRow).wallet_address ?? "").trim();
  const wallets = [...(walletsRaw ?? [])].sort((a, b) => {
    const ap = a.wallet_address === memberWallet ? 1 : 0;
    const bp = b.wallet_address === memberWallet ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return Number(b.phronis_balance) - Number(a.phronis_balance);
  });
  const addrs = wallets.map((w) => w.wallet_address);
  let transactions: TransactionRow[] = [];
  if (addrs.length) {
    const { data: txs } = await supabase
      .from("transactions")
      .select("*")
      .in("wallet_address", addrs)
      .order("created_at", { ascending: false })
      .limit(50);
    transactions = (txs ?? []) as TransactionRow[];
  }

  return NextResponse.json({
    ok: true,
    member: member as MemberRow,
    wallets: (wallets ?? []) as WalletRow[],
    transactions,
  });
}
