"use client";

import { useFiatOnramp } from "@privy-io/react-auth";
import { useFundWallet } from "@privy-io/react-auth/solana";
import { useCallback } from "react";

import { getPrivyFiatOnrampEnvironment, getSolanaCaip2Chain } from "@/_lib/privy-client-config";

export type SolanaCardFundingProvider = "coinbase" | "moonpay" | "meld";
export type SolanaCardFundingAsset = "native-currency" | "USDC";

type Options = {
  address: string;
  onFlowExited?: () => void;
};

/**
 * Card on-ramp for Solana: direct Coinbase/MoonPay via legacy `useFundWallet`,
 * Meld aggregator via `useFiatOnramp` with legacy fallback if needed.
 */
export function useSolanaCardFunding({ address, onFlowExited }: Options) {
  const { fundWallet } = useFundWallet({ onUserExited: onFlowExited });
  const { fund: fundFiat } = useFiatOnramp();
  const solanaChain = getSolanaCaip2Chain();

  const fundWithProvider = useCallback(
    async (provider: SolanaCardFundingProvider, asset: SolanaCardFundingAsset) => {
      if (!address) return;

      const amount = asset === "USDC" ? "25" : "0.05";
      const legacyOptions = {
        chain: solanaChain,
        asset,
        amount,
        defaultFundingMethod: "card" as const,
      };

      if (provider === "meld") {
        const fiatAsset = asset === "USDC" ? "usdc" : "sol";
        try {
          await fundFiat({
            source: { assets: ["usd"], defaultAsset: "usd" },
            destination: {
              asset: fiatAsset,
              chain: solanaChain,
              address,
            },
            environment: getPrivyFiatOnrampEnvironment(),
            defaultAmount: asset === "USDC" ? "25" : "50",
          });
          return;
        } catch {
          /* Meld / fiat flow cancelled or unavailable — fall back to Privy provider picker */
        }
      }

      if (provider === "coinbase" || provider === "moonpay") {
        await fundWallet({
          address,
          options: {
            ...legacyOptions,
            card: { preferredProvider: provider },
          },
        });
        return;
      }

      await fundWallet({ address, options: legacyOptions });
    },
    [address, fundFiat, fundWallet, solanaChain],
  );

  return {
    fundWithProvider,
    solanaChain,
    isMainnet: solanaChain === "solana:mainnet",
  };
}
