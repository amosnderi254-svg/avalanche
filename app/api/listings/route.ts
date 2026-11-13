export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase-server';

// GET /api/listings?category=bikes&q=trek&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const now = new Date().toISOString();

    const min  = searchParams.get('min');
    const max  = searchParams.get('max');
    const area = searchParams.get('area');
    const sort = searchParams.get('sort') || 'newest';

    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'live')
      // Exclude expired listings (expires_at is null for older rows = never expires)
      .or(`expires_at.is.null,expires_at.gt.${now}`);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (q) {
      query = query.ilike('title', `%${q}%`);
    }
    if (min !== null && min !== '') {
      query = query.gte('price', Number(min));
    }
    if (max !== null && max !== '') {
      query = query.lte('price', Number(max));
    }
    if (area) {
      query = query.ilike('location', `%${area}%`);
    }

    // Apply sort before pagination
    if (sort === 'price_asc')  query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else                       query = query.order('created_at', { ascending: false });

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    const hasMore = (from + (data?.length ?? 0)) < total;

    // Log search event fire-and-forget -- only when a text query is present
    // (category-only browsing is navigation, not a search intent signal)
    if (q && q.trim()) {
      void supabase.from('search_events').insert({
        query: q.trim().toLowerCase(),
        category: category || null,
        result_count: total,
      });
    }
    // Log filter-only browsing events (area or price filter with no keyword)
    if (!q && (min || max || area || sort !== 'newest') && total >= 0) {
      void supabase.from('search_events').insert({
        query: null,
        category: category || null,
        result_count: total,
      }).then(() => {});
    }

    return NextResponse.json({ listings: data, page, total, hasMore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch listings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/listings -- create a new listing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title, price, category, condition, description, location,
      seller_name, seller_phone, seller_whatsapp, seller_email,
      images = [], status = 'pending',
      fee_tier, fee_amount, mpesa_code,
    } = body;

    // Basic validation
    if (!title || !category || !condition || !location || !seller_name || !seller_phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('listings')
      .insert({
        title: title.trim(),
        price: Number(price) || 0,
        category,
        condition,
        description: description?.trim() || null,
        location,
        seller_name: seller_name.trim(),
        seller_phone: seller_phone.trim(),
        seller_whatsapp: seller_whatsapp?.trim() || null,
        seller_email: seller_email?.trim() || null,
        images: Array.isArray(images) ? images : [],
        status,
        fee_tier: fee_tier || null,
        fee_amount: Number(fee_amount) || 0,
        mpesa_code: mpesa_code || null,
        // edit_token and expires_at are set by DB defaults
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-create seller profile using admin client (fire-and-forget -- non-blocking)
    void (async () => {
      try {
        const rawPhone = (data.seller_phone || '').trim();
        const digits   = rawPhone.replace(/\D/g, '');
        const phone    = digits.startsWith('254') ? digits : digits.startsWith('0') ? '254' + digits.slice(1) : digits;
        const name     = (data.seller_name || '').trim();
        const hood     = (data.location || '').split(',')[0].trim().slice(0, 40) || 'Nairobi';

        if (!phone || !name) return;

        const admin = createAdminClient();

        // Skip if profile already exists for this phone
        const { data: existing } = await admin
          .from('seller_profiles')
          .select('id, profile_slug')
          .eq('phone', phone)
          .single();

        if (existing) return; // already has a profile

        // Build slug: name-neighbourhood
        const slugBase = `${name}-${hood}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60) || `seller-${Math.random().toString(36).slice(2,8)}`;

        // Ensure uniqueness
        let slug = slugBase;
        const { data: taken } = await admin
          .from('seller_profiles')
          .select('id')
          .eq('profile_slug', slug)
          .single();
        if (taken) slug = `${slugBase}-${Math.random().toString(16).slice(2, 6)}`;

        await admin.from('seller_profiles').insert({
          phone,
          display_name: name,
          neighbourhood: hood,
          profile_slug: slug,
        });
      } catch (profileErr) {
        // Non-critical -- log and continue
        console.error('[seller-profile] auto-create failed:', profileErr);
      }
    })();

    // Feature 1: Notify admin via ntfy.sh (fire-and-forget, never block the response)
    const notifyChannel = process.env.ADMIN_NOTIFY_CHANNEL;
    if (notifyChannel) {
      const priceLabel = data.price === 0 ? 'FREE (donation)' : `KES ${data.price.toLocaleString()}`;
      const feeLabel = data.fee_amount > 0 ? ` | Fee: KES ${data.fee_amount}` : ' | Free listing';
      fetch(`https://ntfy.sh/${notifyChannel}`, {
        method: 'POST',
        headers: {
          'Title': 'New listing submitted',
          'Priority': 'default',
          'Tags': 'package',
          'Content-Type': 'text/plain',
        },
        body: `${data.title} -- ${priceLabel}${feeLabel}\nSeller: ${data.seller_name} (${data.seller_phone})\nLocation: ${data.location}\nReview: ${process.env.NEXT_PUBLIC_APP_URL}/admin`,
      }).catch(() => { /* silent fail -- notification is best-effort */ });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create listing';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
