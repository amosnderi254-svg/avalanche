export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { checkAdminPin } from '@/lib/admin-auth';
import { getClientIp } from '@/lib/rate-limit';
import { hashPin } from '@/lib/shop-auth';

// ── GET /api/admin/shops  -- list all shops ───────────────────────────────────
export async function GET(req: NextRequest) {
  const authResult = checkAdminPin(req.headers, getClientIp(req));
  if (!authResult.ok) return NextResponse.json({ error: authResult.message }, { status: authResult.status });

  const supabase = createAdminClient();
  const { data: shops, error } = await supabase
    .from('seller_profiles')
    .select('id, phone, display_name, profile_slug, neighbourhood, avatar_url, shop_name, shop_bio, shop_banner_url, shop_areas, is_shop, verified_shop, subscription_tier, subscription_expires_at, created_at, shop_pin')
    .eq('is_shop', true)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with live listing count
  const phones = (shops || []).map(s => s.phone);
  let countMap: Record<string, number> = {};
  if (phones.length > 0) {
    const now = new Date().toISOString();
    const { data: listingRows } = await supabase
      .from('listings')
      .select('seller_phone')
      .in('seller_phone', phones)
      .eq('status', 'live')
      .or(`expires_at.is.null,expires_at.gt.${now}`);
    for (const row of listingRows ?? []) {
      countMap[row.seller_phone] = (countMap[row.seller_phone] || 0) + 1;
    }
  }

  return NextResponse.json({
    shops: (shops || []).map(s => ({ ...s, listing_count: countMap[s.phone] || 0 })),
  });
}

// ── PATCH /api/admin/shops  -- update shop fields ─────────────────────────────
export async function PATCH(req: NextRequest) {
  const authResult = checkAdminPin(req.headers, getClientIp(req));
  if (!authResult.ok) return NextResponse.json({ error: authResult.message }, { status: authResult.status });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // Whitelist allowed fields
  const allowed = [
    'is_shop', 'shop_name', 'shop_bio', 'shop_banner_url', 'shop_areas',
    'verified_shop', 'subscription_tier', 'subscription_expires_at',
    'display_name', 'bio', 'neighbourhood',
  ] as const;

  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key];
  }

  // Handle PIN reset separately (must be hashed)
  if (updates.shop_pin) {
    const rawPin = String(updates.shop_pin);
    if (rawPin.length < 4 || rawPin.length > 8) {
      return NextResponse.json({ error: 'shop_pin must be 4-8 digits' }, { status: 400 });
    }
    patch.shop_pin = await hashPin(rawPin);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('seller_profiles')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ shop: data });
}

