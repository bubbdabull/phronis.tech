/** Prefer Helius RPC when HELIUS_API_KEY is set (matches NEXT_PUBLIC_SOLANA_CLUSTER). */
export function getDeskSolanaRpcUrl(): string | null {
  const helius = process.env.HELIUS_API_KEY?.trim();
  if (helius) {
    const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "devnet" ? "devnet" : "mainnet";
    const host = cluster === "devnet" ? "https://devnet.helius-rpc.com/?api-key=" : "https://mainnet.helius-rpc.com/?api-key=";
    return `${host}${encodeURIComponent(helius)}`;
  }
  const u = process.env.SOLANA_RPC_URL?.trim() || process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();
  return u || null;
}
