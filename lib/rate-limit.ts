/**
 * In-memory rate limiter for Next.js serverless routes.
 *
 * CAVEAT: Serverless environments can run multiple instances simultaneously,
 * so this limiter is per-instance, not globally distributed. It still provides
 * meaningful protection against bursty abuse from a single IP hitting the same
 * serverless instance. For strict global limits, replace with an external store
 * (e.g. Redis via Upstash).
 *
 * Usage:
 *   const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *   const result  = limiter.check(ip);
 *   if (!result.ok) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 */

interface LimiterEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

export interface RateLimiterOptions {
  maxRequests: number; // allowed requests per window
  windowMs: number;    // window size in milliseconds
  keyPrefix?: string;  // optional namespace (useful when sharing one Map)
}

export function createRateLimiter(opts: RateLimiterOptions) {
  const { maxRequests, windowMs, keyPrefix = '' } = opts;
  const store = new Map<string, LimiterEntry>();

  // Prune stale entries periodically to prevent unbounded memory growth.
  // Only active during the process lifetime, which is fine for serverless.
  const prune = () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key);
    }
  };

  // Run prune every minute (interval is GC'd when module unloads)
  if (typeof setInterval !== 'undefined') {
    setInterval(prune, 60_000).unref?.();
  }

  return {
    check(identifier: string): RateLimitResult {
      const key   = keyPrefix ? `${keyPrefix}:${identifier}` : identifier;
      const now   = Date.now();
      let entry   = store.get(key);

      if (!entry || entry.resetAt < now) {
        entry = { count: 0, resetAt: now + windowMs };
        store.set(key, entry);
      }

      entry.count++;
      const remaining = Math.max(0, maxRequests - entry.count);
      return {
        ok:        entry.count <= maxRequests,
        remaining,
        resetAt:   entry.resetAt,
      };
    },

    reset(identifier: string): void {
      const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier;
      store.delete(key);
    },
  };
}

/** Extract a best-effort client IP from Next.js request headers. */
export function getClientIp(req: Request): string {
  const headers = req instanceof Request ? req.headers : (req as { headers: Headers }).headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
