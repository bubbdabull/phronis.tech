"use client";

import { TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { WalletAssetAvatar } from "@/_components/wallet/wallet-asset-avatar";
import { isPrivyEarnEnabledForClient } from "@/_lib/privy-earn";
import type { EarnPositionView } from "@/_lib/privy-earn";
import { cn } from "@/_lib/utils";

type Props = {
  smartWalletAddress: string | null;
  ethReady: boolean;
  busy: string;
  onBusyChange: (v: string) => void;
  onAfterAction?: () => void;
};

export function MemberEarnSection({ smartWalletAddress, ethReady, busy, onBusyChange, onAfterAction }: Props) {
  const { getAccessToken } = usePrivy();
  const earnEnabled = isPrivyEarnEnabledForClient();
  const [position, setPosition] = useState<EarnPositionView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [amount, setAmount] = useState("25");

  const loadPosition = useCallback(async () => {
    if (!earnEnabled || !smartWalletAddress) return;
    setLoadError(null);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch(
        `/api/members/earn?address=${encodeURIComponent(smartWalletAddress)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = (await res.json()) as { ok?: boolean; position?: EarnPositionView | null; error?: string };
      if (!res.ok || !data.ok) {
        setLoadError(data.error ?? "Could not load earn position");
        setPosition(null);
        return;
      }
      setPosition(data.position ?? null);
    } catch {
      setLoadError("Could not load earn position");
    }
  }, [earnEnabled, getAccessToken, smartWalletAddress]);

  useEffect(() => {
    void loadPosition();
  }, [loadPosition]);

  const runAction = useCallback(
    async (action: "deposit" | "withdraw") => {
      if (!smartWalletAddress || !amount.trim()) return;
      onBusyChange(`earn-${action}`);
      try {
        const token = await getAccessToken();
        if (!token) return;
        const res = await fetch("/api/members/earn", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ action, amount: amount.trim(), address: smartWalletAddress }),
        });
        const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
        if (!res.ok || !data.ok) {
          setLoadError(data.message ?? data.error ?? "Earn action failed");
          return;
        }
        await loadPosition();
        await onAfterAction?.();
      } catch {
        setLoadError("Earn action failed");
      } finally {
        onBusyChange("");
      }
    },
    [amount, getAccessToken, loadPosition, onAfterAction, onBusyChange, smartWalletAddress],
  );

  if (!earnEnabled) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-phronis-teal" aria-hidden />
          <p className="text-sm font-medium text-phronis-foreground">Earn (yield vault)</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-phronis-muted">
          Enable Privy Earn in the{" "}
          <a
            className="text-phronis-teal underline"
            href="https://docs.privy.io/wallets/actions/earn/setup"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privy dashboard
          </a>
          , copy your <code className="text-phronis-teal">vault_id</code>, then set{" "}
          <code className="text-phronis-teal">PRIVY_EARN_VAULT_ID</code> and{" "}
          <code className="text-phronis-teal">NEXT_PUBLIC_PRIVY_EARN_ENABLED=true</code> in Netlify.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-phronis-teal/25 bg-phronis-teal/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <WalletAssetAvatar kind="chain" chainId="ethereum" size={22} className="rounded-md" />
        <p className="text-sm font-medium text-phronis-foreground">Earn on EVM (Morpho vault)</p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-phronis-muted">
        Deposit USDC from your Ethereum smart wallet into your Privy yield vault. Setup guide:{" "}
        <a
          className="text-phronis-teal underline"
          href="https://docs.privy.io/wallets/actions/earn/setup"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privy Earn setup
        </a>
        .
      </p>

      {!ethReady || !smartWalletAddress ? (
        <p className="mt-3 text-xs text-amber-200/90">Provision your Ethereum smart wallet above before using Earn.</p>
      ) : (
        <>
          {position ? (
            <dl className="mt-4 grid gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-phronis-muted">In vault</dt>
                <dd className="mt-0.5 font-mono text-sm text-phronis-foreground">
                  {position.assetsInVault.toFixed(2)} {position.assetSymbol}
                </dd>
              </div>
              <div>
                <dt className="text-phronis-muted">Yield earned</dt>
                <dd className={cn("mt-0.5 font-mono text-sm", position.earnedYield >= 0 ? "text-phronis-teal" : "text-amber-200")}>
                  {position.earnedYield.toFixed(4)} {position.assetSymbol}
                </dd>
              </div>
              <div>
                <dt className="text-phronis-muted">Net deposited</dt>
                <dd className="mt-0.5 font-mono text-sm text-phronis-foreground">
                  {(position.totalDeposited - position.totalWithdrawn).toFixed(2)} {position.assetSymbol}
                </dd>
              </div>
            </dl>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-phronis-muted" htmlFor="earn-amount">
                Amount (USDC)
              </label>
              <Input
                id="earn-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-white/15 bg-black/20 font-mono"
                inputMode="decimal"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="bg-phronis-teal text-phronis-void hover:opacity-90"
                disabled={!!busy}
                onClick={() => void runAction("deposit")}
              >
                {busy === "earn-deposit" ? "Depositing…" : "Deposit"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-white/15"
                disabled={!!busy}
                onClick={() => void runAction("withdraw")}
              >
                {busy === "earn-withdraw" ? "Withdrawing…" : "Withdraw"}
              </Button>
              <Button type="button" size="sm" variant="ghost" className="text-phronis-muted" disabled={!!busy} onClick={() => void loadPosition()}>
                Refresh
              </Button>
            </div>
          </div>
        </>
      )}

      {loadError ? (
        <p className="mt-3 text-xs text-amber-200/90" role="alert">
          {loadError}
        </p>
      ) : null}
    </section>
  );
}
