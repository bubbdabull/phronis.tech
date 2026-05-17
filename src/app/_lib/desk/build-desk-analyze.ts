import type { DeskAnalyzeResult } from "@/_types/desk";
import { birdeyePickMetrics, birdeyeTokenOverview } from "@/_lib/desk/birdeye";
import { dexscreenerTokenPairs, type DexPairRow } from "@/_lib/desk/dexscreener";

function pickBestPair(pairs: DexPairRow[]): DexPairRow | null {
  if (!pairs.length) return null;
  return pairs.reduce((a, b) => ((a.volume?.h24 ?? 0) >= (b.volume?.h24 ?? 0) ? a : b));
}

function trustAndRug(pair: DexPairRow | null, birdeyePresent: boolean): { trust: number; rug: number; risk: DeskAnalyzeResult["riskLevel"] } {
  let trust = 42;
  const liq = pair?.liquidity?.usd ?? 0;
  if (liq >= 2_000_000) trust += 22;
  else if (liq >= 500_000) trust += 16;
  else if (liq >= 100_000) trust += 10;
  else if (liq >= 30_000) trust += 4;
  else trust -= 8;

  const ch = pair?.priceChange?.h24 ?? 0;
  if (ch > 15) trust += 6;
  else if (ch < -40) trust -= 18;
  else if (ch < -15) trust -= 8;

  const buys = pair?.txns?.h24?.buys ?? 0;
  const sells = pair?.txns?.h24?.sells ?? 0;
  const total = buys + sells;
  if (total > 50) {
    const buyRatio = buys / total;
    if (buyRatio > 0.62) trust += 5;
    if (buyRatio < 0.38) trust -= 6;
  }

  if (birdeyePresent) trust += 6;

  trust = Math.max(5, Math.min(95, Math.round(trust)));
  const rug = Math.max(3, Math.min(92, Math.round(100 - trust + (liq < 80_000 ? 12 : 0))));
  let risk: DeskAnalyzeResult["riskLevel"] = "medium";
  if (rug >= 85 && liq < 15_000) risk = "extreme";
  else if (rug >= 72 || liq < 25_000) risk = "high";
  else if (rug >= 55) risk = "medium";
  else risk = "low";
  return { trust, rug, risk };
}

function highFlow(pair: DexPairRow | null): boolean {
  return (pair?.volume?.h24 ?? 0) > 1_000_000;
}

export async function buildDeskAnalyze(mint: string): Promise<DeskAnalyzeResult | null> {
  const pairs = await dexscreenerTokenPairs("solana", [mint]);
  const best = pickBestPair(pairs);
  const birdeye = await birdeyeTokenOverview(mint);
  if (!best && !birdeye) return null;

  const birdeyePresent = Boolean(birdeye);
  const { trust, rug, risk } = trustAndRug(best, birdeyePresent);

  const metrics: Record<string, string | number> = {};
  if (best?.liquidity?.usd != null) {
    const u = best.liquidity.usd;
    metrics["LP (USD, DexScreener)"] = u >= 1e6 ? `${(u / 1e6).toFixed(2)}M` : `${(u / 1e3).toFixed(0)}K`;
  }
  if (best?.pairCreatedAt) {
    const ageH = Math.max(0, Math.floor((Date.now() - best.pairCreatedAt) / 3600000));
    metrics["Approx. pair age"] = ageH > 48 ? `${Math.floor(ageH / 24)}d` : `${ageH}h`;
  }
  if (best?.volume?.h24 != null) {
    metrics["Volume 24h (USD)"] =
      best.volume.h24 >= 1e6 ? `${(best.volume.h24 / 1e6).toFixed(2)}M` : `${(best.volume.h24 / 1e3).toFixed(0)}K`;
  }
  if (best?.priceChange?.h24 != null) metrics["Price Δ 24h %"] = Math.round(best.priceChange.h24 * 100) / 100;
  const buys = best?.txns?.h24?.buys ?? 0;
  const sells = best?.txns?.h24?.sells ?? 0;
  if (buys + sells > 0) metrics["Buys / sells 24h"] = `${buys} / ${sells}`;
  if (best?.dexId) metrics["Top pair DEX"] = String(best.dexId);

  Object.assign(metrics, birdeyePickMetrics(birdeye));

  const bullishSignals: string[] = [];
  const bearishSignals: string[] = [];
  const reasonsToAvoid: string[] = [];
  const reasonsTradersCare: string[] = [];

  if ((best?.volume?.h24 ?? 0) > 500_000) bullishSignals.push("Elevated 24h volume on the deepest pair (DexScreener).");
  if ((best?.priceChange?.h24 ?? 0) > 5) bullishSignals.push("Positive 24h price change on the top pair.");
  if (birdeyePresent) bullishSignals.push("Birdeye returned token overview fields.");

  if ((best?.liquidity?.usd ?? 0) < 80_000) bearishSignals.push("Thin liquidity on the top pair — exit risk.");
  if ((best?.priceChange?.h24 ?? 0) < -15) bearishSignals.push("Sharp negative 24h move on the top pair.");
  if (buys + sells > 80 && sells > buys * 1.2) bearishSignals.push("Sell-heavy 24h tx counts on the top pair.");

  if ((best?.liquidity?.usd ?? 0) < 50_000) reasonsToAvoid.push("Low LP for size — manipulation and rug risk are elevated.");
  if (risk === "extreme" || risk === "high") {
    reasonsToAvoid.push("Heuristic risk bucket is high — verify mint/freeze authority and LP lock manually.");
  }

  if (highFlow(best)) reasonsTradersCare.push("Strong DEX flow in the last 24h — attention / narrative risk-reward.");
  if ((best?.priceChange?.h24 ?? 0) > 20) reasonsTradersCare.push("Large positive 24h move can attract momentum flow.");

  const aiSummary = [
    `Heuristic desk read for ${mint.slice(0, 6)}…${mint.slice(-4)}.`,
    best ? `Primary venue: ${best.dexId ?? "unknown DEX"} (DexScreener).` : "No DexScreener pair row for this mint.",
    birdeyePresent ? "Birdeye overview merged where fields exist." : "Set BIRDEYE_API_KEY for richer holder and liquidity stats.",
    "Not financial advice; state changes every block.",
  ].join(" ");

  return {
    mint,
    symbol: best?.baseToken?.symbol ?? null,
    imageUrl: best?.info?.imageUrl ?? null,
    trustScore: trust,
    riskLevel: risk,
    rugProbabilityPct: rug,
    bullishSignals: bullishSignals.length ? bullishSignals : ["No strong bullish heuristics fired — DYOR."],
    bearishSignals: bearishSignals.length ? bearishSignals : ["No extra bearish flags beyond baseline volatility."],
    reasonsToAvoid: reasonsToAvoid.length ? reasonsToAvoid : ["Unknown team / tokenomics — default skepticism applies."],
    reasonsTradersCare: reasonsTradersCare.length ? reasonsTradersCare : ["Listed on DEX scanners; visibility can drive flow."],
    aiSummary,
    metrics,
  };
}
