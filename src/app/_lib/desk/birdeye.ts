const BIRDEYE_BASE = "https://public-api.birdeye.so";

export type BirdeyeTokenOverview = Record<string, unknown>;

export async function birdeyeTokenOverview(mint: string): Promise<BirdeyeTokenOverview | null> {
  const key = process.env.BIRDEYE_API_KEY?.trim();
  if (!key) return null;
  const url = new URL(`${BIRDEYE_BASE}/defi/token_overview`);
  url.searchParams.set("address", mint.trim());
  const res = await fetch(url.toString(), {
    headers: {
      "X-API-KEY": key,
      "x-chain": "solana",
      accept: "application/json",
    },
    next: { revalidate: 45 },
  });
  if (!res.ok) return null;
  try {
    const json = (await res.json()) as { success?: boolean; data?: unknown };
    if (json.success === false || json.data === undefined || json.data === null) return null;
    return json as BirdeyeTokenOverview;
  } catch {
    return null;
  }
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Number(v);
  return null;
}

/** Pull headline stats from Birdeye’s response (shape varies by plan/version). */
export function birdeyePickMetrics(overview: BirdeyeTokenOverview | null): Record<string, string | number> {
  if (!overview) return {};
  const root = overview as { success?: boolean; data?: Record<string, unknown> };
  const data =
    root.success === true && root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : (overview as Record<string, unknown>);
  const out: Record<string, string | number> = {};
  const liq = num(data.liquidity);
  const mc = num(data.marketCap) ?? num(data.fdv);
  const v24 = num(data.v24hUSD) ?? num(data.volume24hUSD);
  const holders = num(data.holder);
  const priceChange = num(data.priceChange24hPercent);
  if (liq != null) out["Liquidity (USD, Birdeye)"] = liq >= 1e9 ? `${(liq / 1e9).toFixed(2)}B` : liq >= 1e6 ? `${(liq / 1e6).toFixed(2)}M` : `${(liq / 1e3).toFixed(0)}K`;
  if (mc != null) out["Market cap (USD)"] = mc >= 1e9 ? `${(mc / 1e9).toFixed(2)}B` : mc >= 1e6 ? `${(mc / 1e6).toFixed(2)}M` : `${(mc / 1e3).toFixed(0)}K`;
  if (v24 != null) out["Volume 24h (USD, Birdeye)"] = v24 >= 1e9 ? `${(v24 / 1e9).toFixed(2)}B` : v24 >= 1e6 ? `${(v24 / 1e6).toFixed(2)}M` : `${(v24 / 1e3).toFixed(0)}K`;
  if (holders != null) out["Holders (Birdeye)"] = Math.round(holders);
  if (priceChange != null) out["Price Δ 24h % (Birdeye)"] = Math.round(priceChange * 100) / 100;
  return out;
}
