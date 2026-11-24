export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { getSessionFromCookieHeader } from '@/lib/shop-auth';

// GET /api/my-shop/listings?status=live|sold|all&page=0
export async function GET(req: NextRequest) {
  const session = getSessionFromCookieHeader(req.headers.get('cookie'));
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const supabase = createAdminClient();

  // Verify phone ownership
  const { data: shop } = await supabase
    .from('seller_profiles')
    .select('phone')
    .eq('id', session.shop_id)
    .eq('is_shop', true)
    .single();
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

  const url      = new URL(req.url);
  const status   = url.searchParams.get('status') || 'all';
  const page     = parseInt(url.searchParams.get('page') || '0', 10);
  const pageSize = 20;

  let query = supabase
    .from('listings')
    .select('id, title, price, category, condition, images, status, location, view_count, whatsapp_clicks, created_at, expires_at, fee_tier')
    .eq('seller_phone', shop.phone)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (status !== 'all') {
    query = query.eq('status', status);
  } else {
    // Exclude hard-deleted
    query = query.neq('status', 'deleted');
  }

  const { data: listings, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ listings: listings ?? [], page, hasMore: (listings?.length ?? 0) === pageSize });
}
