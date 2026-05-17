"use client";

import { CreditCard } from "lucide-react";
import { useCallback, useState } from "react";

import type { SolanaCardFundingAsset, SolanaCardFundingProvider } from "@/_hooks/use-solana-card-funding";
import { useSolanaCardFunding } from "@/_hooks/use-solana-card-funding";
import { WalletAssetAvatar } from "@/_components/wallet/wallet-asset-avatar";
import { Button } from "@/_components/ui/button";
import { cn } from "@/_lib/utils";

const PROVIDERS: {
  id: SolanaCardFundingProvider;
  name: string;
  description: string;
}[] = [
  {
    id: "coinbase",
    name: "Coinbase",
    description: "Cards, bank transfer, and local methods via Coinbase Onramp.",
  },
  {
    id: "moonpay",
    name: "MoonPay",
    description: "Cards, Apple Pay, Google Pay, and bank options via MoonPay.",
  },
  {
    id: "meld",
    name: "Meld",
    description: "Aggregator — Transak, Swapped, and more providers in one flow.",
  },
];

type Props = {
  walletAddress: string;
  busy: string;
  onBusyChange: (v: string) => void;
  onAfterFlow?: () => void;
};

export function SolanaCardFundingPanel({ walletAddress, busy, onBusyChange, onAfterFlow }: Props) {
  const [asset, setAsset] = useState<SolanaCardFundingAsset>("USDC");
  const [lastError, setLastError] = useState<string | null>(null);

  const { fundWithProvider, isMainnet } = useSolanaCardFunding({
    address: walletAddress,
    onFlowExited: onAfterFlow,
  });

  const startFunding = useCallback(
    async (provider: SolanaCardFundingProvider) => {
      if (!walletAddress || busy) return;
      setLastError(null);
      onBusyChange(`fund-${provider}`);
      try {
        await fundWithProvider(provider, asset);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not open funding flow.";
        setLastError(message);
      } finally {
        onBusyChange("");
        await onAfterFlow?.();
      }
    },
    [asset, busy, fundWithProvider, onAfterFlow, onBusyChange, walletAddress],
  );

  const fundingBusy = busy.startsWith("fund");

  return (
    <div className="rounded-xl border border-phronis-teal/25 bg-phronis-teal/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <CreditCard className="h-4 w-4 text-phronis-teal" aria-hidden />
        <p className="text-sm font-medium text-phronis-foreground">Buy with card</p>
        {!isMainnet ? (
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-100/90">
            Mainnet recommended
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-xs leading-relaxed text-phronis-muted">
        Choose what to buy, then pick a provider. Meld opens additional regional options (Transak, Swapped, etc.) when enabled in your Privy
        dashboard.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Asset to purchase">
        {(
          [
            { id: "native-currency" as const, tokenId: "sol" as const, label: "SOL" },
            { id: "USDC" as const, tokenId: "usdc" as const, label: "USDC" },
          ] as const
        ).map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={asset === item.id ? "default" : "outline"}
            className={cn(
              asset === item.id
                ? "bg-phronis-teal text-phronis-void hover:opacity-90"
                : "border-white/15 text-phronis-foreground",
            )}
            disabled={fundingBusy}
            onClick={() => setAsset(item.id)}
          >
            <WalletAssetAvatar kind="token" tokenId={item.tokenId} size={16} className="mr-1.5" />
            {item.label}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3" role="group" aria-label="On-ramp provider">
        {PROVIDERS.map((provider) => {
          const loading = busy === `fund-${provider.id}`;
          return (
            <button
              key={provider.id}
              type="button"
              disabled={!walletAddress || fundingBusy}
              onClick={() => void startFunding(provider.id)}
              className={cn(
                "flex flex-col rounded-lg border px-3 py-3 text-left transition-colors",
                "border-white/10 bg-white/[0.02] hover:border-phronis-teal/40 hover:bg-phronis-teal/[0.06]",
                "disabled:cursor-not-allowed disabled:opacity-50",
                loading && "border-phronis-teal/50 ring-1 ring-phronis-teal/30",
              )}
            >
              <span className="text-sm font-medium text-phronis-foreground">{loading ? "Opening…" : provider.name}</span>
              <span className="mt-1 text-[11px] leading-snug text-phronis-muted">{provider.description}</span>
            </button>
          );
        })}
      </div>

      {lastError ? (
        <p className="mt-3 text-xs text-amber-200/90" role="alert">
          {lastError}
        </p>
      ) : null}
    </div>
  );
}
