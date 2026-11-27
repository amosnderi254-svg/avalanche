import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET /api/public/recently-sold
// Returns the last 10 sold listings for the homepage ticker.
// Public endpoint — no auth required.
export async function GET() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('listings')
      .select('id, title, price, category, location, updated_at')
      .eq('status', 'sold')
      .order('updated_at', { ascending: false })
      .limit(12);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(
      { items: data ?? [] },
      {
        headers: {
          // Cache for 5 minutes in CDN, allow stale for 60 s while revalidating
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
