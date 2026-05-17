"use client";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";

type Props = {
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onBack?: () => void;
  busy: boolean;
  otpBusy: boolean;
  error?: string | null;
};

export function EmailOtpFields({ email, code, onCodeChange, onSubmit, onResend, onBack, busy, otpBusy, error }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-phronis-muted">
        We sent a 6-digit code to <span className="font-medium text-phronis-foreground">{email}</span>.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="auth-otp">Verification code</Label>
        <Input
          id="auth-otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={8}
          value={code}
          onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
          className="border-white/15 bg-black/30 font-mono tracking-[0.3em]"
          disabled={busy}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        className="w-full bg-phronis-teal text-phronis-void hover:opacity-90"
        disabled={busy || code.length < 6}
        onClick={onSubmit}
      >
        {otpBusy ? "Verifying…" : "Continue"}
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <button type="button" className="text-phronis-teal hover:underline" disabled={busy} onClick={onResend}>
          Resend code
        </button>
        {onBack ? (
          <button type="button" className="text-phronis-muted hover:text-phronis-foreground" disabled={busy} onClick={onBack}>
            ← Change email
          </button>
        ) : null}
      </div>
    </div>
  );
}
