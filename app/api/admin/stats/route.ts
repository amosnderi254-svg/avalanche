import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';


// GET /api/admin/stats
// Requires admin PIN in Authorization header: Bearer <PIN>
// Returns all aggregated dashboard data in one call to minimize round trips.
export async function GET(req: Request) {
  // -- Auth guard --
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const now = new Date().toISOString();
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Run all queries in parallel
  const [
    totalCountsResult,
    recentSubmissionsResult,
    categoryStatsResult,
    revenueTiersResult,
    expiringResult,
    topSearchesResult,
    zeroSearchesResult,
  ] = await Promise.allSettled([

    // 1. Status counts + total revenue
    supabase
      .from('listings')
      .select('status, fee_amount, fee_tier, created_at, views, whatsapp_clicks')
      .order('created_at', { ascending: false }),

    // 2. Recent 20 pending submissions for moderation queue
    supabase
      .from('listings')
      .select('id, title, price, category, condition, location, seller_name, seller_phone, fee_tier, fee_amount, mpesa_code, images, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20),

    // 3. Category performance: live listings with engagement metrics
    supabase
      .from('listings')
      .select('category, status, views, whatsapp_clicks, price')
      .eq('status', 'live'),

    // 4. Revenue tiers breakdown (live + all historical)
    supabase
      .from('listings')
      .select('fee_tier, fee_amount, status, created_at'),

    // 5. Expiring in next 7 days (live listings only)
    supabase
      .from('listings')
      .select('id, title, price, category, seller_name, expires_at, views, whatsapp_clicks')
      .eq('status', 'live')
      .not('expires_at', 'is', null)
      .gt('expires_at', now)
      .lte('expires_at', sevenDaysFromNow)
      .order('expires_at', { ascending: true })
      .limit(20),

    // 6. Top search queries (last 30 days, grouped)
    supabase
      .from('search_events')
      .select('query, result_count, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(500),

    // 7. Zero-result searches (demand gaps)
    supabase
      .from('search_events')
      .select('query, created_at')
      .eq('result_count', 0)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  // -- Process status tiles --
  const allListings = totalCountsResult.status === 'fulfilled' && !totalCountsResult.value.error
    ? (totalCountsResult.value.data || [])
    : [];

  const liveCount = allListings.filter(l => l.status === 'live').length;
  const pendingCount = allListings.filter(l => l.status === 'pending').length;
  const rejectedCount = allListings.filter(l => l.status === 'rejected').length;
  const totalCount = allListings.length;

  // Revenue: sum of fee_amount for ALL historical listings (not just live)
  // so admin sees total collected, not just currently live
  const totalRevenue = allListings.reduce((sum, l) => sum + (Number(l.fee_amount) || 0), 0);

  // Approval rate (live / (live + rejected), ignoring pending)
  const reviewed = liveCount + rejectedCount;
  const approvalRate = reviewed > 0 ? Math.round((liveCount / reviewed) * 100) : 0;

  // Listing funnel: submitted -> has mpesa -> live (simplified via status)
  const submittedLast30Days = allListings.filter(l =>
    new Date(l.created_at) >= new Date(thirtyDaysAgo)
  ).length;

  // Total engagement on live listings
  const totalViews = allListings
    .filter(l => l.status === 'live')
    .reduce((sum, l) => sum + (Number(l.views) || 0), 0);
  const totalWaClicks = allListings
    .filter(l => l.status === 'live')
    .reduce((sum, l) => sum + (Number(l.whatsapp_clicks) || 0), 0);

  // -- Revenue by month (last 6 months) --
  const revenueByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    revenueByMonth[key] = 0;
  }
  allListings.forEach(l => {
    const key = l.created_at.slice(0, 7); // YYYY-MM
    if (revenueByMonth[key] !== undefined) {
      revenueByMonth[key] += Number(l.fee_amount) || 0;
    }
  });

  // -- Revenue by tier --
  const tierData = revenueTiersResult.status === 'fulfilled' && !revenueTiersResult.value.error
    ? (revenueTiersResult.value.data || [])
    : [];
  const revenueByTier = tierData.reduce((acc, l) => {
    const tier = l.fee_tier || 'donation';
    acc[tier] = (acc[tier] || 0) + (Number(l.fee_amount) || 0);
    return acc;
  }, {} as Record<string, number>);

  // -- Category performance --
  const catData = categoryStatsResult.status === 'fulfilled' && !categoryStatsResult.value.error
    ? (categoryStatsResult.value.data || [])
    : [];
  const categoryMap: Record<string, {
    live: number; views: number; whatsapp_clicks: number;
    total_price: number; count_with_price: number;
  }> = {};
  catData.forEach(l => {
    if (!categoryMap[l.category]) {
      categoryMap[l.category] = { live: 0, views: 0, whatsapp_clicks: 0, total_price: 0, count_with_price: 0 };
    }
    categoryMap[l.category].live++;
    categoryMap[l.category].views += Number(l.views) || 0;
    categoryMap[l.category].whatsapp_clicks += Number(l.whatsapp_clicks) || 0;
    if (l.price > 0) {
      categoryMap[l.category].total_price += Number(l.price) || 0;
      categoryMap[l.category].count_with_price++;
    }
  });
  const categoryStats = Object.entries(categoryMap)
    .map(([category, stats]) => ({
      category,
      live: stats.live,
      views: stats.views,
      whatsapp_clicks: stats.whatsapp_clicks,
      click_rate: stats.views > 0 ? Math.round((stats.whatsapp_clicks / stats.views) * 100) : 0,
      avg_price: stats.count_with_price > 0
        ? Math.round(stats.total_price / stats.count_with_price)
        : 0,
    }))
    .sort((a, b) => b.views - a.views);

  // -- Top searches (aggregate counts) --
  const rawSearches = topSearchesResult.status === 'fulfilled' && !topSearchesResult.value.error
    ? (topSearchesResult.value.data || [])
    : [];
  const searchCounts: Record<string, number> = {};
  rawSearches.forEach(s => {
    const q = s.query.toLowerCase().trim();
    searchCounts[q] = (searchCounts[q] || 0) + 1;
  });
  const topSearches = Object.entries(searchCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  // -- Zero-result searches (demand gaps) --
  const rawZero = zeroSearchesResult.status === 'fulfilled' && !zeroSearchesResult.value.error
    ? (zeroSearchesResult.value.data || [])
    : [];
  const zeroCounts: Record<string, number> = {};
  rawZero.forEach(s => {
    const q = s.query.toLowerCase().trim();
    zeroCounts[q] = (zeroCounts[q] || 0) + 1;
  });
  const demandGaps = Object.entries(zeroCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  return NextResponse.json({
    tiles: {
      live_listings: liveCount,
      pending_review: pendingCount,
      total_listings: totalCount,
      total_revenue: totalRevenue,
      approval_rate: approvalRate,
      total_views: totalViews,
      total_wa_clicks: totalWaClicks,
      submitted_last_30d: submittedLast30Days,
    },
    revenue_by_month: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
    revenue_by_tier: Object.entries(revenueByTier).map(([tier, revenue]) => ({ tier, revenue })),
    category_stats: categoryStats,
    expiring_soon: expiringResult.status === 'fulfilled' && !expiringResult.value.error
      ? expiringResult.value.data || []
      : [],
    recent_pending: recentSubmissionsResult.status === 'fulfilled' && !recentSubmissionsResult.value.error
      ? recentSubmissionsResult.value.data || []
      : [],
    top_searches: topSearches,
    demand_gaps: demandGaps,
  });
}
