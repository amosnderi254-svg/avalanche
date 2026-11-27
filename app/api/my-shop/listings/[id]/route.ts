export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { getSessionFromCookieHeader } from '@/lib/shop-auth';

type Ctx = { params: { id: string } };

// PATCH /api/my-shop/listings/[id]
// Allows shop owners to edit their own listings
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = getSessionFromCookieHeader(req.headers.get('cookie'));
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const supabase = createAdminClient();

  // Verify ownership via seller_phone
  const { data: shop } = await supabase
    .from('seller_profiles')
    .select('phone')
    .eq('id', session.shop_id)
    .eq('is_shop', true)
    .single();
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

  // Verify this listing belongs to this shop
  const { data: existing } = await supabase
    .from('listings')
    .select('id, status')
    .eq('id', params.id)
    .eq('seller_phone', shop.phone)
    .single();
  if (!existing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  // Whitelist editable fields
  const ALLOWED = ['title', 'price', 'condition', 'description', 'status'] as const;
  const STATUS_ALLOWED = ['sold', 'archived'] as const;

  const patch: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) patch[key] = body[key];
  }

  // Validate status transitions (shop owners can only mark sold or archive)
  if ('status' in patch) {
    if (!(STATUS_ALLOWED as readonly string[]).includes(patch.status as string)) {
      return NextResponse.json(
        { error: `Status must be one of: ${STATUS_ALLOWED.join(', ')}` },
        { status: 400 }
      );
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  // Validate price
  if ('price' in patch) {
    const p = Number(patch.price);
    if (isNaN(p) || p < 0 || p > 10_000_000) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }
    patch.price = Math.round(p);
  }

  // Validate title
  if ('title' in patch) {
    const t = String(patch.title).trim();
    if (t.length < 3 || t.length > 100) {
      return NextResponse.json({ error: 'Title must be 3-100 characters' }, { status: 400 });
    }
    patch.title = t;
  }

  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('listings')
    .update(patch)
    .eq('id', params.id)
    .eq('seller_phone', shop.phone)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If marked sold, bump total_sold on seller_profiles
  if (patch.status === 'sold') {
    await supabase.rpc('increment_total_sold', { seller_phone_input: shop.phone }).then(undefined, () => {});
  }

  return NextResponse.json({ listing: data });
}

// DELETE /api/my-shop/listings/[id]
// Soft-deletes a listing (archives it)
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = getSessionFromCookieHeader(req.headers.get('cookie'));
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const supabase = createAdminClient();

  const { data: shop } = await supabase
    .from('seller_profiles')
    .select('phone')
    .eq('id', session.shop_id)
    .eq('is_shop', true)
    .single();
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('listings')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('seller_phone', shop.phone)
    .select('id')
    .single();

  if (error || !data) return NextResponse.json({ error: 'Listing not found or already removed' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
