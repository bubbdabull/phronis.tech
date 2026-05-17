"use client";

import { Copy, QrCode, X } from "lucide-react";
import { useCallback, useState } from "react";

import { WalletAssetAvatar } from "@/_components/wallet/wallet-asset-avatar";
import { Button } from "@/_components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  address: string;
  qrUrl: string;
  clusterLabel: string;
};

export function WalletReceivePanel({ open, onClose, address, qrUrl, clusterLabel }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [address]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-receive-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#12141a] via-phronis-void to-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <WalletAssetAvatar kind="chain" chainId="solana" size={24} className="rounded-lg" />
            <div>
              <p id="wallet-receive-title" className="text-base font-semibold text-phronis-foreground">
                Receive
              </p>
              <p className="text-xs text-phronis-muted">Solana · {clusterLabel}</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-phronis-muted transition hover:bg-white/10"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center px-5 py-6">
          {qrUrl ? (
            <div className="rounded-2xl border border-white/10 bg-white p-3 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} width={200} height={200} alt="Deposit QR code" className="rounded-lg" />
            </div>
          ) : (
            <div className="flex h-[200px] w-[200px] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <QrCode className="h-12 w-12 text-phronis-muted" />
            </div>
          )}
          <p className="mt-5 break-all text-center font-mono text-sm leading-relaxed text-phronis-foreground">{address}</p>
          <p className="mt-3 max-w-xs text-center text-xs leading-relaxed text-phronis-muted">
            Send SOL, USDC, PHR, or any SPL token on Solana {clusterLabel}. Only use this network — wrong-chain sends cannot be
            recovered.
          </p>
          <Button
            type="button"
            className="mt-5 h-11 w-full rounded-2xl bg-phronis-teal font-semibold text-phronis-void hover:opacity-90"
            onClick={() => void copy()}
          >
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Copied" : "Copy address"}
          </Button>
        </div>
      </div>
    </div>
  );
}
