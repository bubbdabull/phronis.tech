"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";

type TradeRow = {
  id: string;
  wallet_address: string;
  side: string;
  signature: string | null;
  mint_in: string | null;
  mint_out: string | null;
  amount_note: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};

export function MemberTradesHub() {
  const { getAccessToken } = usePrivy();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [defaultWallet, setDefaultWallet] = useState("");

  const [wallet_address, setWallet] = useState("");
  const [side, setSide] = useState<"buy" | "sell" | "swap" | "unknown">("swap");
  const [signature, setSignature] = useState("");
  const [mint_in, setMintIn] = useState("");
  const [mint_out, setMintOut] = useState("");
  const [amount_note, setAmountNote] = useState("");

  const authHeaders = useCallback(async () => {
    const bearer = await getAccessToken();
    if (!bearer) throw new Error("missing_token");
    return { Authorization: `Bearer ${bearer}`, "Content-Type": "application/json" } as const;
  }, [getAccessToken]);

  const loadMe = useCallback(async () => {
    try {
      const h = await authHeaders();
      const res = await fetch("/api/members/me", { headers: h });
      const json = (await res.json()) as { ok?: boolean; member?: { wallet_address?: string | null } | null };
      const w = json.member?.wallet_address?.trim();
      if (w) {
        setDefaultWallet(w);
        setWallet((prev) => (prev ? prev : w));
      }
    } catch {
      /* optional */
    }
  }, [authHeaders]);

  const loadTrades = useCallback(async () => {
    setErr(null);
    try {
      const h = await authHeaders();
      const res = await fetch("/api/members/trades?limit=50", { headers: h });
      const json = (await res.json()) as { ok?: boolean; trades?: TradeRow[]; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "load_failed");
        return;
      }
      setTrades(json.trades ?? []);
    } catch {
      setErr("network");
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadMe();
    void loadTrades();
  }, [loadMe, loadTrades]);

  const submit = async () => {
    const wa = wallet_address.trim();
    if (wa.length < 32) {
      setErr("wallet_too_short");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const h = await authHeaders();
      const body = {
        wallet_address: wa,
        side,
        signature: signature.trim() || null,
        mint_in: mint_in.trim() || null,
        mint_out: mint_out.trim() || null,
        amount_note: amount_note.trim() || null,
      };
      const res = await fetch("/api/members/trades", { method: "POST", headers: h, body: JSON.stringify(body) });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "save_failed");
        return;
      }
      setSignature("");
      setMintIn("");
      setMintOut("");
      setAmountNote("");
      await loadTrades();
    } catch {
      setErr("network");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="border-white/10 bg-black/20 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Log a trade</CardTitle>
          <CardDescription>Self-reported events for your journal. Paste a Solana signature when you have one.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {defaultWallet ? (
            <Button type="button" variant="ghost" size="sm" className="h-auto px-0 text-xs text-phronis-teal hover:bg-transparent" onClick={() => setWallet(defaultWallet)}>
              Use onboarding wallet
            </Button>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="tw">Wallet</Label>
            <Input id="tw" value={wallet_address} onChange={(e) => setWallet(e.target.value)} className="border-white/15 bg-black/30 font-mono text-xs" placeholder="Base58 address" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ts">Side</Label>
            <select
              id="ts"
              value={side}
              onChange={(e) => setSide(e.target.value as typeof side)}
              className="flex h-10 w-full rounded-md border border-white/15 bg-black/30 px-3 text-sm"
            >
              <option value="swap">swap</option>
              <option value="buy">buy</option>
              <option value="sell">sell</option>
              <option value="unknown">unknown</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="txsig">Signature (optional)</Label>
            <Input id="txsig" value={signature} onChange={(e) => setSignature(e.target.value)} className="border-white/15 bg-black/30 font-mono text-xs" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tin">Mint in</Label>
              <Input id="tin" value={mint_in} onChange={(e) => setMintIn(e.target.value)} className="border-white/15 bg-black/30 font-mono text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tout">Mint out</Label>
              <Input id="tout" value={mint_out} onChange={(e) => setMintOut(e.target.value)} className="border-white/15 bg-black/30 font-mono text-xs" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tnote">Amount / note</Label>
            <Input id="tnote" value={amount_note} onChange={(e) => setAmountNote(e.target.value)} className="border-white/15 bg-black/30" placeholder="e.g. 2 SOL → PHR" />
          </div>
          {err ? <p className="text-sm text-red-300/90">{err}</p> : null}
          <Button type="button" disabled={busy} onClick={() => void submit()}>
            Save to log
          </Button>
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-black/20 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Recent entries</CardTitle>
            <CardDescription>Newest first — cross-check on Solscan when signatures are present.</CardDescription>
          </div>
          <Button type="button" size="sm" variant="ghost" className="text-phronis-teal" disabled={busy} onClick={() => void loadTrades()}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {trades.length === 0 ? (
              <li className="rounded-lg border border-dashed border-white/15 px-3 py-8 text-center text-sm text-phronis-muted">Nothing logged yet.</li>
            ) : (
              trades.map((t) => (
                <li key={t.id} className="rounded-lg border border-white/10 bg-black/35 px-3 py-3 text-xs font-mono leading-relaxed text-phronis-muted">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-phronis-foreground">
                    <span className="text-[11px] uppercase tracking-wide text-phronis-teal/90">{t.side}</span>
                    <span>{new Date(t.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 break-all">{t.wallet_address}</p>
                  {t.amount_note ? <p className="mt-1 text-phronis-foreground">{t.amount_note}</p> : null}
                  {t.signature ? (
                    <p className="mt-1 break-all">
                      sig: <span className="text-phronis-teal/80">{t.signature}</span>
                    </p>
                  ) : null}
                  {(t.mint_in || t.mint_out) && (
                    <p className="mt-1 break-all">
                      {t.mint_in ? `in ${t.mint_in}` : ""}
                      {t.mint_in && t.mint_out ? " · " : ""}
                      {t.mint_out ? `out ${t.mint_out}` : ""}
                    </p>
                  )}
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
