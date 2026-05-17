/** DexScreener CDN pattern used when the API does not return `info.imageUrl`. */
export function dexscreenerTokenImageUrl(mint: string): string {
  return `https://dd.dexscreener.com/ds-data/tokens/solana/${encodeURIComponent(mint.trim())}.png`;
}

export function pickDexTokenImageUrl(mint: string, apiImage?: string | null): string {
  const m = mint.trim();
  const fromApi = apiImage?.trim();
  if (fromApi) return fromApi;
  return dexscreenerTokenImageUrl(m);
}
