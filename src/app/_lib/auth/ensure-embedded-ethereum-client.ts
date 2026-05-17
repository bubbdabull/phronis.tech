import type { User } from "@privy-io/react-auth";

import {
  embeddedEthereumFromConnectedWallets,
  embeddedEthereumFromReactUser,
} from "@/_lib/privy-ethereum-accounts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type CreateEthereumWallet = () => Promise<unknown>;

/**
 * Embedded Ethereum wallets are created asynchronously after email login.
 * Poll Privy user / connected wallets (and optionally call createWallet) before relying on smart wallets.
 */
export async function ensureEmbeddedEthereumOnClient(opts: {
  getUser: () => User | null;
  getConnectedWallets?: () => { address: string; chainType?: string; walletClientType?: string }[];
  createEthereumWallet?: CreateEthereumWallet;
  maxAttempts?: number;
  delayMs?: number;
}): Promise<string | null> {
  const { getUser, getConnectedWallets, createEthereumWallet, maxAttempts = 10, delayMs = 800 } = opts;

  const readAddress = () =>
    embeddedEthereumFromReactUser(getUser()) ?? embeddedEthereumFromConnectedWallets(getConnectedWallets?.() ?? []) ?? null;

  let created = false;

  for (let i = 0; i < maxAttempts; i++) {
    const addr = readAddress();
    if (addr) return addr;

    if (!created && createEthereumWallet && i >= 2) {
      try {
        await createEthereumWallet();
        created = true;
        const afterCreate = readAddress();
        if (afterCreate) return afterCreate;
      } catch {
        /* may already exist or dashboard blocks creation */
      }
    }

    await sleep(delayMs);
  }

  return readAddress();
}
