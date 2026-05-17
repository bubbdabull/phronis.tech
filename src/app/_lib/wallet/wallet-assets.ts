/** Chain & token metadata for wallet UI (logos via Trust Wallet assets CDN). */

const TW = "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains";

export type WalletChainId =
  | "solana"
  | "ethereum"
  | "polygon"
  | "arbitrum"
  | "ink"
  | "zora"
  | "base";

export type WalletTokenId = "sol" | "usdc" | "phr";

export type WalletChainMeta = {
  id: WalletChainId;
  name: string;
  shortName: string;
  logoUrl: string;
  /** Fallback if primary CDN 404s */
  logoFallbackUrl?: string;
  explorerAddress?: (addr: string) => string;
};

export type WalletTokenMeta = {
  id: WalletTokenId;
  symbol: string;
  name: string;
  logoUrl: string;
  logoFallbackUrl?: string;
  chainId: WalletChainId;
};

export const SOLANA_CHAIN: WalletChainMeta = {
  id: "solana",
  name: "Solana",
  shortName: "SOL",
  logoUrl: `${TW}/solana/info/logo.png`,
  explorerAddress: (addr) => {
    const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet" ? "" : "?cluster=devnet";
    return `https://solscan.io/account/${addr}${cluster}`;
  },
};

/** EVM networks supported by Privy smart wallets (display order). */
export const EVM_CHAINS: readonly WalletChainMeta[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    shortName: "ETH",
    logoUrl: `${TW}/ethereum/info/logo.png`,
    logoFallbackUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    explorerAddress: (addr) => `https://etherscan.io/address/${addr}`,
  },
  {
    id: "polygon",
    name: "Polygon",
    shortName: "MATIC",
    logoUrl: `${TW}/polygon/info/logo.png`,
    logoFallbackUrl: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
    explorerAddress: (addr) => `https://polygonscan.com/address/${addr}`,
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    shortName: "ARB",
    logoUrl: `${TW}/arbitrum/info/logo.png`,
    logoFallbackUrl: "https://assets.coingecko.com/coins/images/16547/small/arb.jpg",
    explorerAddress: (addr) => `https://arbiscan.io/address/${addr}`,
  },
  {
    id: "ink",
    name: "Ink",
    shortName: "INK",
    logoUrl: `${TW}/ink/info/logo.png`,
    logoFallbackUrl: "https://assets.coingecko.com/coins/images/53328/small/ink.jpg",
    explorerAddress: (addr) => `https://explorer.inkonchain.com/address/${addr}`,
  },
  {
    id: "zora",
    name: "Zora",
    shortName: "ZORA",
    logoUrl: `${TW}/zora/info/logo.png`,
    logoFallbackUrl: "https://assets.coingecko.com/coins/images/35984/small/zora.png",
    explorerAddress: (addr) => `https://explorer.zora.energy/address/${addr}`,
  },
  {
    id: "base",
    name: "Base",
    shortName: "BASE",
    logoUrl: `${TW}/base/info/logo.png`,
    logoFallbackUrl: "https://assets.coingecko.com/coins/images/31099/small/base.jpeg",
    explorerAddress: (addr) => `https://basescan.org/address/${addr}`,
  },
] as const;

const USDC_SOL_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const WALLET_TOKENS: Record<WalletTokenId, WalletTokenMeta> = {
  sol: {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    chainId: "solana",
    logoUrl: `${TW}/solana/info/logo.png`,
  },
  usdc: {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    chainId: "solana",
    logoUrl: `${TW}/solana/assets/${USDC_SOL_MINT}/logo.png`,
    logoFallbackUrl: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  },
  phr: {
    id: "phr",
    symbol: "PHR",
    name: "Phronis DAO",
    chainId: "solana",
    logoUrl: `${TW}/solana/info/logo.png`,
  },
};

export function chainById(id: WalletChainId): WalletChainMeta | undefined {
  if (id === "solana") return SOLANA_CHAIN;
  return EVM_CHAINS.find((c) => c.id === id);
}

export function tokenById(id: WalletTokenId): WalletTokenMeta {
  return WALLET_TOKENS[id];
}

export function ethExplorerForChain(chainId: WalletChainId, address: string): string {
  const chain = chainById(chainId);
  return chain?.explorerAddress?.(address) ?? `https://etherscan.io/address/${address}`;
}
