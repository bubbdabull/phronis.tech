/** Extract embedded Ethereum + smart-wallet addresses from Privy linked accounts. */

export type EthWalletInfo = {
  address: string;
  kind: "embedded" | "smart_wallet";
  smartWalletType?: string;
};

function readStr(o: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function oauthLikeType(t: string): boolean {
  return (
    t === "email" ||
    t === "phone" ||
    t === "passkey" ||
    t.endsWith("_oauth") ||
    t === "custom_jwt" ||
    t === "authorization_key"
  );
}

/** Matches Privy embedded Ethereum wallets (`privy`, `privy-v2`, connector `embedded`). */
export function isEmbeddedEthereumLinked(w: {
  wallet_client_type?: string;
  connector_type?: string;
}): boolean {
  const wct = (w.wallet_client_type ?? "").toLowerCase();
  const connector = (w.connector_type ?? "").toLowerCase();
  if (connector === "embedded") return true;
  if (wct === "privy" || wct === "privy-v2" || wct.startsWith("privy")) return true;
  return false;
}

function isEthAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
}

export function linkedAccountsFromPrivyUser(user: unknown): unknown[] {
  if (!user || typeof user !== "object") return [];
  const u = user as Record<string, unknown>;
  const raw = u.linked_accounts ?? u.linkedAccounts;
  return Array.isArray(raw) ? raw : [];
}

function normalizeLinkedAccount(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    type: o.type,
    address: o.address,
    chain_type: o.chainType ?? o.chain_type,
    chainType: o.chainType ?? o.chain_type,
    wallet_client_type: o.walletClientType ?? o.wallet_client_type,
    connector_type: o.connectorType ?? o.connector_type,
    smartWalletType: o.smartWalletType ?? o.smart_wallet_type,
    smart_wallet_type: o.smart_wallet_type ?? o.smartWalletType,
  };
}

export function extractEthereumWallets(
  user: { linkedAccounts?: readonly unknown[]; linked_accounts?: unknown[]; smartWallet?: { address?: string } } | null | undefined,
): EthWalletInfo[] {
  const out: EthWalletInfo[] = [];
  const seen = new Set<string>();

  const topLevelSmart = user?.smartWallet?.address?.trim();
  if (topLevelSmart) {
    seen.add(topLevelSmart.toLowerCase());
    out.push({ address: topLevelSmart, kind: "smart_wallet" });
  }

  const rawAccounts = user?.linkedAccounts?.length
    ? [...user.linkedAccounts]
    : Array.isArray((user as { linked_accounts?: unknown[] })?.linked_accounts)
      ? [...((user as { linked_accounts: unknown[] }).linked_accounts)]
      : [];

  for (const raw of rawAccounts) {
    const o = normalizeLinkedAccount(raw);
    if (!o) continue;

    const typ = readStr(o, "type").toLowerCase();
    if (typ && oauthLikeType(typ)) continue;
    if (typ && typ !== "wallet" && typ !== "smart_wallet") continue;

    const address = readStr(o, "address");
    if (!address || seen.has(address.toLowerCase())) continue;

    const chain = readStr(o, "chain_type", "chainType").toLowerCase();
    const wallet_client_type = readStr(o, "wallet_client_type", "walletClientType");
    const connector_type = readStr(o, "connector_type", "connectorType");

    if (typ === "smart_wallet") {
      seen.add(address.toLowerCase());
      out.push({
        address,
        kind: "smart_wallet",
        smartWalletType: readStr(o, "smartWalletType", "smart_wallet_type") || undefined,
      });
      continue;
    }

    if (chain && chain !== "ethereum") continue;
    if (!chain && !isEthAddress(address)) continue;

    seen.add(address.toLowerCase());
    out.push({
      address,
      kind: isEmbeddedEthereumLinked({ wallet_client_type, connector_type }) ? "embedded" : "smart_wallet",
    });
  }

  return out;
}

export function embeddedEthereumFromAccounts(accounts: unknown[]): string | null {
  for (const raw of accounts) {
    const o = normalizeLinkedAccount(raw);
    if (!o) continue;
    const typ = readStr(o, "type").toLowerCase();
    if (typ === "smart_wallet") continue;
    const chain = readStr(o, "chain_type", "chainType").toLowerCase();
    const address = readStr(o, "address");
    if (!address) continue;
    if (chain && chain !== "ethereum") continue;
    if (!chain && !isEthAddress(address)) continue;
    if (
      isEmbeddedEthereumLinked({
        wallet_client_type: readStr(o, "wallet_client_type", "walletClientType"),
        connector_type: readStr(o, "connector_type", "connectorType"),
      })
    ) {
      return address;
    }
  }
  return null;
}

export function embeddedEthereumFromPrivyUser(user: unknown): string | null {
  return embeddedEthereumFromAccounts(linkedAccountsFromPrivyUser(user));
}

/** React Privy `User.linkedAccounts` (camelCase). */
export function embeddedEthereumFromReactUser(
  user: { linkedAccounts?: readonly unknown[] } | null | undefined,
): string | null {
  if (!user?.linkedAccounts?.length) return embeddedEthereumFromPrivyUser(user);
  const accounts = user.linkedAccounts.map((a) => normalizeLinkedAccount(a) ?? a);
  return embeddedEthereumFromAccounts(accounts);
}

/** `useWallets()` from `@privy-io/react-auth` — embedded + connected Ethereum wallets. */
export function embeddedEthereumFromConnectedWallets(
  wallets: ReadonlyArray<{ address?: string; chainType?: string; walletClientType?: string; connectorType?: string }>,
): string | null {
  for (const w of wallets) {
    const address = typeof w.address === "string" ? w.address.trim() : "";
    if (!address || !isEthAddress(address)) continue;
    const chain = (w.chainType ?? "").toLowerCase();
    if (chain && chain !== "ethereum") continue;
    if (isEmbeddedEthereumLinked({ wallet_client_type: w.walletClientType, connector_type: w.connectorType })) {
      return address;
    }
  }
  return null;
}
