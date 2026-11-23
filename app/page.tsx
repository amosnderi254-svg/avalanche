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

      {/* ── Promo banner (above nav) ─────────────────── */}
      <PromoBanner />

      {/* ── Nav ─────────────────────────────────────────── */}
      <Nav />

      {/* ── Hero slider ─────────────────────────────────── */}
      <HeroSlider />

      {/* ── Live stat strip (Feature 8 — minimal) ─────────── */}
      <ActivityRail />

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

      {/* ── Floating audio player (bottom-left) ─────────── */}
      <AudioPlayer />

    </>
  );
}
