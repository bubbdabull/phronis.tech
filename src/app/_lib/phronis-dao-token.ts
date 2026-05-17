/** Solana SPL mint for PHR as used in DAO / member flows (public env). */
export function getPhrDaoTokenMint(): string | null {
  const v = process.env.NEXT_PUBLIC_PHRONIS_DAO_TOKEN_MINT?.trim();
  return v || null;
}
