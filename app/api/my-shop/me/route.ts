export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { getSessionFromCookieHeader } from '@/lib/shop-auth';

// GET /api/my-shop/me
// Returns the authenticated shop's profile + live listing stats
export async function GET(req: NextRequest) {
  const session = getSessionFromCookieHeader(req.headers.get('cookie'));
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: shopRaw, error } = await supabase
    .from('seller_profiles')
    .select(
      'id, phone, display_name, profile_slug, neighbourhood, avatar_url, ' +
      'shop_name, shop_bio, shop_banner_url, shop_areas, is_shop, ' +
      'verified_shop, subscription_tier, subscription_expires_at, total_sold, created_at'
    )
    .eq('id', session.shop_id)
    .eq('is_shop', true)
    .single();

  if (error || !shopRaw) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shop = shopRaw as any;

  // Live listing count
  const now = new Date().toISOString();
  const { count: liveCount } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('seller_phone', shop.phone)
    .eq('status', 'live')
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  const { count: totalCount } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('seller_phone', shop.phone);

  return NextResponse.json({
    shop: {
      ...shop,
      live_listings: liveCount ?? 0,
      total_listings: totalCount ?? 0,
    },
  });
}
