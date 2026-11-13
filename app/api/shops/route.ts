export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

// ── GET /api/shops?area=&limit= ───────────────────────────────────────────────
// Returns verified/active shops with live listing counts
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const area  = searchParams.get('area')  || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  const supabase = createAdminClient();

  let query = supabase
    .from('seller_profiles')
    .select('id, phone, display_name, profile_slug, neighbourhood, avatar_url, shop_name, shop_bio, shop_banner_url, shop_areas, verified_shop, subscription_tier, created_at')
    .eq('is_shop', true)
    .order('verified_shop', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (area) {
    // Filter by neighbourhood OR shop_areas contains the area
    query = query.or(`neighbourhood.ilike.%${area}%,shop_areas.cs.{${area}}`);
  }

  const { data: shops, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!shops || shops.length === 0) {
    return NextResponse.json({ shops: [] });
  }

  // Fetch live listing counts for each shop in one query
  const phones = shops.map(s => s.phone);
  const now = new Date().toISOString();
  const { data: listingRows } = await supabase
    .from('listings')
    .select('seller_phone')
    .in('seller_phone', phones)
    .eq('status', 'live')
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  // Count per phone
  const countMap: Record<string, number> = {};
  for (const row of listingRows ?? []) {
    countMap[row.seller_phone] = (countMap[row.seller_phone] || 0) + 1;
  }

  const result = shops.map(s => ({
    ...s,
    listing_count: countMap[s.phone] || 0,
  }));

  return NextResponse.json({ shops: result });
}
