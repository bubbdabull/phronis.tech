import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import { getSolanaRpcUrl } from "@/_lib/solana/balances";

export type TransferAssetKind = "SOL" | "SPL";

export type BuildTransferParams = {
  fromAddress: string;
  toAddress: string;
  amount: string;
  /** Omit for SOL; SPL mint address for tokens. */
  mint?: string | null;
  decimals?: number;
};

function parseHumanAmount(amount: string, decimals: number): bigint {
  const trimmed = amount.trim();
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("invalid_amount");
  }
  const [whole, frac = ""] = trimmed.split(".");
  const fracPadded = frac.slice(0, decimals).padEnd(decimals, "0");
  const raw = BigInt(whole) * BigInt(10) ** BigInt(decimals) + BigInt(fracPadded || "0");
  if (raw <= BigInt(0)) throw new Error("invalid_amount");
  return raw;
}

/** Build an unsigned legacy transaction (base64) for SOL or SPL transfer. */
export async function buildTransferTransactionBase64(
  params: BuildTransferParams,
): Promise<{ transaction: string; kind: TransferAssetKind }> {
  const rpc = getSolanaRpcUrl();
  if (!rpc) throw new Error("rpc_not_configured");

  const from = new PublicKey(params.fromAddress.trim());
  const to = new PublicKey(params.toAddress.trim());
  const conn = new Connection(rpc, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");

  const tx = new Transaction({
    feePayer: from,
    blockhash,
    lastValidBlockHeight,
  });

  let kind: TransferAssetKind = "SOL";

  if (params.mint) {
    kind = "SPL";
    const mint = new PublicKey(params.mint);
    const decimals = params.decimals ?? 6;
    const raw = parseHumanAmount(params.amount, decimals);
    const sourceAta = getAssociatedTokenAddressSync(mint, from, false, TOKEN_PROGRAM_ID);
    const destAta = getAssociatedTokenAddressSync(mint, to, false, TOKEN_PROGRAM_ID);
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(from, destAta, to, mint, TOKEN_PROGRAM_ID),
      createTransferInstruction(sourceAta, destAta, from, raw, [], TOKEN_PROGRAM_ID),
    );
  } else {
    const sol = Number(params.amount);
    if (!Number.isFinite(sol) || sol <= 0) throw new Error("invalid_amount");
    const lamports = BigInt(Math.floor(sol * LAMPORTS_PER_SOL));
    if (lamports <= BigInt(0)) throw new Error("invalid_amount");
    tx.add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: Number(lamports),
      }),
    );
  }

  const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
  return { transaction: Buffer.from(serialized).toString("base64"), kind };
}
