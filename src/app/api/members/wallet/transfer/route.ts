import { NextResponse } from "next/server";

import { memberL3RateLimit } from "@/_lib/member-api-l3";
import { requirePrivySession } from "@/_lib/member-auth";
import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";
import { getUsdcMint } from "@/_lib/phronis-usdc";
import { buildTransferTransactionBase64 } from "@/_lib/solana/build-transfer-transaction";
import { linkedAccountsFromPrivyUser } from "@/_lib/privy-ethereum-accounts";
import { embeddedSolanaFromPrivyUser } from "@/_lib/privy-solana-accounts";

function isSolanaAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim());
}

export async function POST(request: Request) {
  const session = await requirePrivySession(request);
  if (session instanceof NextResponse) return session;
  const rl = memberL3RateLimit(request, session.userId, "wallet_transfer", "write");
  if (rl) return rl;

  let body: {
    fromAddress?: string;
    toAddress?: string;
    amount?: string;
    asset?: string;
    mint?: string;
    decimals?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const fromAddress = typeof body.fromAddress === "string" ? body.fromAddress.trim() : "";
  const toAddress = typeof body.toAddress === "string" ? body.toAddress.trim() : "";
  const amount = typeof body.amount === "string" ? body.amount.trim() : "";
  const asset = typeof body.asset === "string" ? body.asset.trim().toUpperCase() : "SOL";

  if (!fromAddress || !toAddress || !amount) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (!isSolanaAddress(fromAddress) || !isSolanaAddress(toAddress)) {
    return NextResponse.json({ ok: false, error: "invalid_address" }, { status: 400 });
  }
  if (fromAddress === toAddress) {
    return NextResponse.json({ ok: false, error: "same_address" }, { status: 400 });
  }

  try {
    const user = await session.privy.users()._get(session.userId);
    const linked = linkedAccountsFromPrivyUser(user);
    const primary = embeddedSolanaFromPrivyUser({ linked_accounts: linked });
    const allowed = new Set<string>();
    if (primary) allowed.add(primary);
    for (const raw of linked) {
      if (!raw || typeof raw !== "object") continue;
      const o = raw as Record<string, unknown>;
      const chain = String(o.chain_type ?? o.chainType ?? "").toLowerCase();
      const addr = typeof o.address === "string" ? o.address.trim() : "";
      if (addr && (!chain || chain === "solana")) allowed.add(addr);
    }
    if (allowed.size > 0 && !allowed.has(fromAddress)) {
      return NextResponse.json({ ok: false, error: "sender_mismatch" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "user_verify_failed" }, { status: 502 });
  }

  let mint: string | null = null;
  let decimals: number | undefined;
  if (asset === "USDC") {
    mint = getUsdcMint();
    decimals = 6;
  } else if (asset === "PHR") {
    mint = getPhrDaoTokenMint();
    decimals = 6;
  } else if (asset === "SPL" && typeof body.mint === "string" && body.mint.trim()) {
    mint = body.mint.trim();
    decimals = typeof body.decimals === "number" ? body.decimals : 6;
  } else if (asset !== "SOL") {
    return NextResponse.json({ ok: false, error: "unsupported_asset" }, { status: 400 });
  }

  try {
    const built = await buildTransferTransactionBase64({
      fromAddress,
      toAddress,
      amount,
      mint,
      decimals,
    });
    return NextResponse.json({ ok: true, ...built });
  } catch (e) {
    const message = e instanceof Error ? e.message : "build_failed";
    return NextResponse.json({ ok: false, error: "build_failed", message }, { status: 502 });
  }
}
