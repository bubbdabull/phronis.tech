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
import { emailOtpSchema, signInEmailSchema, type SignInEmail } from "@/_lib/schemas/member-auth";

type Step = "email" | "otp";

type Props = {
  redirectTo: string;
  errorMessage?: string;
  embedded?: boolean;
  onSwitchToJoin?: () => void;
};

function otpErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Invalid or expired code. Try again or resend.";
}

export function SignInModule({ redirectTo, errorMessage = "", embedded = false, onSwitchToJoin }: Props) {
  const [step, setStep] = useState<Step>("email");
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

  const form = useForm<SignInEmail>({
    resolver: zodResolver(signInEmailSchema),
    defaultValues: { email: "" },
  });

  const onSubmitEmail = form.handleSubmit(async (data) => {
    setLocalError("");
    setBridgeError(null);
    setEmail(data.email);
    try {
      await sendCode({ email: data.email, disableSignup: true });
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
      await sendCode({ email, disableSignup: true });
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

  const footer =
    onSwitchToJoin && !embedded ? (
      <>
        New here?{" "}
        <button type="button" className="text-phronis-teal hover:underline" onClick={onSwitchToJoin}>
          Join Phronis
        </button>
      </>
    ) : undefined;

  const body = (
    <>
      {step === "email" ? (
        <form className="space-y-4" onSubmit={(e) => void onSubmitEmail(e)}>
          <div className="space-y-1.5">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
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
            {!ready ? "Loading…" : otpState.status === "sending-code" ? "Sending code…" : "Sign in"}
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
            setStep("email");
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
      <MemberAuthCard title="Sign in" description="Member access is not configured on this environment.">
        {msg}
      </MemberAuthCard>
    );
  }

  if (bridgeBusy) {
    const busy = <p className="text-center text-sm text-phronis-muted">Welcome back — continuing…</p>;
    return embedded ? busy : (
      <MemberAuthCard title="Welcome back" description="Verifying your session…">
        {busy}
      </MemberAuthCard>
    );
  }

  if (embedded) return body;

  return (
    <MemberAuthCard
      title="Sign in"
      description="Use the email on your Phronis account. We'll send a one-time code—no password needed."
      footer={footer}
    >
      {body}
    </MemberAuthCard>
  );
}
