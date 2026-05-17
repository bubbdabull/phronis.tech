/**
 * Solana SPL tokens shown in the member wallet (built-ins + optional extras from env).
 * Logos use Trust Wallet assets CDN by mint; override per token with logoUrl in JSON.
 */

const TW = "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains";

export type SplTokenDefinition = {
  /** Stable key for UI (built-in ids or mint prefix). */
  id: string;
  mint: string;
  symbol: string;
  name: string;
  logoUrl: string;
  logoFallbackUrl?: string;
  decimals?: number;
  /** Core tokens always listed first. */
  core?: boolean;
};

function trustWalletLogo(mint: string): string {
  return `${TW}/solana/assets/${mint}/logo.png`;
}

function parseExtraTokensFromEnv(): SplTokenDefinition[] {
  const raw = process.env.NEXT_PUBLIC_SOLANA_EXTRA_TOKENS?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: SplTokenDefinition[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const mint = typeof o.mint === "string" ? o.mint.trim() : "";
      const symbol = typeof o.symbol === "string" ? o.symbol.trim().toUpperCase() : "";
      const name = typeof o.name === "string" ? o.name.trim() : symbol;
      if (!mint || !symbol) continue;
      const logoUrl =
        typeof o.logoUrl === "string" && o.logoUrl.trim()
          ? o.logoUrl.trim()
          : trustWalletLogo(mint);
      const logoFallbackUrl =
        typeof o.logoFallbackUrl === "string" && o.logoFallbackUrl.trim() ? o.logoFallbackUrl.trim() : undefined;
      const decimals = typeof o.decimals === "number" ? o.decimals : undefined;
      out.push({
        id: `mint-${mint.slice(0, 8)}`,
        mint,
        symbol,
        name: name || symbol,
        logoUrl,
        logoFallbackUrl,
        decimals,
      });
    }
    return out;
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[wallet] NEXT_PUBLIC_SOLANA_EXTRA_TOKENS is not valid JSON");
    }
    return [];
  }
}

/** Registry entries for balance sync (server + client). */
export function getSolanaTokenRegistry(phrMint: string | null, usdcMint: string): SplTokenDefinition[] {
  const phrLogo =
    process.env.NEXT_PUBLIC_PHR_TOKEN_LOGO_URL?.trim() ||
    (phrMint ? trustWalletLogo(phrMint) : `${TW}/solana/info/logo.png`);

  const core: SplTokenDefinition[] = [
    {
      id: "usdc",
      mint: usdcMint,
      symbol: "USDC",
      name: "USD Coin",
      logoUrl: trustWalletLogo(usdcMint),
      logoFallbackUrl: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
      decimals: 6,
      core: true,
    },
  ];

  if (phrMint) {
    core.push({
      id: "phr",
      mint: phrMint,
      symbol: "PHR",
      name: "Phronis DAO",
      logoUrl: phrLogo,
      logoFallbackUrl: `${TW}/solana/info/logo.png`,
      core: true,
    });
  }

  const extras = parseExtraTokensFromEnv();
  const seen = new Set(core.map((t) => t.mint));
  for (const t of extras) {
    if (seen.has(t.mint)) continue;
    seen.add(t.mint);
    core.push(t);
  }
  return core;
}

export function splTokenLogoUrl(mint: string, override?: string | null): string {
  if (override?.trim()) return override.trim();
  return trustWalletLogo(mint);
}
