"use client";

import { useMemo } from "react";

import { SplTokenAvatar } from "@/_components/wallet/spl-token-avatar";
import { WalletAssetAvatar } from "@/_components/wallet/wallet-asset-avatar";
import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";
import { getUsdcMint } from "@/_lib/phronis-usdc";
import { splBalancesFromDb, type SplBalanceEntry } from "@/_lib/wallet/spl-balance-store";
import { trustWalletLogoForMint } from "@/_lib/solana/token-metadata";
import { WALLET_TOKENS } from "@/_lib/wallet/wallet-assets";
import type { WalletRow } from "@/_types/onboarding";
import { cn } from "@/_lib/utils";

type Props = {
  wallets: readonly WalletRow[];
  solBal: number;
  hasDbWalletRow: boolean;
};

type DisplayRow = {
  key: string;
  symbol: string;
  name: string;
  logoUrl: string;
  logoFallbackUrl?: string;
  balance: number;
  mint?: string;
  isSol?: boolean;
};

function formatBalance(symbol: string, amount: number): string {
  if (symbol === "USDC") return amount.toFixed(2);
  if (amount >= 1_000_000) return amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (amount >= 1) return amount.toLocaleString(undefined, { maximumFractionDigits: 4 });
  if (amount > 0) return amount.toPrecision(4);
  return "0";
}

function entryToRow(mint: string, entry: SplBalanceEntry): DisplayRow {
  return {
    key: mint,
    mint,
    symbol: entry.symbol ?? `${mint.slice(0, 4)}…${mint.slice(-4)}`,
    name: entry.name ?? "SPL token",
    logoUrl: entry.logoUrl ?? trustWalletLogoForMint(mint),
    logoFallbackUrl: trustWalletLogoForMint(mint),
    balance: entry.balance,
  };
}

export function SolanaTokenHoldings({ wallets, solBal, hasDbWalletRow }: Props) {
  const usdcMint = getUsdcMint();
  const phrMint = getPhrDaoTokenMint();

  const rows = useMemo(() => {
    const usdcBal = wallets[0] ? Number(wallets[0].usdc_balance ?? 0) : 0;
    const phrBal = wallets[0] ? Number(wallets[0].phronis_balance ?? 0) : 0;
    const extra = splBalancesFromDb(
      wallets[0]?.spl_balances as Record<string, unknown> | null | undefined,
    );

    const list: DisplayRow[] = [
      {
        key: "sol",
        symbol: "SOL",
        name: "Solana",
        logoUrl: WALLET_TOKENS.sol.logoUrl,
        balance: solBal,
        isSol: true,
      },
      {
        key: usdcMint,
        mint: usdcMint,
        symbol: "USDC",
        name: "USD Coin",
        logoUrl: WALLET_TOKENS.usdc.logoUrl,
        logoFallbackUrl: WALLET_TOKENS.usdc.logoFallbackUrl,
        balance: usdcBal,
      },
    ];

    if (phrMint) {
      list.push({
        key: phrMint,
        mint: phrMint,
        symbol: "PHR",
        name: "Phronis DAO",
        logoUrl: WALLET_TOKENS.phr.logoUrl,
        balance: phrBal,
      });
    }

    for (const [mint, entry] of Object.entries(extra)) {
      if (mint === usdcMint || mint === phrMint) continue;
      list.push(entryToRow(mint, entry));
    }

    return list
      .filter((r) => r.isSol || r.balance > 0)
      .sort((a, b) => {
        if (a.isSol) return -1;
        if (b.isSol) return 1;
        if (a.symbol === "USDC") return -1;
        if (b.symbol === "USDC") return 1;
        if (a.symbol === "PHR") return -1;
        if (b.symbol === "PHR") return 1;
        return b.balance - a.balance;
      });
  }, [wallets, solBal, usdcMint, phrMint]);

  const hasAnyToken = rows.some((r) => !r.isSol && r.balance > 0);

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <WalletAssetAvatar kind="chain" chainId="solana" size={22} className="rounded-md" />
        <p className="text-sm font-medium text-phronis-foreground">Solana tokens</p>
      </div>
      <p className="mt-1 text-xs text-phronis-muted">
        Any SPL token sent to your address appears here after <strong className="text-phronis-foreground/80">Sync &amp; refresh</strong>{" "}
        (meme coins, USDC, PHR, and more). Logos resolve from Jupiter and Trust Wallet when available.
      </p>
      {!hasDbWalletRow ? (
        <p className="mt-2 text-xs text-amber-200/90">Sync your wallet to scan token accounts on-chain.</p>
      ) : !hasAnyToken && solBal < 0.001 ? (
        <p className="mt-2 text-xs text-phronis-muted">No tokens detected yet — fund or receive SPL tokens to this address.</p>
      ) : null}
      <ul className="mt-4 divide-y divide-white/10 rounded-lg border border-white/10">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-3 px-3 py-2.5">
            {row.isSol ? (
              <WalletAssetAvatar kind="token" tokenId="sol" size={32} />
            ) : (
              <SplTokenAvatar
                token={{
                  symbol: row.symbol,
                  name: row.name,
                  logoUrl: row.logoUrl,
                  logoFallbackUrl: row.logoFallbackUrl,
                }}
                size={32}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-phronis-foreground">{row.symbol}</p>
              <p className="truncate text-xs text-phronis-muted" title={row.mint}>
                {row.name}
                {row.mint ? (
                  <span className="mt-0.5 block font-mono text-[10px] text-phronis-muted/80">
                    {row.mint.slice(0, 6)}…{row.mint.slice(-6)}
                  </span>
                ) : null}
              </p>
            </div>
            <p
              className={cn(
                "shrink-0 font-mono text-sm tabular-nums",
                row.balance > 0 ? "text-phronis-foreground" : "text-phronis-muted",
              )}
            >
              {hasDbWalletRow ? formatBalance(row.symbol, row.balance) : "—"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
