import { Suspense } from 'react';
import Nav from '@/components/Nav';
import ListingsPage from '@/components/ListingsPage';
import NayaChat from '@/components/NayaChat';
import Footer from '@/components/Footer';
import Link from 'next/link';

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

const CATEGORIES = [
  { id: 'all',       label: 'All Items',   icon: 'M3 5h20M3 12h20M3 19h20' },
  { id: 'bikes',     label: 'Bikes',       icon: 'M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM12 17v-5l-3-3 4-4 3 3h3' },
  { id: 'scooters',  label: 'Scooters',    icon: 'M5 17a2 2 0 100-4 2 2 0 000 4zM17 5v8M12 5h9M12 5v8h5' },
  { id: 'strollers', label: 'Strollers',   icon: 'M4 16s-1-2 0-2h16s1 2 0 2M6 20h12M2 8h20M6 8V4h12v4' },
  { id: 'car-seats', label: 'Car Seats',   icon: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-2 10a2 2 0 002 2h4a2 2 0 002-2V9a2 2 0 00-2-2h-4a2 2 0 00-2 2v8zm4-6h2' },
  { id: 'toys',      label: 'Toys',        icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'books',     label: 'Books',       icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 014 4.5v15z' },
  { id: 'baby-gear', label: 'Baby Gear',   icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { id: 'shoes',     label: 'Shoes',       icon: 'M22 11.5A6.5 6.5 0 0015.5 5h-3L6 7.5V14l3-1 2 3h3.5A6.5 6.5 0 0022 11.5z' },
  { id: 'clothing',  label: 'Clothing',    icon: 'M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z' },
];

const SAMPLE_CARDS = [
  { label: 'Trek Kids Bike 20"', price: 'KSh 8,500', cond: 'Like New',  bg: 'linear-gradient(135deg,#FFF3EB,#FFE0C8)', icon: 'M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM12 17v-5l-3-3 4-4 3 3h3', iconC: '#F07828' },
  { label: 'Bugaboo Stroller',   price: 'KSh 22,000', cond: 'Good',      bg: 'linear-gradient(135deg,#F0FAE5,#DCEFC0)', icon: 'M4 16s-1-2 0-2h16s1 2 0 2M6 20h12M2 8h20M6 8V4h12v4',               iconC: '#7DC243' },
  { label: 'Lego Creator Set',   price: 'FREE',        cond: 'Very Good', bg: 'linear-gradient(135deg,#EAF4FF,#C8DFFF)', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', iconC: '#1565C0' },
];

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

const TRUST_STATS = [
  { value: 'KSh 99',  label: 'to list any item',       icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { value: 'Free',    label: 'to browse everything',    icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z' },
  { value: 'Direct',  label: 'WhatsApp to sellers',     icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { value: 'Nairobi', label: 'parent community',        icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm10 10v-2a4 4 0 00-3-3.87' },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* ── Nav ─────────────────────────────────────────── */}
      <Nav />

      {/* ── Hero ────────────────────────────────────────── */}
      <section style={{
        background: 'var(--bg, #FFFDF9)',
        paddingTop: 72,
        paddingBottom: 64,
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 48,
            alignItems: 'center',
          }}>
            {/* Left: headline + search */}
            <div style={{ maxWidth: 620 }}>
              <h1 style={{
                font: '900 clamp(42px,6vw,68px)/1.05 Outfit,sans-serif',
                margin: '0 0 28px',
                color: 'var(--text-1)',
                letterSpacing: '-0.03em',
              }}>
                Shop smart.<br />
                <span style={{ color: 'var(--orange, #F07828)' }}>Kids grow fast.</span>
              </h1>
              <p style={{
                font: '500 17px/1.6 Outfit,sans-serif',
                color: 'var(--text-3)',
                margin: '0 0 36px',
              }}>
                Find quality gently-used kids gear from Nairobi parents. Bikes, strollers, car seats, toys and more - for a fraction of the original price.
              </p>

              {/* Search bar */}
              <form
                action="/"
                method="GET"
                role="search"
                style={{
                  display: 'flex',
                  gap: 0,
                  border: '2.5px solid var(--text-1, #1A1A1A)',
                  borderRadius: 12,
                  boxShadow: '5px 5px 0 var(--text-1, #1A1A1A)',
                  overflow: 'hidden',
                  background: '#fff',
                }}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: 16, gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="var(--text-3, #999)" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0 }} aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    name="q"
                    type="search"
                    placeholder="Search bikes, strollers, toys..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      font: '500 16px Outfit,sans-serif',
                      color: 'var(--text-1)',
                      background: 'transparent',
                      padding: '16px 0',
                    }}
                    aria-label="Search listings"
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '0 28px',
                    background: 'var(--orange, #F07828)',
                    color: '#fff',
                    border: 'none',
                    font: '700 15px Outfit,sans-serif',
                    cursor: 'pointer',
                    letterSpacing: '.01em',
                    flexShrink: 0,
                  }}
                >
                  Search
                </button>
              </form>

              {/* Quick links */}
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                {['Bikes', 'Strollers', 'Car Seats', 'Toys', 'Books'].map(q => (
                  <Link
                    key={q}
                    href={`/?q=${q.toLowerCase()}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '5px 13px',
                      background: '#fff',
                      border: '1.5px solid var(--border)',
                      borderRadius: 999,
                      font: '500 12px Outfit,sans-serif',
                      color: 'var(--text-2)',
                      textDecoration: 'none',
                      transition: 'border-color .15s, color .15s',
                    }}
                  >
                    {q}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: floating product cards (decorative, hidden on mobile) */}
            <div
              className="hero-cards"
              aria-hidden="true"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                flexShrink: 0,
              }}
            >
              {SAMPLE_CARDS.map((card, i) => (
                <div
                  key={card.label}
                  style={{
                    width: 200,
                    padding: '14px 16px',
                    background: card.bg,
                    borderRadius: 14,
                    border: '1.5px solid rgba(0,0,0,.07)',
                    transform: i === 1 ? 'translateX(16px)' : 'none',
                    boxShadow: '0 2px 12px rgba(0,0,0,.07)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 32, height: 32,
                      background: 'rgba(255,255,255,.7)',
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke={card.iconC} strokeWidth="1.75"
                        strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d={card.icon}/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ font: '600 11px Outfit,sans-serif', color: '#1A1A1A', lineHeight: 1.3 }}>{card.label}</div>
                      <div style={{ font: '400 10px Outfit,sans-serif', color: '#888' }}>{card.cond}</div>
                    </div>
                  </div>
                  <div style={{
                    font: '700 15px Outfit,sans-serif',
                    color: card.price === 'FREE' ? '#7DC243' : '#F07828',
                  }}>
                    {card.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Category strip ───────────────────────────────── */}
      <section style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{
          display: 'flex',
          gap: 4,
          padding: '12px 20px',
          minWidth: 'max-content',
        }}>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={cat.id === 'all' ? '/' : `/?cat=${cat.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 16px',
                borderRadius: 999,
                border: '1.5px solid var(--border)',
                background: '#fff',
                font: '600 13px Outfit,sans-serif',
                color: 'var(--text-2)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all .15s',
                flexShrink: 0,
              }}
              className="cat-chip"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="var(--orange, #F07828)" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={cat.icon}/>
              </svg>
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

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

      {/* ── Trust stats ──────────────────────────────────── */}
      <section style={{
        padding: '60px 0',
        background: 'var(--bg, #FFFDF9)',
        borderTop: '1px solid var(--border)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 1,
            border: '1.5px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'var(--border)',
          }}>
            {TRUST_STATS.map((stat) => (
              <div
                key={stat.value}
                style={{
                  padding: '32px 24px',
                  background: '#fff',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{
                  width: 44, height: 44,
                  background: '#FFF3EB',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="var(--orange, #F07828)" strokeWidth="1.75"
                    strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={stat.icon}/>
                  </svg>
                </div>
                <div style={{
                  font: '800 26px/1 Outfit,sans-serif',
                  color: 'var(--text-1)',
                  letterSpacing: '-.02em',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  font: '500 13px Outfit,sans-serif',
                  color: 'var(--text-3)',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
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

      {/* ── Page-scoped styles ───────────────────────────── */}
      <style>{`
        .hero-cards {
          display: flex;
        }
        @media (max-width: 768px) {
          .hero-cards { display: none !important; }
          section > .container > div[style*="grid-template-columns: 1fr auto"] {
            grid-template-columns: 1fr !important;
          }
        }
        .cat-chip:hover {
          border-color: var(--orange, #F07828);
          color: var(--orange, #F07828);
          background: #FFF3EB;
        }
        a[href*="/?cat="]:hover,
        a[href="/"]:hover {
          text-decoration: none;
        }
      `}</style>
    </>
  );
}
