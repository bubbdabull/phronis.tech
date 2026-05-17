"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowRight, Check, ChevronUp, Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Separator } from "@/_components/ui/separator";
import { Textarea } from "@/_components/ui/textarea";
import { AvatarPicker } from "@/_components/member/avatar-picker";
import { MemberSupportRequestCard } from "@/_components/member/member-support-request-card";
import { MemberWalletFundingCard } from "@/_components/member/member-wallet-funding-card";
import { isDaoOpen } from "@/_lib/product/coming-soon";
import { useEmbeddedSolanaAddress } from "@/_hooks/use-embedded-solana-address";
import { useOnboardingSession } from "@/_hooks/use-onboarding-session";
import { memberProfileUpdateSchema, type MemberProfileUpdate } from "@/_lib/schemas/member-profile";
import { cn } from "@/_lib/utils";

function linkedPrivyEmail(user: { linkedAccounts?: readonly { type?: string; address?: string }[] } | null | undefined): string | null {
  if (!user?.linkedAccounts?.length) return null;
  for (const a of user.linkedAccounts) {
    if (a.type === "email" && "address" in a && typeof a.address === "string" && a.address.trim()) {
      return a.address.trim();
    }
  }
  return null;
}

function explorerTxUrl(sig: string): string {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet" ? "" : "?cluster=devnet";
  return `https://solscan.io/tx/${sig}${cluster}`;
}

