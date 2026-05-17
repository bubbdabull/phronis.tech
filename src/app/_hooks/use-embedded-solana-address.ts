"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCreateWallet, useWallets } from "@privy-io/react-auth/solana";
import { useCallback, useMemo, useRef, useState } from "react";

import { ensureEmbeddedSolanaOnClient } from "@/_lib/auth/ensure-embedded-solana-client";
import { isPrivyRateLimitError } from "@/_lib/auth/privy-identity-token";
import {
  embeddedSolanaFromReactUser,
  embeddedSolanaFromSolanaWallets,
} from "@/_lib/privy-solana-accounts";

/**
 * Resolves the user's embedded Solana address from Privy linked accounts and Solana wallets,
 * with optional client-side provisioning (poll + createWallet).
 */
export function useEmbeddedSolanaAddress() {
  const { user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { createWallet } = useCreateWallet();
  const [provisioning, setProvisioning] = useState(false);
  const provisioningRef = useRef(false);

  const fromLinked = useMemo(() => embeddedSolanaFromReactUser(user), [user]);
  const fromSolanaWallets = useMemo(() => embeddedSolanaFromSolanaWallets(wallets), [wallets]);
  const address = fromLinked ?? fromSolanaWallets ?? null;

  const ensureAddress = useCallback(async (): Promise<string | null> => {
    const immediate = embeddedSolanaFromReactUser(user) ?? embeddedSolanaFromSolanaWallets(wallets);
    if (immediate) return immediate;

    if (provisioningRef.current) return null;
    provisioningRef.current = true;
    setProvisioning(true);
    try {
      return await ensureEmbeddedSolanaOnClient({
        getUser: () => user ?? null,
        getSolanaAddress: () => embeddedSolanaFromSolanaWallets(wallets),
        createSolanaWallet: async () => {
          await createWallet();
        },
        maxAttempts: 8,
        delayMs: 1000,
      });
    } catch (err) {
      if (isPrivyRateLimitError(err)) return embeddedSolanaFromReactUser(user) ?? embeddedSolanaFromSolanaWallets(wallets);
      throw err;
    } finally {
      provisioningRef.current = false;
      setProvisioning(false);
    }
  }, [user, wallets, createWallet]);

  return {
    address,
    fromLinked,
    fromSolanaWallets,
    walletsReady,
    provisioning,
    ensureAddress,
  };
}
