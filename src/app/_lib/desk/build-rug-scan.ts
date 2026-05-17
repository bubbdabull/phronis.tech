import { Connection, PublicKey } from "@solana/web3.js";
import { getMint, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { birdeyeTokenOverview } from "@/_lib/desk/birdeye";
import { dexscreenerTokenPairs, type DexPairRow } from "@/_lib/desk/dexscreener";
import { getDeskSolanaRpcUrl } from "@/_lib/desk/solana-rpc";

export type RugScanResult = {
  mint: string;
  symbol?: string | null;
  imageUrl?: string | null;
  rugProbabilityPct: number;
  threatLevel: "watch" | "elevated" | "severe";
  warnings: string[];
  signals: Record<string, unknown>;
  dexLiquidityUsd: number | null;
  mintAuthorityRelinquished: boolean | null;
  freezeAuthorityEnabled: boolean | null;
};

function bestPair(pairs: DexPairRow[]): DexPairRow | null {
  if (!pairs.length) return null;
  return pairs.reduce((a, b) => ((a.volume?.h24 ?? 0) >= (b.volume?.h24 ?? 0) ? a : b));
}

/** On-chain + DEX heuristics for rug-style risk (not exhaustive; educates users). */
export async function buildRugScan(mint: string): Promise<RugScanResult> {
  const pairs = await dexscreenerTokenPairs("solana", [mint.trim()]);
  const best = bestPair(pairs);
  const liq = best?.liquidity?.usd ?? null;
  const ch = best?.priceChange?.h24 ?? 0;
  const buys = best?.txns?.h24?.buys ?? 0;
  const sells = best?.txns?.h24?.sells ?? 0;

  let mintAuthorityRelinquished: boolean | null = null;
  let freezeAuthorityEnabled: boolean | null = null;
  const rpc = getDeskSolanaRpcUrl();
  if (rpc) {
    try {
      const conn = new Connection(rpc, "confirmed");
      const mintPk = new PublicKey(mint.trim());
      for (const programId of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
        try {
          const m = await getMint(conn, mintPk, undefined, programId);
          mintAuthorityRelinquished = m.mintAuthority === null;
          freezeAuthorityEnabled = m.freezeAuthority !== null;
          break;
        } catch {
          /* try next program */
        }
      }
    } catch {
      /* invalid mint or RPC */
    }
  }

  const birdeye = await birdeyeTokenOverview(mint.trim());

  let rug = 35;
  const warnings: string[] = [];

  if (liq != null) {
    if (liq < 30_000) {
      rug += 28;
      warnings.push("Very low DEX liquidity on the top pair.");
    } else if (liq < 100_000) {
      rug += 14;
      warnings.push("Moderate liquidity — large trades can move price.");
    }
  } else {
    rug += 10;
    warnings.push("No DexScreener liquidity read for this mint.");
  }

  if (ch < -35) {
    rug += 12;
    warnings.push("Deep negative 24h price change on the top pair.");
  }

  if (buys + sells > 30 && sells > buys * 1.35) {
    rug += 8;
    warnings.push("Sell-heavy 24h transaction mix.");
  }

  if (freezeAuthorityEnabled === true) {
    rug += 15;
    warnings.push("Freeze authority is set — accounts could be frozen by the authority.");
  } else if (freezeAuthorityEnabled === false) {
    rug -= 3;
  }

  if (mintAuthorityRelinquished === false) {
    rug += 12;
    warnings.push("Mint authority still present — additional supply could be minted.");
  } else if (mintAuthorityRelinquished === true) {
    rug -= 5;
  }

  if (birdeye) rug -= 3;

  rug = Math.max(5, Math.min(94, Math.round(rug)));
  let threatLevel: RugScanResult["threatLevel"] = "watch";
  if (rug >= 72) threatLevel = "severe";
  else if (rug >= 52) threatLevel = "elevated";

  return {
    mint: mint.trim(),
    symbol: best?.baseToken?.symbol ?? null,
    imageUrl: best?.info?.imageUrl ?? null,
    rugProbabilityPct: rug,
    threatLevel,
    warnings: warnings.length ? warnings : ["No critical flags from this pass — still verify team, LP lock, and socials manually."],
    signals: {
      liquidityUsd: liq,
      priceChange24h: ch,
      buys24h: buys,
      sells24h: sells,
      dexId: best?.dexId ?? null,
      birdeyeLoaded: Boolean(birdeye),
    },
    dexLiquidityUsd: liq,
    mintAuthorityRelinquished,
    freezeAuthorityEnabled,
  };
}
