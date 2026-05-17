"use client";

import { useSignAndSendTransaction, useWallets } from "@privy-io/react-auth/solana";
import { Transaction } from "@solana/web3.js";
import { ArrowUpRight, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

import { DeskTokenAvatar } from "@/_features/member-desk/desk-token-avatar";
import { WalletAssetAvatar } from "@/_components/wallet/wallet-asset-avatar";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";
import { getUsdcMint } from "@/_lib/phronis-usdc";
import { getSolanaCaip2Chain } from "@/_lib/privy-client-config";
import { cn } from "@/_lib/utils";

const PHR_MINT = getPhrDaoTokenMint() ?? "";
const USDC_MINT = getUsdcMint();

export type SendAsset = "SOL" | "USDC" | "PHR";

type Props = {
  open: boolean;
  onClose: () => void;
  walletAddress: string;
  solBal: number;
  usdcBal: number;
  phrBal: number;
  busy: string;
  onBusyChange: (v: string) => void;
  onAfterSend?: () => void;
};

export function WalletSendPanel({
  open,
  onClose,
  walletAddress,
  solBal,
  usdcBal,
  phrBal,
  busy,
  onBusyChange,
  onAfterSend,
}: Props) {
  const { getAccessToken } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const solanaChain = getSolanaCaip2Chain();

  const [asset, setAsset] = useState<SendAsset>("USDC");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successSig, setSuccessSig] = useState<string | null>(null);

  const balance = asset === "SOL" ? solBal : asset === "USDC" ? usdcBal : phrBal;
  const sending = busy === "send";

  const solanaWallet = useMemo(
    () => wallets.find((w) => w.address === walletAddress) ?? wallets[0] ?? null,
    [wallets, walletAddress],
  );

  useEffect(() => {
    if (!open) {
      setRecipient("");
      setAmount("");
      setError(null);
      setSuccessSig(null);
    }
  }, [open]);

  const setMax = useCallback(() => {
    if (asset === "SOL") {
      const reserve = 0.005;
      const max = Math.max(0, solBal - reserve);
      setAmount(max > 0 ? max.toFixed(4) : "0");
    } else if (asset === "USDC") {
      setAmount(usdcBal > 0 ? usdcBal.toFixed(2) : "0");
    } else {
      setAmount(phrBal > 0 ? String(phrBal) : "0");
    }
  }, [asset, phrBal, solBal, usdcBal]);

  const send = useCallback(async () => {
    if (!walletAddress || !recipient.trim() || !amount.trim()) return;
    if (!walletsReady || !solanaWallet) {
      setError("Wallet not ready — sync and try again.");
      return;
    }
    if (solBal < 0.001) {
      setError("Need ~0.001 SOL for network fees.");
      return;
    }

    setError(null);
    setSuccessSig(null);
    onBusyChange("send");

    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sign in required.");
        return;
      }

      const res = await fetch("/api/members/wallet/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromAddress: walletAddress,
          toAddress: recipient.trim(),
          amount: amount.trim(),
          asset,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        transaction?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.transaction) {
        setError(data.message ?? data.error ?? "Could not build transfer");
        return;
      }

      const tx = Transaction.from(Buffer.from(data.transaction, "base64"));
      const { signature } = await signAndSendTransaction({
        transaction: tx.serialize({ requireAllSignatures: false }),
        wallet: solanaWallet,
        chain: solanaChain,
      });

      const bs58 = (await import("bs58")).default;
      setSuccessSig(bs58.encode(signature));
      await onAfterSend?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Send failed";
      if (!/user rejected|cancelled|canceled/i.test(msg)) setError(msg);
    } finally {
      onBusyChange("");
    }
  }, [
    amount,
    asset,
    getAccessToken,
    onAfterSend,
    onBusyChange,
    recipient,
    signAndSendTransaction,
    solBal,
    solanaChain,
    solanaWallet,
    walletAddress,
    walletsReady,
  ]);

  if (!open) return null;

  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet" ? "" : "?cluster=devnet";
  const explorerTx = successSig ? `https://solscan.io/tx/${successSig}${cluster}` : null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-send-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#12141a] via-phronis-void to-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p id="wallet-send-title" className="text-base font-semibold text-phronis-foreground">
              Send
            </p>
            <p className="text-xs text-phronis-muted">Transfer from your Solana wallet</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-phronis-muted transition hover:bg-white/10 hover:text-phronis-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex gap-2">
            {(["SOL", "USDC", "PHR"] as const).map((a) => (
              <button
                key={a}
                type="button"
                disabled={sending || (a === "PHR" && !PHR_MINT)}
                onClick={() => {
                  setAsset(a);
                  setAmount("");
                  setError(null);
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition",
                  asset === a
                    ? "border-phronis-teal/40 bg-phronis-teal/15 text-phronis-teal"
                    : "border-white/10 bg-white/[0.03] text-phronis-muted hover:border-white/20",
                )}
              >
                {a === "PHR" && PHR_MINT ? (
                  <DeskTokenAvatar mint={PHR_MINT} symbol="PHR" size={18} className="rounded-full" />
                ) : (
                  <WalletAssetAvatar kind="token" tokenId={a.toLowerCase() as "sol" | "usdc"} size={18} />
                )}
                {a}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-phronis-muted" htmlFor="send-to">
              To address
            </label>
            <Input
              id="send-to"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Solana address"
              className="border-white/15 bg-black/30 font-mono text-sm"
              disabled={sending}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium uppercase tracking-wider text-phronis-muted" htmlFor="send-amount">
                Amount
              </label>
              <button
                type="button"
                className="text-[11px] font-semibold text-phronis-teal hover:underline disabled:opacity-40"
                disabled={sending || balance <= 0}
                onClick={setMax}
              >
                MAX
              </button>
            </div>
            <Input
              id="send-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder="0.00"
              className="border-white/15 bg-black/30 font-mono text-lg"
              disabled={sending}
            />
            <p className="text-right text-[11px] text-phronis-muted">
              Balance: {balance.toLocaleString(undefined, { maximumFractionDigits: asset === "USDC" ? 2 : 4 })} {asset}
            </p>
          </div>

          {error ? (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">{error}</p>
          ) : null}
          {successSig && explorerTx ? (
            <p className="rounded-xl border border-phronis-teal/30 bg-phronis-teal/10 px-3 py-2 text-xs text-phronis-teal">
              Sent.{" "}
              <a href={explorerTx} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                View on Solscan
              </a>
            </p>
          ) : null}

          <Button
            type="button"
            className="h-12 w-full rounded-2xl bg-phronis-teal text-base font-semibold text-phronis-void hover:opacity-90"
            disabled={sending || !recipient.trim() || !amount.trim()}
            onClick={() => void send()}
          >
            {sending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Send {asset}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
