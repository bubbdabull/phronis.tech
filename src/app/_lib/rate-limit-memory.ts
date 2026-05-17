/**
 * Best-effort in-memory rate limiter for API routes (single Node instance).
 * For serverless / multi-instance production, replace with Redis or an edge limiter (e.g. Vercel KV, Upstash).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const row = buckets.get(key);
  if (!row || now > row.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (row.count >= max) return false;
  row.count += 1;
  return true;
}
