const BASE = "https://api.dexscreener.com";

export type DexBoostRow = {
  chainId?: string;
  tokenAddress?: string;
  url?: string;
  description?: string;
};

export type DexPairRow = {
  dexId?: string;
  chainId?: string;
  /** DexScreener token image (when provided by API). */
  info?: { imageUrl?: string };
  baseToken?: { address?: string; name?: string; symbol?: string };
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  pairCreatedAt?: number;
  txns?: { h24?: { buys?: number; sells?: number } };
};

/** Top boosted tokens (public; ~60 req/min). Solana-focused slice for the desk. */
export async function dexscreenerTopBoostsSolana(limit = 8): Promise<DexBoostRow[]> {
  const res = await fetch(`${BASE}/token-boosts/top/v1`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];
  return data
    .filter((r): r is DexBoostRow => typeof r === "object" && r !== null && (r as DexBoostRow).chainId === "solana")
    .slice(0, limit);
}

/** Best pair rows per mint (DexScreener `tokens/v1`). Up to ~20 addresses comma-separated. */
export async function dexscreenerTokenPairs(chainId: string, mints: string[]): Promise<DexPairRow[]> {
  const uniq = [...new Set(mints.map((m) => m.trim()).filter(Boolean))].slice(0, 20);
  if (!uniq.length) return [];
  const res = await fetch(`${BASE}/tokens/v1/${chainId}/${uniq.join(",")}`, { next: { revalidate: 30 } });
  if (!res.ok) return [];
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as DexPairRow[]) : [];
}

export async function dexscreenerSearchPairs(query: string, limit = 25): Promise<DexPairRow[]> {
  const q = query.trim().slice(0, 80);
  if (!q) return [];
  const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`, {
    next: { revalidate: 45 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { pairs?: DexPairRow[] };
  const pairs = data.pairs ?? [];
  return pairs
    .filter((p) => p.chainId === "solana")
    .sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0))
    .slice(0, limit);
}

function formatUsd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

/** Map boosted mints → trending rows using `tokens/v1` for symbol, 24h change, volume. */
export async function dexscreenerTrendingFromBoosts(boosts: DexBoostRow[], take = 5) {
  const mints = boosts.map((b) => b.tokenAddress).filter((m): m is string => typeof m === "string" && m.length > 20).slice(0, take);
  const pairs = await dexscreenerTokenPairs("solana", mints);
  const byMint = new Map<string, DexPairRow>();
  for (const p of pairs) {
    const addr = p.baseToken?.address;
    if (!addr) continue;
    const vol = p.volume?.h24 ?? 0;
    const prev = byMint.get(addr);
    const prevVol = prev?.volume?.h24 ?? 0;
    if (!prev || vol > prevVol) byMint.set(addr, p);
  }
  return mints.map((mint) => {
    const p = byMint.get(mint);
    const sym = p?.baseToken?.symbol ?? `${mint.slice(0, 4)}…`;
    const ch = p?.priceChange?.h24 ?? 0;
    const vol = p?.volume?.h24 ?? 0;
    return {
      symbol: sym,
      mint,
      change24hPct: Math.round(ch * 100) / 100,
      volumeUsd: formatUsd(vol),
      volumeH24: vol,
      imageUrl: p?.info?.imageUrl ?? null,
    };
  });
}

/** Young pairs for “launches” strip (smallest liquidity age proxy among provided pairs). */
export function dexscreenerRecentLaunchesFromPairs(pairs: DexPairRow[], take = 4) {
  const withTime = pairs.filter((p) => p.pairCreatedAt && p.baseToken?.address);
  const sorted = [...withTime].sort((a, b) => (a.pairCreatedAt ?? 0) - (b.pairCreatedAt ?? 0));
  const young = sorted.slice(0, take);
  return young.map((p) => {
    const ageMs = Date.now() - (p.pairCreatedAt ?? 0);
    const days = Math.max(0, Math.floor(ageMs / 86400000));
    const hours = Math.max(0, Math.floor(ageMs / 3600000));
    const age = days > 0 ? `${days}d` : `${hours}h`;
    const liq = p.liquidity?.usd ?? 0;
    let risk: "low" | "med" | "high" = "med";
    if (liq < 50_000) risk = "high";
    else if (liq > 500_000) risk = "low";
    return {
      name: p.baseToken?.symbol ?? "Token",
      mint: p.baseToken?.address ?? "",
      age,
      risk,
      imageUrl: p.info?.imageUrl ?? null,
    };
  });
}
