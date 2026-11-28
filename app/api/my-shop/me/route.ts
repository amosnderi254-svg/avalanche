export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { getSessionFromCookieHeader } from '@/lib/shop-auth';

// GET /api/my-shop/me
// Returns the authenticated shop's profile + rich stats for dashboard
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

  const now = new Date().toISOString();

  // Run all stat queries in parallel
  const [
    liveResult,
    totalResult,
    soldListings,
    allListings,
  ] = await Promise.all([
    // Live listing count
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('seller_phone', shop.phone)
      .eq('status', 'live')
      .or(`expires_at.is.null,expires_at.gt.${now}`),

    // Total listing count
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('seller_phone', shop.phone),

    // Sold listings — sum price for earnings
    supabase
      .from('listings')
      .select('price')
      .eq('seller_phone', shop.phone)
      .eq('status', 'sold'),

    // All listings — sum views + find best performer
    // Try view_count first (post-migration), fall through to views if column missing
    supabase
      .from('listings')
      .select('id, title, price, images, views, status, category, created_at')
      .eq('seller_phone', shop.phone)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  // Earnings: sum of prices of sold listings
  const soldRows = (soldListings.data ?? []) as { price: number }[];
  const totalEarned = soldRows.reduce((sum, r) => sum + (r.price ?? 0), 0);

  // Total views across all listings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allRows = (allListings.data ?? []) as any[];
  // Support both column names: 'view_count' (after migration) and 'views' (original schema)
  const totalViews = allRows.reduce((sum, r) => sum + (r.view_count ?? r.views ?? 0), 0);

  // Best performer: highest views listing (sort by whichever view column exists)
  const sortedByViews = [...allRows].sort(
    (a, b) => (b.view_count ?? b.views ?? 0) - (a.view_count ?? a.views ?? 0)
  );
  const bestListing = sortedByViews[0] ?? null;

  // Recent activity: last 6 listings by created_at
  const recentListings = [...allRows]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  // Conversion rate: sold / (sold + live + archived) if > 0
  const soldCount  = liveResult.count !== null ? (totalResult.count ?? 0) - (liveResult.count ?? 0) : (shop.total_sold ?? 0);
  const convRate   = (totalResult.count ?? 0) > 0
    ? Math.round(((shop.total_sold ?? 0) / (totalResult.count ?? 1)) * 100)
    : 0;

  // Average price of live listings
  const liveRows = allRows.filter(r => r.status === 'live');
  const avgPrice = liveRows.length > 0
    ? Math.round(liveRows.reduce((sum, r) => sum + (r.price ?? 0), 0) / liveRows.length)
    : 0;

  void soldCount;

  return NextResponse.json({
    shop: {
      ...shop,
      live_listings:    liveResult.count  ?? 0,
      total_listings:   totalResult.count ?? 0,
      total_earned:     totalEarned,
      total_views:      totalViews,
      conversion_rate:  convRate,
      avg_price:        avgPrice,
      best_listing:     bestListing,
      recent_listings:  recentListings,
    },
  });
}
