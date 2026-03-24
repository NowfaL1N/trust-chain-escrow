type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

/**
 * Lightweight in-memory rate limiter.
 * Suitable for single-instance deployments; for multi-instance use Redis/KV.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= limit) return true;
  entry.count += 1;
  buckets.set(key, entry);
  return false;
}

export function clientIpFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  return forwarded.split(",")[0]?.trim() || "unknown";
}
