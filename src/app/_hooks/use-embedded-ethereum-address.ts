"use client";

import { useCreateWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ensureEmbeddedEthereumOnClient } from "@/_lib/auth/ensure-embedded-ethereum-client";
import { isPrivyRateLimitError } from "@/_lib/auth/privy-identity-token";
import {
  embeddedEthereumFromConnectedWallets,
  embeddedEthereumFromReactUser,
} from "@/_lib/privy-ethereum-accounts";

/**
 * Resolves the user's embedded Ethereum signer from Privy linked accounts and connected wallets,
 * with client-side provisioning when missing (same pattern as Solana).
 */
export function useEmbeddedEthereumAddress() {
  const { user, authenticated, ready: privyReady } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { createWallet } = useCreateWallet();
  const [provisioning, setProvisioning] = useState(false);
  const provisioningRef = useRef(false);

  const fromLinked = useMemo(() => embeddedEthereumFromReactUser(user), [user]);
  const fromConnected = useMemo(() => embeddedEthereumFromConnectedWallets(wallets), [wallets]);
  const address = fromLinked ?? fromConnected ?? null;

  const ensureAddress = useCallback(async (): Promise<string | null> => {
    const immediate = embeddedEthereumFromReactUser(user) ?? embeddedEthereumFromConnectedWallets(wallets);
    if (immediate) return immediate;

    if (provisioningRef.current) return null;
    provisioningRef.current = true;
    setProvisioning(true);
    try {
      return await ensureEmbeddedEthereumOnClient({
        getUser: () => user ?? null,
        getConnectedWallets: () => wallets,
        createEthereumWallet: async () => {
          await createWallet();
        },
        maxAttempts: 8,
        delayMs: 1000,
      });
    } catch (err) {
      if (isPrivyRateLimitError(err)) {
        return embeddedEthereumFromReactUser(user) ?? embeddedEthereumFromConnectedWallets(wallets);
      }
      throw err;
    } finally {
      provisioningRef.current = false;
      setProvisioning(false);
    }
  }, [createWallet, user, wallets]);

  useEffect(() => {
    if (!privyReady || !authenticated || address) return;
    void ensureAddress();
  }, [address, authenticated, ensureAddress, privyReady]);

  return {
    address,
    fromLinked,
    fromConnected,
    walletsReady,
    provisioning,
    ensureAddress,
  };
}
