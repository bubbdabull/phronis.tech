"use client";

import { getIdentityToken, usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useRef, useState } from "react";

import { useEmbeddedSolanaAddress } from "@/_hooks/use-embedded-solana-address";
import { fetchIdentityTokenOnce } from "@/_lib/auth/privy-identity-token";
import type { MemberRow, TransactionRow, WalletRow } from "@/_types/onboarding";

function messageForMembersMe(status: number, code?: string): string {
  switch (code) {
    case "privy_server_not_configured":
      return "Server is missing Privy verification (PRIVY_APP_SECRET / Privy app id). Ask an admin to configure it.";
    case "supabase_not_configured":
      return "Server is missing Supabase (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY). Wallet balances from the database will not load until this is set.";
    case "member_multiple_rows":
      return "More than one member row matched your Privy id. In Supabase, remove duplicate rows for the same `privy_id`.";
    case "member_table_missing":
      return "The `members` table (or schema) is missing. Apply project migrations in `supabase/migrations/` to this database.";
    case "supabase_invalid_api_key":
      return "Supabase rejected the server API key (often “Invalid API key”). In Supabase: Project Settings → API, copy the secret labeled service_role (not anon) into SUPABASE_SERVICE_ROLE_KEY in your server env, save, and restart the Next.js server.";
    case "database_error":
      return "Could not read your member record from the database. The server uses the Supabase service role key (it bypasses RLS). Confirm SUPABASE_SERVICE_ROLE_KEY is the service_role secret—not the anon key—and that migrations ran. Check server logs for details.";
    case "invalid_token":
    case "missing_authorization":
      return "Your session could not be verified. Sign out and sign in again.";
    default:
      if (status === 401) return "Your session could not be verified. Sign out and sign in again.";
      if (status === 503) return "Member service is not fully configured on the server. Check Privy and Supabase environment variables.";
      return "Could not load member profile from the server.";
  }
}

function messageForSync(error?: string, message?: string, hint?: string): string {
  if (message?.trim()) return message.trim();
  if (hint?.trim()) return hint.trim();
  switch (error) {
    case "invalid_token":
    case "missing_authorization":
      return "Your session could not be verified. Sign out and sign in again, then sync.";
    case "invalid_identity_token":
    case "identity_mismatch":
      return "Wallet sync could not verify your Privy session. Sign out and back in, then try Sync again.";
    case "privy_user_fetch_failed":
      return "Could not load your full wallet list from Privy. Check PRIVY_APP_SECRET and try again.";
    case "privy_server_not_configured":
      return "Privy is not configured on the server.";
    case "supabase_not_configured":
      return "Supabase is not configured on the server.";
    case "wallet_insert_failed":
    case "wallet_update_failed":
      return message?.trim() || "Could not save wallet balances to the database.";
    default:
      return error ? `Sync failed (${error}).` : "Sync failed.";
  }
}

export function useOnboardingSession() {
  const { authenticated, getAccessToken } = usePrivy();
  const { address: embeddedAddress, ensureAddress } = useEmbeddedSolanaAddress();
  const ensureAddressRef = useRef(ensureAddress);
  ensureAddressRef.current = ensureAddress;
  const [member, setMember] = useState<MemberRow | null>(null);
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!authenticated) {
      setMember(null);
      setWallets([]);
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch("/api/members/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        debug?: string;
        member?: MemberRow | null;
        wallets?: WalletRow[];
        transactions?: TransactionRow[];
      };
      if (!res.ok || !json.ok) {
        const msg = messageForMembersMe(res.status, json.error);
        const dbg = typeof json.debug === "string" ? json.debug.trim() : "";
        const skipDebugSuffix = json.error === "supabase_invalid_api_key";
        const withDebug =
          process.env.NODE_ENV === "development" && dbg && !skipDebugSuffix ? `${msg} (${dbg})` : msg;
        setError(withDebug);
        setMember(null);
        setWallets([]);
        setTransactions([]);
        return;
      }
      setMember(json.member ?? null);
      setWallets(json.wallets ?? []);
      setTransactions(json.transactions ?? []);
    } catch {
      setError("Network error loading profile.");
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken]);

  const syncFromPrivy = useCallback(async (opts?: { provision?: boolean }) => {
    const token = await getAccessToken();
    if (!token) {
      setError("Sign in required to sync wallets.");
      return false;
    }

    const embeddedSolanaAddress = opts?.provision
      ? (await ensureAddressRef.current()) ?? embeddedAddress ?? null
      : embeddedAddress ?? null;
    const idTok = await fetchIdentityTokenOnce(getIdentityToken);

    const payload: Record<string, string> = {};
    if (idTok) payload.identityToken = idTok;
    if (embeddedSolanaAddress) payload.embeddedSolanaAddress = embeddedSolanaAddress;

    const res = await fetch("/api/onboarding/sync", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const json = (await res.json()) as {
      ok?: boolean;
      member?: MemberRow;
      wallets?: WalletRow[];
      wallet_address?: string | null;
      error?: string;
      message?: string;
      hint?: string;
    };
    if (!res.ok || !json.ok || !json.member) {
      const dbg =
        process.env.NODE_ENV === "development" && typeof json.message === "string" ? json.message : undefined;
      setError(messageForSync(json.error, dbg ?? json.message, json.hint));
      return false;
    }
    setError(null);
    setMember(json.member);
    setWallets(json.wallets ?? []);
    return true;
  }, [embeddedAddress, getAccessToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { member, wallets, transactions, loading, error, refresh, syncFromPrivy };
}
