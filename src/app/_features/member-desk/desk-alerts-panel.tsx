"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";

import { TerminalCard } from "@/_features/member-desk/terminal-card";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";

const ALERT_TYPES = ["mint_watch", "price_move", "liquidity_floor", "volume_spike", "wallet_follow", "custom"] as const;

type MemberAlert = {
  id: string;
  alert_type: string;
  config: Record<string, unknown>;
  notify_push: boolean;
  notify_email: boolean;
  notify_telegram: boolean;
  notify_discord_webhook: string | null;
  active: boolean;
  created_at: string;
};

export function DeskAlertsPanel() {
  const { getAccessToken } = usePrivy();
  const [alerts, setAlerts] = useState<MemberAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<(typeof ALERT_TYPES)[number]>("mint_watch");
  const [mint, setMint] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [saving, setSaving] = useState(false);

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
        setAlerts([]);
        return;
      }
      const res = await fetch("/api/desk/alerts", { headers: h });
      const json = (await res.json()) as { ok?: boolean; alerts?: MemberAlert[]; error?: string; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? json.error ?? "Could not load alerts.");
        setAlerts([]);
        return;
      }
      setAlerts(json.alerts ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const h = await authHeaders();
      if (!h) {
        setError("Sign in required.");
        return;
      }
      const config: Record<string, unknown> = {};
      if (alertType === "mint_watch" || alertType === "price_move" || alertType === "liquidity_floor") {
        if (mint.trim().length >= 32) config.mint = mint.trim();
      }
      if (alertType === "wallet_follow" && mint.trim().length >= 32) {
        config.wallet = mint.trim();
      }

      const body: Record<string, unknown> = {
        alert_type: alertType,
        config,
        notify_discord_webhook: discordUrl.trim() || null,
      };

      const res = await fetch("/api/desk/alerts", {
        method: "POST",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Could not create alert.");
        return;
      }
      setMint("");
      setDiscordUrl("");
      await load();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(a: MemberAlert) {
    const h = await authHeaders();
    if (!h) return;
    await fetch(`/api/desk/alerts/${a.id}`, {
      method: "PATCH",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ active: !a.active }),
    });
    await load();
  }

  async function remove(id: string) {
    const h = await authHeaders();
    if (!h) return;
    await fetch(`/api/desk/alerts/${id}`, { method: "DELETE", headers: h });
    await load();
  }

  return (
    <div className="space-y-6">
      <TerminalCard title="Your alerts" subtitle="Stored in Supabase; delivery workers can fan out later." accent="slate">
        {loading ? <p className="text-sm text-phronis-muted">Loading…</p> : null}
        {error ? <p className="text-sm text-amber-200/90">{error}</p> : null}
        {!alerts.length && !loading ? <p className="text-sm text-phronis-muted">No alerts yet.</p> : null}
        <ul className="mt-4 space-y-2">
          {alerts.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
              <div>
                <span className="font-medium text-phronis-foreground">{a.alert_type}</span>
                <span className={`ml-2 text-xs ${a.active ? "text-phronis-teal" : "text-phronis-muted"}`}>
                  {a.active ? "active" : "paused"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" className="border-white/20" onClick={() => void toggleActive(a)}>
                  {a.active ? "Pause" : "Resume"}
                </Button>
                <Button type="button" size="sm" variant="ghost" className="text-rose-300" onClick={() => void remove(a.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </TerminalCard>

      <TerminalCard title="Create alert" accent="violet">
        <form className="space-y-4" onSubmit={onCreate}>
          <div className="space-y-2">
            <Label htmlFor="al-type">Type</Label>
            <select
              id="al-type"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as (typeof ALERT_TYPES)[number])}
              className="w-full rounded-md border border-white/15 bg-black/25 px-3 py-2 text-sm text-phronis-foreground"
            >
              {ALERT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {(alertType === "mint_watch" || alertType === "price_move" || alertType === "liquidity_floor" || alertType === "wallet_follow") && (
            <div className="space-y-2">
              <Label htmlFor="al-mint">{alertType === "wallet_follow" ? "Wallet address" : "Mint (optional for custom)"}</Label>
              <Input
                id="al-mint"
                value={mint}
                onChange={(e) => setMint(e.target.value)}
                placeholder="Solana address"
                className="border-white/15 bg-black/25 font-mono text-sm"
                autoComplete="off"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="al-discord">Discord webhook URL (optional)</Label>
            <Input
              id="al-discord"
              value={discordUrl}
              onChange={(e) => setDiscordUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/…"
              className="border-white/15 bg-black/25 text-sm"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={saving} className="bg-phronis-teal text-phronis-void hover:opacity-90">
            {saving ? "Saving…" : "Save alert"}
          </Button>
        </form>
      </TerminalCard>
    </div>
  );
}
