"use client";

import { useSignAndSendTransaction, useWallets } from "@privy-io/react-auth/solana";
import { VersionedTransaction } from "@solana/web3.js";
import { ArrowDown, ChevronDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DeskTokenAvatar } from "@/_features/member-desk/desk-token-avatar";
import { WalletAssetAvatar } from "@/_components/wallet/wallet-asset-avatar";
import { Button } from "@/_components/ui/button";
import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";
import { getUsdcMint } from "@/_lib/phronis-usdc";
import { cn } from "@/_lib/utils";

const PHR_MINT = getPhrDaoTokenMint() ?? "";
const USDC_MINT = getUsdcMint();
const SOL_MINT = "So11111111111111111111111111111111111111112";

type PayAsset = "USDC" | "SOL";

type JupiterQuote = Record<string, unknown>;

type QuotePreview = {
  outAmount: string;
  outDecimals: number;
  priceImpact?: string;
};

type Props = {
  primaryWallet: string;
  hasGas: boolean;
  hasUsdc: boolean;
  usdcBal: number;
  solBal: number;
  phrBal: number;
  solanaChain: "solana:mainnet" | "solana:devnet";
  busy: string;
  onBusyChange: (v: string) => void;
  onSync: () => Promise<void>;
};

function formatUnits(raw: string, decimals: number, maxFrac = 6): string {
  try {
    const n = BigInt(raw || "0");
    if (n === BigInt(0)) return "0";
    const base = BigInt(10) ** BigInt(decimals);
    const whole = n / base;
    const frac = n % base;
    if (frac === BigInt(0)) return whole.toLocaleString();
    const fracStr = frac.toString().padStart(decimals, "0").slice(0, maxFrac).replace(/0+$/, "");
    return fracStr ? `${whole.toLocaleString()}.${fracStr}` : whole.toLocaleString();
  } catch {
    return raw;
  }
}

function parsePayAmount(payWith: PayAsset, value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return payWith === "USDC" ? Math.floor(n * 1e6) : Math.floor(n * 1e9);
}

