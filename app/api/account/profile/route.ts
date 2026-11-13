export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

// POST /api/account/profile  { token: "..." }
// Verifies the edit token and returns the profile (without the token itself)
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('id, phone, display_name, bio, neighbourhood, avatar_url, profile_slug, total_sold, created_at, updated_at, edit_token')
      .eq('edit_token', token)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Omit edit_token from the response (security)
    const { edit_token: _, ...profile } = data;
    void _;

    return NextResponse.json({ profile, phone: data.phone });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error verifying token';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
