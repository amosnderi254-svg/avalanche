import { Suspense } from 'react';
import Nav from '@/components/Nav';
import ListingsPage from '@/components/ListingsPage';
import NayaChat from '@/components/NayaChat';
import Footer from '@/components/Footer';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import PromoBanner from '@/components/PromoBanner';
import ActivityRail from '@/components/ActivityRail';
import AudioPlayer from '@/components/AudioPlayer';
import RecentlySoldTicker from '@/components/RecentlySoldTicker';
import { createServerClient } from '@/lib/supabase-server';


export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Buy & Sell Kids' Gear in Nairobi | MyTinyverse",
  description: "Find gently used bikes, strollers, car seats, toys and books from Nairobi parents. Save up to 70% on quality kids gear. Cash on handover, no middleman.",
  keywords: "kids marketplace Nairobi, second hand children items Kenya, buy sell kids gear, gently used baby items Nairobi, second hand strollers Kenya, used bikes for kids Nairobi",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${APP_URL}/#website`,
      url: APP_URL,
      name: 'MyTinyverse',
      description: 'Buy, sell or donate gently used kids items in Nairobi - bikes, strollers, car seats, toys, books and more.',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${APP_URL}/?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${APP_URL}/#organization`,
      name: 'MyTinyverse',
      url: APP_URL,
      logo: { '@type': 'ImageObject', url: `${APP_URL}/logo.png` },
      contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: 'English' },
      areaServed: { '@type': 'City', name: 'Nairobi', '@id': 'https://www.wikidata.org/wiki/Q3870' },
    },
  ],
};

const HOW_IT_WORKS = [
  {
    num: '01',
    title: 'Post your item',
    body: 'Take a few photos, write a short description and set your price. For KSh 99 your listing goes live in under 5 minutes.',
    iconBg: '#FFF0E6',
    iconStroke: '#F07828',
    icon: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 13m-4 0a4 4 0 008 0 4 4 0 00-8 0',
  },
  {
    num: '02',
    title: 'Buyers message you',
    body: 'Interested parents message you directly on WhatsApp. You pick who you sell to. No middleman anywhere near it.',
    iconBg: '#EDF7E2',
    iconStroke: '#7DC243',
    icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  },
  {
    num: '03',
    title: 'Meet and hand over',
    body: 'Agree on a safe spot in Nairobi, hand over the item and collect your cash. Quick, clean and local.',
    iconBg: '#E3F2FD',
    iconStroke: '#1565C0',
    icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10m-3 0a3 3 0 006 0 3 3 0 00-6 0',
  },
];

