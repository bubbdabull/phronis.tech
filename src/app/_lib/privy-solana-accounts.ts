/**
 * Extract embedded Solana wallets from Privy user / linked-account payloads.
 * Supports API user objects, identity-token users, and React `linkedAccounts` shapes.
 */

export type SolanaLinked = {
  address: string;
  wallet_client_type?: string;
  connector_type?: string;
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

/** Matches Privy embedded wallets (`privy`, `privy-v2`, connector `embedded`). */
export function isEmbeddedSolanaLinked(w: SolanaLinked): boolean {
  const wct = (w.wallet_client_type ?? "").toLowerCase();
  const connector = (w.connector_type ?? "").toLowerCase();
  if (connector === "embedded") return true;
  if (wct === "privy" || wct === "privy-v2" || wct.startsWith("privy")) return true;
  return false;
}

/** Privy `useWallets()` from `@privy-io/react-auth/solana` — all entries are embedded Solana wallets. */
export function embeddedSolanaFromSolanaWallets(
  wallets: ReadonlyArray<{ address?: string; walletClientType?: string; connectorType?: string }>,
): string | null {
  for (const w of wallets) {
    const address = typeof w.address === "string" ? w.address.trim() : "";
    if (!address) continue;
    const linked: SolanaLinked = {
      address,
      wallet_client_type: w.walletClientType,
      connector_type: w.connectorType,
    };
    if (isEmbeddedSolanaLinked(linked) || !w.walletClientType) return address;
  }
  return null;
}

export function extractSolanaLinkedFromAccounts(accounts: unknown[]): SolanaLinked[] {
  const out: SolanaLinked[] = [];
  const seen = new Set<string>();

  for (const raw of accounts) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    const typ = readStr(o, "type").toLowerCase();
    if (typ && oauthLikeType(typ)) continue;
    if (typ && typ !== "wallet" && typ !== "smart_wallet") continue;

    const chain = readStr(o, "chain_type", "chainType").toLowerCase();
    if (chain !== "solana") continue;

    const address = readStr(o, "address");
    if (!address || seen.has(address)) continue;
    seen.add(address);

    out.push({
      address,
      wallet_client_type: readStr(o, "wallet_client_type", "walletClientType", "wallet_client") || undefined,
      connector_type: readStr(o, "connector_type", "connectorType") || undefined,
    });
  }

  return out;
}

export function linkedAccountsFromPrivyUser(user: unknown): unknown[] {
  if (!user || typeof user !== "object") return [];
  const u = user as Record<string, unknown>;
  const raw = u.linked_accounts ?? u.linkedAccounts;
  return Array.isArray(raw) ? raw : [];
}

/** Merge account lists; later entries override earlier per address. */
export function mergeSolanaLinkedLists(...lists: SolanaLinked[][]): SolanaLinked[] {
  const map = new Map<string, SolanaLinked>();
  for (const list of lists) {
    for (const w of list) map.set(w.address, { ...map.get(w.address), ...w });
  }
  return [...map.values()];
}

export function embeddedSolanaFromAccounts(accounts: unknown[]): SolanaLinked[] {
  return extractSolanaLinkedFromAccounts(accounts).filter(isEmbeddedSolanaLinked);
}

export function pickPrimaryEmbeddedSolana(list: SolanaLinked[]): string | null {
  const embedded = list.filter(isEmbeddedSolanaLinked);
  return embedded[0]?.address ?? null;
}

export function embeddedSolanaFromPrivyUser(user: unknown): string | null {
  return pickPrimaryEmbeddedSolana(embeddedSolanaFromAccounts(linkedAccountsFromPrivyUser(user)));
}

/** React Privy `User.linkedAccounts` (camelCase). */
export function embeddedSolanaFromReactUser(
  user: { linkedAccounts?: readonly unknown[] } | null | undefined,
): string | null {
  if (!user?.linkedAccounts?.length) return null;
  const accounts = user.linkedAccounts.map((a) => {
    if (!a || typeof a !== "object") return a;
    const o = a as Record<string, unknown>;
    return {
      type: o.type,
      address: o.address,
      chain_type: o.chainType ?? o.chain_type,
      chainType: o.chainType ?? o.chain_type,
      wallet_client_type: o.walletClientType ?? o.wallet_client_type,
      connector_type: o.connectorType ?? o.connector_type,
    };
  });
  return embeddedSolanaFromPrivyUser({ linked_accounts: accounts });
}
