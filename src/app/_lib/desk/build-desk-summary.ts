import type { DeskSummary } from "@/_types/desk";
import { listQuizzedModuleIds } from "@/_lib/crypto-mastery-course/module-quizzes";
import {
  dexscreenerRecentLaunchesFromPairs,
  dexscreenerTokenPairs,
  dexscreenerTopBoostsSolana,
  dexscreenerTrendingFromBoosts,
} from "@/_lib/desk/dexscreener";
import { getDeskSolanaRpcUrl } from "@/_lib/desk/solana-rpc";
import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";
import { fetchWalletBalances } from "@/_lib/solana/balances";
import type { MemberRow } from "@/_types/onboarding";
import type { SupabaseClient } from "@supabase/supabase-js";

function sentimentFromTrending(changes: number[]): { label: string; score: number } {
  if (!changes.length) return { label: "No index data", score: 50 };
  const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
  const score = Math.max(0, Math.min(100, Math.round(50 + avg * 1.2)));
  if (avg > 8) return { label: "Risk-on (short-term)", score };
  if (avg < -8) return { label: "Risk-off (short-term)", score };
  return { label: "Mixed tape", score };
}

function xpFromModules(done: number) {
  const xp = done * 200;
  const level = Math.max(1, Math.min(40, 1 + Math.floor(done / 2)));
  const nextLevelXp = Math.max(400, level * 320);
  return { level, xp, nextLevelXp };
}

export async function buildDeskSummary(supabase: SupabaseClient, privyUserId: string): Promise<DeskSummary> {
  const sources: string[] = [];
  const { data: member } = await supabase.from("members").select("*").eq("privy_id", privyUserId).maybeSingle();
  const m = member as MemberRow | null;

  const headline = m?.display_name?.trim() ? `Welcome back, ${m.display_name.trim()}` : "Welcome to your desk";
  let subline = "Live: DexScreener trends · wallet balances from your RPC (Helius if set).";
  let walletSol = 0;
  let walletPhr = 0;
  let watchlistCount = 0;
  const quizModuleIds = listQuizzedModuleIds();
  const modulesTotal = quizModuleIds.length || 12;
  let modulesDone = 0;

  if (m?.id) {
    const { data: walletsRaw } = await supabase.from("wallets").select("*").eq("member_id", m.id);
    const memberWallet = String(m.wallet_address ?? "").trim();
    const wallets = [...(walletsRaw ?? [])].sort((a, b) => {
      const ap = a.wallet_address === memberWallet ? 1 : 0;
      const bp = b.wallet_address === memberWallet ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return Number(b.phronis_balance) - Number(a.phronis_balance);
    });
    const primary = wallets[0]?.wallet_address?.trim() || memberWallet;
    walletSol = Number(wallets[0]?.sol_balance ?? 0);
    walletPhr = Number(wallets[0]?.phronis_balance ?? 0);

    const deskRpc = getDeskSolanaRpcUrl();
    if (primary && deskRpc) {
      try {
        const live = await fetchWalletBalances(primary, getPhrDaoTokenMint(), { rpcUrlOverride: deskRpc });
        walletSol = live.sol;
        walletPhr = live.phronis;
        sources.push(deskRpc.includes("helius") ? "Helius RPC" : "Solana RPC");
      } catch {
        sources.push("Supabase wallet cache (RPC read failed)");
      }
    } else if (!deskRpc) {
      subline = "Set HELIUS_API_KEY or SOLANA_RPC_URL for live SOL / PHR balances.";
    }

    const { count, error: wErr } = await supabase
      .from("watchlists")
      .select("id", { count: "exact", head: true })
      .eq("member_id", m.id);
    if (!wErr && typeof count === "number") {
      watchlistCount = count;
      if (count > 0) sources.push("Supabase watchlists");
    }

    const { data: quizRows } = await supabase.from("member_crypto_module_quiz").select("module_id, passed").eq("member_id", m.id);
    modulesDone = (quizRows ?? []).filter((r) => r.passed).length;
  }

  const boosts = await dexscreenerTopBoostsSolana(10);
  let trending: DeskSummary["trending"] = [];
  if (boosts.length) {
    trending = await dexscreenerTrendingFromBoosts(boosts, 5);
    sources.push("DexScreener");
  } else {
    subline = "DexScreener trending unavailable (network or rate limit). Check again shortly.";
  }

  const pairRows = await dexscreenerTokenPairs(
    "solana",
    trending.map((t) => t.mint),
  );
  const launches = dexscreenerRecentLaunchesFromPairs(pairRows, 4);

  const sentiment = sentimentFromTrending(trending.map((t) => t.change24hPct));
  const rugAlerts = launches.filter((l) => l.risk === "high").length;
  const portfolioRisk = Math.max(5, Math.min(95, 100 - sentiment.score + rugAlerts * 6));

  const { level, xp, nextLevelXp } = xpFromModules(modulesDone);

  if (process.env.BIRDEYE_API_KEY?.trim()) {
    sources.push("Birdeye (analyzer)");
  }

  return {
    headline,
    subline,
    walletSol,
    walletPhr,
    watchlistCount,
    xpLevel: { level, xp, nextLevelXp },
    sentiment,
    trending,
    smartMoney: [],
    launches,
    riskOverview: { portfolioRisk, rugAlerts },
    education: { modulesDone, modulesTotal, streakDays: 0 },
    dataMode: trending.length ? "live" : "partial",
    dataSources: sources,
  };
}
