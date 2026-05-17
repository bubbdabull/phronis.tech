"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useMemo } from "react";

import { useEmbeddedEthereumAddress } from "@/_hooks/use-embedded-ethereum-address";
import { extractEthereumWallets } from "@/_lib/privy-ethereum-accounts";

export type EthereumSmartWalletStatus =
  | "loading"
  | "ready"
  | "linking"
  | "needs_eth_signer"
  | "provisioning_eth"
  | "needs_dashboard";

function readSmartWalletFromUser(user: { smartWallet?: { address?: string } } | null | undefined): string | null {
  const addr = user?.smartWallet?.address?.trim();
  return addr || null;
}

/**
 * Resolves the user's ERC-4337 smart wallet address from Privy user + SmartWallets SDK.
 */
export function useEthereumSmartWallet() {
  const { user, ready: privyReady } = usePrivy();
  const { client: smartWalletClient } = useSmartWallets();
  const { address: ethEmbedded, provisioning: ethProvisioning, ensureAddress, walletsReady } = useEmbeddedEthereumAddress();

  const ethWallets = useMemo(() => extractEthereumWallets(user), [user]);

  const smartWalletAddress = useMemo(() => {
    return (
      readSmartWalletFromUser(user) ??
      ethWallets.find((w) => w.kind === "smart_wallet")?.address ??
      smartWalletClient?.account?.address ??
      null
    );
  }, [user, ethWallets, smartWalletClient?.account?.address]);

  const status: EthereumSmartWalletStatus = useMemo(() => {
    if (!privyReady || !walletsReady) return "loading";
    if (smartWalletAddress) return "ready";
    if (ethProvisioning) return "provisioning_eth";
    if (!ethEmbedded) return "needs_eth_signer";
    return "linking";
  }, [privyReady, smartWalletAddress, ethProvisioning, ethEmbedded, walletsReady]);

  return {
    smartWalletAddress,
    ethEmbedded,
    ethWallets,
    status,
    privyReady,
    ethProvisioning,
    hasSmartWalletClient: Boolean(smartWalletClient),
    ensureEthAddress: ensureAddress,
  };
}
