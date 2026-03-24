/**
 * Simple in-memory rate limiter (sliding window).
 *
 * NOTE: This is per-process / per-serverless-instance. For production at
 * scale, swap in a Redis-backed implementation.
 */

const hits = new Map<string, number[]>();

/**
 * Returns `true` when the caller has exceeded `maxHits` within the last
 * `windowMs` milliseconds for the given `key`.
 */
export function isRateLimited(
  key: string,
  maxHits: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const timestamps = hits.get(key) ?? [];

  // Remove entries outside the window
  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= maxHits) {
    hits.set(key, valid);
    return true;
  }

  valid.push(now);
  hits.set(key, valid);
  return false;
}

/**
 * Best-effort extraction of the client IP from a request.
 * Works with standard headers set by reverse proxies / Vercel / Cloudflare.
 */
export function clientIpFromRequest(req: Request): string {
  const headers = req.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
