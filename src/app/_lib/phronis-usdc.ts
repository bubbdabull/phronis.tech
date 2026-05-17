/** Solana USDC SPL mint (public). Defaults to mainnet USDC when unset. */
const MAINNET_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export function getUsdcMint(): string {
  const v = process.env.NEXT_PUBLIC_USDC_MINT?.trim();
  if (v) return v;
  if (process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "devnet") {
    return "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
  }
  return MAINNET_USDC_MINT;
}
