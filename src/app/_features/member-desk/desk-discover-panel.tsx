"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useRef, useState } from "react";

import { DeskTokenAvatar } from "@/_features/member-desk/desk-token-avatar";
import { TerminalCard } from "@/_features/member-desk/terminal-card";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";

type DexPairRow = {
  dexId?: string;
  chainId?: string;
  info?: { imageUrl?: string };
  baseToken?: { address?: string; name?: string; symbol?: string };
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
};

export function DeskDiscoverPanel() {
  const { getAccessToken } = usePrivy();
  const [q, setQ] = useState("");
  const [pairs, setPairs] = useState<DexPairRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setPairs([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const bearer = await getAccessToken();
        if (!bearer) {
          setError("Sign in required.");
          setPairs([]);
          return;
        }
        const res = await fetch(`/api/desk/discover?q=${encodeURIComponent(trimmed)}`, {
          headers: { Authorization: `Bearer ${bearer}` },
        });
        const json = (await res.json()) as { ok?: boolean; pairs?: DexPairRow[]; error?: string };
        if (!res.ok || !json.ok) {
          setError(json.error ?? "Search failed.");
          setPairs([]);
          return;
        }
        setPairs(json.pairs ?? []);
      } catch {
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    },
    [getAccessToken],
  );

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void runSearch(q);
    }, 380);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, runSearch]);

  return (
    <div className="space-y-6">
      <TerminalCard title="Discover" subtitle="DexScreener search — Solana pairs, ranked by 24h volume" accent="violet">
        <div className="space-y-2">
          <Label htmlFor="disc-q">Search name, symbol, or mint</Label>
          <Input
            id="disc-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. BONK or part of a mint"
            className="border-white/15 bg-black/25 text-sm"
            autoComplete="off"
          />
        </div>
        {loading ? <p className="mt-3 text-sm text-phronis-muted">Searching…</p> : null}
        {error ? <p className="mt-3 text-sm text-amber-200/90">{error}</p> : null}
      </TerminalCard>

      <TerminalCard title="Results" accent="teal">
        {!pairs.length && !loading && q.trim().length >= 2 ? (
          <p className="text-sm text-phronis-muted">No Solana pairs returned for that query.</p>
        ) : !pairs.length ? (
          <p className="text-sm text-phronis-muted">Type at least 2 characters to search.</p>
        ) : (
          <ul className="space-y-3">
            {pairs.map((p, idx) => {
              const sym = p.baseToken?.symbol ?? "?";
              const addr = p.baseToken?.address ?? "";
              const vol = p.volume?.h24 ?? 0;
              const liq = p.liquidity?.usd ?? 0;
              const ch = p.priceChange?.h24 ?? 0;
              return (
                <li key={`${addr}-${idx}`} className="rounded-lg border border-white/10 bg-black/15 p-3 text-sm">
                  <div className="flex gap-3">
                    {addr ? <DeskTokenAvatar mint={addr} symbol={sym} imageUrl={p.info?.imageUrl} size={44} /> : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold text-phronis-foreground">{sym}</span>
                        <span className="text-xs text-phronis-muted">{p.dexId}</span>
                      </div>
                      {addr ? <p className="mt-1 break-all font-mono text-xs text-phronis-muted">{addr}</p> : null}
                      <p className="mt-2 text-xs text-phronis-muted">
                        Vol 24h ${vol.toLocaleString(undefined, { maximumFractionDigits: 0 })} · Liq{" "}
                        {liq.toLocaleString(undefined, { maximumFractionDigits: 0 })} · 24h {ch >= 0 ? "+" : ""}
                        {ch.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </TerminalCard>
    </div>
  );
}
