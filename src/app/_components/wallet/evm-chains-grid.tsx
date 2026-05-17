"use client";

import { EVM_CHAINS } from "@/_lib/wallet/wallet-assets";
import { cn } from "@/_lib/utils";

import { WalletAssetAvatar } from "./wallet-asset-avatar";

type Props = {
  className?: string;
  /** Highlight chain where smart wallet is deployed (default Ethereum). */
  activeChainId?: "ethereum";
};

export function EvmChainsGrid({ className, activeChainId = "ethereum" }: Props) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-phronis-muted">Supported EVM networks</p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EVM_CHAINS.map((chain) => {
          const active = chain.id === activeChainId;
          return (
            <li
              key={chain.id}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors",
                active
                  ? "border-phronis-teal/35 bg-phronis-teal/[0.08] ring-1 ring-phronis-teal/20"
                  : "border-white/10 bg-white/[0.03] hover:border-white/15",
              )}
            >
              <WalletAssetAvatar kind="chain" chainId={chain.id} size={32} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-phronis-foreground">{chain.name}</p>
                <p className="text-[10px] text-phronis-muted">{active ? "Smart wallet home" : "Cross-chain ready"}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
