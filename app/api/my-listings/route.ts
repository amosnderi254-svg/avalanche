export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/my-listings?phone=254712345678
// Returns all listings for a given seller phone number.
// Accepts both 07xxx and 2547xxx formats.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = (searchParams.get('phone') || '').trim().replace(/\s+/g, '');

    if (!phone || phone.length < 9) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    // Normalise to both formats so we match whatever was stored at listing time
    const withCountry = phone.startsWith('0')
      ? '254' + phone.slice(1)
      : phone.startsWith('+254')
        ? phone.slice(1)   // strip leading +
        : phone;
    const withZero = withCountry.startsWith('254')
      ? '0' + withCountry.slice(3)
      : phone;

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, price, status, category, location, images, created_at, condition')
      .or(`seller_phone.eq.${withCountry},seller_phone.eq.${withZero}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ listings: data ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch listings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
