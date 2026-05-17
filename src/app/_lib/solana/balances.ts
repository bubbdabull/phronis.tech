import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";
import { getUsdcMint } from "@/_lib/phronis-usdc";
import { fetchDiscoveredSplTokens } from "@/_lib/solana/spl-token-scan";

export type WalletBalances = {
  sol: number;
  phronis: number;
  usdc: number;
  lamports: number;
  /** All SPL mints discovered on-chain (includes USDC/PHR). */
  discovered: Awaited<ReturnType<typeof fetchDiscoveredSplTokens>>;
};

export function getSolanaRpcUrl(): string | null {
  const u = process.env.SOLANA_RPC_URL?.trim() || process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();
  return u || null;
}

export async function fetchWalletBalances(
  walletAddress: string,
  mintOverride?: string | null,
  opts?: { rpcUrlOverride?: string | null },
): Promise<WalletBalances> {
  const rpc = opts?.rpcUrlOverride?.trim() || getSolanaRpcUrl();
  if (!rpc) {
    return { sol: 0, phronis: 0, usdc: 0, lamports: 0, discovered: [] };
  }

  const phrMint = mintOverride ?? getPhrDaoTokenMint();
  const usdcMint = getUsdcMint();
  const conn = new Connection(rpc, "confirmed");
  const owner = new PublicKey(walletAddress);
  const [lamports, discovered] = await Promise.all([
    conn.getBalance(owner, "confirmed"),
    fetchDiscoveredSplTokens(conn, owner),
  ]);

  const byMint = Object.fromEntries(discovered.map((t) => [t.mint, t.balance]));
  const phronis = phrMint ? (byMint[phrMint] ?? 0) : 0;
  const usdc = byMint[usdcMint] ?? 0;

  return {
    lamports,
    sol: lamports / LAMPORTS_PER_SOL,
    phronis,
    usdc,
    discovered,
  };
}
