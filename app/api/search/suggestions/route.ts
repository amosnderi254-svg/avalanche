import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const CATEGORY_SUGGESTIONS = [
  { id: 'bikes',     label: 'Bikes & Scooters', href: '/?cat=bikes' },
  { id: 'strollers', label: 'Strollers',        href: '/?cat=strollers' },
  { id: 'car-seats', label: 'Car Seats',        href: '/?cat=car-seats' },
  { id: 'toys',      label: 'Toys & Games',     href: '/?cat=toys' },
  { id: 'books',     label: 'Books',            href: '/?cat=books' },
  { id: 'baby-gear', label: 'Baby Gear',        href: '/?cat=baby-gear' },
  { id: 'shoes',     label: 'Shoes',            href: '/?cat=shoes' },
  { id: 'clothing',  label: 'Clothing',         href: '/?cat=clothing' },
  { id: 'scooters',  label: 'Scooters',         href: '/?cat=scooters' },
];

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [], matchedCats: [] });
  }

  // Category matches (instant, no DB needed)
  const matchedCats = CATEGORY_SUGGESTIONS.filter(c =>
    c.label.toLowerCase().includes(q.toLowerCase())
  );

  try {
    const supabase = createServerClient();

    const { data: listings } = await supabase
      .from('listings')
      .select('id, title, price, location, category, is_donation')
      .eq('status', 'live')
      .ilike('title', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(6);

    const suggestions = (listings || []).map(l => ({
      id: l.id as string,
      label: l.title as string,
      price:
        l.is_donation || Number(l.price) === 0
          ? 'FREE'
          : `KSh ${Number(l.price).toLocaleString()}`,
      location: (l.location as string) || '',
      category: (l.category as string) || '',
      href: `/listing/${l.id}`,
    }));

    return NextResponse.json({ suggestions, matchedCats });
  } catch {
    return NextResponse.json({ suggestions: [], matchedCats });
  }
}
