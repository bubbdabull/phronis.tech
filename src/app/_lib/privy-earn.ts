import type { PrivyClient } from "@privy-io/node";

import { extractEthereumWallets } from "@/_lib/privy-ethereum-accounts";

const PRIVY_API_BASE = process.env.PRIVY_API_BASE_URL?.trim() || "https://api.privy.io";

export function getPrivyEarnVaultId(): string | null {
  const id = process.env.PRIVY_EARN_VAULT_ID?.trim();
  return id || null;
}

export function isPrivyEarnConfigured(): boolean {
  return Boolean(getPrivyEarnVaultId());
}

/**
 * Optional client hint — server `PRIVY_EARN_VAULT_ID` is authoritative.
 * Do not read vault id on the client (not exposed via NEXT_PUBLIC_).
 */
export function isPrivyEarnEnabledForClient(): boolean {
  return process.env.NEXT_PUBLIC_PRIVY_EARN_ENABLED === "true";
}

export type EarnPositionView = {
  assetSymbol: string;
  decimals: number;
  assetsInVault: number;
  totalDeposited: number;
  totalWithdrawn: number;
  earnedYield: number;
};

function fromSmallestUnit(raw: string | null | undefined, decimals: number): number {
  if (!raw) return 0;
  try {
    return Number(raw) / 10 ** decimals;
  } catch {
    return 0;
  }
}

function privyBasicAuthHeaders(): Record<string, string> | null {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
  const appSecret = process.env.PRIVY_APP_SECRET?.trim();
  if (!appId || !appSecret) return null;
  const auth = Buffer.from(`${appId}:${appSecret}`).toString("base64");
  return {
    "privy-app-id": appId,
    Authorization: `Basic ${auth}`,
  };
}

/** Verify the address belongs to this Privy user (embedded or smart wallet). */
export async function userOwnsEthereumAddress(
  privy: PrivyClient,
  userId: string,
  address: string,
): Promise<boolean> {
  try {
    const user = await privy.users()._get(userId);
    const norm = address.trim().toLowerCase();
    return extractEthereumWallets(user).some((w) => w.address.toLowerCase() === norm);
  } catch {
    return false;
  }
}

export async function resolvePrivyWalletIdByAddress(
  privy: PrivyClient,
  address: string,
): Promise<string | null> {
  try {
    const wallet = await privy.wallets().getWalletByAddress({ address: address.trim() });
    return wallet.id?.trim() || null;
  } catch {
    return null;
  }
}

/** Resolve Privy wallet id after confirming the address belongs to the session user. */
export async function resolveEarnWalletId(
  privy: PrivyClient,
  userId: string,
  address: string,
): Promise<string | null> {
  if (!(await userOwnsEthereumAddress(privy, userId, address))) return null;
  return resolvePrivyWalletIdByAddress(privy, address);
}

/** Wallet position in a Morpho vault — https://docs.privy.io/wallets/actions/earn/get-vault-position */
export async function fetchEarnPosition(
  walletId: string,
  vaultId: string,
): Promise<EarnPositionView | null> {
  const headers = privyBasicAuthHeaders();
  if (!headers) return null;

  const url = `${PRIVY_API_BASE}/v1/wallets/${encodeURIComponent(walletId)}/earn/ethereum/vaults?vault_id=${encodeURIComponent(vaultId)}`;

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    if (process.env.NODE_ENV !== "production") {
      const detail = await res.text().catch(() => "");
      console.warn("[privy-earn] position fetch failed", res.status, detail.slice(0, 200));
    }
    return null;
  }

  const body = (await res.json()) as {
    asset?: { symbol?: string; decimals?: number };
    assets_in_vault?: string;
    total_deposited?: string;
    total_withdrawn?: string;
  };

  const decimals = body.asset?.decimals ?? 6;
  const assetsInVault = fromSmallestUnit(body.assets_in_vault, decimals);
  const totalDeposited = fromSmallestUnit(body.total_deposited, decimals);
  const totalWithdrawn = fromSmallestUnit(body.total_withdrawn, decimals);

  return {
    assetSymbol: (body.asset?.symbol ?? "usdc").toUpperCase(),
    decimals,
    assetsInVault,
    totalDeposited,
    totalWithdrawn,
    earnedYield: assetsInVault - (totalDeposited - totalWithdrawn),
  };
}

export async function earnDeposit(
  privy: PrivyClient,
  walletId: string,
  vaultId: string,
  amount: string,
) {
  return privy.wallets().earn().ethereum().deposit(walletId, { vault_id: vaultId, amount });
}

export async function earnWithdraw(
  privy: PrivyClient,
  walletId: string,
  vaultId: string,
  amount: string,
) {
  return privy.wallets().earn().ethereum().withdraw(walletId, { vault_id: vaultId, amount });
}
