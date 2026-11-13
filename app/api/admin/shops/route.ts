export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

const ADMIN_PIN = process.env.ADMIN_PIN || '0784';

function auth(req: NextRequest): boolean {
  return req.headers.get('x-admin-pin') === ADMIN_PIN;
}

// ── GET /api/admin/shops  -- list all shops ───────────────────────────────────
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: shops, error } = await supabase
    .from('seller_profiles')
    .select('id, phone, display_name, profile_slug, neighbourhood, avatar_url, shop_name, shop_bio, shop_banner_url, shop_areas, is_shop, verified_shop, subscription_tier, subscription_expires_at, created_at')
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
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { phone, shop_name, shop_bio, neighbourhood, subscription_tier } = body;

  if (!phone || !shop_name) {
    return NextResponse.json({ error: 'phone and shop_name required' }, { status: 400 });
  }

  const normalizedPhone = phone.replace(/\D/g, '').replace(/^0/, '254');
  const supabase = createAdminClient();

  // Check if seller profile exists
  const { data: existing } = await supabase
    .from('seller_profiles')
    .select('id, phone, display_name')
    .eq('phone', normalizedPhone)
    .single();

  if (existing) {
    // Promote existing profile to shop
    const { data, error } = await supabase
      .from('seller_profiles')
      .update({
        is_shop: true,
        shop_name,
        shop_bio: shop_bio || null,
        subscription_tier: subscription_tier || 'free',
        verified_shop: false,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    void sendShopWelcomeWA(data, 'promoted');
    void notifyAdminNewShop(data, 'promoted');
    return NextResponse.json({ shop: data, action: 'promoted' });
  }

  // Create new seller profile as shop
  const slugBase = shop_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const profile_slug = `${slugBase}-${Math.random().toString(16).slice(2, 6)}`;

  const { data, error } = await supabase
    .from('seller_profiles')
    .insert({
      phone: normalizedPhone,
      display_name: shop_name,
      profile_slug,
      neighbourhood: neighbourhood || null,
      is_shop: true,
      shop_name,
      shop_bio: shop_bio || null,
      subscription_tier: subscription_tier || 'free',
      verified_shop: false,
      total_sold: 0,
      shop_areas: [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  void sendShopWelcomeWA(data, 'created');
  void notifyAdminNewShop(data, 'created');
  return NextResponse.json({ shop: data, action: 'created' });
}

// ── ntfy admin alert on new shop ─────────────────────────────────────────────
async function notifyAdminNewShop(
  shop: { phone: string; shop_name: string; profile_slug: string; neighbourhood?: string | null; subscription_tier: string },
  action: 'created' | 'promoted'
) {
  const channel = process.env.ADMIN_NOTIFY_CHANNEL;
  if (!channel) return;
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';
  const shopUrl = `${appUrl}/sellers/${shop.profile_slug}`;
  const label   = action === 'promoted' ? 'Seller promoted to shop' : 'New shop onboarded';
  fetch(`https://ntfy.sh/${channel}`, {
    method: 'POST',
    headers: {
      'Title': label,
      'Priority': 'default',
      'Tags': 'shopping',
      'Content-Type': 'text/plain',
      'Actions': `view, View shop, ${shopUrl}; view, Admin, ${appUrl}/admin`,
    },
    body: `${shop.shop_name} | ${shop.subscription_tier} plan\nPhone: ${shop.phone}${shop.neighbourhood ? ` | ${shop.neighbourhood}` : ''}`,
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
