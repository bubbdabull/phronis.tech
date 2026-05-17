import type { LinkedAccount, User as PrivyNodeUser } from "@privy-io/node";
import { NextResponse } from "next/server";

import type { MemberProfileRow } from "@/_types/member-profile";
import { memberL3RateLimit } from "@/_lib/member-api-l3";
import { requirePrivySession } from "@/_lib/member-auth";
import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";

function extractEmail(accounts: LinkedAccount[]): string | null {
  const row = accounts.find((a) => a.type === "email");
  if (row && row.type === "email") return row.address;
  return null;
}

function extractSolanaWallet(accounts: LinkedAccount[]): string | null {
  const solana: { address: string; wallet_client_type?: string }[] = [];
  for (const a of accounts) {
    if (a.type !== "wallet") continue;
    if (!("chain_type" in a) || a.chain_type !== "solana") continue;
    solana.push({
      address: (a as { address: string }).address,
      wallet_client_type: (a as { wallet_client_type?: string }).wallet_client_type,
    });
  }
  const embedded = solana.find(
    (w) => w.wallet_client_type === "privy" || w.wallet_client_type === "privy-v2",
  );
  return embedded?.address ?? solana[0]?.address ?? null;
}

export async function POST(request: Request) {
  const session = await requirePrivySession(request);
  if (session instanceof NextResponse) return session;
  const rl = memberL3RateLimit(request, session.userId, "member_profile_sync", "sync");
  if (rl) return rl;

  const { privy, supabase } = session;
  const accessUserId = session.userId;

  let body: { identityToken?: string };
  try {
    body = (await request.json()) as { identityToken?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const identityToken = typeof body.identityToken === "string" ? body.identityToken.trim() : "";
  if (!identityToken) {
    return NextResponse.json({ ok: false, error: "missing_identity_token" }, { status: 400 });
  }

  let privyUser: PrivyNodeUser;
  try {
    privyUser = await privy.users().get({ id_token: identityToken });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_identity_token" }, { status: 401 });
  }

  if (privyUser.id !== accessUserId) {
    return NextResponse.json({ ok: false, error: "identity_mismatch" }, { status: 401 });
  }

  const email = extractEmail(privyUser.linked_accounts);
  const wallet_address = extractSolanaWallet(privyUser.linked_accounts);
  const synced_at = new Date().toISOString();
  const envPhrMint = getPhrDaoTokenMint();

  const { data: existing, error: readErr } = await supabase
    .from("member_profiles")
    .select("id, dao_contract_address")
    .eq("privy_user_id", privyUser.id)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  if (existing?.id) {
    const patch: Record<string, string | null> = { email, wallet_address, synced_at };
    if (envPhrMint && !existing.dao_contract_address) {
      patch.dao_contract_address = envPhrMint;
    }
    const { error: upErr } = await supabase.from("member_profiles").update(patch).eq("id", existing.id);
    if (upErr) {
      return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
    }
  } else {
    const { error: insErr } = await supabase.from("member_profiles").insert({
      privy_user_id: privyUser.id,
      email,
      wallet_address,
      access_tier: "L1",
      dao_tier: "L1",
      dao_contract_address: envPhrMint,
      synced_at,
    });
    if (insErr) {
      return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
    }
  }

  const { data: row, error: finalErr } = await supabase
    .from("member_profiles")
    .select("*")
    .eq("privy_user_id", privyUser.id)
    .single();

  if (finalErr || !row) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    profile: row as MemberProfileRow,
  });
}
