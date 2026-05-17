"use client";

import { getIdentityToken, useCreateWallet as useCreateEthereumWallet, usePrivy } from "@privy-io/react-auth";
import { useCreateWallet as useCreateSolanaWallet } from "@privy-io/react-auth/solana";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ensureEmbeddedSolanaOnClient } from "@/_lib/auth/ensure-embedded-solana-client";
import { fetchIdentityTokenOnce } from "@/_lib/auth/privy-identity-token";
import { ensureEmbeddedEthereumOnClient } from "@/_lib/auth/ensure-embedded-ethereum-client";
import { embeddedEthereumFromReactUser } from "@/_lib/privy-ethereum-accounts";
import { embeddedSolanaFromReactUser } from "@/_lib/privy-solana-accounts";
import { MEMBER_AUTH_SUCCESS_PATH } from "@/_lib/auth/member-auth-constants";
import { takeJoinDisplayName } from "@/_lib/auth/pending-join-profile";
import { safeClientReturnPath } from "@/_lib/auth/safe-client-return-path";

const VERIFY_TIMEOUT_MS = 12_000;

export type AuthBridgeState = "idle" | "working" | "done" | "error";

type Options = {
  redirectTo: string;
  syncAfterAuth?: boolean;
};

export function useMemberAuthBridge({ redirectTo, syncAfterAuth = false }: Options) {
  const router = useRouter();
  const { ready, authenticated, logout, getAccessToken, user } = usePrivy();
  const { createWallet: createSolanaWallet } = useCreateSolanaWallet();
  const { createWallet: createEthereumWallet } = useCreateEthereumWallet();
  const [bridgeState, setBridgeState] = useState<AuthBridgeState>("idle");
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);
  const userRef = useRef(user);
  userRef.current = user;

  const safeRedirect = safeClientReturnPath(
    redirectTo.startsWith("/") ? redirectTo : MEMBER_AUTH_SUCCESS_PATH,
  );

  const finishSuccess = useCallback(() => {
    setBridgeState("done");
    router.refresh();
    router.push(safeRedirect);
  }, [router, safeRedirect]);

  useEffect(() => {
    if (!ready || !authenticated) {
      handledRef.current = false;
      setBridgeState((s) => (s === "error" || s === "done" ? s : "idle"));
      return;
    }

    if (handledRef.current) return;
    handledRef.current = true;

    let cancelled = false;
    setBridgeState("working");
    setError(null);

    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (!cancelled) {
            setError("Could not read your session. Try again.");
            setBridgeState("error");
            handledRef.current = false;
          }
          return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);
        try {
          const res = await fetch("/api/privy/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
            signal: controller.signal,
          });
          if (res.status === 401 && !cancelled) {
            setError("Server could not verify this session. Check Privy env keys.");
            setBridgeState("error");
            handledRef.current = false;
            await logout();
            return;
          }
        } finally {
          window.clearTimeout(timer);
        }

        if (syncAfterAuth && !cancelled) {
          let embeddedSolanaAddress = embeddedSolanaFromReactUser(userRef.current);
          if (!embeddedSolanaAddress) {
            embeddedSolanaAddress = await ensureEmbeddedSolanaOnClient({
              getUser: () => userRef.current,
              createSolanaWallet: async () => {
                await createSolanaWallet();
              },
              maxAttempts: 8,
              delayMs: 1000,
            });
          }

          await ensureEmbeddedEthereumOnClient({
            getUser: () => userRef.current,
            createEthereumWallet: async () => {
              await createEthereumWallet();
            },
            maxAttempts: 8,
            delayMs: 1000,
          });

          const idTok = await fetchIdentityTokenOnce(getIdentityToken);

          const syncRes = await fetch("/api/onboarding/sync", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              ...(idTok ? { identityToken: idTok } : {}),
              ...(embeddedSolanaAddress ? { embeddedSolanaAddress } : {}),
            }),
            cache: "no-store",
          });

          const syncJson = (await syncRes.json()) as {
            ok?: boolean;
            error?: string;
            message?: string;
            wallet_address?: string | null;
          };

          if (!syncRes.ok || !syncJson.ok) {
            if (!cancelled) {
              setError(
                syncJson.message ??
                  (syncJson.error === "invalid_identity_token"
                    ? "Identity token could not be verified. Ensure PRIVY_APP_SECRET matches your app and identity tokens are enabled."
                    : "Could not sync your embedded wallet. Try again in a moment."),
              );
              setBridgeState("error");
              handledRef.current = false;
              return;
            }
          }

          if (!embeddedSolanaAddress && !syncJson.wallet_address && !cancelled) {
            setError(
              "Your embedded Solana wallet is still being created. Wait a few seconds and use Sync on Welcome, or try signing in again.",
            );
            setBridgeState("error");
            handledRef.current = false;
            return;
          }

          const displayName = takeJoinDisplayName();
          if (displayName) {
            await fetch("/api/members/profile", {
              method: "PATCH",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ display_name: displayName }),
            });
          }
        }

        if (!cancelled) finishSuccess();
      } catch {
        if (!cancelled) {
          setError("Something went wrong during sign-in. Please try again.");
          setBridgeState("error");
          handledRef.current = false;
        }
      }
    })();

    return () => {
      cancelled = true;
      handledRef.current = false;
    };
  }, [authenticated, createEthereumWallet, createSolanaWallet, finishSuccess, getAccessToken, logout, ready, syncAfterAuth]);

  const resetBridge = useCallback(() => {
    handledRef.current = false;
    setBridgeState("idle");
    setError(null);
  }, []);

  return {
    ready,
    authenticated,
    bridgeState,
    bridgeBusy: bridgeState === "working" || bridgeState === "done",
    error,
    setError,
    resetBridge,
    logout,
  };
}
