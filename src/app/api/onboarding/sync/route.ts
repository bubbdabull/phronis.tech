import type { User as PrivyNodeUser } from "@privy-io/node";
import { PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

import type { MemberRow, WalletRow } from "@/_types/onboarding";
import { memberL3RateLimit } from "@/_lib/member-api-l3";
import { requirePrivySession } from "@/_lib/member-auth";
import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";
import {
  embeddedSolanaFromAccounts,
  extractSolanaLinkedFromAccounts,
  isEmbeddedSolanaLinked,
  linkedAccountsFromPrivyUser,
  mergeSolanaLinkedLists,
  pickPrimaryEmbeddedSolana,
  type SolanaLinked,
} from "@/_lib/privy-solana-accounts";
import { databaseErrorResponse } from "@/_lib/member/db-error";
import { fetchWalletBalances } from "@/_lib/solana/balances";

function extractEmailFromAccounts(accounts: unknown[]): string | null {
  for (const raw of accounts) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    if (String(o.type) !== "email") continue;
    const addr = o.address;
    if (typeof addr === "string" && addr.trim()) return addr.trim();
  }
  return null;
}

function isLikelySolanaPublicKey(s: string): boolean {
  const t = s.trim();
  if (t.length < 32 || t.length > 44) return false;
  try {
    new PublicKey(t);
    return true;
  } catch {
    return false;
  }
}

function buildSolanaSyncTargets(list: SolanaLinked[], clientEmbedded?: string | null): Map<string, SolanaLinked> {
  const m = new Map<string, SolanaLinked>();
  for (const w of list) {
    if (isEmbeddedSolanaLinked(w)) m.set(w.address, w);
  }
  const c = clientEmbedded?.trim();
  if (c && isLikelySolanaPublicKey(c) && !m.has(c)) {
    m.set(c, { address: c, wallet_client_type: "privy", connector_type: "embedded" });
  }
  return m;
}

