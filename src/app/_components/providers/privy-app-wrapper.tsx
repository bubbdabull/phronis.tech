"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { useMemo, type ReactNode } from "react";
import { mainnet } from "viem/chains";

import { PrivyWithSolanaFunding } from "@/_components/providers/privy-solana-plugins";
import { getPrivyEmbeddedCreateOnLogin, getPrivySmartWalletPaymasterContext } from "@/_lib/privy-client-config";

/**
 * EVM chain for Privy embedded wallets. Uses Alchemy when NEXT_PUBLIC_ALCHEMY_ETH_RPC_URL is set
 * (restrict the key by HTTP referrer / domain in Alchemy).
 */
function useEvmDefaultChain() {
  return useMemo(() => {
    const url = process.env.NEXT_PUBLIC_ALCHEMY_ETH_RPC_URL?.trim();
    if (!url) return mainnet;
    return {
      ...mainnet,
      rpcUrls: {
        default: { http: [url] },
        public: { http: [url] },
      },
    };
  }, []);
}

/**
 * Single Privy root so wallet session is shared across routes that mount this provider.
 * Auth: email only. Wallets: Privy embedded (Solana + Ethereum) — no external extension login.
 */
export function PrivyAppWrapper({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
  const evmChain = useEvmDefaultChain();
  const embeddedCreate = useMemo(() => getPrivyEmbeddedCreateOnLogin(), []);
  const smartWalletPaymaster = useMemo(() => getPrivySmartWalletPaymasterContext(), []);

  if (!appId) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          walletChainType: "ethereum-and-solana",
          accentColor: "#5eead4",
          showWalletLoginFirst: false,
          landingHeader: "Sign in",
          loginMessage:
            "Sign in with email. We create your Solana and Ethereum embedded wallets automatically — no browser extension required.",
        },
        supportedChains: [evmChain],
        defaultChain: evmChain,
        loginMethods: ["email"],
        embeddedWallets: {
          ethereum: { createOnLogin: embeddedCreate.ethereum },
          solana: { createOnLogin: embeddedCreate.solana },
          showWalletUIs: true,
        },
      }}
    >
      <SmartWalletsProvider config={smartWalletPaymaster ? { paymasterContext: smartWalletPaymaster } : undefined}>
        <PrivyWithSolanaFunding>{children}</PrivyWithSolanaFunding>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}
