import type { PrivyClient } from "@privy-io/node";

export function getPrivyEarnVaultId(): string | null {
  const id = process.env.PRIVY_EARN_VAULT_ID?.trim();
  return id || null;
}

export function isPrivyEarnConfigured(): boolean {
  return Boolean(getPrivyEarnVaultId());
}

/** Public flag for wallet UI — vault id is server-only. */
export function isPrivyEarnEnabledForClient(): boolean {
  return process.env.NEXT_PUBLIC_PRIVY_EARN_ENABLED === "true" && isPrivyEarnConfigured();
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

/** Fetch vault position via Privy REST (not yet exposed on convenience SDK surface). */
export async function fetchEarnPosition(
  privy: PrivyClient,
  walletId: string,
  vaultId: string,
): Promise<EarnPositionView | null> {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
  const appSecret = process.env.PRIVY_APP_SECRET?.trim();
  if (!appId || !appSecret) return null;

  const auth = Buffer.from(`${appId}:${appSecret}`).toString("base64");
  const url = `https://auth.privy.io/api/v1/wallets/${encodeURIComponent(walletId)}/earn/ethereum/vaults?vault_id=${encodeURIComponent(vaultId)}`;

  const res = await fetch(url, {
    headers: {
      "privy-app-id": appId,
      Authorization: `Basic ${auth}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
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
