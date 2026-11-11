import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-server';
import Nav from '@/components/Nav';
import Link from 'next/link';
import type { Article } from '@/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';

// ── Metadata (dynamic, per-article) ──────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('articles')
    .select('title, slug, excerpt, meta_title, meta_description, cover_image_url, published_at, author')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (!data) return { title: 'Article not found | MyTinyverse' };

  const title       = data.meta_title || data.title;
  const description = data.meta_description || data.excerpt || '';
  const url         = `${APP_URL}/blog/${data.slug}`;
  const image       = data.cover_image_url;

  return {
    title:       `${title} | MyTinyverse Blog`,
    description,
    alternates:  { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'MyTinyverse',
      type: 'article',
      publishedTime: data.published_at || undefined,
      authors: [data.author],
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

// ── Static params for ISR ─────────────────────────────────
export async function generateStaticParams() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(100);
  return (data || []).map(a => ({ slug: a.slug }));
}

export const revalidate = 60;

// ── Helpers ───────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const TAG_COLOURS: Record<string, { bg: string; fg: string }> = {
  default:    { bg: '#f2f2f2', fg: '#444' },
  safety:     { bg: '#FFF0E6', fg: '#F07828' },
  tips:       { bg: '#E8F5E9', fg: '#2E7D32' },
  budget:     { bg: '#E3F2FD', fg: '#1565C0' },
  health:     { bg: '#FCE4EC', fg: '#880E4F' },
  education:  { bg: '#EDE7F6', fg: '#4527A0' },
  nairobi:    { bg: '#E8F5E9', fg: '#1B5E20' },
  secondhand: { bg: '#FFF8E1', fg: '#E65100' },
};

function tagStyle(tag: string) {
  const key = Object.keys(TAG_COLOURS).find(k => tag.toLowerCase().includes(k)) || 'default';
  return TAG_COLOURS[key];
}

