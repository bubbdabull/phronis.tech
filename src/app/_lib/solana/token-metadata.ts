const TW = "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains";

export type TokenMetadata = {
  symbol: string;
  name: string;
  logoUrl: string;
  logoFallbackUrl?: string;
  decimals?: number;
};

type JupiterTokenRow = {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
  decimals?: number;
};

let jupiterStrictCache: Map<string, JupiterTokenRow> | null = null;
let jupiterCacheAt = 0;
const JUPITER_CACHE_MS = 10 * 60 * 1000;

async function loadJupiterStrictMap(): Promise<Map<string, JupiterTokenRow>> {
  const now = Date.now();
  if (jupiterStrictCache && now - jupiterCacheAt < JUPITER_CACHE_MS) {
    return jupiterStrictCache;
  }
  try {
    const res = await fetch("https://token.jup.ag/strict", { next: { revalidate: 600 } });
    if (!res.ok) return jupiterStrictCache ?? new Map();
    const list = (await res.json()) as JupiterTokenRow[];
    jupiterStrictCache = new Map(list.filter((t) => t.address).map((t) => [t.address, t]));
    jupiterCacheAt = now;
    return jupiterStrictCache;
  } catch {
    return jupiterStrictCache ?? new Map();
  }
}

function shortMint(mint: string): string {
  if (mint.length <= 10) return mint;
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

export function trustWalletLogoForMint(mint: string): string {
  return `${TW}/solana/assets/${mint}/logo.png`;
}

export async function resolveTokenMetadata(
  mint: string,
  decimals?: number,
): Promise<TokenMetadata> {
  const map = await loadJupiterStrictMap();
  const jup = map.get(mint);
  if (jup) {
    return {
      symbol: jup.symbol?.toUpperCase() || shortMint(mint),
      name: jup.name || jup.symbol || "Token",
      logoUrl: jup.logoURI?.trim() || trustWalletLogoForMint(mint),
      logoFallbackUrl: trustWalletLogoForMint(mint),
      decimals: jup.decimals ?? decimals,
    };
  }

  return {
    symbol: shortMint(mint),
    name: "SPL token",
    logoUrl: trustWalletLogoForMint(mint),
    logoFallbackUrl: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    decimals,
  };
}

export async function resolveTokenMetadataBatch(
  mints: string[],
  decimalsByMint?: Record<string, number>,
): Promise<Map<string, TokenMetadata>> {
  const map = await loadJupiterStrictMap();
  const out = new Map<string, TokenMetadata>();
  for (const mint of mints) {
    const jup = map.get(mint);
    const dec = decimalsByMint?.[mint];
    if (jup) {
      out.set(mint, {
        symbol: jup.symbol?.toUpperCase() || shortMint(mint),
        name: jup.name || jup.symbol || "Token",
        logoUrl: jup.logoURI?.trim() || trustWalletLogoForMint(mint),
        logoFallbackUrl: trustWalletLogoForMint(mint),
        decimals: jup.decimals ?? dec,
      });
    } else {
      out.set(mint, {
        symbol: shortMint(mint),
        name: "SPL token",
        logoUrl: trustWalletLogoForMint(mint),
        logoFallbackUrl: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
        decimals: dec,
      });
    }
  }
  return out;
}