export function WelcomeDashboard() {
  const { getAccessToken, user } = usePrivy();
  const { member, wallets, transactions, loading, error, refresh, syncFromPrivy } = useOnboardingSession();
  const { address: embeddedAddress, provisioning, walletsReady } = useEmbeddedSolanaAddress();
  const [busy, setBusy] = useState("");
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [profileJustSaved, setProfileJustSaved] = useState(false);
  const profileUiInit = useRef(false);
  const privyEmail = useMemo(() => linkedPrivyEmail(user), [user]);
  const hasSavedProfile = Boolean(member?.username?.trim());
  const primaryWallet =
    wallets[0]?.wallet_address?.trim() || member?.wallet_address?.trim() || embeddedAddress?.trim() || "";
  const hasDbWalletRow = Boolean(wallets[0]?.wallet_address);
  const solBal = wallets[0] ? Number(wallets[0].sol_balance) : 0;
  const usdcBal = wallets[0] ? Number(wallets[0].usdc_balance ?? 0) : 0;
  const phrBal = wallets[0] ? Number(wallets[0].phronis_balance) : 0;

  const form = useForm<MemberProfileUpdate>({
    resolver: zodResolver(memberProfileUpdateSchema),
    defaultValues: {
      username: "",
      display_name: "",
      bio: "",
      avatar_url: "",
      email: "",
    },
  });

  const watchedUsername = form.watch("username");
  const watchedDisplayName = form.watch("display_name");
  const avatarDefaultSeed = useMemo(
    () =>
      (
        watchedUsername?.trim() ||
        watchedDisplayName?.trim() ||
        member?.username ||
        member?.display_name ||
        member?.id ||
        "member"
      ).slice(0, 80),
    [watchedUsername, watchedDisplayName, member?.username, member?.display_name, member?.id],
  );

  const autoSyncedRef = useRef(false);
  useEffect(() => {
    if (loading || autoSyncedRef.current || !walletsReady) return;
    const hasSyncedRow = wallets.some((w) => Boolean(w.wallet_address?.trim()));
    if (hasSyncedRow && member?.wallet_address?.trim()) return;

    autoSyncedRef.current = true;
    void (async () => {
      try {
        const ok = await syncFromPrivy(
          embeddedAddress ? undefined : { provision: true },
        );
        if (ok) await refresh();
      } catch {
        autoSyncedRef.current = false;
      }
    })();
  }, [embeddedAddress, loading, member?.wallet_address, refresh, syncFromPrivy, wallets, walletsReady]);

  useEffect(() => {
    if (!member) return;
    form.reset({
      username: member.username ?? "",
      display_name: member.display_name ?? "",
      bio: member.bio ?? "",
      avatar_url: member.avatar_url ?? "",
      email: member.email ?? "",
    });
  }, [member, form]);

  useEffect(() => {
    if (loading || profileUiInit.current) return;
    profileUiInit.current = true;
    setProfileExpanded(!member?.username?.trim());
  }, [loading, member?.username]);

  useEffect(() => {
    if (!profileJustSaved) return;
    const t = window.setTimeout(() => setProfileJustSaved(false), 4000);
    return () => window.clearTimeout(t);
  }, [profileJustSaved]);

  const onSaveProfile = form.handleSubmit(async (data) => {
    setBusy("profile");
    try {
      const token = await getAccessToken();
      if (!token) return;
      const payload = { ...data };
      if (privyEmail) delete payload.email;
      const res = await fetch("/api/members/profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await refresh();
        setProfileExpanded(false);
        setProfileJustSaved(true);
      }
    } finally {
      setBusy("");
    }
  });

  const funded = member?.wallet_funded ?? (hasDbWalletRow && solBal >= 0.001 && usdcBal >= 0.01);

  if (loading && !member) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-phronis-muted" role="status">
        Loading your workspace…
      </div>
    );
  }

  return (
    <div id="top" className="space-y-8">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium tracking-tight text-phronis-foreground sm:text-3xl">Profile &amp; wallet</h2>
          <p className="mt-2 max-w-2xl text-sm text-phronis-muted sm:text-base">
            <span className="text-phronis-foreground/90">1.</span> Fill out your profile · <span className="text-phronis-foreground/90">2.</span> Fund wallet &amp; buy PHR ·{" "}
            {isDaoOpen() ? (
              <>
                <span className="text-phronis-foreground/90">3.</span> Membership &amp; DAO ·{" "}
                <span className="text-phronis-foreground/90">4.</span> Academy courses — no PHR required.
              </>
            ) : (
              <>
                <span className="text-phronis-foreground/90">3.</span> Academy courses — no PHR required.
              </>
            )}
          </p>
        </div>
      </div>
      {error ? <p className="text-sm text-amber-200/90">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Step 1 — profile */}
        <Card className="border-white/10 lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {hasSavedProfile && member?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatar_url}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-full border border-white/15 bg-black/30 object-cover"
                />
              ) : hasSavedProfile ? (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-phronis-teal/15 text-sm font-semibold text-phronis-teal">
                  {(member?.display_name || member?.username || "?").slice(0, 1).toUpperCase()}
                </div>
              ) : null}
              <div className="min-w-0 space-y-1">
                <CardTitle className="flex flex-wrap items-center gap-2">
                  Profile
                  {hasSavedProfile && !profileExpanded ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-phronis-teal/30 bg-phronis-teal/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-phronis-teal">
                      <Check className="h-3 w-3" aria-hidden />
                      Saved
                    </span>
                  ) : null}
                </CardTitle>
                {hasSavedProfile && !profileExpanded ? (
                  <CardDescription className="leading-relaxed">
                    <span className="font-medium text-phronis-foreground/90">
                      {member?.display_name?.trim() || member?.username}
                    </span>
                    {member?.username ? (
                      <>
                        {" "}
                        · <span className="text-phronis-muted">@{member.username}</span>
                      </>
                    ) : null}
                    {member?.bio?.trim() ? (
                      <span className="mt-1 block max-w-xl truncate text-phronis-muted">{member.bio}</span>
                    ) : null}
                  </CardDescription>
                ) : (
                  <CardDescription>Step 1 — how you appear to other members (stored in Supabase).</CardDescription>
                )}
                {profileJustSaved ? (
                  <p className="text-xs font-medium text-phronis-teal" role="status">
                    Profile saved — continue to wallet funding below.
                  </p>
                ) : null}
              </div>
            </div>
            {hasSavedProfile ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 border-white/15"
                onClick={() => setProfileExpanded((open) => !open)}
              >
                {profileExpanded ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" aria-hidden />
                    Close
                  </>
                ) : (
                  <>
                    <Pencil className="mr-2 h-4 w-4" aria-hidden />
                    Edit profile
                  </>
                )}
              </Button>
            ) : null}
          </CardHeader>
          {profileExpanded ? (
          <CardContent>
            <form className="space-y-4" onSubmit={onSaveProfile}>
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <Label className="text-phronis-foreground">Avatar</Label>
                <AvatarPicker
                  value={form.watch("avatar_url") ?? ""}
                  onChange={(url) => form.setValue("avatar_url", url, { shouldDirty: true, shouldValidate: true })}
                  defaultSeedSource={avatarDefaultSeed}
                />
                <input type="hidden" {...form.register("avatar_url")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" {...form.register("username")} className="border-white/15 bg-black/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display name</Label>
                  <Input id="display_name" {...form.register("display_name")} className="border-white/15 bg-black/20" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={3} {...form.register("bio")} className="border-white/15 bg-black/20" />
              </div>
              {privyEmail ? (
                <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-phronis-muted">Email</p>
                  <p className="text-sm text-phronis-foreground">{privyEmail}</p>
                  <p className="text-xs text-phronis-muted">From your Privy sign-in. No need to add it here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...form.register("email")}
                    className="max-w-md border-white/15 bg-black/20"
                  />
                  <p className="text-xs text-phronis-muted">
                    You signed in without an email on this account. Add one so we can reach you about membership and DAO updates.
                  </p>
                </div>
              )}
              <Button type="submit" disabled={!!busy} className="bg-phronis-teal text-phronis-void hover:opacity-90">
                {busy === "profile" ? "Saving…" : "Save profile"}
              </Button>
            </form>
          </CardContent>
          ) : null}
        </Card>

        <MemberWalletFundingCard
          wallets={wallets}
          primaryWallet={primaryWallet}
          hasDbWalletRow={hasDbWalletRow}
          busy={busy}
          onBusyChange={setBusy}
          onSync={async () => {
            const ok = await syncFromPrivy({ provision: true });
            if (ok) await refresh();
          }}
        />

        <MemberSupportRequestCard member={member} primaryWallet={primaryWallet} privyEmail={privyEmail} />

        {isDaoOpen() ? (
        <Card className="border-white/10 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Membership &amp; DAO</CardTitle>
              <CardDescription>Step 3 — membership tier in Supabase. DAO governance opens in a future release.</CardDescription>
            </div>
            <Badge variant="dao">{member?.membership_tier ?? "—"}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-phronis-muted">
              <p>
                Wallet funded:{" "}
                <span className={cn("font-medium", funded ? "text-phronis-teal" : "text-amber-200/90")}>
                  {funded ? "SOL + USDC ready" : "Add SOL (gas) and USDC in Step 2"}
                </span>
              </p>
              <p className="mt-1">
                Balances:{" "}
                <span className="font-mono text-phronis-foreground">
                  {solBal.toFixed(4)} SOL · {usdcBal.toFixed(2)} USDC · {phrBal.toLocaleString()} PHR
                </span>
              </p>
            </div>
            <Button asChild className="inline-flex h-10 items-center justify-center bg-phronis-teal px-4 py-2 text-sm font-medium text-phronis-void hover:opacity-90">
              <Link href="/dao">
                Open DAO
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
        ) : null}

        <Card className="border-white/10 lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Crypto Academy</CardTitle>
              <CardDescription>
                Step {isDaoOpen() ? "4" : "3"} — complete Crypto Mastery sections and pass a short quiz for each. No PHR balance required — sign in and open
                Academy from the sidebar.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 border-white/15">
              <Link href="/learn">Open Academy</Link>
            </Button>
          </CardHeader>
        </Card>

        <Card className="border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction history</CardTitle>
            <CardDescription>Signatures recorded by your app (extend with webhooks).</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-phronis-muted">No transactions logged yet.</p>
            ) : (
              <ul className="divide-y divide-white/10 rounded-lg border border-white/10">
                {transactions.map((tx) => (
                  <li key={tx.id} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-mono text-xs text-phronis-foreground">{tx.type}</span>
                    <a
                      href={explorerTxUrl(tx.signature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] text-phronis-teal hover:underline"
                    >
                      {tx.signature.slice(0, 16)}…
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

