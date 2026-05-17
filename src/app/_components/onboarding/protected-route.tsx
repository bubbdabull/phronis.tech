"use client";

/**
 * L3 (application): gate member dashboard routes — unauthenticated users are redirected to `/members`.
 * L2 (server) is enforced on each `/api/members/*` and related route via Privy bearer + Supabase.
 * L1 (on-chain) applies where APIs read chain state (e.g. PHR balance for DAO access).
 * @see docs/MEMBER_SECTION_SECURITY_L1_L2_L3.md
 */
import { usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { MEMBER_AUTH_SUCCESS_PATH } from "@/_lib/auth/member-auth-constants";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const pathname = usePathname() ?? MEMBER_AUTH_SUCCESS_PATH;
    const returnTo =
      pathname.startsWith("/members") || pathname === "/welcome" ? MEMBER_AUTH_SUCCESS_PATH : pathname;

  useEffect(() => {
    if (!ready || authenticated) return;
    router.replace(
      `/members?mode=signin&redirectTo=${encodeURIComponent(returnTo)}#auth`,
    );
  }, [authenticated, ready, returnTo, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-phronis-muted" role="status">
        Loading session…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-phronis-muted" role="status">
        Redirecting to sign in…
      </div>
    );
  }

  return <>{children}</>;
}