async function resolvePrivyUser(
  privy: NonNullable<ReturnType<typeof import("@/_lib/privy-server").getPrivyServerClient>>,
  accessUserId: string,
  identityToken: string,
): Promise<PrivyNodeUser | NextResponse> {
  let fromToken: PrivyNodeUser | null = null;

  if (identityToken) {
    try {
      fromToken = await privy.users().get({ id_token: identityToken });
      if (fromToken.id !== accessUserId) {
        return NextResponse.json({ ok: false, error: "identity_mismatch" }, { status: 401 });
      }
    } catch {
      // Stale or rate-limited identity JWT — fall back to server user fetch below.
      fromToken = null;
    }
  }

  try {
    const fromApi = await privy.users()._get(accessUserId);
    if (!fromToken) return fromApi;

    const mergedAccounts = [
      ...linkedAccountsFromPrivyUser(fromToken),
      ...linkedAccountsFromPrivyUser(fromApi),
    ];
    return { ...fromApi, linked_accounts: mergedAccounts } as PrivyNodeUser;
  } catch (e) {
    if (fromToken) return fromToken;
    if (process.env.NODE_ENV !== "production") {
      console.error("[api/onboarding/sync] privy.users()._get failed", e);
    }
    return NextResponse.json(
      { ok: false, error: "privy_user_fetch_failed", message: "Could not load your Privy profile from the server." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const session = await requirePrivySession(request);
  if (session instanceof NextResponse) return session;
  const rl = memberL3RateLimit(request, session.userId, "onboarding_sync", "sync");
  if (rl) return rl;

  const { privy, supabase } = session;
  const accessUserId = session.userId;

  let body: { identityToken?: string; embeddedSolanaAddress?: string };
  try {
    body = (await request.json()) as { identityToken?: string; embeddedSolanaAddress?: string };
  } catch {
    body = {};
  }

  const identityToken = typeof body.identityToken === "string" ? body.identityToken.trim() : "";
  const clientEmbedded =
    typeof body.embeddedSolanaAddress === "string" ? body.embeddedSolanaAddress.trim() : "";

  const privyUser = await resolvePrivyUser(privy, accessUserId, identityToken);
  if (privyUser instanceof NextResponse) return privyUser;

  const rawAccounts = linkedAccountsFromPrivyUser(privyUser);
  const solanaLinked = mergeSolanaLinkedLists(
    extractSolanaLinkedFromAccounts(rawAccounts),
    embeddedSolanaFromAccounts(rawAccounts),
  );

  let syncTargets = buildSolanaSyncTargets(solanaLinked, clientEmbedded || null);
  const wallet_address = pickPrimaryEmbeddedSolana([...syncTargets.values()]) ?? (clientEmbedded || null);

  if (wallet_address && !syncTargets.has(wallet_address)) {
    syncTargets.set(wallet_address, {
      address: wallet_address,
      wallet_client_type: "privy",
      connector_type: "embedded",
    });
  }

  const email = extractEmailFromAccounts(rawAccounts);

  const { data: existing, error: readErr } = await supabase
    .from("members")
    .select("id, wallet_address")
    .eq("privy_id", privyUser.id)
    .maybeSingle();

  if (readErr) {
    return databaseErrorResponse("api/onboarding/sync members read", readErr);
  }

  let memberId: string;

  if (existing?.id) {
    const nextWallet = wallet_address ?? existing.wallet_address;
    const { error: upErr } = await supabase
      .from("members")
      .update({
        wallet_address: nextWallet,
        ...(email ? { email } : {}),
      })
      .eq("id", existing.id);
    if (upErr) {
      return databaseErrorResponse("api/onboarding/sync members update", upErr);
    }
    memberId = existing.id;
  } else {
    const { data: inserted, error: insErr } = await supabase
      .from("members")
      .insert({
        privy_id: privyUser.id,
        wallet_address,
        display_name: email,
        email,
        membership_tier: "L1",
      })
      .select("id")
      .single();
    if (insErr || !inserted) {
      return databaseErrorResponse("api/onboarding/sync members insert", insErr ?? { message: "insert returned no row" });
    }
    memberId = inserted.id;
    const { error: memShipErr } = await supabase
      .from("memberships")
      .insert({ member_id: memberId, tier: "L1", active: true });
    if (memShipErr) {
      return databaseErrorResponse("api/onboarding/sync memberships insert", memShipErr);
    }
  }

  const primaryAddr = wallet_address;
  if (primaryAddr) {
    const primaryBalances = await fetchWalletBalances(primaryAddr, getPhrDaoTokenMint());
    const funded = primaryBalances.sol >= 0.001 && primaryBalances.usdc >= 0.01;
    await supabase.from("members").update({ wallet_funded: funded }).eq("id", memberId);
  }

  const mint = getPhrDaoTokenMint();
  const linkedAddresses = [...syncTargets.keys()];
  if (linkedAddresses.length > 0) {
    for (const addr of linkedAddresses) {
      const balances = await fetchWalletBalances(addr, mint);
      const { data: w } = await supabase.from("wallets").select("id").eq("member_id", memberId).eq("wallet_address", addr).maybeSingle();
      if (w?.id) {
        const { error: upWErr } = await supabase
          .from("wallets")
          .update({
            sol_balance: balances.sol,
            phronis_balance: balances.phronis,
            usdc_balance: balances.usdc,
          })
          .eq("id", w.id);
        if (upWErr) {
          if (process.env.NODE_ENV !== "production") console.error("[onboarding/sync] wallet update", upWErr);
          return NextResponse.json(
            { ok: false, error: "wallet_update_failed", message: upWErr.message },
            { status: 500 },
          );
        }
      } else {
        const { error: insWErr } = await supabase.from("wallets").insert({
          member_id: memberId,
          wallet_address: addr,
          sol_balance: balances.sol,
          phronis_balance: balances.phronis,
          usdc_balance: balances.usdc,
        });
        if (insWErr) {
          if (process.env.NODE_ENV !== "production") console.error("[onboarding/sync] wallet insert", insWErr);
          return NextResponse.json(
            { ok: false, error: "wallet_insert_failed", message: insWErr.message },
            { status: 500 },
          );
        }
      }
    }

    const { data: stale } = await supabase.from("wallets").select("id, wallet_address").eq("member_id", memberId);
    for (const row of stale ?? []) {
      if (!linkedAddresses.includes(row.wallet_address)) {
        await supabase.from("wallets").delete().eq("id", row.id);
      }
    }
  }

  const { data: member, error: mErr } = await supabase.from("members").select("*").eq("id", memberId).single();
  if (mErr || !member) {
    return databaseErrorResponse("api/onboarding/sync members select", mErr ?? { message: "member missing after sync" });
  }

  const { data: walletsRaw } = await supabase.from("wallets").select("*").eq("member_id", memberId);
  const memberWallet = String((member as MemberRow).wallet_address ?? "").trim();
  const walletsSorted = [...(walletsRaw ?? [])].sort((a, b) => {
    const ap = a.wallet_address === memberWallet ? 1 : 0;
    const bp = b.wallet_address === memberWallet ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return Number(b.phronis_balance) - Number(a.phronis_balance);
  });

  return NextResponse.json({
    ok: true,
    member: member as MemberRow,
    wallets: walletsSorted as WalletRow[],
    wallet_address: wallet_address ?? null,
  });
}
