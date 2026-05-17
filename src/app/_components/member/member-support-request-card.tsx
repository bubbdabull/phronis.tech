"use client";

import { usePrivy } from "@privy-io/react-auth";
import { CheckCircle2, LifeBuoy, Loader2, Send } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/card";
import { Label } from "@/_components/ui/label";
import { Textarea } from "@/_components/ui/textarea";
import type { SupportRequestType } from "@/_lib/email/resend-client";
import { supportRequestTypeLabel } from "@/_lib/email/resend-client";
import type { MemberRow } from "@/_types/onboarding";
import { cn } from "@/_lib/utils";

const REQUEST_OPTIONS: { id: SupportRequestType; hint: string }[] = [
  {
    id: "manual_onboarding",
    hint: "Wallet not linking, profile issues, or step-by-step setup with our team.",
  },
  {
    id: "assisted_funding",
    hint: "Ask us to help fund your embedded wallet with SOL (gas) or USDC for trading.",
  },
  {
    id: "other",
    hint: "Anything else about your member account.",
  },
];

type Props = {
  member: MemberRow | null;
  primaryWallet: string;
  privyEmail: string | null;
};

export function MemberSupportRequestCard({ member, primaryWallet, privyEmail }: Props) {
  const { getAccessToken } = usePrivy();
  const [requestType, setRequestType] = useState<SupportRequestType>("assisted_funding");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const needsEmail = !privyEmail && !member?.email?.trim();

  const onSubmit = useCallback(async () => {
    setError(null);
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      setError("Please add a few more details (at least 10 characters).");
      return;
    }
    if (needsEmail && !contactEmail.trim()) {
      setError("Add your email so we can reply.");
      return;
    }

    setBusy(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sign in again to send a message.");
        return;
      }

      const res = await fetch("/api/members/support-request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestType,
          message: trimmed,
          walletAddress: primaryWallet || null,
          ...(needsEmail ? { contactEmail: contactEmail.trim() } : {}),
        }),
      });

      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Could not send your message. Try again shortly.");
        return;
      }

      setSent(true);
      setMessage("");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }, [contactEmail, getAccessToken, message, needsEmail, primaryWallet, requestType]);

  return (
    <Card className="border-white/10 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-phronis-teal" aria-hidden />
          Request help from Phronis
        </CardTitle>
        <CardDescription className="max-w-2xl leading-relaxed">
          Need manual onboarding or assisted funding for your crypto wallet? Send a message to our team — we&apos;ll email you back at{" "}
          {privyEmail || member?.email ? (
            <span className="font-medium text-phronis-foreground/90">{privyEmail ?? member?.email}</span>
          ) : (
            "the address you provide below"
          )}
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {sent ? (
          <div
            className="flex items-start gap-3 rounded-xl border border-phronis-teal/30 bg-phronis-teal/10 px-4 py-3 text-sm text-phronis-teal"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">Message sent</p>
              <p className="mt-1 text-phronis-teal/90">
                Our team received your request and will follow up by email. You can send another message anytime.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 h-8 px-2 text-phronis-teal hover:bg-phronis-teal/10"
                onClick={() => setSent(false)}
              >
                Send another message
              </Button>
            </div>
          </div>
        ) : (
          <>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-phronis-foreground">What do you need?</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {REQUEST_OPTIONS.map((opt) => {
                  const active = requestType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={busy}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-left text-sm transition",
                        active
                          ? "border-phronis-teal/40 bg-phronis-teal/10 ring-1 ring-phronis-teal/25"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20",
                      )}
                      onClick={() => setRequestType(opt.id)}
                    >
                      <span className="font-medium text-phronis-foreground">{supportRequestTypeLabel(opt.id)}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-phronis-muted">{opt.hint}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {primaryWallet ? (
              <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-phronis-muted">
                Your Solana wallet{" "}
                <span className="font-mono text-phronis-foreground/85">
                  {primaryWallet.slice(0, 6)}…{primaryWallet.slice(-4)}
                </span>{" "}
                will be included automatically.
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                rows={5}
                disabled={busy}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  requestType === "assisted_funding"
                    ? "e.g. I need ~0.05 SOL for gas and $25 USDC to start trading PHR. I'm in the US and card on-ramp isn't available."
                    : "Describe what you need help with…"
                }
                className="border-white/15 bg-black/20"
              />
            </div>

            {needsEmail ? (
              <div className="space-y-2">
                <Label htmlFor="support-email">Your email (for our reply)</Label>
                <input
                  id="support-email"
                  type="email"
                  autoComplete="email"
                  disabled={busy}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="flex h-10 w-full max-w-md rounded-md border border-white/15 bg-black/20 px-3 text-sm text-phronis-foreground outline-none focus-visible:ring-2 focus-visible:ring-phronis-teal/50"
                />
              </div>
            ) : null}

            {error ? (
              <p className="text-sm text-amber-200/90" role="alert">
                {error}
              </p>
            ) : null}

            <Button
              type="button"
              disabled={busy}
              className="bg-phronis-teal text-phronis-void hover:opacity-90"
              onClick={() => void onSubmit()}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" aria-hidden />
                  Send request
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
