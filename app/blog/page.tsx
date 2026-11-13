import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase-server';
import Nav from '@/components/Nav';
import Link from 'next/link';
import type { Article } from '@/types';

export const dynamic = 'force-dynamic';


const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';

export const metadata: Metadata = {
  title: 'Parenting Blog | MyTinyverse',
  description: 'Practical tips, guides and advice for Nairobi parents -- from buying second-hand kids gear safely to the best toddler activities in the city.',
  alternates: { canonical: `${APP_URL}/blog` },
  openGraph: {
    title: 'Parenting Blog | MyTinyverse',
    description: 'Practical tips and guides for Nairobi parents.',
    url: `${APP_URL}/blog`,
    siteName: 'MyTinyverse',
    type: 'website',
  },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// Minimal colour set derived from tags (deterministic, no randomness)
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

// Fallback cover pattern if no image
function CoverFallback({ index }: { index: number }) {
  const patterns = [
    'linear-gradient(135deg,#FFF5EE 0%,#F0FBE8 100%)',
    'linear-gradient(135deg,#E8F5E9 0%,#FFF3E0 100%)',
    'linear-gradient(135deg,#EDE7F6 0%,#E8F5E9 100%)',
    'linear-gradient(135deg,#FFF8E1 0%,#FCE4EC 100%)',
  ];
  return (
    <div style={{
      width: '100%', aspectRatio: '16/9',
      background: patterns[index % patterns.length],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F07828" strokeWidth="1.5" opacity={0.5}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    </div>
  );
}

export default async function BlogPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image_url, tags, views, reading_time_minutes, author, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(24);

  const articles: Article[] = (data || []) as Article[];
  const [featured, ...rest] = articles;

  // Collect all unique tags for filter bar
  const allTags = Array.from(new Set(articles.flatMap(a => a.tags || []))).sort();

  return (
    <>
      {/* CSS hover effects -- Server Component cannot use onMouseEnter/onMouseLeave */}
      <style>{`
        .blog-card-hover:hover {
          box-shadow: var(--shadow-md) !important;
          transform: translateY(-2px) !important;
        }
      `}</style>

      <Nav/>

      {/* Hero band */}
      <section style={{
        background: 'linear-gradient(135deg,#FFF5EE 0%,#F0FBE8 100%)',
        padding: '48px 0 40px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ font: '600 12px Outfit,sans-serif', color: 'var(--orange)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Parenting Blog
          </p>
          <h1 style={{ font: '700 36px/1.2 Outfit,sans-serif', margin: '0 0 12px' }}>
            Tips, guides &amp; ideas for<br/>
            <span style={{ color: 'var(--orange)' }}>Nairobi parents</span>
          </h1>
          <p style={{ font: '400 16px Outfit,sans-serif', color: 'var(--text-3)', margin: 0, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            Practical advice on buying second-hand kids gear, parenting on a budget, and making the most of life with little ones in Nairobi.
          </p>
        </div>
      </section>

      <div className="container" style={{ padding: '40px 0 80px' }}>

        {articles.length === 0 ? (
          // Empty state
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FFF0E6', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h2 style={{ font: '700 22px Outfit,sans-serif', margin: '0 0 8px' }}>Coming soon</h2>
            <p style={{ font: '400 15px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 28px' }}>
              We are working on amazing parenting content. Check back soon!
            </p>
            <Link href="/" className="btn btn-primary">Browse listings</Link>
          </div>
        ) : (
          <>
            {/* Tag filter bar */}
            {allTags.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
                {allTags.map(tag => {
                  const s = tagStyle(tag);
                  return (
                    <span key={tag} style={{
                      background: s.bg, color: s.fg,
                      borderRadius: 'var(--r-pill)',
                      padding: '5px 14px',
                      font: '500 12px Outfit,sans-serif',
                      cursor: 'default',
                    }}>
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Featured article (first) */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 40 }}>
                <article className="blog-card-hover" style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'box-shadow .2s, transform .2s',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                }}
                >
                  {/* Cover */}
                  <div style={{ overflow: 'hidden', minHeight: 260 }}>
                    {featured.cover_image_url ? (
                      <img src={featured.cover_image_url} alt={featured.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                    ) : (
                      <CoverFallback index={0}/>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                      <span style={{ background: '#FFF0E6', color: 'var(--orange)', borderRadius: 'var(--r-pill)', padding: '4px 12px', font: '600 11px Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Featured
                      </span>
                      {(featured.tags || []).slice(0, 2).map(tag => {
                        const s = tagStyle(tag);
                        return (
                          <span key={tag} style={{ background: s.bg, color: s.fg, borderRadius: 'var(--r-pill)', padding: '4px 12px', font: '500 11px Outfit,sans-serif' }}>
                            {tag}
                          </span>
                        );
                      })}
                    </div>

                    <h2 style={{ font: '700 26px/1.3 Outfit,sans-serif', margin: '0 0 12px', color: 'var(--text-1)' }}>
                      {featured.title}
                    </h2>
                    <p style={{ font: '400 15px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 20px' }}>
                      {featured.excerpt}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>
                        {featured.published_at ? fmtDate(featured.published_at) : ''}
                      </span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }}/>
                      <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>
                        {featured.reading_time_minutes} min read
                      </span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }}/>
                      <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>
                        {featured.views} views
                      </span>
                    </div>

                    <div style={{ marginTop: 24 }}>
                      <span className="btn btn-primary btn-sm">Read article</span>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Article grid */}
            {rest.length > 0 && (
              <>
                <h2 style={{ font: '700 18px Outfit,sans-serif', margin: '0 0 20px', color: 'var(--text-1)' }}>
                  More articles
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 20,
                }}>
                  {rest.map((article, i) => (
                    <Link key={article.id} href={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
                      <article className="blog-card-hover" style={{
                        background: '#fff',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-lg)',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'box-shadow .2s, transform .2s',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      >
                        {/* Cover */}
                        <div style={{ overflow: 'hidden', aspectRatio: '16/9' }}>
                          {article.cover_image_url ? (
                            <img src={article.cover_image_url} alt={article.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
                            />
                          ) : (
                            <CoverFallback index={i + 1}/>
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* Tags */}
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                            {(article.tags || []).slice(0, 3).map(tag => {
                              const s = tagStyle(tag);
                              return (
                                <span key={tag} style={{ background: s.bg, color: s.fg, borderRadius: 'var(--r-pill)', padding: '3px 10px', font: '500 11px Outfit,sans-serif' }}>
                                  {tag}
                                </span>
                              );
                            })}
                          </div>

                          <h3 style={{ font: '700 16px/1.4 Outfit,sans-serif', margin: '0 0 8px', color: 'var(--text-1)', flex: 1 }}>
                            {article.title}
                          </h3>

                          {article.excerpt && (
                            <p style={{ font: '400 13px/1.5 Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {article.excerpt}
                            </p>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 'auto' }}>
                            <span style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)' }}>
                              {article.published_at ? fmtDate(article.published_at) : ''}
                            </span>
                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border)' }}/>
                            <span style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)' }}>
                              {article.reading_time_minutes} min read
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      <section style={{ background: 'linear-gradient(135deg,#FFF5EE 0%,#F0FBE8 100%)', borderTop: '1px solid var(--border)', padding: '48px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ font: '700 26px Outfit,sans-serif', margin: '0 0 10px' }}>
            Ready to declutter?
          </h2>
          <p style={{ font: '400 15px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 24px' }}>
            List your gently used kids gear and reach thousands of Nairobi parents.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/sell" className="btn btn-primary btn-lg">List an item</Link>
            <Link href="/" className="btn btn-secondary btn-lg">Browse listings</Link>
          </div>
        </div>
      </section>
    </>
  );
}
