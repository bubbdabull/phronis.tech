import { NextResponse } from "next/server";

import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";
import { memberL3RateLimit } from "@/_lib/member-api-l3";
import { requirePrivySession } from "@/_lib/member-auth";
import { fetchWalletBalances } from "@/_lib/solana/balances";

function minPhrForDao(): number {
  const raw = process.env.NEXT_PUBLIC_DAO_MIN_PHR_BALANCE ?? "0";
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function GET(request: Request) {
  const session = await requirePrivySession(request);
  if (session instanceof NextResponse) return session;
  const rl = memberL3RateLimit(request, session.userId, "dao_access", "read");
  if (rl) return rl;

  const { supabase, userId } = session;
  const { data: member } = await supabase.from("members").select("id, wallet_address").eq("privy_id", userId).maybeSingle();
  if (!member?.wallet_address) {
    return NextResponse.json({
      ok: true,
      allowed: false,
      reason: "no_wallet",
      phronisBalance: 0,
      minRequired: minPhrForDao(),
    });
  }

  const mint = getPhrDaoTokenMint();
  const balances = await fetchWalletBalances(member.wallet_address, mint);
  const minReq = minPhrForDao();
  const allowed = balances.phronis >= minReq;

  return NextResponse.json({
    ok: true,
    allowed,
    phronisBalance: balances.phronis,
    minRequired: minReq,
    walletAddress: member.wallet_address,
  });
}