const QUICK_CATEGORIES = [
  { id: 'strollers', label: 'Strollers',  iconBg: '#FFF0E6', iconColor: '#F07828', icon: 'M3 12h1M5 6h14M5 6a2 2 0 00-2 2v4h18V8a2 2 0 00-2-2M19 12h2M7 12v5a2 2 0 002 2h6a2 2 0 002-2v-5M9 19a2 2 0 01-2 2 2 2 0 01-2-2M17 19a2 2 0 01-2 2 2 2 0 01-2-2' },
  { id: 'bikes',     label: 'Bikes',      iconBg: '#EDF7E2', iconColor: '#7DC243', icon: 'M5 19a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-9-9l2-5h5l2 4H10zm-1 0l-2 1-2 4' },
  { id: 'shoes',     label: 'Shoes',      iconBg: '#E8F4FD', iconColor: '#1E88E5', icon: 'M2 18h20M4 18V9a4 4 0 014-4h8a4 4 0 014 4v9M8 18v-4h8v4' },
  { id: 'toys',      label: 'Toys',       iconBg: '#F3E8FD', iconColor: '#AB47BC', icon: 'M12 2a5 5 0 015 5v1h1a2 2 0 010 4h-1v1a5 5 0 01-10 0v-1H6a2 2 0 010-4h1V7a5 5 0 015-5zM9 10h6' },
  { id: 'books',     label: 'Books',      iconBg: '#FFF8E1', iconColor: '#F9A825', icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z' },
  { id: 'car-seats', label: 'Car Seats',  iconBg: '#E0F2F1', iconColor: '#00897B', icon: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3M9 17v4m0 0h6m-6 0H7m8 0h2m1-4h3a2 2 0 002-2v-4a2 2 0 00-2-2h-3' },
  { id: 'clothing',  label: 'Clothing',   iconBg: '#FCE4EC', iconColor: '#E91E63', icon: 'M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z' },
  { id: 'baby-gear', label: 'Baby Gear',  iconBg: '#FFF3E0', iconColor: '#FF7043', icon: 'M12 2C9.24 2 7 4.24 7 7v1H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V10a2 2 0 00-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2a3 3 0 013 3v1H9V7a3 3 0 013-3zm-1 10h2v2h-2v-2zm0-4h2v2h-2v-2z' },
];

export default async function Home() {
  /* ── Live category counts (server-side) ─────────────────────────────── */
  let countMap: Record<string, number> = {};
  let totalLive = 0;
  try {
    const supabase = createServerClient();
    const now = new Date().toISOString();
    const { data: rows } = await supabase
      .from('listings')
      .select('category')
      .eq('status', 'live')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .not('category', 'is', null);
    countMap = (rows ?? []).reduce((acc: Record<string, number>, r: { category: string }) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1;
      return acc;
    }, {});
    totalLive = Object.values(countMap).reduce((a, b) => a + b, 0);
  } catch { /* non-critical — section degrades gracefully */ }
  /* Category with the most live listings gets the "🔥 Trending" badge */
  const trendingId = Object.entries(countMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* ── Promo banner (above nav) ─────────────────── */}
      <PromoBanner />

      {/* ── Nav ─────────────────────────────────────────── */}
      <Nav />

      {/* ── Hero slider ─────────────────────────────────── */}
      <HeroSlider />

      {/* ── Live stat strip (Feature 8 — minimal) ─────────── */}
      <ActivityRail />

      {/* ── Recently Sold Ticker ─────────────────────────── */}
      <RecentlySoldTicker />

      {/* ── Listings ─────────────────────────────────────── */}
      <div id="listings" style={{ background: 'var(--bg, #FFFDF9)' }}>
        <Suspense fallback={
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ margin: '0 auto' }}/>
          </div>
        }>
          <ListingsPage />
        </Suspense>
      </div>

      {/* ── How it works ─────────────────────────────────── */}
      <section style={{ padding: '72px 0', background: '#fff', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{
              font: '700 11px Outfit,sans-serif',
              color: 'var(--orange, #F07828)',
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              margin: '0 0 10px',
            }}>
              Simple process
            </p>
            <h2 style={{
              font: '800 clamp(26px,4vw,36px)/1.15 Outfit,sans-serif',
              color: 'var(--text-1)',
              margin: 0,
              letterSpacing: '-.02em',
            }}>
              It really is this simple.
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}>
            {HOW_IT_WORKS.map(step => (
              <div
                key={step.num}
                className="card"
                style={{ padding: '32px 28px', position: 'relative' }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute', top: 20, right: 24,
                    font: '900 40px/1 Outfit,sans-serif',
                    color: 'var(--border)',
                    letterSpacing: '-.04em',
                    userSelect: 'none',
                  }}
                >
                  {step.num}
                </span>
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 14,
                  background: step.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke={step.iconStroke} strokeWidth="1.75"
                    strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={step.icon}/>
                  </svg>
                </div>
                <h3 style={{
                  font: '700 17px Outfit,sans-serif',
                  color: 'var(--text-1)',
                  margin: '0 0 10px',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  font: '400 14px/1.65 Outfit,sans-serif',
                  color: 'var(--text-3)',
                  margin: 0,
                }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <Link href="/sell" className="btn btn-primary">
              Start selling
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live Category Grid ───────────────────────────────────────────── */}
      <section style={{
        padding: '72px 0 80px',
        background: 'linear-gradient(145deg, #FFF9F4 0%, #FFF0E0 40%, #FFE4C4 80%, #FFD9A8 100%)',
        position: 'relative', overflow: 'hidden',
        borderTop: '1px solid rgba(240,120,40,.12)',
      }}>
        {/* Decorative soft blobs — warm tones only */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: -160, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,120,40,.10) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: -100, left: -60,
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,180,80,.14) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <style>{`
          @keyframes catIn {
            from { opacity: 0; transform: translateY(24px) scale(.96); }
            to   { opacity: 1; transform: translateY(0)   scale(1); }
          }
          @keyframes livePulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: .5; transform: scale(1.5); }
          }
          .cat-card {
            display: flex; flex-direction: column; align-items: center;
            text-align: center; gap: 10px;
            padding: 28px 16px 22px;
            background: rgba(255,255,255,.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1.5px solid rgba(255,255,255,.9);
            border-radius: 18px;
            text-decoration: none; color: inherit;
            position: relative;
            box-shadow: 0 2px 12px rgba(200,100,20,.07), 0 1px 3px rgba(200,100,20,.05);
            transition: transform .22s cubic-bezier(.34,1.56,.64,1),
                        border-color .18s ease,
                        box-shadow .18s ease,
                        background .18s ease;
            animation: catIn .45s ease both;
            animation-delay: calc(var(--i) * 60ms);
          }
          .cat-card:hover {
            transform: translateY(-8px) scale(1.03);
            border-color: rgba(240,120,40,.5);
            box-shadow: 0 20px 48px rgba(200,90,10,.16), 0 4px 16px rgba(200,90,10,.10);
            background: rgba(255,255,255,.92);
          }
          .cat-cta {
            font: 600 11px/1 Outfit,sans-serif;
            color: #F07828;
            letter-spacing: .04em;
            opacity: 0; transform: translateY(6px);
            transition: opacity .2s ease, transform .2s ease;
            margin-top: 2px;
          }
          .cat-card:hover .cat-cta { opacity: 1; transform: translateY(0); }
          .cat-trend {
            position: absolute; top: -11px; left: 50%; transform: translateX(-50%);
            background: linear-gradient(90deg, #F07828, #FF9A3C);
            color: #fff;
            font: 700 9px/1 Outfit,sans-serif;
            letter-spacing: .08em; text-transform: uppercase;
            padding: 4px 10px; border-radius: 20px;
            white-space: nowrap;
            box-shadow: 0 4px 14px rgba(240,120,40,.45);
          }
          .cat-count {
            font: 600 11px/1 Outfit,sans-serif;
            color: #C08050;
            transition: color .18s ease;
          }
          .cat-card:hover .cat-count { color: #F07828; }
        `}</style>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span aria-hidden="true" style={{
                display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                background: '#7DC243',
                animation: 'livePulse 2s ease-in-out infinite',
              }} />
              <span style={{
                font: '600 11px/1 Outfit,sans-serif',
                color: '#5A8A2A',
                textTransform: 'uppercase',
                letterSpacing: '.12em',
              }}>
                {totalLive > 0 ? `${totalLive.toLocaleString()} items live right now` : 'Live marketplace'}
              </span>
            </div>
            <h2 style={{
              font: '800 clamp(26px,4.5vw,40px)/1.1 Outfit,sans-serif',
              color: '#1A1A1A',
              margin: '0 0 12px',
              letterSpacing: '-.03em',
            }}>
              What are you selling today?
            </h2>
            <p style={{
              font: '400 15px/1.5 Outfit,sans-serif',
              color: '#7A5A40',
              margin: 0,
            }}>
              Pick a category — your listing goes live in under 5 minutes.
            </p>
          </div>

          {/* Category grid — 4 cols desktop / 2 cols mobile */}
          <style>{`
            .cat-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 14px;
            }
            @media (max-width: 700px) {
              .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
            }
          `}</style>
          <div className="cat-grid">
            {QUICK_CATEGORIES.map((cat, i) => {
              const count = countMap[cat.id] ?? 0;
              const isTrending = cat.id === trendingId && count > 0;
              return (
                <Link
                  key={cat.id}
                  href={`/sell?category=${cat.id}`}
                  className="cat-card"
                  style={{ '--i': i } as React.CSSProperties}
                  aria-label={`Sell ${cat.label}${count > 0 ? ` — ${count} listed` : ''}`}
                >
                  {isTrending && (
                    <span className="cat-trend" aria-label="Trending category">
                      🔥 Trending
                    </span>
                  )}

                  {/* Icon circle */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: cat.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke={cat.iconColor} strokeWidth="1.75"
                      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                    >
                      <path d={cat.icon}/>
                    </svg>
                  </div>

                  {/* Label */}
                  <span style={{
                    font: '700 13px/1.2 Outfit,sans-serif',
                    color: '#1A1A1A',
                    letterSpacing: '.01em',
                  }}>
                    {cat.label}
                  </span>

                  {/* Live count */}
                  <span className="cat-count">
                    {count > 0 ? `${count} listed` : 'Be first'}
                  </span>

                  {/* Hover CTA */}
                  <span className="cat-cta">List yours →</span>
                </Link>
              );
            })}
          </div>

          {/* Footer note */}
          <p style={{
            textAlign: 'center',
            font: '400 13px Outfit,sans-serif',
            color: '#A07850',
            margin: '36px 0 0',
          }}>
            Listing is KSh 99.{' '}
            <Link href="/sell" style={{
              color: '#F07828',
              textDecoration: 'none',
              fontWeight: 600,
            }}>
              Not sure what to list? Start from scratch →
            </Link>
          </p>
        </div>

      </section>

      {/* ── Dark CTA banner ──────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#1A1A1A' }}>
        <div className="container">
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              font: '800 clamp(28px,4.5vw,42px)/1.1 Outfit,sans-serif',
              color: 'var(--orange, #F07828)',
              margin: '0 0 16px',
              letterSpacing: '-.03em',
            }}>
              Nairobi parents are already here.<br />Join them.
            </h2>
            <p style={{
              font: '500 16px/1.6 Outfit,sans-serif',
              color: 'rgba(255,255,255,.65)',
              margin: '0 0 40px',
            }}>
              Five minutes to list. Nairobi-wide reach. No subscription needed.
            </p>
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <Link
                href="/sell"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  background: 'var(--orange, #F07828)',
                  color: '#fff',
                  borderRadius: 10,
                  font: '700 15px Outfit,sans-serif',
                  textDecoration: 'none',
                  letterSpacing: '.01em',
                  border: '2px solid transparent',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Post an item - KSh 99
              </Link>
              <Link
                href="/#listings"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '14px 28px',
                  background: 'transparent',
                  color: '#fff',
                  borderRadius: 10,
                  font: '600 15px Outfit,sans-serif',
                  textDecoration: 'none',
                  border: '2px solid rgba(255,255,255,.25)',
                }}
              >
                Browse listings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Chat assistant ───────────────────────────────── */}
      <NayaChat />

      {/* ── Footer ──────────────────────────────────────── */}
      <Footer />

      {/* ── Floating audio player (bottom-left) ─────────── */}
      <AudioPlayer />

    </>
  );
}
