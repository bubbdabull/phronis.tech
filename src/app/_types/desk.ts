/** Dashboard payload for the member Terminal home (live APIs + Supabase). */
export type DeskSummary = {
  headline: string;
  subline: string;
  walletSol: number;
  walletPhr: number;
  watchlistCount: number;
  xpLevel: { level: number; xp: number; nextLevelXp: number };
  sentiment: { label: string; score: number };
  trending: Array<{
    symbol: string;
    mint: string;
    change24hPct: number;
    volumeUsd: string;
    /** Raw 24h volume (USD) for charts. */
    volumeH24: number;
    imageUrl?: string | null;
  }>;
  smartMoney: Array<{ wallet: string; action: string; token: string; ago: string }>;
  launches: Array<{ name: string; mint: string; age: string; risk: "low" | "med" | "high"; imageUrl?: string | null }>;
  riskOverview: { portfolioRisk: number; rugAlerts: number };
  education: { modulesDone: number; modulesTotal: number; streakDays: number };
  /** `live` when DexScreener trending returned rows; `partial` otherwise. */
  dataMode: "live" | "partial";
  /** Which backends contributed (e.g. Helius RPC, DexScreener). */
  dataSources: string[];
};

export type DeskAnalyzeResult = {
  mint: string;
  symbol?: string | null;
  imageUrl?: string | null;
  trustScore: number;
  riskLevel: "low" | "medium" | "high" | "extreme";
  rugProbabilityPct: number;
  bullishSignals: string[];
  bearishSignals: string[];
  reasonsToAvoid: string[];
  reasonsTradersCare: string[];
  aiSummary: string;
  metrics: Record<string, string | number>;
};
