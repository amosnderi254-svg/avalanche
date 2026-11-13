export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerClient } from '@/lib/supabase-server';

// ── GET /api/sellers/[identifier] ─────────────────────────────────────────
// identifier can be:
//   - a profile_slug  (e.g. "grace-wambua-westlands")
//   - a phone number  (e.g. "254712345678" or "0712345678")
// Returns: { profile, listings, listingCount }
// ─────────────────────────────────────────────────────────────────────────

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0'))   return '254' + digits.slice(1);
  return digits;
}

function looksLikePhone(identifier: string): boolean {
  const digits = identifier.replace(/\D/g, '');
  return digits.length >= 9 && /^\d+$/.test(identifier.replace(/[+\-\s]/g, ''));
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { identifier: string } },
) {
  const { identifier } = params;
  if (!identifier) return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });

  const supabase = createAdminClient();

  // Try to find the profile
  let profileQuery;
  const SHOP_SELECT = 'id, phone, display_name, bio, neighbourhood, avatar_url, profile_slug, total_sold, created_at, is_shop, shop_name, shop_bio, shop_banner_url, shop_areas, subscription_tier, subscription_expires_at, verified_shop';
  if (looksLikePhone(identifier)) {
    const phone = normalizePhone(identifier);
    profileQuery = supabase
      .from('seller_profiles')
      .select(SHOP_SELECT)
      .eq('phone', phone)
      .single();
  } else {
    profileQuery = supabase
      .from('seller_profiles')
      .select(SHOP_SELECT)
      .eq('profile_slug', identifier)
      .single();
  }

  const { data: profile, error: profileErr } = await profileQuery;
  if (profileErr || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Fetch the seller's active listings (max 12)
  const now = new Date().toISOString();
  const anonClient = createServerClient();
  const { data: listings, count } = await anonClient
    .from('listings')
    .select('id, title, price, category, condition, images, location, created_at', { count: 'exact' })
    .eq('seller_phone', profile.phone)
    .eq('status', 'live')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false })
    .limit(12);

  return NextResponse.json({
    profile,
    listings: listings ?? [],
    listingCount: count ?? 0,
  });
}

// ── PATCH /api/sellers/[identifier] -- edit profile (token-auth) ──────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { identifier: string } },
) {
  const { identifier } = params;
  const { edit_token, display_name, bio, neighbourhood, avatar_url } = await req.json();

  if (!edit_token) return NextResponse.json({ error: 'edit_token required' }, { status: 401 });

  const supabase = createAdminClient();

  // Verify edit_token against the profile
  const { data: profile, error: fetchErr } = await supabase
    .from('seller_profiles')
    .select('id, phone, display_name, neighbourhood, profile_slug, edit_token')
    .eq('profile_slug', identifier)
    .single();

  if (fetchErr || !profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  if (profile.edit_token !== edit_token) return NextResponse.json({ error: 'Invalid edit token' }, { status: 403 });

  // Build updates
  const updates: Record<string, unknown> = {};
  if (display_name !== undefined) {
    const newName = display_name.trim();
    if (newName && newName !== profile.display_name) {
      updates.display_name = newName;
      // Regenerate slug based on new name + neighbourhood
      const hood = neighbourhood?.trim() || profile.neighbourhood || 'nairobi';
      const base = `${newName}-${hood}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);

      // Check slug collision (excluding self)
      const { data: existing } = await supabase
        .from('seller_profiles')
        .select('profile_slug')
        .eq('profile_slug', base)
        .neq('phone', profile.phone)
        .single();

      updates.profile_slug = existing
        ? `${base}-${Math.random().toString(16).slice(2, 6)}`
        : base;
    }
  }
  if (bio !== undefined)           updates.bio           = bio?.trim().slice(0, 160) || null;
  if (neighbourhood !== undefined) updates.neighbourhood = neighbourhood?.trim() || null;
  if (avatar_url !== undefined)    updates.avatar_url    = avatar_url || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, profile_slug: profile.profile_slug });
  }

  const { data: updated, error: updateErr } = await supabase
    .from('seller_profiles')
    .update(updates)
    .eq('phone', profile.phone)
    .select('id, display_name, bio, neighbourhood, avatar_url, profile_slug, total_sold, created_at, updated_at')
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
  return NextResponse.json(updated);
}
