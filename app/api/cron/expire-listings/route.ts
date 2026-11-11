import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/cron/expire-listings
// Called by Vercel Cron daily at 2am -- marks expired live listings as rejected.
// Vercel sends Authorization: Bearer <CRON_SECRET> header on production.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = createServerClient();
  const now = new Date().toISOString();

  // Find all live listings whose expires_at has passed
  const { data: expired, error: findError } = await supabase
    .from('listings')
    .select('id, title')
    .eq('status', 'live')
    .not('expires_at', 'is', null)
    .lt('expires_at', now);

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ ok: true, expired: 0, message: 'No expired listings found' });
  }

  const ids = expired.map(l => l.id);

  // Update all expired listings to rejected
  const { error: updateError } = await supabase
    .from('listings')
    .update({ status: 'rejected' })
    .in('id', ids);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  console.log(`[cron] Expired ${ids.length} listing(s):`, ids);

  return NextResponse.json({
    ok: true,
    expired: ids.length,
    listings: expired.map(l => l.title),
  });
}
