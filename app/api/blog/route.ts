import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const revalidate = 60; // revalidate every 60 seconds

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag    = searchParams.get('tag');
  const limit  = Math.min(Number(searchParams.get('limit') || '20'), 50);
  const offset = Number(searchParams.get('offset') || '0');

  const supabase = createServerClient();

  let query = supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image_url, tags, views, reading_time_minutes, author, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (tag) query = query.contains('tags', [tag]);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ articles: data || [] });
}
