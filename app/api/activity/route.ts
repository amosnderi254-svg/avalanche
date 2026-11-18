export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/activity — returns recent live listings + marketplace stats for the activity rail
export async function GET() {
  try {
    const supabase = createServerClient();

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [listingsRes, liveCountRes, soldCountRes, recentCountRes] = await Promise.all([
      supabase
        .from('listings')
        .select('id, title, price, category, location, images, created_at')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'live'),
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'sold'),
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'live')
        .gte('created_at', yesterday),
    ]);

    return NextResponse.json({
      listings: listingsRes.data ?? [],
      stats: {
        live_count:   liveCountRes.count  ?? 0,
        sold_count:   soldCountRes.count  ?? 0,
        recent_count: recentCountRes.count ?? 0,
      },
    });
  } catch (err) {
    console.error('[activity]', err);
    return NextResponse.json({ listings: [], stats: { live_count: 0, sold_count: 0, recent_count: 0 } });
  }
}
