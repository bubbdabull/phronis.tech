import type { DiscoveredSplToken } from "@/_lib/solana/spl-token-scan";
import { resolveTokenMetadataBatch, type TokenMetadata } from "@/_lib/solana/token-metadata";

export type SplBalanceEntry = {
  balance: number;
  decimals?: number;
  symbol?: string;
  name?: string;
  logoUrl?: string;
};

export function parseSplBalanceEntry(raw: unknown): SplBalanceEntry | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return { balance: raw };
  }
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const balance = typeof o.balance === "number" ? o.balance : Number(o.balance);
  if (!Number.isFinite(balance)) return null;
  return {
    balance,
    decimals: typeof o.decimals === "number" ? o.decimals : undefined,
    symbol: typeof o.symbol === "string" ? o.symbol : undefined,
    name: typeof o.name === "string" ? o.name : undefined,
    logoUrl: typeof o.logoUrl === "string" ? o.logoUrl : undefined,
  };
}

export function splBalancesFromDb(
  raw: Record<string, unknown> | null | undefined,
): Record<string, SplBalanceEntry> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, SplBalanceEntry> = {};
  for (const [mint, v] of Object.entries(raw)) {
    const entry = parseSplBalanceEntry(v);
    if (entry && entry.balance > 0) out[mint] = entry;
  }
  return out;
}

/** Build DB payload: every discovered mint with metadata (excludes core mints stored in dedicated columns). */
export async function buildSplBalancesPayload(
  discovered: DiscoveredSplToken[],
  opts: { usdcMint: string; phrMint: string | null },
): Promise<Record<string, SplBalanceEntry>> {
  const exclude = new Set([opts.usdcMint, ...(opts.phrMint ? [opts.phrMint] : [])]);
  const extra = discovered.filter((t) => !exclude.has(t.mint));
  if (extra.length === 0) return {};

  const meta = await resolveTokenMetadataBatch(
    extra.map((t) => t.mint),
    Object.fromEntries(extra.map((t) => [t.mint, t.decimals])),
  );

  const out: Record<string, SplBalanceEntry> = {};
  for (const t of extra) {
    const m: TokenMetadata | undefined = meta.get(t.mint);
    out[t.mint] = {
      balance: t.balance,
      decimals: m?.decimals ?? t.decimals,
      symbol: m?.symbol,
      name: m?.name,
      logoUrl: m?.logoUrl,
    };
  }
  return out;
}
