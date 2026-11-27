export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/public/seller-earnings?period=month|all&category=all|bikes|strollers|...
// Public — no auth. Returns aggregated earnings for social proof.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period   = searchParams.get('period') ?? 'month';
  const category = searchParams.get('category') ?? 'all';

  const supabase = createServerClient();

  // Date boundary
  let since: string | null = null;
  if (period === 'month') {
    const now = new Date();
    since = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  } else if (period === 'week') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    since = d.toISOString();
  }
  // period === 'all' → no date filter

  // Build query — SUM price + COUNT per category
  // We use updated_at as a proxy for sold_at (listings are updated when status → sold)
  let q = supabase
    .from('listings')
    .select('category, price')
    .eq('status', 'sold');

  if (since) {
    q = q.gte('updated_at', since);
  }
  if (category !== 'all') {
    q = q.eq('category', category);
  }

  const { data, error } = await q;

  if (error) {
    return NextResponse.json({ total: 0, count: 0, by_category: {} }, { status: 200 });
  }

  const rows = (data ?? []) as { category: string; price: number }[];

  // Aggregate
  const byCategory: Record<string, { total: number; count: number }> = {};
  let grandTotal = 0;
  let grandCount = 0;

  for (const row of rows) {
    const cat = row.category ?? 'other';
    const price = row.price ?? 0;
    if (!byCategory[cat]) byCategory[cat] = { total: 0, count: 0 };
    byCategory[cat].total += price;
    byCategory[cat].count += 1;
    grandTotal += price;
    grandCount += 1;
  }

  // Period label
  const now = new Date();
  const periodLabel = period === 'month'
    ? now.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
    : period === 'week'
    ? 'Last 7 days'
    : 'All time';

  return NextResponse.json(
    {
      total: grandTotal,
      count: grandCount,
      period,
      period_label: periodLabel,
      by_category: Object.fromEntries(
        Object.entries(byCategory)
          .sort((a, b) => b[1].total - a[1].total)
          .map(([k, v]) => [k, v])
      ),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    }
  );
}
