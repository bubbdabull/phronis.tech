import { NextResponse } from "next/server";

import { memberL3RateLimit } from "@/_lib/member-api-l3";
import { requirePrivySession } from "@/_lib/member-auth";
import {
  earnDeposit,
  earnWithdraw,
  fetchEarnPosition,
  getPrivyEarnVaultId,
  isPrivyEarnConfigured,
  resolveEarnWalletId,
} from "@/_lib/privy-earn";

function earnNotConfigured() {
  return NextResponse.json(
    {
      ok: false,
      configured: false,
      error: "earn_not_configured",
      message: "Set PRIVY_EARN_VAULT_ID from Privy Dashboard → Wallet infrastructure → Earn.",
    },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  const session = await requirePrivySession(request);
  if (session instanceof NextResponse) return session;
  const rl = memberL3RateLimit(request, session.userId, "earn_position", "read");
  if (rl) return rl;

  const configured = isPrivyEarnConfigured();
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim();

  if (!address) {
    return NextResponse.json({ ok: true, configured });
  }

  if (!configured) return earnNotConfigured();

  const vaultId = getPrivyEarnVaultId()!;
  const walletId = await resolveEarnWalletId(session.privy, session.userId, address);
  if (!walletId) {
    return NextResponse.json(
      {
        ok: false,
        error: "wallet_not_found",
        message: "Ethereum smart wallet not linked to your account, or Privy wallet id missing.",
      },
      { status: 404 },
    );
  }

  const position = await fetchEarnPosition(walletId, vaultId);
  return NextResponse.json({ ok: true, configured: true, position });
}

export async function POST(request: Request) {
  const session = await requirePrivySession(request);
  if (session instanceof NextResponse) return session;
  const rl = memberL3RateLimit(request, session.userId, "earn_action", "write");
  if (rl) return rl;

  if (!isPrivyEarnConfigured()) return earnNotConfigured();

  let body: { action?: string; amount?: string; address?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const action = body.action === "withdraw" ? "withdraw" : body.action === "deposit" ? "deposit" : null;
  const amount = typeof body.amount === "string" ? body.amount.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  if (!action || !amount || !address) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const vaultId = getPrivyEarnVaultId()!;
  const walletId = await resolveEarnWalletId(session.privy, session.userId, address);
  if (!walletId) {
    return NextResponse.json(
      {
        ok: false,
        error: "wallet_not_found",
        message: "Could not resolve your Ethereum wallet in Privy. Sync, then try again.",
      },
      { status: 404 },
    );
  }

  try {
    const result =
      action === "deposit"
        ? await earnDeposit(session.privy, walletId, vaultId, amount)
        : await earnWithdraw(session.privy, walletId, vaultId, amount);
    return NextResponse.json({
      ok: true,
      action: result,
      message:
        action === "deposit"
          ? "Deposit submitted — it may take a minute to confirm onchain."
          : "Withdrawal submitted — it may take a minute to confirm onchain.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "earn_action_failed";
    return NextResponse.json({ ok: false, error: "earn_action_failed", message }, { status: 502 });
  }
}
