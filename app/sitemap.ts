import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();
  const now = new Date().toISOString();

  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('status', 'live')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false });

  const listingUrls: MetadataRoute.Sitemap = (listings || []).map(listing => ({
    url: `${APP_URL}/listing/${listing.id}`,
    lastModified: new Date(listing.updated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const articleUrls: MetadataRoute.Sitemap = (articles || []).map(article => ({
    url: `${APP_URL}/blog/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    { url: APP_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${APP_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${APP_URL}/sell`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    ...listingUrls,
    ...articleUrls,
  ];
}