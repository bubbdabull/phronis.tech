import type { User } from "@privy-io/react-auth";

import { embeddedSolanaFromReactUser } from "@/_lib/privy-solana-accounts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type CreateSolanaWallet = () => Promise<unknown>;

/**
 * Embedded Solana wallets are created asynchronously after email OTP.
 * Poll the Privy user / Solana wallets (and optionally create a wallet) before server sync.
 *
 * Does NOT call getIdentityToken — that triggers Privy user refresh and rate limits quickly.
 */
export async function ensureEmbeddedSolanaOnClient(opts: {
  getUser: () => User | null;
  getSolanaAddress?: () => string | null;
  createSolanaWallet?: CreateSolanaWallet;
  maxAttempts?: number;
  delayMs?: number;
}): Promise<string | null> {
  const { getUser, getSolanaAddress, createSolanaWallet, maxAttempts = 10, delayMs = 800 } = opts;

  const readAddress = () =>
    embeddedSolanaFromReactUser(getUser()) ?? getSolanaAddress?.() ?? null;

  let created = false;

  for (let i = 0; i < maxAttempts; i++) {
    const addr = readAddress();
    if (addr) return addr;

    if (!created && createSolanaWallet && i >= 3) {
      try {
        await createSolanaWallet();
        created = true;
        const afterCreate = readAddress();
        if (afterCreate) return afterCreate;
      } catch {
        /* may already exist */
      }
    }

    await sleep(delayMs);
  }

  return readAddress();
}
