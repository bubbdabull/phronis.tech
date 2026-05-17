import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export type DiscoveredSplToken = {
  mint: string;
  balance: number;
  decimals: number;
};

type ParsedTokenAmount = {
  uiAmount: number | null;
  amount: string;
  decimals: number;
};

function readTokenAmount(info: { tokenAmount?: ParsedTokenAmount }): { balance: number; decimals: number } | null {
  const ta = info.tokenAmount;
  if (!ta) return null;
  const decimals = ta.decimals ?? 0;
  const balance =
    ta.uiAmount != null ? ta.uiAmount : Number(ta.amount) / 10 ** Math.max(0, decimals);
  return { balance, decimals };
}

/** All SPL / Token-2022 accounts with a positive balance for this owner. */
export async function fetchDiscoveredSplTokens(
  conn: Connection,
  owner: PublicKey,
): Promise<DiscoveredSplToken[]> {
  const byMint = new Map<string, DiscoveredSplToken>();

  for (const programId of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
    const resp = await conn.getParsedTokenAccountsByOwner(owner, { programId });
    for (const { account } of resp.value) {
      const data = account.data;
      if (!data || typeof data !== "object" || !("parsed" in data)) continue;
      const parsed = data as { parsed?: { info?: { mint?: string; tokenAmount?: ParsedTokenAmount } } };
      const info = parsed.parsed?.info;
      const mint = info?.mint;
      if (!mint || !info) continue;
      const amount = readTokenAmount(info);
      if (!amount || amount.balance <= 0) continue;

      const prev = byMint.get(mint);
      if (prev) {
        prev.balance += amount.balance;
      } else {
        byMint.set(mint, { mint, balance: amount.balance, decimals: amount.decimals });
      }
    }
  }

  return [...byMint.values()];
}