export function BuyPhronisSection({
  primaryWallet,
  hasGas,
  hasUsdc,
  usdcBal,
  solBal,
  phrBal,
  solanaChain,
  busy,
  onBusyChange,
  onSync,
}: Props) {
  const { wallets, ready: walletsReady } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const [payWith, setPayWith] = useState<PayAsset>("USDC");
  const [payAmount, setPayAmount] = useState("25");
  const [quotePreview, setQuotePreview] = useState<QuotePreview | null>(null);
  const [jupiterQuote, setJupiterQuote] = useState<JupiterQuote | null>(null);
  const [qError, setQError] = useState<string | null>(null);
  const [successSig, setSuccessSig] = useState<string | null>(null);
  const [phase, setPhase] = useState<"" | "quote" | "swap">("");
  const quoteSeq = useRef(0);

  const payBalance = payWith === "USDC" ? usdcBal : solBal;
  const amountHuman = Number(payAmount);
  const canPay =
    payWith === "USDC"
      ? hasGas && hasUsdc && Number.isFinite(amountHuman) && amountHuman > 0 && amountHuman <= usdcBal
      : hasGas && Number.isFinite(amountHuman) && amountHuman > 0 && amountHuman <= solBal;

  const solanaWallet = useMemo(
    () => wallets.find((w) => w.address === primaryWallet) ?? wallets[0] ?? null,
    [wallets, primaryWallet],
  );

  const resetQuote = useCallback(() => {
    setQuotePreview(null);
    setJupiterQuote(null);
  }, []);

  const fetchQuote = useCallback(async () => {
    if (!PHR_MINT) {
      setQError("Set NEXT_PUBLIC_PHRONIS_DAO_TOKEN_MINT.");
      return null;
    }
    if (!canPay) {
      resetQuote();
      return null;
    }

    const seq = ++quoteSeq.current;
    setPhase("quote");
    setQError(null);

    try {
      const inputMint = payWith === "SOL" ? SOL_MINT : USDC_MINT;
      const rawAmount = parsePayAmount(payWith, payAmount);
      const params = new URLSearchParams({
        inputMint,
        outputMint: PHR_MINT,
        amount: String(rawAmount),
      });
      const res = await fetch(`/api/swap/quote?${params.toString()}`);
      const json = (await res.json()) as {
        ok?: boolean;
        outAmount?: string;
        priceImpactPct?: string;
        quote?: JupiterQuote & { outDecimals?: number };
        error?: string;
      };

      if (seq !== quoteSeq.current) return null;

      if (!res.ok || !json.ok || !json.quote) {
        resetQuote();
        setQError(json.error ?? "Quote unavailable for this pair");
        return null;
      }

      const outDecimals =
        typeof json.quote.outDecimals === "number"
          ? json.quote.outDecimals
          : typeof (json.quote as { outputMintDecimals?: number }).outputMintDecimals === "number"
            ? (json.quote as { outputMintDecimals: number }).outputMintDecimals
            : 6;

      const preview: QuotePreview = {
        outAmount: json.outAmount ?? "0",
        outDecimals,
        priceImpact: json.priceImpactPct,
      };
      setJupiterQuote(json.quote);
      setQuotePreview(preview);
      return { preview, quote: json.quote };
    } catch {
      if (seq === quoteSeq.current) {
        setQError("Could not reach Jupiter");
        resetQuote();
      }
      return null;
    } finally {
      if (seq === quoteSeq.current) setPhase("");
    }
  }, [canPay, payAmount, payWith, resetQuote]);

  useEffect(() => {
    if (!primaryWallet || !canPay) {
      resetQuote();
      return;
    }
    const t = window.setTimeout(() => void fetchQuote(), 550);
    return () => window.clearTimeout(t);
  }, [canPay, fetchQuote, payAmount, payWith, primaryWallet, resetQuote]);

  const setMax = useCallback(() => {
    if (payWith === "USDC") {
      const v = Math.max(0, usdcBal - 0.01);
      setPayAmount(v > 0 ? v.toFixed(2) : "0");
    } else {
      const reserve = 0.01;
      const v = Math.max(0, solBal - reserve);
      setPayAmount(v > 0 ? v.toFixed(4) : "0");
    }
    resetQuote();
  }, [payWith, resetQuote, solBal, usdcBal]);

  const switchPayAsset = useCallback(
    (asset: PayAsset) => {
      setPayWith(asset);
      setPayAmount(asset === "USDC" ? "25" : "0.05");
      setQError(null);
      setSuccessSig(null);
      resetQuote();
    },
    [resetQuote],
  );

  const executeSwap = useCallback(async () => {
    if (!PHR_MINT || !primaryWallet) return;
    if (!walletsReady || !solanaWallet) {
      setQError("Solana wallet not ready — sync your wallet first.");
      return;
    }
    if (!canPay) {
      setQError("Insufficient balance.");
      return;
    }

    setPhase("swap");
    setQError(null);
    onBusyChange("swap");

    try {
      let quote = jupiterQuote;
      if (!quote) {
        const fresh = await fetchQuote();
        quote = fresh?.quote ?? null;
      }
      if (!quote) {
        setQError("Get a quote before swapping.");
        return;
      }

      const buildRes = await fetch("/api/swap/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteResponse: quote, userPublicKey: primaryWallet }),
      });
      const buildJson = (await buildRes.json()) as { ok?: boolean; swapTransaction?: string; error?: string };
      if (!buildRes.ok || !buildJson.ok || !buildJson.swapTransaction) {
        setQError(buildJson.error ?? "Could not build swap");
        return;
      }

      const tx = VersionedTransaction.deserialize(Buffer.from(buildJson.swapTransaction, "base64"));
      const { signature } = await signAndSendTransaction({
        transaction: tx.serialize(),
        wallet: solanaWallet,
        chain: solanaChain,
      });

      const bs58 = (await import("bs58")).default;
      setSuccessSig(bs58.encode(signature));
      resetQuote();
      await onSync();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      if (!/user rejected|cancelled|canceled/i.test(msg)) setQError(msg);
    } finally {
      setPhase("");
      onBusyChange("");
    }
  }, [
    canPay,
    fetchQuote,
    jupiterQuote,
    onBusyChange,
    onSync,
    primaryWallet,
    resetQuote,
    signAndSendTransaction,
    solanaChain,
    solanaWallet,
    walletsReady,
  ]);

  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet" ? "" : "?cluster=devnet";
  const explorerTx = successSig ? `https://solscan.io/tx/${successSig}${cluster}` : null;
  const receiveDisplay = quotePreview ? formatUnits(quotePreview.outAmount, quotePreview.outDecimals) : null;
  const swapping = phase === "swap" || busy === "swap";
  const quoting = phase === "quote";

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-black/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-phronis-foreground">Swap</p>
          <p className="text-[11px] text-phronis-muted">Buy PHR with your embedded wallet</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-phronis-muted">
          <WalletAssetAvatar kind="chain" chainId="solana" size={14} className="rounded-sm" />
          Jupiter · Solana
        </span>
      </div>

      {/* You pay */}
      <div className="p-4 pb-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-phronis-muted">You pay</span>
          <button
            type="button"
            className="text-[11px] font-semibold text-phronis-teal hover:underline disabled:opacity-40"
            disabled={swapping || payBalance <= 0}
            onClick={setMax}
          >
            MAX
          </button>
        </div>

        <div className="flex gap-3">
          <PayTokenSelect value={payWith} disabled={swapping} onChange={switchPayAsset} />
          <div className="min-w-0 flex-1">
            <input
              type="text"
              inputMode="decimal"
              value={payAmount}
              disabled={swapping}
              onChange={(e) => {
                setPayAmount(e.target.value.replace(/[^0-9.]/g, ""));
                resetQuote();
                setSuccessSig(null);
              }}
              placeholder="0.00"
              className="w-full bg-transparent text-right font-mono text-2xl font-semibold tracking-tight text-phronis-foreground outline-none placeholder:text-white/20"
              aria-label={`${payWith} amount`}
            />
            <p className="mt-1 text-right text-[11px] text-phronis-muted">
              Balance: {payBalance.toLocaleString(undefined, { maximumFractionDigits: payWith === "USDC" ? 2 : 4 })} {payWith}
            </p>
          </div>
        </div>
      </div>

      {/* Divider + arrow */}
      <div className="relative flex justify-center py-1">
        <div className="absolute inset-x-4 top-1/2 h-px bg-white/10" aria-hidden />
        <div
          className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-phronis-void text-phronis-teal shadow-lg"
          aria-hidden
        >
          <ArrowDown className="h-4 w-4" />
        </div>
      </div>

      {/* You receive */}
      <div className="px-4 pb-4 pt-2">
        <span className="text-xs font-medium text-phronis-muted">You receive</span>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-black/25 py-2 pl-2 pr-3">
            {PHR_MINT ? (
              <DeskTokenAvatar mint={PHR_MINT} symbol="PHR" size={36} className="rounded-full" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-phronis-teal/20 text-xs font-bold text-phronis-teal">
                PH
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-phronis-foreground">PHR</p>
              <p className="text-[10px] text-phronis-muted">Phronis DAO</p>
            </div>
            <ChevronDown className="ml-1 h-3.5 w-3.5 text-phronis-muted/50" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 text-right">
            {quoting && !receiveDisplay ? (
              <div className="flex items-center justify-end gap-2 text-phronis-muted">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span className="text-sm">Fetching rate…</span>
              </div>
            ) : (
              <p className="font-mono text-2xl font-semibold tracking-tight text-phronis-foreground">
                {receiveDisplay ?? "—"}
              </p>
            )}
            <p className="mt-1 text-[11px] text-phronis-muted">
              Wallet: {phrBal.toLocaleString()} PHR
              {quotePreview?.priceImpact ? ` · Impact ${quotePreview.priceImpact}%` : null}
            </p>
          </div>
        </div>
      </div>

      {qError ? (
        <p className="mx-4 mb-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">{qError}</p>
      ) : null}

      {successSig && explorerTx ? (
        <p className="mx-4 mb-3 rounded-lg border border-phronis-teal/30 bg-phronis-teal/10 px-3 py-2 text-xs text-phronis-teal">
          Swap confirmed.{" "}
          <a href={explorerTx} target="_blank" rel="noopener noreferrer" className="font-medium underline">
            View transaction
          </a>
        </p>
      ) : null}

      <div className="border-t border-white/10 p-4">
        <Button
          type="button"
          className="h-11 w-full bg-phronis-teal text-base font-semibold text-phronis-void hover:opacity-90 disabled:opacity-50"
          disabled={swapping || quoting || !primaryWallet || !canPay || !walletsReady || !PHR_MINT}
          onClick={() => void executeSwap()}
        >
          {swapping ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Swapping…
            </span>
          ) : !PHR_MINT ? (
            "PHR mint not configured"
          ) : (
            `Swap ${payWith} for PHR`
          )}
        </Button>
        {!canPay && primaryWallet ? (
          <p className="mt-2 text-center text-[11px] leading-relaxed text-phronis-muted">
            {payWith === "USDC"
              ? "Add SOL for network fees and USDC to this address, then sync."
              : "Keep extra SOL for fees; amount must be within your balance."}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PayTokenSelect({
  value,
  disabled,
  onChange,
}: {
  value: PayAsset;
  disabled?: boolean;
  onChange: (v: PayAsset) => void;
}) {
  const [open, setOpen] = useState(false);

  const options: { id: PayAsset; symbol: string; name: string; mint: string }[] = [
    { id: "USDC", symbol: "USDC", name: "USD Coin", mint: USDC_MINT },
    { id: "SOL", symbol: "SOL", name: "Solana", mint: SOL_MINT },
  ];

  const active = options.find((o) => o.id === value) ?? options[0];

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 py-2 pl-2 pr-2.5 transition hover:border-white/20 disabled:opacity-50"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {active.id === "SOL" ? (
          <WalletAssetAvatar kind="token" tokenId="sol" size={36} />
        ) : (
          <WalletAssetAvatar kind="token" tokenId="usdc" size={36} />
        )}
        <div className="text-left">
          <p className="text-sm font-semibold text-phronis-foreground">{active.symbol}</p>
          <p className="max-w-[72px] truncate text-[10px] text-phronis-muted">{active.name}</p>
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-phronis-muted transition", open && "rotate-180")} aria-hidden />
      </button>

      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close token menu" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            className="absolute left-0 top-full z-50 mt-1.5 min-w-[168px] overflow-hidden rounded-xl border border-white/15 bg-phronis-void py-1 shadow-xl"
          >
            {options.map((opt) => (
              <li key={opt.id} role="option" aria-selected={opt.id === value}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/5",
                    opt.id === value && "bg-phronis-teal/10",
                  )}
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                >
                  {opt.id === "SOL" ? (
                    <WalletAssetAvatar kind="token" tokenId="sol" size={28} />
                  ) : (
                    <WalletAssetAvatar kind="token" tokenId="usdc" size={28} />
                  )}
                  <span>
                    <span className="block text-sm font-medium text-phronis-foreground">{opt.symbol}</span>
                    <span className="block text-[10px] text-phronis-muted">{opt.name}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
