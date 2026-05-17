import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";
import { getUsdcMint } from "@/_lib/phronis-usdc";

export type WalletBalances = {
  sol: number;
  /** Raw token amount as decimal number (uses mint decimals from chain). */
  phronis: number;
  usdc: number;
  lamports: number;
};

async function fetchSplUiAmount(
  conn: Connection,
  owner: PublicKey,
  mintStr: string,
): Promise<number> {
  try {
    const mint = new PublicKey(mintStr);
    const ata = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID);
    const bal = await conn.getTokenAccountBalance(ata, "confirmed");
    return bal.value.uiAmount ?? Number(bal.value.amount) / 10 ** bal.value.decimals;
  } catch {
    return 0;
  }
}

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
    return { sol: 0, phronis: 0, usdc: 0, lamports: 0 };
  }
  const phrMint = mintOverride ?? getPhrDaoTokenMint();
  const conn = new Connection(rpc, "confirmed");
  const owner = new PublicKey(walletAddress);
  const lamports = await conn.getBalance(owner, "confirmed");
  const [phronis, usdc] = await Promise.all([
    phrMint ? fetchSplUiAmount(conn, owner, phrMint) : Promise.resolve(0),
    fetchSplUiAmount(conn, owner, getUsdcMint()),
  ]);
  return {
    lamports,
    sol: lamports / LAMPORTS_PER_SOL,
    phronis,
    usdc,
  };
}
