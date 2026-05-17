"use client";

import { TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { WalletAssetAvatar } from "@/_components/wallet/wallet-asset-avatar";
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
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [position, setPosition] = useState<EarnPositionView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [amount, setAmount] = useState("25");

  const loadConfig = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch("/api/members/earn", { headers: { Authorization: `Bearer ${token}` } });
      const data = (await res.json()) as { ok?: boolean; configured?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setConfigured(false);
        setLoadError(data.message ?? "Earn is not available");
        return;
      }
      setConfigured(Boolean(data.configured));
    } catch {
      setConfigured(false);
      setLoadError("Could not reach earn API");
    }
  }, [getAccessToken]);

  const loadPosition = useCallback(async () => {
    if (!configured || !smartWalletAddress) return;
    setLoadError(null);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch(
        `/api/members/earn?address=${encodeURIComponent(smartWalletAddress)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = (await res.json()) as {
        ok?: boolean;
        position?: EarnPositionView | null;
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setLoadError(data.message ?? data.error ?? "Could not load earn position");
        setPosition(null);
        return;
      }
      setPosition(data.position ?? null);
    } catch {
      setLoadError("Could not load earn position");
    }
  }, [configured, getAccessToken, smartWalletAddress]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    void loadPosition();
  }, [loadPosition]);

  const runAction = useCallback(
    async (action: "deposit" | "withdraw") => {
      if (!smartWalletAddress || !amount.trim()) return;
      onBusyChange(`earn-${action}`);
      setSuccessMsg(null);
      setLoadError(null);
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
        setSuccessMsg(data.message ?? (action === "deposit" ? "Deposit submitted" : "Withdrawal submitted"));
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

  if (configured === null) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-xs text-phronis-muted">Loading Privy Earn…</p>
      </section>
    );
  }

  if (!configured) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <EarnHeader />
        <p className="mt-2 text-xs leading-relaxed text-phronis-muted">
          Deploy a fee wrapper in{" "}
          <a className="text-phronis-teal underline" href="https://dashboard.privy.io" target="_blank" rel="noopener noreferrer">
            Privy Dashboard
          </a>{" "}
          → <strong className="text-phronis-foreground/80">Wallet infrastructure → Earn</strong>, copy your{" "}
          <code className="text-phronis-teal">vault_id</code>, then set{" "}
          <code className="text-phronis-teal">PRIVY_EARN_VAULT_ID</code> in Netlify (server env). See{" "}
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
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-phronis-teal/25 bg-phronis-teal/[0.04] p-4">
      <EarnHeader />
      <p className="mt-2 text-xs leading-relaxed text-phronis-muted">
        Deposit USDC from your Ethereum smart wallet into your Privy Morpho yield vault. Deposits are async — refresh
        after ~1 minute.{" "}
        <a
          className="text-phronis-teal underline"
          href="https://docs.privy.io/wallets/actions/earn/deposit"
          target="_blank"
          rel="noopener noreferrer"
        >
          Docs
        </a>
      </p>

      {!ethReady || !smartWalletAddress ? (
        <p className="mt-3 text-xs text-amber-200/90">Provision your Ethereum smart wallet above before using Earn.</p>
      ) : (
        <>
          {position ? (
            <dl className="mt-4 grid gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-xs sm:grid-cols-3">
              <EarnStat label="In vault" value={`${position.assetsInVault.toFixed(2)} ${position.assetSymbol}`} />
              <EarnStat
                label="Yield earned"
                value={`${position.earnedYield.toFixed(4)} ${position.assetSymbol}`}
                valueClass={position.earnedYield >= 0 ? "text-phronis-teal" : "text-amber-200"}
              />
              <EarnStat
                label="Net deposited"
                value={`${(position.totalDeposited - position.totalWithdrawn).toFixed(2)} ${position.assetSymbol}`}
              />
            </dl>
          ) : (
            <p className="mt-3 text-xs text-phronis-muted">No vault position yet — deposit USDC to start earning yield.</p>
          )}

          <EarnAmountForm
            amount={amount}
            busy={busy}
            onAmountChange={setAmount}
            onDeposit={() => void runAction("deposit")}
            onWithdraw={() => void runAction("withdraw")}
            onRefresh={() => void loadPosition()}
          />
        </>
      )}

      {successMsg ? (
        <p className="mt-3 text-xs text-phronis-teal" role="status">
          {successMsg}
        </p>
      ) : null}
      {loadError ? (
        <p className="mt-3 text-xs text-amber-200/90" role="alert">
          {loadError}
        </p>
      ) : null}
    </section>
  );
}

function EarnHeader() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TrendingUp className="h-4 w-4 text-phronis-teal" aria-hidden />
      <WalletAssetAvatar kind="chain" chainId="ethereum" size={22} className="rounded-md" />
      <p className="text-sm font-medium text-phronis-foreground">Privy Earn (USDC yield)</p>
    </div>
  );
}

function EarnStat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <dt className="text-phronis-muted">{label}</dt>
      <dd className={cn("mt-0.5 font-mono text-sm text-phronis-foreground", valueClass)}>{value}</dd>
    </div>
  );
}

function EarnAmountForm({
  amount,
  busy,
  onAmountChange,
  onDeposit,
  onWithdraw,
  onRefresh,
}: {
  amount: string;
  busy: string;
  onAmountChange: (v: string) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1">
        <label className="text-[11px] font-medium uppercase tracking-wider text-phronis-muted" htmlFor="earn-amount">
          Amount (USDC)
        </label>
        <Input
          id="earn-amount"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
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
          onClick={onDeposit}
        >
          {busy === "earn-deposit" ? "Depositing…" : "Deposit"}
        </Button>
        <Button type="button" size="sm" variant="outline" className="border-white/15" disabled={!!busy} onClick={onWithdraw}>
          {busy === "earn-withdraw" ? "Withdrawing…" : "Withdraw"}
        </Button>
        <Button type="button" size="sm" variant="ghost" className="text-phronis-muted" disabled={!!busy} onClick={onRefresh}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
