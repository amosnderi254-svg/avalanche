export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/public/top-sellers
// Public — no auth. Returns top 6 shops by total_sold for homepage trust row.
export async function GET() {
  const supabase = createServerClient();

  // 1. Fetch top shops ordered by total_sold — now includes shop_banner_url
  const { data: shops, error } = await supabase
    .from('seller_profiles')
    .select(
      'id, shop_name, profile_slug, avatar_url, shop_banner_url, ' +
      'verified_shop, total_sold, neighbourhood, phone'
    )
    .eq('is_shop', true)
    .order('total_sold', { ascending: false })
    .limit(10);

  if (error || !shops?.length) {
    return NextResponse.json(
      { sellers: [] },
      { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120' } }
    );
  }

  // 2. Batch-fetch live listings + category for primary_category computation
  const phones = shops.map(s => s.phone).filter(Boolean) as string[];
  const now = new Date().toISOString();

  const { data: liveListings } = await supabase
    .from('listings')
    .select('seller_phone, category')
    .in('seller_phone', phones)
    .eq('status', 'live')
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  // Count live listings and tally categories in a single pass
  const liveCount: Record<string, number> = {};
  const catCount: Record<string, Record<string, number>> = {};

  for (const row of liveListings ?? []) {
    const p = row.seller_phone as string;
    const cat = (row.category as string) ?? 'other';
    liveCount[p] = (liveCount[p] ?? 0) + 1;
    if (!catCount[p]) catCount[p] = {};
    catCount[p][cat] = (catCount[p][cat] ?? 0) + 1;
  }

  function primaryCat(phone: string): string {
    const cats = catCount[phone] ?? {};
    const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? 'other';
  }

  // 3. Build + filter — only show shops with ≥1 sale or ≥1 live listing
  const sellers = shops
    .map(shop => ({
      id:               shop.id,
      shop_name:        shop.shop_name,
      profile_slug:     shop.profile_slug,
      avatar_url:       shop.avatar_url       ?? null,
      shop_banner_url:  shop.shop_banner_url  ?? null,
      verified:         shop.verified_shop    ?? false,
      total_sold:       shop.total_sold       ?? 0,
      live_listings:    liveCount[shop.phone] ?? 0,
      neighbourhood:    shop.neighbourhood    ?? null,
      primary_category: primaryCat(shop.phone),
    }))
    .filter(s => s.profile_slug && (s.total_sold > 0 || s.live_listings > 0))
    .slice(0, 6);

  return NextResponse.json(
    { sellers },
    { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120' } }
  );
}
