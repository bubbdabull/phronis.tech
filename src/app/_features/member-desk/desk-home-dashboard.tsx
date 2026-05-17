"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

import { DeskTrendingChangeChart, DeskTrendingVolumeChart } from "@/_features/member-desk/desk-terminal-charts";
import { DeskTokenAvatar } from "@/_features/member-desk/desk-token-avatar";
import { TerminalCard } from "@/_features/member-desk/terminal-card";
import type { DeskSummary } from "@/_types/desk";
import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { cn } from "@/_lib/utils";

export function DeskHomeDashboard() {
  const { getAccessToken } = usePrivy();
  const [data, setData] = useState<DeskSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const bearer = await getAccessToken();
        if (!bearer) {
          if (!cancelled) setErr("Not signed in.");
          return;
        }
        const res = await fetch("/api/desk/summary", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${bearer}` },
        });
        const json = (await res.json()) as { ok?: boolean; summary?: DeskSummary; error?: string };
        if (!res.ok || !json.ok || !json.summary) {
          if (!cancelled) setErr(json.error ?? "Could not load desk summary.");
          return;
        }
        if (!cancelled) setData(json.summary);
      } catch {
        if (!cancelled) setErr("Network error loading desk.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getAccessToken]);

  if (err) {
    return <p className="text-sm text-amber-200/90">{err}</p>;
  }

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  const chartRows = data.trending.map((t) => ({
    symbol: t.symbol,
    change24hPct: t.change24hPct,
    volumeH24: t.volumeH24 ?? 0,
  }));

  return (
    <div className="space-y-6">
      <p className="text-[10px] text-phronis-muted">
        <span className="font-semibold text-phronis-teal/90">{data.dataMode === "live" ? "Live" : "Partial"}</span>
        {" · "}
        {data.dataSources.length ? data.dataSources.join(" · ") : "Configure APIs for richer reads."}
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        <TerminalCard title="Session" subtitle="Personalized desk" accent="teal" className="lg:col-span-2">
          <p className="font-serif text-xl text-phronis-foreground">{data.headline}</p>
          <p className="mt-1 text-sm text-phronis-muted">{data.subline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-phronis-teal/30 text-phronis-teal">
              SOL {data.walletSol.toFixed(3)}
            </Badge>
            <Badge variant="outline" className="border-white/20">
              PHR {data.walletPhr.toLocaleString()}
            </Badge>
            <Badge variant="outline" className="border-white/20">
              Watchlist {data.watchlistCount}
            </Badge>
          </div>
        </TerminalCard>
        <TerminalCard title="Learning XP" accent="violet">
          <p className="text-2xl font-semibold text-phronis-foreground">Level {data.xpLevel.level}</p>
          <p className="mt-1 text-xs text-phronis-muted">
            {data.xpLevel.xp} / {data.xpLevel.nextLevelXp} XP
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-phronis-teal"
              style={{ width: `${Math.min(100, (data.xpLevel.xp / data.xpLevel.nextLevelXp) * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-phronis-muted">
            Academy: {data.education.modulesDone}/{data.education.modulesTotal} modules · {data.education.streakDays}d streak
          </p>
        </TerminalCard>
      </div>

      {chartRows.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <TerminalCard title="24h % moves" subtitle="Boosted Solana picks (DexScreener)" accent="slate">
            <DeskTrendingChangeChart rows={chartRows} />
          </TerminalCard>
          <TerminalCard title="24h volume" subtitle="Same basket — teal / rose by sign of % change" accent="teal">
            <DeskTrendingVolumeChart rows={chartRows} />
          </TerminalCard>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TerminalCard title="Market sentiment" accent="slate">
          <p className="text-lg font-medium text-phronis-foreground">{data.sentiment.label}</p>
          <p className="mt-1 text-xs text-phronis-muted">Short-horizon read from trending 24h moves (DexScreener).</p>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-phronis-teal/90">{data.sentiment.score}</p>
          <p className="text-[10px] uppercase tracking-wider text-phronis-muted">Composite score (0–100)</p>
        </TerminalCard>
        <TerminalCard title="Risk overview" accent="amber">
          <p className="text-3xl font-semibold text-phronis-foreground">{data.riskOverview.portfolioRisk}</p>
          <p className="text-xs text-phronis-muted">Heuristic desk index (0–100)</p>
          <p className="mt-3 text-sm text-amber-200/90">{data.riskOverview.rugAlerts} high-risk launch signals</p>
        </TerminalCard>
        <TerminalCard title="Trending (Solana)" accent="teal">
          {data.trending.length === 0 ? (
            <p className="text-xs text-phronis-muted">No boosted Solana rows from DexScreener right now.</p>
          ) : (
            <ul className="space-y-2">
              {data.trending.map((t) => (
                <li key={t.mint} className="flex items-center gap-3 border-b border-white/5 py-2 last:border-0 last:pb-0">
                  <DeskTokenAvatar mint={t.mint} symbol={t.symbol} imageUrl={t.imageUrl} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-phronis-foreground">{t.symbol}</p>
                    <p className="truncate font-mono text-[10px] text-phronis-muted">{t.mint.slice(0, 6)}…{t.mint.slice(-4)}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <p className={cn("font-medium", t.change24hPct >= 0 ? "text-phronis-teal" : "text-rose-300")}>
                      {t.change24hPct >= 0 ? "+" : ""}
                      {t.change24hPct}%
                    </p>
                    <p className="text-[10px] text-phronis-muted">{t.volumeUsd}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TerminalCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TerminalCard title="Smart money" subtitle="On-chain wallet flow" accent="teal">
          {data.smartMoney.length === 0 ? (
            <p className="text-xs text-phronis-muted">
              Wire Helius or Birdeye wallet feeds to populate smart-money rows here.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.smartMoney.map((s) => (
                <li key={`${s.wallet}-${s.ago}`} className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                  <span className="font-mono text-phronis-foreground">{s.wallet}</span>
                  <span className="text-phronis-muted">{s.action}</span>
                  <span className="text-phronis-teal/90">{s.token}</span>
                  <span className="text-[10px] text-phronis-muted">{s.ago}</span>
                </li>
              ))}
            </ul>
          )}
        </TerminalCard>
        <TerminalCard title="New launches" subtitle="Young pairs (DexScreener)" accent="amber">
          {data.launches.length === 0 ? (
            <p className="text-xs text-phronis-muted">No young pairs in the current trending set.</p>
          ) : (
            <ul className="space-y-3">
              {data.launches.map((l) => (
                <li key={l.mint} className="flex items-center gap-3 border-b border-white/5 pb-2 text-xs last:border-0 last:pb-0">
                  <DeskTokenAvatar mint={l.mint} symbol={l.name} imageUrl={l.imageUrl} size={36} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-phronis-foreground">{l.name}</span>
                    <span className="font-mono text-[10px] text-phronis-muted">{l.mint.slice(0, 8)}…</span>
                    <span className="text-phronis-muted">{l.age}</span>
                    <Badge variant="outline" className="w-fit border-white/20 text-[10px] uppercase">
                      {l.risk} risk
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TerminalCard>
      </div>

      <TerminalCard title="AI desk" subtitle="Threads stored in Supabase · OpenAI-compatible API" accent="violet">
        <p className="text-sm text-phronis-muted">
          Ask about wallets, risk heuristics, or how to read on-chain signals. Uses PAI_API_KEY, AI_API_KEY, or OPENAI_API_KEY on
          the server.
        </p>
        <Button asChild className="mt-4 bg-phronis-teal text-phronis-void hover:opacity-90">
          <Link href="/desk/assistant">Open AI desk</Link>
        </Button>
      </TerminalCard>
    </div>
  );
}
