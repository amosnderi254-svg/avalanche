/**
 * Shop owner authentication utilities.
 *
 * Uses Node's built-in `crypto` module -- no external dependencies.
 *
 * PIN storage: PBKDF2-SHA512 with a random 16-byte salt.
 *   Stored format: "salt_hex:hash_hex"
 *
 * Session token: HMAC-SHA256 signed payload.
 *   Format: "base64url_payload.base64url_sig"
 *   Payload: { shop_id, phone, exp }
 */

import crypto from 'crypto';

export const SESSION_COOKIE = 'mtv_shop_session';
const SESSION_DURATION_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  return process.env.SHOP_SESSION_SECRET || 'mtv-shop-dev-secret-do-not-use-in-prod';
}

// ── PIN hashing ───────────────────────────────────────────────────────────────

export function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pin, salt, 100_000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const candidate = crypto.pbkdf2Sync(pin, salt, 100_000, 64, 'sha512').toString('hex');
    // Constant-time comparison to prevent timing attacks
    if (hash.length !== candidate.length) return false;
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'));
  } catch {
    return false;
  }
}

// ── Session token ─────────────────────────────────────────────────────────────

export interface ShopSession {
  shop_id: string;
  phone: string;
  exp: number;
}

export function createSessionToken(session: ShopSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): ShopSession | null {
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return null;
    const payload = token.slice(0, dot);
    const sig     = token.slice(dot + 1);
    const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const session: ShopSession = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function getSessionFromCookieHeader(cookieHeader: string | null): ShopSession | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`)
  );
  if (!match?.[1]) return null;
  return verifySessionToken(decodeURIComponent(match[1]));
}

export function makeSessionCookie(session: ShopSession): string {
  const token  = createSessionToken(session);
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000);
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function newSession(shop_id: string, phone: string): ShopSession {
  return { shop_id, phone, exp: Date.now() + SESSION_DURATION_MS };
}
