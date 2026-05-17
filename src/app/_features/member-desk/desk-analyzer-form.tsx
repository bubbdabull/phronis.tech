"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

import { DeskTokenAvatar } from "@/_features/member-desk/desk-token-avatar";
import { TerminalCard } from "@/_features/member-desk/terminal-card";
import type { DeskAnalyzeResult } from "@/_types/desk";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";

export function DeskAnalyzerForm() {
  const { getAccessToken } = usePrivy();
  const [mint, setMint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeskAnalyzeResult | null>(null);

  async function onAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const bearer = await getAccessToken();
      if (!bearer) {
        setError("Sign in required.");
        return;
      }
      const res = await fetch("/api/desk/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${bearer}`, "Content-Type": "application/json" },
        body: JSON.stringify({ mint: mint.trim() }),
      });
        const json = (await res.json()) as { ok?: boolean; result?: DeskAnalyzeResult; error?: string; message?: string };
        if (!res.ok || !json.ok || !json.result) {
          setError(json.message ?? json.error ?? "Analysis failed.");
          return;
        }
      setResult(json.result);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <TerminalCard title="Contract analyzer" subtitle="Paste a Solana mint — DexScreener + optional Birdeye" accent="teal">
        <form className="space-y-4" onSubmit={onAnalyze}>
          <div className="space-y-2">
            <Label htmlFor="mint">Token mint (CA)</Label>
            <Input
              id="mint"
              value={mint}
              onChange={(e) => setMint(e.target.value)}
              placeholder="e.g. DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
              className="border-white/15 bg-black/25 font-mono text-sm"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={loading || !mint.trim()} className="bg-phronis-teal text-phronis-void hover:opacity-90">
            {loading ? "Running…" : "Run analysis"}
          </Button>
          {error ? <p className="text-sm text-amber-200/90">{error}</p> : null}
        </form>
      </TerminalCard>

      {result ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
            <DeskTokenAvatar mint={result.mint} symbol={result.symbol} imageUrl={result.imageUrl} size={52} />
            <div>
              <p className="font-serif text-lg text-phronis-foreground">{result.symbol?.trim() || "Token"}</p>
              <p className="font-mono text-xs text-phronis-muted">{result.mint}</p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
          <TerminalCard title="Trust & risk" accent="violet">
            <p className="text-3xl font-semibold text-phronis-foreground">{result.trustScore}</p>
            <p className="text-xs text-phronis-muted">Trust score (0–100) · heuristic from DexScreener + Birdeye</p>
            <p className="mt-3 text-sm">
              Risk level: <span className="font-medium text-phronis-foreground">{result.riskLevel}</span> · Rug probability{" "}
              {result.rugProbabilityPct}%
            </p>
            <dl className="mt-4 space-y-1 text-xs text-phronis-muted">
              {Object.entries(result.metrics).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 border-b border-white/5 py-1">
                  <dt>{k}</dt>
                  <dd className="font-mono text-phronis-foreground/90">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </TerminalCard>
          <TerminalCard title="Narrative" accent="slate">
            <p className="text-sm leading-relaxed text-phronis-muted">{result.aiSummary}</p>
          </TerminalCard>
          <TerminalCard title="Bullish" accent="teal">
            <ul className="list-disc space-y-1 pl-4 text-sm text-phronis-muted">
              {result.bullishSignals.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </TerminalCard>
          <TerminalCard title="Bearish / avoid" accent="amber">
            <ul className="list-disc space-y-1 pl-4 text-sm text-phronis-muted">
              {result.bearishSignals.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-rose-200/80">Reasons to avoid</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-phronis-muted">
              {result.reasonsToAvoid.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-phronis-teal/90">Why traders care</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-phronis-muted">
              {result.reasonsTradersCare.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </TerminalCard>
          </div>
        </div>
      ) : null}
    </div>
  );
}
