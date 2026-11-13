/**
 * Shared admin PIN authentication with brute-force protection.
 *
 * All admin endpoints should call checkAdminPin() instead of doing inline PIN
 * comparisons, so lockout logic is applied consistently across every protected route.
 *
 * Supports two header patterns the platform uses:
 *   - Authorization: Bearer <PIN>   (stats endpoint)
 *   - x-admin-pin: <PIN>            (all other admin endpoints)
 *
 * Lockout policy (per IP, in-memory):
 *   - 5 failed attempts within 15 minutes triggers a 15-minute lockout
 *   - Each subsequent failure resets the lockout timer
 *   - Successful auth clears the counter
 *
 * NOTE: In-memory, so per-instance in serverless. Provides meaningful protection
 * against concentrated attacks on the same instance. For distributed lockout,
 * migrate to an external store (Upstash Redis, etc.).
 */

interface FailEntry {
  count: number;
  lockedUntil: number | null;
  windowStart: number;
}

const MAX_ATTEMPTS    = 5;
const WINDOW_MS       = 15 * 60_000; // 15-minute attempt window
const LOCKOUT_MS      = 15 * 60_000; // 15-minute lockout on breach

const failStore = new Map<string, FailEntry>();

// Prune stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of failStore) {
      if (
        (entry.lockedUntil === null || entry.lockedUntil < now) &&
        entry.windowStart + WINDOW_MS < now
      ) {
        failStore.delete(key);
      }
    }
  }, 5 * 60_000).unref?.();
}

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 423 | 429; message: string; retryAfterMs?: number };

/**
 * Validates an admin PIN from either the Authorization or x-admin-pin header.
 * Records failures and enforces lockout.
 *
 * @param headers  - Request headers
 * @param clientIp - Client IP (from getClientIp())
 */
export function checkAdminPin(
  headers: Headers,
  clientIp: string,
): AdminAuthResult {
  const ADMIN_PIN = process.env.ADMIN_PIN || '0784';

  // Check lockout first
  const now   = Date.now();
  let   entry = failStore.get(clientIp);

  if (entry?.lockedUntil && entry.lockedUntil > now) {
    const retryAfterMs = entry.lockedUntil - now;
    return {
      ok:          false,
      status:      423, // Locked
      message:     `Too many failed attempts. Try again in ${Math.ceil(retryAfterMs / 60_000)} minute(s).`,
      retryAfterMs,
    };
  }

  // Extract PIN from either header pattern
  const bearerHeader = headers.get('authorization') || '';
  const pinHeader    = headers.get('x-admin-pin')   || '';

  let submitted: string | null = null;
  if (bearerHeader.startsWith('Bearer ')) {
    submitted = bearerHeader.slice(7).trim();
  } else if (pinHeader) {
    submitted = pinHeader.trim();
  }

  if (submitted === ADMIN_PIN) {
    // Success -- clear failure counter
    failStore.delete(clientIp);
    return { ok: true };
  }

  // Failure -- record and potentially lock
  if (!entry || entry.windowStart + WINDOW_MS < now) {
    entry = { count: 0, lockedUntil: null, windowStart: now };
  }
  entry.count++;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil  = now + LOCKOUT_MS;
    failStore.set(clientIp, entry);
    return {
      ok:          false,
      status:      423,
      message:     `Too many failed attempts. Locked for ${LOCKOUT_MS / 60_000} minutes.`,
      retryAfterMs: LOCKOUT_MS,
    };
  }

  failStore.set(clientIp, entry);
  const remaining = MAX_ATTEMPTS - entry.count;
  return {
    ok:      false,
    status:  401,
    message: `Unauthorized. ${remaining} attempt(s) remaining before lockout.`,
  };
}