// ── POST /api/admin/shops  -- onboard a new shop (promote existing seller or create) ──
export async function POST(req: NextRequest) {
  const authResult = checkAdminPin(req.headers, getClientIp(req));
  if (!authResult.ok) return NextResponse.json({ error: authResult.message }, { status: authResult.status });

  const body = await req.json();
  const {
    phone, shop_name, shop_bio, neighbourhood, subscription_tier,
    owner_name, id_type, id_number, email,
    kiosk_address, operating_hours, categories,
    billing_cycle, subscription_start, mpesa_ref, admin_notes,
    shop_pin,
  } = body;

  if (!phone || !shop_name) {
    return NextResponse.json({ error: 'phone and shop_name required' }, { status: 400 });
  }

  // Hash PIN if provided
  let hashedPin: string | null = null;
  if (shop_pin) {
    if (typeof shop_pin !== 'string' || shop_pin.length < 4 || shop_pin.length > 8) {
      return NextResponse.json({ error: 'shop_pin must be 4-8 digits' }, { status: 400 });
    }
    hashedPin = await hashPin(shop_pin);
  }

  // Calculate subscription_expires_at from start date + billing cycle
  function calcExpiry(start: string | undefined, tier: string, cycle: string): string | null {
    if (!tier || tier === 'free') return null;
    const base = start ? new Date(start) : new Date();
    const days  = cycle === 'annual' ? 365 : 30;
    base.setDate(base.getDate() + days);
    return base.toISOString();
  }
  const subscription_expires_at = calcExpiry(subscription_start, subscription_tier, billing_cycle || 'monthly');

  // Build a structured shop_bio that includes KYC notes if no dedicated column exists
  const enrichedBio = [
    shop_bio || null,
    kiosk_address ? `Location: ${kiosk_address}` : null,
    operating_hours ? `Hours: ${operating_hours}` : null,
  ].filter(Boolean).join(' | ') || null;

  // Build admin-readable shop_areas from categories until a dedicated column is added
  const shopAreas: string[] = Array.isArray(categories) && categories.length > 0 ? categories : [];

  const normalizedPhone = phone.replace(/\D/g, '').replace(/^0/, '254');
  const supabase = createAdminClient();

  // Check if seller profile exists
  const { data: existing } = await supabase
    .from('seller_profiles')
    .select('id, phone, display_name, profile_slug')
    .eq('phone', normalizedPhone)
    .single();

  if (existing) {
    // Promote existing profile to shop
    const promotePayload: Record<string, unknown> = {
      is_shop: true,
      display_name: owner_name || existing.display_name,
      shop_name,
      shop_bio: enrichedBio,
      shop_areas: shopAreas,
      subscription_tier: subscription_tier || 'free',
      subscription_expires_at,
      verified_shop: false,
    };
    // Generate a profile_slug if the existing profile doesn't have one
    if (!existing.profile_slug) {
      const slugBase = shop_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
      promotePayload.profile_slug = `${slugBase}-${Math.random().toString(16).slice(2, 6)}`;
    }
    if (hashedPin) promotePayload.shop_pin = hashedPin;

    const { data, error } = await supabase
      .from('seller_profiles')
      .update(promotePayload)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    void sendShopWelcomeWA(data, 'promoted');
    void notifyAdminNewShop(data, 'promoted', { owner_name, id_type, id_number, email, mpesa_ref, admin_notes });
    return NextResponse.json({ shop: data, action: 'promoted' });
  }

  // Create new seller profile as shop
  const slugBase = shop_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const profile_slug = `${slugBase}-${Math.random().toString(16).slice(2, 6)}`;

  const insertPayload: Record<string, unknown> = {
    phone: normalizedPhone,
    display_name: owner_name || shop_name,
    profile_slug,
    neighbourhood: neighbourhood || null,
    is_shop: true,
    shop_name,
    shop_bio: enrichedBio,
    shop_areas: shopAreas,
    subscription_tier: subscription_tier || 'free',
    subscription_expires_at,
    verified_shop: false,
    total_sold: 0,
  };
  if (hashedPin) insertPayload.shop_pin = hashedPin;

  const { data, error } = await supabase
    .from('seller_profiles')
    .insert(insertPayload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  void sendShopWelcomeWA(data, 'created');
  void notifyAdminNewShop(data, 'created', { owner_name, id_type, id_number, email, mpesa_ref, admin_notes });
  return NextResponse.json({ shop: data, action: 'created' });
}

// ── ntfy admin alert on new shop ─────────────────────────────────────────────
async function notifyAdminNewShop(
  shop: { phone: string; shop_name: string; profile_slug: string; neighbourhood?: string | null; subscription_tier: string },
  action: 'created' | 'promoted',
  kyc?: { owner_name?: string; id_type?: string; id_number?: string; email?: string; mpesa_ref?: string; admin_notes?: string }
) {
  const channel = process.env.ADMIN_NOTIFY_CHANNEL;
  if (!channel) return;
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';
  const shopUrl = `${appUrl}/sellers/${shop.profile_slug}`;
  const label   = action === 'promoted' ? 'Seller promoted to shop' : 'New shop onboarded';
  const kycLine = kyc?.owner_name ? `Owner: ${kyc.owner_name}` + (kyc.id_number ? ` | ID: ${kyc.id_number}` : '') : '';
  const lines = [
    `${shop.shop_name} | ${shop.subscription_tier} plan`,
    `Phone: ${shop.phone}${shop.neighbourhood ? ` | ${shop.neighbourhood}` : ''}`,
    kycLine,
    kyc?.email ? `Email: ${kyc.email}` : '',
    kyc?.mpesa_ref ? `M-Pesa: ${kyc.mpesa_ref}` : '',
    kyc?.admin_notes ? `Notes: ${kyc.admin_notes}` : '',
  ].filter(Boolean).join('\n');
  fetch(`https://ntfy.sh/${channel}`, {
    method: 'POST',
    headers: {
      'Title': label,
      'Priority': 'default',
      'Tags': 'shopping',
      'Content-Type': 'text/plain',
      'Actions': `view, View shop, ${shopUrl}; view, Admin, ${appUrl}/admin`,
    },
    body: lines,
  }).catch(() => {});
}

// ── WhatsApp welcome message to new shop owner ────────────────────────────────
async function sendShopWelcomeWA(
  shop: { phone: string; shop_name: string; profile_slug: string; subscription_tier: string },
  action: 'created' | 'promoted'
) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    if (!accountSid || !authToken || !fromNumber) return;

    const appUrl  = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';
    const shopUrl = `${appUrl}/sellers/${shop.profile_slug}`;
    const tierLabel = shop.subscription_tier === 'pro'
      ? 'Pro'
      : shop.subscription_tier === 'starter'
      ? 'Starter'
      : 'Free';

    const intro = action === 'promoted'
      ? `Hi! Your seller account has been upgraded to a MyTinyverse Shop.`
      : `Hi! Welcome to MyTinyverse -- your shop is now live.`;

    const waBody =
      `${intro}\n\n` +
      `Shop name: ${shop.shop_name}\n` +
      `Plan: ${tierLabel}\n` +
      `Your shop page: ${shopUrl}\n\n` +
      `Start listing your items and share your shop link with customers. ` +
      `Reply to this message if you need any help.\n\n` +
      `-- MyTinyverse Team`;

    const params = new URLSearchParams({
      To:   `whatsapp:+${shop.phone}`,
      From: fromNumber,
      Body: waBody,
    });

    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: params.toString(),
      }
    );
  } catch {
    // Non-critical -- never block the response
  }
}
