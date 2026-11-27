export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/public/demand
// Public. Returns top search queries + zero-result queries (demand gaps).
// Aggregated from search_events, last 30 days.
export async function GET() {
  const supabase = createServerClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [topResult, gapsResult] = await Promise.all([
    supabase
      .from('search_events')
      .select('query, result_count')
      .gte('created_at', thirtyDaysAgo)
      .gt('result_count', 0)
      .limit(500),

    supabase
      .from('search_events')
      .select('query')
      .gte('created_at', thirtyDaysAgo)
      .eq('result_count', 0)
      .limit(300),
  ]);

  // Aggregate trending searches
  const searchCounts: Record<string, number> = {};
  for (const row of topResult.data ?? []) {
    const q = (row.query ?? '').toLowerCase().trim();
    if (q.length < 2) continue;
    searchCounts[q] = (searchCounts[q] ?? 0) + 1;
  }
  const topSearches = Object.entries(searchCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([query, count]) => ({ query, count }));

  // Aggregate demand gaps (zero-result searches)
  const gapCounts: Record<string, number> = {};
  for (const row of gapsResult.data ?? []) {
    const q = (row.query ?? '').toLowerCase().trim();
    if (q.length < 2) continue;
    gapCounts[q] = (gapCounts[q] ?? 0) + 1;
  }
  // Filter out queries that DO have results (edge case: same term had 0 results earlier)
  const knownTerms = new Set(Object.keys(searchCounts));
  const demandGaps = Object.entries(gapCounts)
    .filter(([q]) => !knownTerms.has(q))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  return NextResponse.json(
    {
      top_searches: topSearches,
      demand_gaps: demandGaps,
      updated_at: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    }
  );
}
