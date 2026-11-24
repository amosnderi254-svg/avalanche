export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { verifyPin, makeSessionCookie, newSession } from '@/lib/shop-auth';
import { getClientIp } from '@/lib/rate-limit';

// Simple in-memory brute-force guard (per IP, like admin-auth)
interface FailEntry { count: number; lockedUntil: number | null; windowStart: number; }
const failStore = new Map<string, FailEntry>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS    = 15 * 60_000;
const LOCKOUT_MS   = 15 * 60_000;

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, e] of failStore) {
      if ((e.lockedUntil === null || e.lockedUntil < now) && e.windowStart + WINDOW_MS < now) {
        failStore.delete(k);
      }
    }
  }, 5 * 60_000).unref?.();
}

// POST /api/my-shop/auth
// Body: { phone: string, pin: string }
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Check lockout
  const now   = Date.now();
  let   entry = failStore.get(ip);
  if (entry?.lockedUntil && entry.lockedUntil > now) {
    const mins = Math.ceil((entry.lockedUntil - now) / 60_000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${mins} minute(s).` },
      { status: 423 }
    );
  }

  let body: { phone?: string; pin?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const { phone, pin } = body;
  if (!phone || !pin) return NextResponse.json({ error: 'Phone and PIN required' }, { status: 400 });
  if (!/^\d{4,8}$/.test(pin)) return NextResponse.json({ error: 'PIN must be 4-8 digits' }, { status: 400 });

  // Normalize phone
  const normalized = phone.replace(/\D/g, '').replace(/^0/, '254');
  if (!/^254\d{9}$/.test(normalized)) {
    return NextResponse.json({ error: 'Enter a valid Kenyan phone number' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: shop } = await supabase
    .from('seller_profiles')
    .select('id, phone, shop_name, shop_pin, is_shop, subscription_tier, subscription_expires_at, verified_shop')
    .eq('phone', normalized)
    .eq('is_shop', true)
    .single();

  // Always run verifyPin to prevent timing-based enumeration
  const hashedPin = shop?.shop_pin ?? 'x:y'; // dummy so verifyPin always runs
  const pinOk     = shop ? verifyPin(pin, hashedPin) : false;

  if (!shop || !pinOk) {
    // Record failure
    if (!entry || entry.windowStart + WINDOW_MS < now) {
      entry = { count: 0, lockedUntil: null, windowStart: now };
    }
    entry.count++;
    if (entry.count >= MAX_ATTEMPTS) {
      entry.lockedUntil = now + LOCKOUT_MS;
    }
    failStore.set(ip, entry);
    return NextResponse.json({ error: 'Incorrect phone or PIN' }, { status: 401 });
  }

  // Check PIN is set
  if (!shop.shop_pin) {
    return NextResponse.json(
      { error: 'Dashboard access not yet set up. Contact admin to get your PIN.' },
      { status: 403 }
    );
  }

  // Success -- clear failures
  failStore.delete(ip);

  const session = newSession(shop.id, shop.phone);
  const cookie  = makeSessionCookie(session);

  return NextResponse.json(
    { ok: true, shop_name: shop.shop_name },
    { headers: { 'Set-Cookie': cookie } }
  );
}
