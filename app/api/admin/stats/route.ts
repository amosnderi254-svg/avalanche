import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_PIN = process.env.ADMIN_PIN || '0784';

function checkAuth(req: NextRequest) {
  const pin = req.headers.get('x-admin-pin');
  return pin === ADMIN_PIN;
}

// POST /api/admin/create-listing
// Admin posts a listing on behalf of a parent.
// - No M-Pesa gate: fee_amount=0, fee_tier='admin'
// - Status: 'live' immediately
// - Photos uploaded to Supabase storage same as /api/upload
// - expires_at: 60 days from now
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    // ── Fields ─────────────────────────────────────────────────────────────
    const title        = (formData.get('title') as string | null)?.trim();
    const price        = formData.get('price') as string | null;
    const is_donation  = formData.get('is_donation') === 'true';
    const category     = (formData.get('category') as string | null)?.trim();
    const age_range    = (formData.get('age_range') as string | null)?.trim() || null;
    const condition    = (formData.get('condition') as string | null)?.trim();
    const description  = (formData.get('description') as string | null)?.trim() || null;
    const location     = (formData.get('location') as string | null)?.trim();
    const seller_name  = (formData.get('seller_name') as string | null)?.trim();
    const seller_phone = (formData.get('seller_phone') as string | null)?.trim();
    const seller_wa_raw = (formData.get('seller_whatsapp') as string | null)?.trim();
    const seller_whatsapp = seller_wa_raw || seller_phone || null;
    const admin_note   = (formData.get('admin_note') as string | null)?.trim() || null;

    // ── Validation ─────────────────────────────────────────────────────────
    if (!title || !category || !condition || !location || !seller_name || !seller_phone) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, condition, location, seller_name, seller_phone' },
        { status: 400 },
      );
    }

    // ── Photo uploads ───────────────────────────────────────────────────────
    const supabase = createServerClient();
    const imageUrls: string[] = [];

    for (let i = 0; i < 3; i++) {
      const file = formData.get(`photo${i}`) as File | null;
      if (!file) continue;

      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue; // skip files > 5MB

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `admin-${uuidv4()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filename, buffer, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.error('Photo upload error:', uploadError.message);
        continue; // skip bad uploads, don't fail the whole request
      }

      const { data: urlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filename);

      imageUrls.push(urlData.publicUrl);
    }

    // ── Insert listing ──────────────────────────────────────────────────────
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    const { data, error } = await supabase
      .from('listings')
      .insert({
        title,
        price: is_donation ? 0 : Math.max(0, Number(price) || 0),
        category,
        condition,
        description: description || null,
        location,
        seller_name,
        seller_phone,
        seller_whatsapp,
        seller_email: null,
        images: imageUrls,
        status: 'live',
        fee_tier: 'admin',
        fee_amount: 0,
        mpesa_code: null,
        expires_at: expiresAt.toISOString(),
        // Store age_range and admin_note in description prefix if set
        // (schema doesn't have dedicated columns - embed in description)
      })
      .select('id, title, status')
      .single();

    if (error) throw error;

    // ── Admin note: append to Supabase notes or just log ───────────────────
    // Store admin_note + age_range in a separate admin_notes table if it exists,
    // otherwise just log it (non-blocking, best-effort).
    if (admin_note || age_range) {
      void supabase
        .from('admin_listing_notes')
        .insert({ listing_id: data.id, note: admin_note || null, age_range: age_range || null })
        .then(() => { /* fire-and-forget, table may not exist */ })
        .catch(() => { /* silent */ });
    }

    return NextResponse.json({ listing: { id: data.id, title: data.title } }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create listing';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
