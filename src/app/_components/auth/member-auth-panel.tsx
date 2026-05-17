"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { JoinModule } from "@/_components/auth/join-module";
import { SignInModule } from "@/_components/auth/sign-in-module";
import {
  MEMBER_AUTH_SUCCESS_PATH,
  parseMemberAuthMode,
  type MemberAuthMode,
} from "@/_lib/auth/member-auth-constants";
import { safeClientReturnPath } from "@/_lib/auth/safe-client-return-path";
import { cn } from "@/_lib/utils";

type Props = {
  initialMode?: MemberAuthMode;
  /** Override post-auth destination (defaults to `/member`). */
  redirectTo?: string;
  errorMessage?: string;
};

export function MemberAuthPanel({ initialMode = "join", redirectTo, errorMessage = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<MemberAuthMode>(() =>
    parseMemberAuthMode(searchParams.get("mode") ?? initialMode),
  );
  const urlError = searchParams.get("error") ?? "";
  const combinedError = errorMessage || (urlError ? decodeURIComponent(urlError) : "");

  const successPath = useMemo(
    () => safeClientReturnPath(redirectTo ?? searchParams.get("redirectTo") ?? MEMBER_AUTH_SUCCESS_PATH),
    [redirectTo, searchParams],
  );

  const setModeAndUrl = useCallback(
    (next: MemberAuthMode) => {
      setMode(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", next);
      if (successPath && successPath !== MEMBER_AUTH_SUCCESS_PATH) {
        params.set("redirectTo", successPath);
      } else {
        params.delete("redirectTo");
      }
      router.replace(`/members?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, successPath],
  );

  return (
    <div id="auth" className="scroll-mt-28">
      <div className="mb-4 flex rounded-lg border border-white/10 bg-black/25 p-1">
        <button
          type="button"
          onClick={() => setModeAndUrl("join")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            mode === "join" ? "bg-white/12 text-phronis-teal" : "text-phronis-muted hover:text-phronis-foreground",
          )}
        >
          Join
        </button>
        <button
          type="button"
          onClick={() => setModeAndUrl("signin")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            mode === "signin" ? "bg-white/12 text-phronis-teal" : "text-phronis-muted hover:text-phronis-foreground",
          )}
        >
          Sign in
        </button>
      </div>
      {mode === "join" ? (
        <JoinModule
          embedded
          redirectTo={successPath}
          errorMessage={combinedError}
          onSwitchToSignIn={() => setModeAndUrl("signin")}
        />
      ) : (
        <SignInModule
          embedded
          redirectTo={successPath}
          errorMessage={combinedError}
          onSwitchToJoin={() => setModeAndUrl("join")}
        />
      )}
    </div>
  );
}
