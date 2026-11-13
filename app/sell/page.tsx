import { Suspense } from 'react';
import Nav from '@/components/Nav';
import HeroSlider from '@/components/HeroSlider';
import ActivityTicker from '@/components/ActivityTicker';
import AgeFilter from '@/components/AgeFilter';
import NeighborhoodStrip from '@/components/NeighborhoodStrip';
import NayaChat from '@/components/NayaChat';
import ListingsPage from '@/components/ListingsPage';
import Link from 'next/link';
import Footer from '@/components/Footer';

/* ── Trending categories ─────────────────────────────────────── */
const TRENDING = [
  { slug: 'bikes',    label: 'Bikes',       count: 24, icon: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0' },
  { slug: 'strollers',label: 'Strollers',   count: 18, icon: 'M4 16s-1-2 0-2h16s1 2 0 2M6 20h12M2 8h20M6 8V4h12v4' },
  { slug: 'car-seats',label: 'Car seats',   count: 12, icon: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3' },
  { slug: 'toys',     label: 'Toys',        count: 31, icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { slug: 'books',    label: 'Books',       count: 22, icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 014 4.5v15z' },
  { slug: 'baby-gear',label: 'Baby gear',   count: 15, icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { slug: 'clothes',  label: 'Clothes',     count: 28, icon: 'M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z' },
  { slug: 'shoes',    label: 'Shoes',       count: 19, icon: 'M22 11.5A6.5 6.5 0 0015.5 5h-3L6 7.5V14l3-1 2 3h3.5A6.5 6.5 0 0022 11.5z' },
];

/* ── Seller earnings proof ───────────────────────────────────── */
const EARNINGS = [
  {
    name:     'Janet K.',
    area:     'Karen',
    amount:   'KES 8,500',
    quote:    'Listed Thursday, sold Saturday. The money paid for two months of swimming lessons.',
    items:    'Stroller, car seat, bouncer',
    color:    '#fff4ec',
    accent:   'var(--orange)',
  },
  {
    name:     'David M.',
    area:     'Runda',
    amount:   'KES 14,200',
    quote:    'Cleared the whole shed in one weekend. That money is in school fees savings now.',
    items:    'Four bikes and two scooters',
    color:    '#edf7e2',
    accent:   'var(--green)',
  },
  {
    name:     'Wanjiku N.',
    area:     'Kilimani',
    amount:   'KES 3,500',
    quote:    'Things I thought nobody would want. Parents came from across town for them.',
    items:    'Books, toys, baby rocker',
    color:    '#e8f4fd',
    accent:   '#1565C0',
  },
];

/* ── Safe buying guide ───────────────────────────────────────── */
const SAFE_GUIDE = [
  {
    category: 'Car seats',
    icon: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-2 10a2 2 0 002 2h4a2 2 0 002-2V9a2 2 0 00-2-2h-4a2 2 0 00-2 2v8zm4-6h2',
    checks: [
      'Check the manufacture date stamp on the base - no older than 6 years',
      'Ask the seller directly: has this seat ever been in an accident',
      'Confirm all parts are original - no missing chest clips, no restrung harness',
      'Test the LATCH connectors and base level indicator before you pay',
    ],
    warning: 'Never buy a car seat if the seller cannot confirm its accident history.',
  },
  {
    category: 'Cots and cribs',
    icon: 'M2 4h20v12H2zM2 16v4M22 16v4M6 20h12',
    checks: [
      'Slat spacing must be under 60mm - run a 500ml bottle between them to check',
      'Look underneath for cracks along the base boards or corner joints',
      'Confirm the mattress is new or in excellent condition - never use a soft or second-hand mattress',
      'Check that drop-side cribs have been permanently fixed - drop-sides are banned',
    ],
    warning: 'A mattress that shows dents or discolouration belongs in the bin, not on your baby.',
  },
  {
    category: 'Strollers',
    icon: 'M4 16s-1-2 0-2h16s1 2 0 2M6 20h12M2 8h20M6 8V4h12v4',
    checks: [
      'Test every fold and unfold three times - latches should click firmly',
      'Inspect wheel hubs for cracks and check the brake engages cleanly',
      'Sit the seat upright and check the safety harness buckle releases under pressure',
      'Confirm the frame is not bent at the pivot points from a past collision',
    ],
    warning: 'If the fold mechanism feels stiff or skips, it may collapse without warning.',
  },
  {
    category: 'Baby monitors',
    icon: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v3z',
    checks: [
      'Factory reset the unit and pair it fresh to your own phone or receiver',
      'Test range throughout your home before handing over payment',
      'Check that night vision is clear at 2 to 3 metres - not washed out or grainy',
      'Video monitors: confirm encryption is enabled in the app settings',
    ],
    warning: 'Change the monitor password on day one - old settings keep prior owners linked.',
  },
];

/* ── Earning potential items ─────────────────────────────────── */
const EARN_ITEMS = [
  { label: 'Balance bike',     range: 'KES 2,500 to 5,000',  icon: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0' },
  { label: 'Car seat',         range: 'KES 3,500 to 8,000',  icon: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3' },
  { label: 'Stroller',         range: 'KES 4,000 to 12,000', icon: 'M4 16s-1-2 0-2h16s1 2 0 2M6 20h12M2 8h20M6 8V4h12v4' },
  { label: 'Baby bouncer',     range: 'KES 1,500 to 3,500',  icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { label: 'Books (10 set)',   range: 'KES 500 to 2,000',    icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 014 4.5v15z' },
  { label: 'Toy lot',          range: 'KES 800 to 3,000',    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { label: 'Kids scooter',     range: 'KES 1,800 to 4,500',  icon: 'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3' },
  { label: 'Kids clothes (5)', range: 'KES 600 to 2,000',    icon: 'M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z' },
];

export default function Home() {
  return (
    <>
      {/* 1. Navigation */}
      <Nav/>

      {/* 2. Hero slider */}
      <HeroSlider/>

      {/* 3. Live activity ticker */}
      <ActivityTicker/>

      {/* 4. Stats bar */}
      <div style={{ background: 'var(--text-1)', padding: '22px 0' }}>
        <div className="container">
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            flexWrap: 'wrap', gap: '12px 0',
          }}>
            {[
              { value: 'KES 99',   label: 'to list any item'  },
              { value: 'Free',     label: 'to browse'          },
              { value: 'Nairobi',  label: 'based community'    },
              { value: 'WhatsApp', label: 'direct to sellers'  },
            ].map(({ value, label }, i) => (
              <div key={value} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && (
                  <span
                    className="stat-sep"
                    aria-hidden="true"
                    style={{ width: 1, height: 32, background: 'rgba(255,255,255,.12)', margin: '0 24px', flexShrink: 0 }}
                  />
                )}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ font: '700 18px Outfit,sans-serif', color: '#fff' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Age / stage filter */}
      <Suspense fallback={<div style={{ height: 80, background: '#fff', borderBottom: '1px solid var(--border)' }}/>}>
        <AgeFilter/>
      </Suspense>

      {/* 6. Trending categories */}
      <section style={{ padding: '36px 0 40px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <h2 style={{ font: '700 20px Outfit,sans-serif', color: 'var(--text-1)', margin: 0 }}>
              What parents are buying right now
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 10,
          }}>
            {TRENDING.map(cat => (
              <Link
                key={cat.slug}
                href={`/?cat=${cat.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="trending-card"
                  style={{
                    padding: '16px 14px',
                    borderRadius: 'var(--r-md)',
                    border: '1.5px solid var(--border)',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 'var(--r-sm)',
                      background: '#fff4ec',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="var(--orange)" strokeWidth="1.75"
                      strokeLinecap="round" strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={cat.icon}/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-1)', marginBottom: 2 }}>
                      {cat.label}
                    </div>
                    <div style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)' }}>
                      {cat.count} listings
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Listings grid */}
      <div id="listings">
        <Suspense fallback={
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="spinner" style={{ margin: '0 auto' }}/>
          </div>
        }>
          <ListingsPage/>
        </Suspense>
      </div>

      {/* 8. Seller earnings proof */}
      <section style={{ padding: '64px 0', background: '#fafaf8', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ font: '600 11px Outfit,sans-serif', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '.09em', margin: '0 0 10px' }}>
              Real parents. Real money.
            </p>
            <h2 style={{ font: '700 30px/1.2 Outfit,sans-serif', margin: 0, color: 'var(--text-1)' }}>
              That thing in your storage is worth real money
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {EARNINGS.map(e => (
              <div
                key={e.name}
                style={{
                  background: '#fff',
                  borderRadius: 'var(--r-lg)',
                  border: '1.5px solid var(--border)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Amount pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    background: e.color,
                    borderRadius: 'var(--r-pill)',
                    alignSelf: 'flex-start',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={e.accent} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                  >
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                  </svg>
                  <span style={{ font: '700 15px Outfit,sans-serif', color: e.accent }}>
                    {e.amount} earned
                  </span>
                </div>

                {/* Quote */}
                <p style={{
                  font: '400 14px/1.7 Outfit,sans-serif',
                  color: 'var(--text-2)',
                  margin: 0,
                  fontStyle: 'italic',
                }}>
                  "{e.quote}"
                </p>

                {/* Attribution */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-1)', marginBottom: 2 }}>
                    {e.name}, {e.area}
                  </div>
                  <div style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)' }}>
                    Sold: {e.items}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/sell" className="btn btn-primary btn-lg">
              List my first item
            </Link>
            <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: '12px 0 0' }}>
              KES 99 per listing. No subscription needed.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Safe buying guide */}
      <section style={{ padding: '64px 0', background: '#fff', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ font: '600 11px Outfit,sans-serif', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.09em', margin: '0 0 10px' }}>
              Buy safely
            </p>
            <h2 style={{ font: '700 30px/1.2 Outfit,sans-serif', margin: '0 0 6px', color: 'var(--text-1)' }}>
              What to check before you hand over money
            </h2>
            <p style={{ font: '500 15px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
              Quick checks before you pay.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {SAFE_GUIDE.map(guide => (
              <div
                key={guide.category}
                style={{
                  borderRadius: 'var(--r-lg)',
                  border: '1.5px solid var(--border)',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '18px 20px',
                    background: '#edf7e2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 'var(--r-sm)',
                      background: 'rgba(125,194,67,.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="var(--green)" strokeWidth="1.75"
                      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                    >
                      <path d={guide.icon}/>
                    </svg>
                  </div>
                  <h3 style={{ font: '700 15px Outfit,sans-serif', color: 'var(--text-1)', margin: 0 }}>
                    {guide.category}
                  </h3>
                </div>

                {/* Checklist */}
                <div style={{ padding: '18px 20px', background: '#fff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                    {guide.checks.map((check, ci) => (
                      <div key={ci} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div
                          style={{
                            width: 18, height: 18, borderRadius: 4,
                            background: '#edf7e2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: 1,
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2 6l3 3 5-5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span style={{ font: '400 13px/1.55 Outfit,sans-serif', color: 'var(--text-2)' }}>
                          {check}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Warning */}
                  <div
                    style={{
                      padding: '10px 12px',
                      background: '#fff9f0',
                      borderRadius: 'var(--r-sm)',
                      border: '1px solid #ffe4c4',
                      display: 'flex',
                      gap: 8,
                      alignItems: 'flex-start',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="var(--orange)" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span style={{ font: '400 12px/1.5 Outfit,sans-serif', color: '#c05000' }}>
                      {guide.warning}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Earning potential / storage memory trigger */}
      <section style={{ padding: '64px 0', background: 'var(--text-1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ font: '600 11px Outfit,sans-serif', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '.09em', margin: '0 0 10px' }}>
              What is sitting in your store room?
            </p>
            <h2 style={{ font: '700 30px/1.2 Outfit,sans-serif', margin: 0, color: '#fff' }}>
              Check what your stored items are worth
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 10,
            marginBottom: 40,
          }}>
            {EARN_ITEMS.map(item => (
              <div
                key={item.label}
                style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,.06)',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid rgba(255,255,255,.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="var(--orange)" strokeWidth="1.75"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <path d={item.icon}/>
                </svg>
                <div style={{ font: '500 13px Outfit,sans-serif', color: '#fff', lineHeight: 1.4 }}>
                  {item.label}
                </div>
                <div style={{ font: '600 13px Outfit,sans-serif', color: 'var(--orange)' }}>
                  {item.range}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/sell" className="btn btn-primary btn-lg">
              Turn those items into cash
            </Link>
            <p style={{ font: '400 12px Outfit,sans-serif', color: 'rgba(255,255,255,.35)', margin: '12px 0 0' }}>
              Your listing goes live in under five minutes.
            </p>
          </div>
        </div>
      </section>

      {/* 11. How it works */}
      <section style={{ padding: '64px 0', background: '#fafaf8', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ font: '600 12px Outfit,sans-serif', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '.09em', margin: '0 0 10px' }}>
              Simple process
            </p>
            <h2 style={{ font: '700 30px/1.2 Outfit,sans-serif', margin: 0, color: 'var(--text-1)' }}>
              It really is this simple.
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
          }}>
            {/* Step 1 */}
            <div className="how-card card" style={{ padding: '32px 28px', position: 'relative' }}>
              <span aria-hidden="true" style={{ position: 'absolute', top: 20, right: 24, font: '700 36px/1 Outfit,sans-serif', color: '#ececec', letterSpacing: '-.03em', userSelect: 'none' }}>01</span>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--r-md)', background: '#FFF0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.75" aria-hidden="true">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <h3 style={{ font: '700 17px Outfit,sans-serif', margin: '0 0 10px', color: 'var(--text-1)' }}>Post your item</h3>
              <p style={{ font: '400 14px/1.65 Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                Take a few photos, write a short description and set your price. For KES 99 your listing goes live in under five minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="how-card card" style={{ padding: '32px 28px', position: 'relative' }}>
              <span aria-hidden="true" style={{ position: 'absolute', top: 20, right: 24, font: '700 36px/1 Outfit,sans-serif', color: '#ececec', letterSpacing: '-.03em', userSelect: 'none' }}>02</span>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--r-md)', background: '#EDF7E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.75" aria-hidden="true">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <h3 style={{ font: '700 17px Outfit,sans-serif', margin: '0 0 10px', color: 'var(--text-1)' }}>Buyers come to you</h3>
              <p style={{ font: '400 14px/1.65 Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                Interested parents message you directly on WhatsApp. You pick who you sell to. No middleman anywhere near it.
              </p>
            </div>

            {/* Step 3 */}
            <div className="how-card card" style={{ padding: '32px 28px', position: 'relative' }}>
              <span aria-hidden="true" style={{ position: 'absolute', top: 20, right: 24, font: '700 36px/1 Outfit,sans-serif', color: '#ececec', letterSpacing: '-.03em', userSelect: 'none' }}>03</span>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--r-md)', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="1.75" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 style={{ font: '700 17px Outfit,sans-serif', margin: '0 0 10px', color: 'var(--text-1)' }}>Meet and hand over</h3>
              <p style={{ font: '400 14px/1.65 Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                Agree on a safe spot in Nairobi, hand over the item and collect your cash. Quick, clean and local.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <Link href="/sell" className="btn btn-primary">
              Start selling
            </Link>
          </div>
        </div>
      </section>

      {/* 12. Nairobi neighbourhood strip */}
      <Suspense fallback={<div style={{ height: 120, background: '#f9fafb', borderTop: '1px solid var(--border)' }}/>}>
        <NeighborhoodStrip/>
      </Suspense>

      {/* 13. CTA block */}
      <section
        style={{
          padding: '72px 0',
          background: 'linear-gradient(135deg, #fff4ec 0%, #edf7e2 100%)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <div
            style={{
              maxWidth: 640,
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                font: '700 34px/1.15 Outfit,sans-serif',
                color: 'var(--text-1)',
                margin: '0 0 16px',
                letterSpacing: '-.02em',
              }}
            >
              Nairobi parents are already here. Join them.
            </h2>
            <p
              style={{
                font: '600 16px Outfit,sans-serif',
                color: 'var(--text-2)',
                margin: '0 0 36px',
              }}
            >
              Five minutes to list. Nairobi-wide reach.
            </p>
            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link href="/sell" className="btn btn-primary btn-lg">
                Post an item for KES 99
              </Link>
              <Link href="/" className="btn btn-secondary btn-lg">
                Browse listings
              </Link>
            </div>
            <p
              style={{
                font: '400 12px Outfit,sans-serif',
                color: 'var(--text-3)',
                margin: '20px 0 0',
              }}
            >
              No subscription. No account required to browse.
            </p>
          </div>
        </div>
      </section>

      {/* Chat assistant */}
      <NayaChat/>

      <Footer/>
    </>
  );
}
