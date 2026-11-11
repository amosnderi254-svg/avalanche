import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/listings/[id]
// Pass ?notrack=1 to skip view count increment (used by /status/[id] page)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Increment view count fire-and-forget -- skip when notrack param present
    // (status page, edit page, admin checks -- not a real buyer view)
    const notrack = new URL(req.url).searchParams.get('notrack');
    if (!notrack) {
     void supabase.rpc('increment_views', { listing_id: params.id });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/listings/[id] -- update mpesa_code on a PENDING listing only
// Only allows fields that a seller legitimately sets post-submission.
// Scoped to status='pending' so live listings cannot be tampered with.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const supabase = createServerClient();

    // Only allow updating these fields, and only on pending listings
    const allowed = ['mpesa_code', 'description', 'images'] as const;
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    // Guard: only touch listings that are still pending (not yet approved/rejected)
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', params.id)
      .eq('status', 'pending')   // ← prevents tampering with live listings
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Listing not found or already reviewed' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
