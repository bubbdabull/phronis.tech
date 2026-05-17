import type { PrivyClientConfig } from "@privy-io/react-auth";

type CreateOnLogin = NonNullable<NonNullable<PrivyClientConfig["embeddedWallets"]>["ethereum"]>["createOnLogin"];

function embeddedCreateFromEnv(name: string, fallback: CreateOnLogin): CreateOnLogin {
  const raw = process.env[name]?.trim().toLowerCase();
  if (raw === "all-users" || raw === "users-without-wallets" || raw === "off") return raw;
  if (raw) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[privy] Invalid ${name}="${raw}", using ${fallback}`);
    }
  }
  return fallback;
}

/**
 * Shared Privy React config helpers (embedded wallet create-on-login, smart-wallet paymaster).
 * Used by `PrivyAppWrapper` — login is email-only; external wallet connectors are disabled in code.
 */
export function getPrivyEmbeddedCreateOnLogin(): {
  ethereum: CreateOnLogin;
  solana: CreateOnLogin;
} {
  return {
    ethereum: embeddedCreateFromEnv("NEXT_PUBLIC_PRIVY_EMBEDDED_ETH_CREATE", "all-users"),
    solana: embeddedCreateFromEnv("NEXT_PUBLIC_PRIVY_EMBEDDED_SOL_CREATE", "all-users"),
  };
}

/** Optional paymaster context for `@privy-io/react-auth/smart-wallets` (public JSON only — prefer dashboard for secrets). */
export function getPrivySmartWalletPaymasterContext(): Record<string, unknown> | undefined {
  const raw = process.env.NEXT_PUBLIC_PRIVY_SMART_WALLET_PAYMASTER_CONTEXT_JSON?.trim();
  if (!raw) return undefined;
  try {
    const v = JSON.parse(raw) as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[privy] NEXT_PUBLIC_PRIVY_SMART_WALLET_PAYMASTER_CONTEXT_JSON is not valid JSON");
    }
  }
  return undefined;
}
