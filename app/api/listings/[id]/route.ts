import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

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

    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'live')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (q) {
      query = query.ilike('title', `%${q}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    const hasMore = (from + (data?.length ?? 0)) < total;

    if (q && q.trim()) {
      void supabase.from('search_events').insert({
        query: q.trim().toLowerCase(),
        category: category || null,
        result_count: total,
      });
    }

    return NextResponse.json({ listings: data, page, total, hasMore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch listings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title, price, category, condition, description, location,
      seller_name, seller_phone, seller_whatsapp, seller_email,
      images = [], status = 'pending',
      fee_tier, fee_amount, mpesa_code,
    } = body;

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
      })
      .select()
      .single();

    if (error) throw error;

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
      }).catch(() => {});
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create listing';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}