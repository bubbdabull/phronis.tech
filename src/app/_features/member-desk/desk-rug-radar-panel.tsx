"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";

import { DeskTokenAvatar } from "@/_features/member-desk/desk-token-avatar";
import { TerminalCard } from "@/_features/member-desk/terminal-card";
import type { RugScanResult } from "@/_lib/desk/build-rug-scan";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";

type CachedScan = {
  id: string;
  mint_address: string;
  rug_probability: number | null;
  threat_level: string | null;
  computed_at: string;
};

export function DeskRugRadarPanel() {
  const { getAccessToken } = usePrivy();
  const [mint, setMint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RugScanResult | null>(null);
  const [recent, setRecent] = useState<CachedScan[]>([]);

  const authHeaders = useCallback(async () => {
    const bearer = await getAccessToken();
    if (!bearer) return null;
    return { Authorization: `Bearer ${bearer}` };
  }, [getAccessToken]);

  const loadRecent = useCallback(async () => {
    try {
      const h = await authHeaders();
      if (!h) return;
      const res = await fetch("/api/desk/rug-scan?limit=25", { headers: h });
      const json = (await res.json()) as { ok?: boolean; scans?: CachedScan[] };
      if (res.ok && json.ok && json.scans) setRecent(json.scans);
    } catch {
      /* ignore */
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  async function onScan(e: React.FormEvent) {
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
      const res = await fetch("/api/desk/rug-scan", {
        method: "POST",
        headers: { Authorization: `Bearer ${bearer}`, "Content-Type": "application/json" },
        body: JSON.stringify({ mint: mint.trim() }),
      });
      const json = (await res.json()) as { ok?: boolean; result?: RugScanResult; error?: string };
      if (!res.ok || !json.ok || !json.result) {
        setError(json.error ?? "Scan failed.");
        return;
      }
      setResult(json.result);
      void loadRecent();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <TerminalCard title="Rug radar" subtitle="Heuristic pass: DexScreener + SPL mint/freeze authorities (+ Birdeye if configured)" accent="amber">
        <form className="space-y-4" onSubmit={onScan}>
          <div className="space-y-2">
            <Label htmlFor="rug-mint">Token mint</Label>
            <Input
              id="rug-mint"
              value={mint}
              onChange={(e) => setMint(e.target.value)}
              placeholder="Solana mint (CA)"
              className="border-white/15 bg-black/25 font-mono text-sm"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={loading || mint.trim().length < 32} className="bg-amber-500/90 text-phronis-void hover:opacity-90">
            {loading ? "Scanning…" : "Run rug scan"}
          </Button>
          {error ? <p className="text-sm text-amber-200/90">{error}</p> : null}
        </form>
      </TerminalCard>

      {result ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
            <DeskTokenAvatar mint={result.mint} symbol={result.symbol} imageUrl={result.imageUrl} size={48} />
            <div>
              <p className="font-medium text-phronis-foreground">{result.symbol?.trim() || "Token"}</p>
              <p className="font-mono text-[11px] text-phronis-muted">{result.mint}</p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
          <TerminalCard title="Score" accent="amber">
            <p className="text-3xl font-semibold text-phronis-foreground">{result.rugProbabilityPct}%</p>
            <p className="text-xs text-phronis-muted">Rug-style probability (educational heuristic, not a guarantee)</p>
            <p className="mt-3 text-sm">
              Threat: <span className="font-medium capitalize text-phronis-foreground">{result.threatLevel}</span>
            </p>
            <dl className="mt-4 space-y-1 text-xs text-phronis-muted">
              <div className="flex justify-between gap-2 border-b border-white/5 py-1">
                <dt>Mint authority relinquished</dt>
                <dd>{result.mintAuthorityRelinquished == null ? "—" : result.mintAuthorityRelinquished ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-white/5 py-1">
                <dt>Freeze authority set</dt>
                <dd>{result.freezeAuthorityEnabled == null ? "—" : result.freezeAuthorityEnabled ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-white/5 py-1">
                <dt>Top pair liquidity (USD)</dt>
                <dd>{result.dexLiquidityUsd != null ? result.dexLiquidityUsd.toLocaleString() : "—"}</dd>
              </div>
            </dl>
          </TerminalCard>
          <TerminalCard title="Warnings" accent="slate">
            <ul className="list-disc space-y-1 pl-4 text-sm text-phronis-muted">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </TerminalCard>
          </div>
        </div>
      ) : null}

      <TerminalCard title="Recent scans (desk cache)" accent="violet">
        {!recent.length ? (
          <p className="text-sm text-phronis-muted">No cached rows yet — run a scan above.</p>
        ) : (
          <ul className="space-y-2 font-mono text-xs">
            {recent.map((r) => (
              <li key={r.id} className="flex flex-wrap justify-between gap-2 border-b border-white/5 py-1">
                <span className="text-phronis-foreground/90">{r.mint_address.slice(0, 8)}…</span>
                <span className="text-phronis-muted">
                  {r.rug_probability ?? "—"}% · {r.threat_level ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </TerminalCard>
    </div>
  );
}
