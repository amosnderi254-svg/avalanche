import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

const ADMIN_PIN = process.env.ADMIN_PIN || '0784';

function auth(req: NextRequest) {
  const pin =
    req.headers.get('x-admin-pin') ||
    req.headers.get('authorization')?.replace('Bearer ', '');
  return pin === ADMIN_PIN;
}

// ── GET: list all articles (admin sees all statuses) ──────
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status'); // optional filter

  const supabase = createAdminClient();
  let query = supabase
    .from('articles')
    .select('id, title, slug, excerpt, status, tags, views, reading_time_minutes, author, published_at, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ articles: data || [] });
}

// ── POST: create a new article ───────────────────────────
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    title, slug, excerpt, content, cover_image_url,
    meta_title, meta_description, tags, reading_time_minutes, author,
  } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: 'title and slug are required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .insert({
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
      excerpt: excerpt || null,
      content: content || null,
      cover_image_url: cover_image_url || null,
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt || null,
      tags: tags || [],
      status: 'draft',
      reading_time_minutes: reading_time_minutes || 5,
      author: author || 'MyTinyverse Team',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ article: data }, { status: 201 });
}

// ── PATCH: update article or change status ────────────────
export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, action, ...fields } = body;

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const supabase = createAdminClient();

  // Status transitions
  if (action === 'submit') {
    // Writer submits draft for review
    const { error } = await supabase
      .from('articles')
      .update({ status: 'pending' })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: 'pending' });
  }

  if (action === 'publish') {
    // Admin approves and publishes
    const { error } = await supabase
      .from('articles')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: 'published' });
  }

  if (action === 'unpublish') {
    const { error } = await supabase
      .from('articles')
      .update({ status: 'draft', published_at: null })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: 'draft' });
  }

  // General field update
  const allowed = [
    'title', 'slug', 'excerpt', 'content', 'cover_image_url',
    'meta_title', 'meta_description', 'tags', 'reading_time_minutes', 'author',
  ];
  const updates: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in fields) updates[k] = fields[k];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ article: data });
}

// ── DELETE: remove article ────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
