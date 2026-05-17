"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";

import { TerminalCard } from "@/_features/member-desk/terminal-card";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";

type TrackedWallet = {
  id: string;
  solana_address: string;
  display_label: string | null;
  notes: string | null;
  tags: string[];
  smart_money_score: number | null;
  created_at: string;
};

type RecentSig = { signature: string; slot?: number; err?: string };

export function DeskTrackedWalletsPanel() {
  const { getAccessToken } = usePrivy();
  const [wallets, setWallets] = useState<TrackedWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [recentFor, setRecentFor] = useState<string | null>(null);
  const [recentSigs, setRecentSigs] = useState<RecentSig[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const authHeaders = useCallback(async () => {
    const bearer = await getAccessToken();
    if (!bearer) return null;
    return { Authorization: `Bearer ${bearer}` };
  }, [getAccessToken]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const h = await authHeaders();
      if (!h) {
        setError("Sign in required.");
        setWallets([]);
        return;
      }
      const res = await fetch("/api/desk/tracked-wallets", { headers: h });
      const json = (await res.json()) as { ok?: boolean; wallets?: TrackedWallet[]; error?: string; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? json.error ?? "Could not load wallets.");
        setWallets([]);
        return;
      }
      setWallets(json.wallets ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void load();
  }, [load]);

  async function loadRecent(pubkey: string) {
    setRecentFor(pubkey);
    setRecentSigs([]);
    setRecentLoading(true);
    try {
      const h = await authHeaders();
      if (!h) return;
      const res = await fetch(`/api/desk/tracked-wallets?recent=${encodeURIComponent(pubkey)}`, { headers: h });
      const json = (await res.json()) as { ok?: boolean; recentSigs?: RecentSig[]; error?: string };
      if (res.ok && json.ok && json.recentSigs) setRecentSigs(json.recentSigs);
    } finally {
      setRecentLoading(false);
    }
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const h = await authHeaders();
      if (!h) {
        setError("Sign in required.");
        return;
      }
      const res = await fetch("/api/desk/tracked-wallets", {
        method: "POST",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({
          solana_address: address.trim(),
          display_label: label.trim() || null,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error === "already_tracked" ? "That wallet is already on your list." : json.error ?? "Save failed.");
        return;
      }
      setAddress("");
      setLabel("");
      await load();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    const h = await authHeaders();
    if (!h) return;
    await fetch(`/api/desk/tracked-wallets/${id}`, { method: "DELETE", headers: h });
    if (recentFor && wallets.find((w) => w.id === id)?.solana_address === recentFor) {
      setRecentFor(null);
      setRecentSigs([]);
    }
    await load();
  }

  return (
    <div className="space-y-6">
      <TerminalCard title="Tracked wallets" subtitle="Save addresses; pull recent signatures from your RPC." accent="teal">
        {loading ? <p className="text-sm text-phronis-muted">Loading…</p> : null}
        {error ? <p className="text-sm text-amber-200/90">{error}</p> : null}

        <form className="mt-4 space-y-3" onSubmit={onAdd}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tw-addr">Solana address</Label>
              <Input
                id="tw-addr"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Wallet public key"
                className="border-white/15 bg-black/25 font-mono text-sm"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tw-label">Label (optional)</Label>
              <Input
                id="tw-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Smart DEX buyer #12"
                className="border-white/15 bg-black/25 text-sm"
                autoComplete="off"
              />
            </div>
          </div>
          <Button type="submit" disabled={saving || address.trim().length < 32} className="bg-phronis-teal text-phronis-void hover:opacity-90">
            {saving ? "Saving…" : "Track wallet"}
          </Button>
        </form>
      </TerminalCard>

      <TerminalCard title="Your list" accent="slate">
        {!wallets.length && !loading ? (
          <p className="text-sm text-phronis-muted">No wallets yet — add one above.</p>
        ) : (
          <ul className="space-y-3">
            {wallets.map((w) => (
              <li key={w.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-phronis-foreground">{w.display_label || "Untitled"}</p>
                    <p className="mt-1 break-all font-mono text-xs text-phronis-muted">{w.solana_address}</p>
                    {w.smart_money_score != null ? (
                      <p className="mt-1 text-xs text-phronis-teal/90">Smart score (manual): {w.smart_money_score}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/20"
                      onClick={() => void loadRecent(w.solana_address)}
                    >
                      Recent txs
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="text-rose-300 hover:text-rose-200" onClick={() => void onDelete(w.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </TerminalCard>

      {recentFor ? (
        <TerminalCard title="Recent on-chain activity" subtitle={recentFor} accent="violet">
          {recentLoading ? <p className="text-sm text-phronis-muted">Loading signatures…</p> : null}
          <ul className="mt-2 space-y-1 font-mono text-xs">
            {recentSigs.map((s, i) =>
              s.err ? (
                <li key={i} className="text-amber-200/90">
                  {s.err}
                </li>
              ) : (
                <li key={s.signature || i}>
                  <a
                    className="text-phronis-teal underline-offset-2 hover:underline"
                    href={`https://solscan.io/tx/${s.signature}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.signature.slice(0, 20)}…
                  </a>
                  {s.slot != null ? <span className="ml-2 text-phronis-muted">slot {s.slot}</span> : null}
                </li>
              ),
            )}
          </ul>
        </TerminalCard>
      ) : null}
    </div>
  );
}