// ── Page ──────────────────────────────────────────────────
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  // Fetch published article (anon client -- respects RLS)
  const supabase = createServerClient();
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (!data) notFound();
  const article = data as Article;

  // Increment view count in background (admin client bypasses RLS)
  const admin = createAdminClient();
  admin.rpc('increment_article_views', { article_slug: params.slug }).then(() => {});

  // Fetch related articles (same tags, exclude current)
  const { data: related } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image_url, reading_time_minutes, published_at, tags')
    .eq('status', 'published')
    .neq('slug', params.slug)
    .overlaps('tags', article.tags || [])
    .order('published_at', { ascending: false })
    .limit(3);

  // JSON-LD Article schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline:      article.title,
    description:   article.meta_description || article.excerpt || '',
    url:           `${APP_URL}/blog/${article.slug}`,
    datePublished: article.published_at || article.created_at,
    dateModified:  article.updated_at,
    author: {
      '@type': 'Organization',
      name:    article.author || 'MyTinyverse Team',
      url:     APP_URL,
    },
    publisher: {
      '@type':  'Organization',
      name:     'MyTinyverse',
      url:      APP_URL,
      logo: {
        '@type': 'ImageObject',
        url:     `${APP_URL}/logo.png`,
      },
    },
    ...(article.cover_image_url ? {
      image: {
        '@type': 'ImageObject',
        url:     article.cover_image_url,
        width:   1200,
        height:  630,
      },
    } : {}),
    mainEntityOfPage: {
      '@type': '@id',
      '@id':   `${APP_URL}/blog/${article.slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Nav/>

      {/* Breadcrumb */}
      <div className="container" style={{ padding: '16px 0 0' }}>
        <nav style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>
          <Link href="/" style={{ color: 'var(--text-3)' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link href="/blog" style={{ color: 'var(--text-3)' }}>Blog</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-1)' }}>{article.title}</span>
        </nav>
      </div>

      <div className="container" style={{ padding: '28px 0 80px', maxWidth: 1100, display: 'grid', gridTemplateColumns: '1fr min(660px,100%) 1fr', columnGap: 0 }}>
        {/* Spacer */}
        <div/>

        {/* Article main */}
        <main>
          {/* Cover image */}
          {article.cover_image_url && (
            <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 32, aspectRatio: '16/9' }}>
              <img src={article.cover_image_url} alt={article.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
            </div>
          )}

          {/* Tags */}
          {(article.tags || []).length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {article.tags.map(tag => {
                const s = tagStyle(tag);
                return (
                  <span key={tag} style={{ background: s.bg, color: s.fg, borderRadius: 'var(--r-pill)', padding: '4px 12px', font: '500 12px Outfit,sans-serif' }}>
                    {tag}
                  </span>
                );
              })}
            </div>
          )}

          {/* Title */}
          <h1 style={{ font: '700 32px/1.25 Outfit,sans-serif', margin: '0 0 16px', color: 'var(--text-1)', textWrap: 'balance' } as React.CSSProperties}>
            {article.title}
          </h1>

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFF0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span style={{ font: '500 13px Outfit,sans-serif', color: 'var(--text-2)' }}>
                {article.author || 'MyTinyverse Team'}
              </span>
            </div>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-3)' }}/>
            <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>
              {article.published_at ? fmtDate(article.published_at) : ''}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-3)' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>
                {article.reading_time_minutes} min read
              </span>
            </div>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-3)' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>
                {(article.views || 0).toLocaleString()} views
              </span>
            </div>
          </div>

          {/* Article body -- AI-generated HTML */}
          <div
            style={{ lineHeight: 1.75 }}
            className="article-body"
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
          />

          {/* In-article CTA */}
          <div style={{
            margin: '48px 0',
            background: 'linear-gradient(135deg,#FFF5EE 0%,#F0FBE8 100%)',
            border: '1px solid #f0d9c4',
            borderRadius: 'var(--r-lg)',
            padding: '28px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ font: '700 18px Outfit,sans-serif', margin: '0 0 4px', color: 'var(--text-1)' }}>
                Find great deals on kids gear
              </p>
              <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                Browse hundreds of gently used items from Nairobi parents -- bikes, strollers, toys and more.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
              <Link href="/" className="btn btn-primary btn-sm">Browse listings</Link>
              <Link href="/sell" className="btn btn-secondary btn-sm">List an item</Link>
            </div>
          </div>

          {/* Related articles */}
          {related && related.length > 0 && (
            <div>
              <h2 style={{ font: '700 20px Outfit,sans-serif', margin: '0 0 20px', color: 'var(--text-1)' }}>
                Related articles
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(related as Article[]).map(rel => (
                  <Link key={rel.id} href={`/blog/${rel.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-md)',
                      padding: '16px 18px',
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      transition: 'border-color .15s',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--orange)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                    >
                      {rel.cover_image_url && (
                        <img src={rel.cover_image_url} alt={rel.title}
                          style={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}/>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ font: '600 14px Outfit,sans-serif', margin: '0 0 4px', color: 'var(--text-1)' }}>
                          {rel.title}
                        </p>
                        <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                          {rel.reading_time_minutes} min read
                          {rel.published_at && ` -- ${fmtDate(rel.published_at)}`}
                        </p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Link href="/blog" className="btn btn-secondary btn-sm">View all articles</Link>
              </div>
            </div>
          )}
        </main>

        {/* Spacer */}
        <div/>
      </div>

      {/* Article body typography */}
      <style>{`
        .article-body h2 {
          font: 700 22px/1.3 Outfit,sans-serif;
          color: var(--text-1);
          margin: 36px 0 14px;
        }
        .article-body h3 {
          font: 600 18px/1.4 Outfit,sans-serif;
          color: var(--text-1);
          margin: 28px 0 10px;
        }
        .article-body p {
          font: 400 16px/1.75 Outfit,sans-serif;
          color: var(--text-2);
          margin: 0 0 18px;
        }
        .article-body ul,
        .article-body ol {
          padding-left: 24px;
          margin: 0 0 18px;
        }
        .article-body li {
          font: 400 16px/1.75 Outfit,sans-serif;
          color: var(--text-2);
          margin-bottom: 6px;
        }
        .article-body strong {
          font-weight: 600;
          color: var(--text-1);
        }
        .article-body em {
          font-style: italic;
        }
      `}</style>
    </>
  );
}
