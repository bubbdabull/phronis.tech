"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, CreditCard } from "lucide-react";

import { DeskTokenAvatar } from "@/_features/member-desk/desk-token-avatar";
import { WalletAssetAvatar } from "@/_components/wallet/wallet-asset-avatar";
import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";
import type { WalletTokenId } from "@/_lib/wallet/wallet-assets";
import { cn } from "@/_lib/utils";

const PHR_MINT = getPhrDaoTokenMint() ?? "";

type Props = {
  primaryWallet: string;
  portfolioHint: number | null;
  swapReady: boolean;
  hasDbWalletRow: boolean;
  hasGas: boolean;
  solBal: number;
  usdcBal: number;
  phrBal: number;
  onReceive: () => void;
  onSend: () => void;
  onSwap: () => void;
  onBuy: () => void;
};

export function WalletHeroSection({
  primaryWallet,
  portfolioHint,
  swapReady,
  hasDbWalletRow,
  hasGas,
  solBal,
  usdcBal,
  phrBal,
  onReceive,
  onSend,
  onSwap,
  onBuy,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d1118] via-[#0a1628] to-phronis-void p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] sm:p-6">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-phronis-teal/20 blur-3xl"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-phronis-muted">Solana wallet</p>
          <p className="mt-1 font-mono text-sm text-phronis-foreground/90">
            {primaryWallet.slice(0, 4)}…{primaryWallet.slice(-4)}
          </p>
          {portfolioHint != null ? (
            <p className="mt-3 text-3xl font-semibold tracking-tight text-phronis-foreground">
              ≈ ${portfolioHint.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              <span className="ml-2 text-sm font-normal text-phronis-muted">est.</span>
            </p>
          ) : (
            <p className="mt-3 text-lg text-phronis-muted">Sync to load balances</p>
          )}
          <p
            className={cn(
              "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              swapReady ? "bg-phronis-teal/15 text-phronis-teal" : "bg-amber-400/10 text-amber-200/90",
            )}
          >
            {!hasDbWalletRow ? "Sync to load" : swapReady ? "Ready to trade" : hasGas ? "Add USDC to swap" : "Add SOL for gas"}
          </p>
        </div>
        <WalletAssetAvatar kind="chain" chainId="solana" size={40} className="rounded-xl ring-2 ring-white/10" />
      </div>

      <div className="relative mt-6 grid grid-cols-4 gap-2 sm:gap-3">
        <ActionChip icon={ArrowDownLeft} label="Receive" onClick={onReceive} />
        <ActionChip icon={ArrowUpRight} label="Send" onClick={onSend} disabled={!hasDbWalletRow} />
        <ActionChip icon={ArrowRightLeft} label="Swap" onClick={onSwap} />
        <ActionChip icon={CreditCard} label="Buy" onClick={onBuy} />
      </div>

      <div className="relative mt-5 space-y-0.5 rounded-2xl border border-white/10 bg-black/25 p-1">
        <TokenRow tokenId="sol" symbol="SOL" name="Solana" balance={hasDbWalletRow ? solBal.toFixed(4) : "—"} />
        <TokenRow
          tokenId="usdc"
          symbol="USDC"
          name="USD Coin"
          balance={hasDbWalletRow ? usdcBal.toFixed(2) : "—"}
          highlight
        />
        <TokenRow tokenId="phr" symbol="PHR" name="Phronis DAO" balance={hasDbWalletRow ? phrBal.toLocaleString() : "—"} />
      </div>
    </section>
  );
}

function ActionChip({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-[11px] font-semibold text-phronis-foreground transition",
        "hover:border-phronis-teal/30 hover:bg-phronis-teal/10 disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-phronis-teal/15 text-phronis-teal">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      {label}
    </button>
  );
}

function TokenRow({
  tokenId,
  symbol,
  name,
  balance,
  highlight,
}: {
  tokenId: WalletTokenId;
  symbol: string;
  name: string;
  balance: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
        highlight ? "bg-phronis-teal/[0.06]" : "hover:bg-white/[0.03]",
      )}
    >
      {tokenId === "phr" && PHR_MINT ? (
        <DeskTokenAvatar mint={PHR_MINT} symbol="PHR" size={36} className="rounded-full" />
      ) : (
        <WalletAssetAvatar kind="token" tokenId={tokenId} size={36} />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-phronis-foreground">{symbol}</p>
        <p className="truncate text-xs text-phronis-muted">{name}</p>
      </div>
      <p className="font-mono text-sm font-medium tabular-nums text-phronis-foreground">{balance}</p>
    </div>
  );
}
