export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { getSessionFromCookieHeader } from '@/lib/shop-auth';

// PATCH /api/my-shop/profile
// Shop owners can update their public shop info
export async function PATCH(req: NextRequest) {
  const session = getSessionFromCookieHeader(req.headers.get('cookie'));
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  // Whitelist editable fields
  const ALLOWED = [
    'display_name', 'shop_name', 'shop_bio', 'neighbourhood', 'shop_areas',
  ] as const;

  const patch: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) patch[key] = body[key];
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  // Validate shop_name
  if ('shop_name' in patch) {
    const n = String(patch.shop_name).trim();
    if (n.length < 2 || n.length > 60) {
      return NextResponse.json({ error: 'Shop name must be 2-60 characters' }, { status: 400 });
    }
    patch.shop_name = n;
  }

  // Validate shop_bio
  if ('shop_bio' in patch && patch.shop_bio) {
    const b = String(patch.shop_bio).trim();
    if (b.length > 300) {
      return NextResponse.json({ error: 'Bio must be 300 characters or less' }, { status: 400 });
    }
    patch.shop_bio = b;
  }

  // Validate shop_areas
  if ('shop_areas' in patch) {
    if (!Array.isArray(patch.shop_areas)) {
      return NextResponse.json({ error: 'shop_areas must be an array' }, { status: 400 });
    }
    patch.shop_areas = (patch.shop_areas as unknown[]).slice(0, 10).map(a => String(a).trim()).filter(Boolean);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('seller_profiles')
    .update(patch)
    .eq('id', session.shop_id)
    .eq('is_shop', true)
    .select(
      'id, display_name, shop_name, shop_bio, neighbourhood, shop_areas, avatar_url, profile_slug, verified_shop, subscription_tier, subscription_expires_at'
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ shop: data });
}
