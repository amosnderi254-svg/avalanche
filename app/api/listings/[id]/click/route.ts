export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// POST /api/listings/[id]/click
// Called fire-and-forget from ListingCard when buyer taps the WhatsApp CTA.
// No auth required -- public endpoint. Increments whatsapp_clicks on the listing.
// Only increments on LIVE listings to avoid polluting stats with test clicks.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    await supabase.rpc('increment_whatsapp_clicks', { listing_id: params.id });
    return NextResponse.json({ ok: true });
  } catch {
    // Silently succeed -- this is analytics, never block the buyer
    return NextResponse.json({ ok: true });
  }
}
