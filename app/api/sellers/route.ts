export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

// ── Helpers ───────────────────────────────────────────────

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0'))   return '254' + digits.slice(1);
  return digits;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function buildUniqueSlug(
  supabase: ReturnType<typeof createAdminClient>,
  name: string,
  neighbourhood: string,
  excludePhone?: string,   // skip checking own row on upsert
): Promise<string> {
  const base = slugify(`${name}-${neighbourhood || 'nairobi'}`);
  if (!base) return 'seller-' + Math.random().toString(36).slice(2, 8);

  // Check if base slug is free
  let q = supabase
    .from('seller_profiles')
    .select('profile_slug')
    .eq('profile_slug', base);
  if (excludePhone) q = q.neq('phone', excludePhone);
  const { data } = await q.single();

  if (!data) return base; // available

  // Try numeric suffixes
  for (let i = 2; i <= 9; i++) {
    const candidate = `${base}-${i}`;
    let q2 = supabase
      .from('seller_profiles')
      .select('profile_slug')
      .eq('profile_slug', candidate);
    if (excludePhone) q2 = q2.neq('phone', excludePhone);
    const { data: d2 } = await q2.single();
    if (!d2) return candidate;
  }

  // Fallback: append random 4-char hex
  return `${base}-${Math.random().toString(16).slice(2, 6)}`;
}

// ── POST /api/sellers -- create or upsert a seller profile ────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone: rawPhone,
      display_name,
      bio,
      neighbourhood,
      avatar_url,
    } = body;

    if (!rawPhone || !display_name) {
      return NextResponse.json({ error: 'phone and display_name required' }, { status: 400 });
    }

    const phone = normalizePhone(rawPhone);
    const supabase = createAdminClient();

    // Check if profile already exists for this phone
    const { data: existing } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existing) {
      // Update display_name, bio, neighbourhood if provided
      const updates: Record<string, unknown> = {};
      if (display_name && display_name !== existing.display_name) {
        updates.display_name = display_name.trim();
        // Regenerate slug if name changed
        updates.profile_slug = await buildUniqueSlug(supabase, display_name.trim(), neighbourhood || existing.neighbourhood || 'nairobi', phone);
      }
      if (bio !== undefined)           updates.bio           = bio?.trim() || null;
      if (neighbourhood !== undefined) updates.neighbourhood = neighbourhood?.trim() || null;
      if (avatar_url !== undefined)    updates.avatar_url    = avatar_url || null;

      if (Object.keys(updates).length === 0) {
        // Nothing to update -- return existing (omit edit_token)
        const { edit_token: _, ...pub } = existing;
        void _;
        return NextResponse.json(pub);
      }

      const { data: updated, error } = await supabase
        .from('seller_profiles')
        .update(updates)
        .eq('phone', phone)
        .select()
        .single();

      if (error) throw error;
      const { edit_token: _t, ...pub } = updated;
      void _t;
      return NextResponse.json(pub);
    }

    // Create new profile
    const name         = display_name.trim();
    const hood         = neighbourhood?.trim() || 'Nairobi';
    const profile_slug = await buildUniqueSlug(supabase, name, hood);

    const { data: created, error } = await supabase
      .from('seller_profiles')
      .insert({
        phone,
        display_name: name,
        bio:          bio?.trim() || null,
        neighbourhood: hood,
        avatar_url:   avatar_url || null,
        profile_slug,
      })
      .select()
      .single();

    if (error) throw error;
    // Return the full row INCLUDING edit_token so the caller can store/surface it
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create/update seller profile';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── GET /api/sellers?phone=254... -- look up profile by phone ────────────
export async function GET(req: NextRequest) {
  const phone = new URL(req.url).searchParams.get('phone');
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('seller_profiles')
    .select('id, display_name, bio, neighbourhood, avatar_url, profile_slug, total_sold, created_at')
    .eq('phone', normalizePhone(phone))
    .single();

  if (error || !data) return NextResponse.json({ profile: null });
  return NextResponse.json({ profile: data });
}
