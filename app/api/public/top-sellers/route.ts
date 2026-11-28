export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/public/top-sellers
// Public — no auth. Returns top 6 shops by total_sold for homepage trust row.
export async function GET() {
  const supabase = createServerClient();

  // 1. Fetch top shops ordered by total_sold
  const { data: shops, error } = await supabase
    .from('seller_profiles')
    .select('id, shop_name, profile_slug, avatar_url, verified_shop, total_sold, neighbourhood, phone')
    .eq('is_shop', true)
    .order('total_sold', { ascending: false })
    .limit(10);

  if (error || !shops?.length) {
    return NextResponse.json(
      { sellers: [] },
      { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120' } }
    );
  }

  // 2. Batch-fetch live listing counts for those shops
  const phones = shops.map(s => s.phone).filter(Boolean) as string[];
  const now = new Date().toISOString();

  const { data: liveListings } = await supabase
    .from('listings')
    .select('seller_phone')
    .in('seller_phone', phones)
    .eq('status', 'live')
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  const liveCount: Record<string, number> = {};
  for (const row of liveListings ?? []) {
    const p = row.seller_phone as string;
    liveCount[p] = (liveCount[p] ?? 0) + 1;
  }

  // 3. Build + filter — only show shops with ≥1 sale or ≥1 live listing
  const sellers = shops
    .map(shop => ({
      id:            shop.id,
      shop_name:     shop.shop_name,
      profile_slug:  shop.profile_slug,
      avatar_url:    shop.avatar_url ?? null,
      verified:      shop.verified_shop ?? false,
      total_sold:    shop.total_sold  ?? 0,
      live_listings: liveCount[shop.phone] ?? 0,
      neighbourhood: shop.neighbourhood ?? null,
    }))
    .filter(s => s.profile_slug && (s.total_sold > 0 || s.live_listings > 0))
    .slice(0, 6);

  return NextResponse.json(
    { sellers },
    { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120' } }
  );
}
