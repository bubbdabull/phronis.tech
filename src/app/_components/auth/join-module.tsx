"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginWithEmail } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { EmailOtpFields } from "@/_components/auth/email-otp-fields";
import { MemberAuthCard } from "@/_components/auth/member-auth-card";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { useMemberAuthBridge } from "@/_hooks/use-member-auth-bridge";
import { stashJoinDisplayName } from "@/_lib/auth/pending-join-profile";
import { emailOtpSchema, joinDetailsSchema, type JoinDetails } from "@/_lib/schemas/member-auth";

type Step = "details" | "otp";

type Props = {
  redirectTo: string;
  errorMessage?: string;
  embedded?: boolean;
  onSwitchToSignIn?: () => void;
};

function otpErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Invalid or expired code. Try again or resend.";
}

export function JoinModule({ redirectTo, errorMessage = "", embedded = false, onSwitchToSignIn }: Props) {
  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState("");

  const { sendCode, loginWithCode, state: otpState } = useLoginWithEmail();
  const { ready, bridgeBusy, error: bridgeError, setError: setBridgeError } = useMemberAuthBridge({
    redirectTo,
    syncAfterAuth: true,
  });

  const appIdMissing = !process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
  const otpBusy =
    otpState.status === "sending-code" || otpState.status === "submitting-code" || bridgeBusy;

  const form = useForm<JoinDetails>({
    resolver: zodResolver(joinDetailsSchema),
    defaultValues: { display_name: "", email: "" },
  });

  const onSubmitDetails = form.handleSubmit(async (data) => {
    setLocalError("");
    setBridgeError(null);
    stashJoinDisplayName(data.display_name);
    setEmail(data.email);
    try {
      await sendCode({ email: data.email, disableSignup: false });
      setStep("otp");
      setOtp("");
    } catch (e) {
      setLocalError(otpErrorMessage(e));
    }
  });

  const submitOtp = useCallback(async () => {
    const parsed = emailOtpSchema.safeParse({ code: otp });
    if (!parsed.success) {
      setLocalError(parsed.error.flatten().fieldErrors.code?.[0] ?? "Enter the code from your email.");
      return;
    }
    setLocalError("");
    setBridgeError(null);
    try {
      await loginWithCode({ code: parsed.data.code });
    } catch (e) {
      setLocalError(otpErrorMessage(e));
    }
  }, [loginWithCode, otp, setBridgeError]);

  const resendCode = useCallback(async () => {
    setLocalError("");
    try {
      await sendCode({ email, disableSignup: false });
    } catch (e) {
      setLocalError(otpErrorMessage(e));
    }
  }, [email, sendCode]);

  useEffect(() => {
    if (otpState.status === "error" && otpState.error) {
      setLocalError(otpErrorMessage(otpState.error));
    }
  }, [otpState]);

  const displayError = localError || bridgeError || errorMessage;

  const body = (
    <>
      {step === "details" ? (
        <form className="space-y-4" onSubmit={(e) => void onSubmitDetails(e)}>
          <div className="space-y-1.5">
            <Label htmlFor="join-name">Your name</Label>
            <Input
              id="join-name"
              autoComplete="name"
              placeholder="Alex"
              className="border-white/15 bg-black/30"
              disabled={!ready || otpBusy}
              {...form.register("display_name")}
            />
            {form.formState.errors.display_name ? (
              <p className="text-xs text-red-300">{form.formState.errors.display_name.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="join-email">Email</Label>
            <Input
              id="join-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="border-white/15 bg-black/30"
              disabled={!ready || otpBusy}
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-red-300">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          {displayError ? (
            <p className="text-sm text-red-300" role="alert">
              {displayError}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full bg-phronis-teal text-phronis-void hover:opacity-90"
            disabled={!ready || otpState.status === "sending-code"}
          >
            {!ready ? "Loading…" : otpState.status === "sending-code" ? "Sending code…" : "Join Phronis"}
          </Button>
        </form>
      ) : (
        <EmailOtpFields
          email={email}
          code={otp}
          onCodeChange={setOtp}
          onSubmit={() => void submitOtp()}
          onResend={() => void resendCode()}
          onBack={() => {
            setStep("details");
            setOtp("");
            setLocalError("");
          }}
          busy={otpBusy}
          otpBusy={otpState.status === "submitting-code"}
          error={displayError}
        />
      )}
    </>
  );

  if (appIdMissing) {
    const msg = (
      <p className="text-sm text-red-300">
        Set <span className="font-mono">NEXT_PUBLIC_PRIVY_APP_ID</span> in your environment.
      </p>
    );
    return embedded ? msg : (
      <MemberAuthCard title="Join Phronis" description="Member access is not configured on this environment.">
        {msg}
      </MemberAuthCard>
    );
  }

  if (bridgeBusy) {
    const busy = <p className="text-center text-sm text-phronis-muted">Setting up your account…</p>;
    return embedded ? busy : (
      <MemberAuthCard title="Setting up your account" description="Creating your embedded wallet and member profile…">
        {busy}
      </MemberAuthCard>
    );
  }

  if (embedded) return body;

  const footer = onSwitchToSignIn ? (
    <>
      Already have an account?{" "}
      <button type="button" className="text-phronis-teal hover:underline" onClick={onSwitchToSignIn}>
        Sign in
      </button>
    </>
  ) : undefined;

  return (
    <MemberAuthCard
      title="Join Phronis"
      description="Enter your name and email. We send a one-time code, then create your embedded Solana wallet automatically."
      footer={footer}
    >
      {body}
    </MemberAuthCard>
  );
}
