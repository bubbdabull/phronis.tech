const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function isPrivyRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /too many requests/i.test(msg);
}

/**
 * Fetch Privy identity token with minimal retries to avoid rate limits.
 * Server sync can still proceed with access token + embeddedSolanaAddress only.
 */
export async function fetchIdentityTokenOnce(
  getIdentityToken: () => Promise<string | null>,
  opts?: { maxAttempts?: number; delayMs?: number },
): Promise<string | null> {
  const maxAttempts = opts?.maxAttempts ?? 2;
  const delayMs = opts?.delayMs ?? 1200;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const token = await getIdentityToken();
      if (token) return token;
    } catch (err) {
      if (isPrivyRateLimitError(err)) return null;
      throw err;
    }
    if (i < maxAttempts - 1) await sleep(delayMs);
  }

  return null;
}
