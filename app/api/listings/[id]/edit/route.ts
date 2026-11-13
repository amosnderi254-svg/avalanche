export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/listings/[id]/edit?token=XXX -- verify edit token, return listing for editing
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing edit token' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .eq('edit_token', token)
    .in('status', ['pending', 'live'])
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Listing not found or token invalid' },
      { status: 404 }
    );
  }

  // Strip edit_token from response before returning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { edit_token, ...safeData } = data;
  return NextResponse.json(safeData);
}

// PATCH /api/listings/[id]/edit?token=XXX -- update listing (seller edit, pending only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing edit token' }, { status: 400 });
  }

  const body = await req.json();

  // Only allow these fields to be edited by seller
  const allowed = [
    'title', 'price', 'category', 'condition', 'description',
    'location', 'seller_name', 'seller_phone', 'seller_whatsapp',
    'seller_email', 'images',
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', params.id)
    .eq('edit_token', token)              // must present correct token
    .in('status', ['pending', 'live'])    // can edit pending or live listings
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Listing not found or token invalid' },
      { status: 404 }
    );
  }

  // Strip sensitive fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { edit_token, ...safeData } = data;
  return NextResponse.json(safeData);
}
