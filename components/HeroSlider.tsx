'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import HeroSearch from './HeroSearch';

/* ── Slide definitions ─────────────────────────────── */
const SLIDES = [
  {
    id: 'bikes',
    image: '/images/hero/bikes.jpg',
    imgPos: '55% center',
    badge: 'Bikes & Scooters',
    line1: 'Get moving.',
    line2: 'Big savings on bikes.',
    sub: 'Quality second-hand bikes, scooters and helmets from Nairobi families. Up to 70% off retail.',
    cards: [
      {
        label: 'Trek Kids Bike 20"',
        price: 'KSh 8,500',
        cond: 'Like New',
        bg: 'linear-gradient(135deg,#FFF3EB,#FFE0C8)',
        icon: 'M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM12 17v-5l-3-3 4-4 3 3h3',
        iconC: '#F07828',
      },
      {
        label: 'Micro Scooter Red',
        price: 'KSh 3,200',
        cond: 'Good',
        bg: 'linear-gradient(135deg,#F0FAE5,#DCEFC0)',
        icon: 'M5 17a2 2 0 100-4 2 2 0 000 4zM17 5v8M12 5h9M12 5v8h5',
        iconC: '#7DC243',
      },
      {
        label: 'Kids Helmet Set',
        price: 'KSh 1,500',
        cond: 'Like New',
        bg: 'linear-gradient(135deg,#EAF4FF,#C8DFFF)',
        icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
        iconC: '#1565C0',
      },
    ],
  },
  {
    id: 'car-seats',
    image: '/images/hero/car-seat.jpg',
    imgPos: '60% center',
    badge: 'Car Seats & Safety',
    line1: 'Safety first.',
    line2: 'Spend less on car seats.',
    sub: 'Certified, gently-used car seats from trusted Nairobi parents. Inspect before you buy, every time.',
    cards: [
      {
        label: 'Graco 4Ever Seat',
        price: 'KSh 15,000',
        cond: 'Good',
        bg: 'linear-gradient(135deg,#FFF3EB,#FFE0C8)',
        icon: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-2 10a2 2 0 002 2h4a2 2 0 002-2V9a2 2 0 00-2-2h-4a2 2 0 00-2 2v8zm4-6h2',
        iconC: '#F07828',
      },
      {
        label: 'Chicco KeyFit 30',
        price: 'KSh 12,000',
        cond: 'Like New',
        bg: 'linear-gradient(135deg,#F0FAE5,#DCEFC0)',
        icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
        iconC: '#7DC243',
      },
      {
        label: 'Mamas & Papas',
        price: 'KSh 8,500',
        cond: 'Very Good',
        bg: 'linear-gradient(135deg,#EAF4FF,#C8DFFF)',
        icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
        iconC: '#1565C0',
      },
    ],
  },
  {
    id: 'playpens',
    image: '/images/hero/playpen.jpg',
    imgPos: '58% center',
    badge: 'Playpens & Baby Gear',
    line1: 'Room to grow.',
    line2: 'Deals you will love.',
    sub: 'Baby bouncers, playpens, cots and activity gyms from Nairobi parents. Grab quality gear for less.',
    cards: [
      {
        label: 'BabyBjorn Playpen',
        price: 'KSh 18,000',
        cond: 'Good',
        bg: 'linear-gradient(135deg,#FFF3EB,#FFE0C8)',
        icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
        iconC: '#F07828',
      },
      {
        label: 'Fisher-Price Gym',
        price: 'KSh 4,500',
        cond: 'Like New',
        bg: 'linear-gradient(135deg,#F0FAE5,#DCEFC0)',
        icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
        iconC: '#7DC243',
      },
      {
        label: 'Lego Duplo Farm',
        price: 'FREE',
        cond: 'Very Good',
        bg: 'linear-gradient(135deg,#EAF4FF,#C8DFFF)',
        icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 014 4.5v15z',
        iconC: '#1565C0',
      },
    ],
  },
];

const TRUST_SIGNALS = [
  { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Free to browse' },
  { icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z', text: 'Direct WhatsApp' },
  { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', text: 'KSh 99 to sell' },
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(i => (i + 1) % SLIDES.length);
    }, 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const goTo = (i: number) => { setActive(i); resetTimer(); };
  const slide = SLIDES[active];

  return (
    <section
      style={{
        position: 'relative',
        height: 'calc(100svh - 64px)',
        minHeight: 480,
        maxHeight: 860,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Background images - crossfade independently */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${s.image})`,
            backgroundSize: 'cover',
            backgroundPosition: s.imgPos,
            backgroundRepeat: 'no-repeat',
            opacity: i === active ? 1 : 0,
            transition: 'opacity 1s ease',
            zIndex: 0,
          }}
        />
      ))}

      {/* Soft dark overlay - left heavier for text legibility, right lighter for the image */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(100deg, rgba(0,0,0,.62) 0%, rgba(0,0,0,.52) 50%, rgba(0,0,0,.28) 100%)',
        zIndex: 1,
      }}/>

      {/* Main content */}
      <div className="container" style={{ position: 'relative', zIndex: 3, width: '100%', paddingTop: 32, paddingBottom: 32 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 56,
          alignItems: 'center',
        }}>

          {/* ── Left column ───────────────────────────── */}
          <div style={{ maxWidth: 580 }}>

            {/* Slide-specific text - remounts on change to trigger animation */}
            <div key={active} style={{ animation: 'heroFadeSlide .55s cubic-bezier(.22,.68,0,1.2)' }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '5px 14px 5px 8px',
                background: 'rgba(255,255,255,.12)',
                border: '1.5px solid rgba(255,255,255,.28)',
                borderRadius: 999,
                marginBottom: 20,
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                  background: '#7DC243',
                  boxShadow: '0 0 0 3px rgba(125,194,67,.35)',
                  animation: 'heroPulse 2s ease-in-out infinite',
                }}/>
                <span style={{ font: '600 12px Outfit,sans-serif', color: '#fff', letterSpacing: '.01em' }}>
                  {slide.badge}
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                font: '900 clamp(36px,6vw,68px)/1.05 Outfit,sans-serif',
                margin: '0 0 16px',
                color: '#fff',
                letterSpacing: '-0.03em',
                textShadow: '0 2px 20px rgba(0,0,0,.3)',
              }}>
                {slide.line1}<br/>
                <span style={{ color: '#FFAD6B', position: 'relative', display: 'inline-block' }}>
                  {slide.line2}
                  <svg
                    aria-hidden="true"
                    style={{ position: 'absolute', bottom: -4, left: 0, width: '100%', height: 10 }}
                    viewBox="0 0 200 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,5 Q25,0 50,5 Q75,10 100,5 Q125,0 150,5 Q175,10 200,5"
                      fill="none" stroke="#FFAD6B" strokeWidth="2.5" strokeLinecap="round" opacity=".6"
                    />
                  </svg>
                </span>
              </h1>

              {/* Subtext */}
              <p style={{
                font: '500 16px/1.6 Outfit,sans-serif',
                color: 'rgba(255,255,255,.82)',
                margin: '0 0 28px',
                maxWidth: 480,
                textShadow: '0 1px 8px rgba(0,0,0,.3)',
              }}>
                {slide.sub}
              </p>
            </div>

            {/* Fixed across slides: search bar */}
            <HeroSearch />

            {/* Fixed: Trust signals */}
            <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
              {TRUST_SIGNALS.map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#7DC243" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={item.icon}/>
                  </svg>
                  <span style={{ font: '500 13px Outfit,sans-serif', color: 'rgba(255,255,255,.8)' }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Dot navigation */}
            <div role="tablist" aria-label="Hero slides" style={{ display: 'flex', gap: 8, marginTop: 28, alignItems: 'center' }}>
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  onClick={() => goTo(i)}
                  aria-label={s.badge}
                  aria-selected={i === active}
                  style={{
                    width: i === active ? 28 : 8,
                    height: 8,
                    borderRadius: 999,
                    background: i === active ? '#F07828' : 'rgba(255,255,255,.35)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width .35s ease, background .35s ease',
                  }}
                />
              ))}
              {/* Prev / Next arrows */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {[-1, 1].map(dir => (
                  <button
                    key={dir}
                    onClick={() => goTo((active + dir + SLIDES.length) % SLIDES.length)}
                    aria-label={dir === -1 ? 'Previous slide' : 'Next slide'}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(255,255,255,.18)',
                      border: '1.5px solid rgba(255,255,255,.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points={dir === -1 ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column: slide-specific floating cards ── */}
          <div
            key={`cards-${active}`}
            className="hero-cards"
            aria-hidden="true"
            style={{
              display: 'flex', flexDirection: 'column', gap: 14,
              animation: 'heroFadeSlide .6s cubic-bezier(.22,.68,0,1.2)',
            }}
          >
            {slide.cards.map((card, ci) => (
              <div
                key={card.label}
                className={`hero-float-card hero-float-${ci}`}
                style={{
                  width: 215, padding: '16px 18px',
                  background: card.bg,
                  borderRadius: 18,
                  border: '1.5px solid rgba(255,255,255,.8)',
                  transform: ci === 1 ? 'translateX(20px)' : 'none',
                  boxShadow: '0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 38, height: 38,
                    background: 'rgba(255,255,255,.75)', borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,.08)',
                  }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                      stroke={card.iconC} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <path d={card.icon}/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ font: '600 12px Outfit,sans-serif', color: '#1A1A1A', lineHeight: 1.3 }}>{card.label}</div>
                    <div style={{ font: '400 11px Outfit,sans-serif', color: '#777', marginTop: 2 }}>{card.cond}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    font: '800 16px Outfit,sans-serif',
                    color: card.price === 'FREE' ? '#7DC243' : '#F07828',
                  }}>
                    {card.price}
                  </div>
                  <div style={{
                    padding: '3px 10px',
                    background: 'rgba(255,255,255,.65)',
                    borderRadius: 999,
                    font: '600 10px Outfit,sans-serif',
                    color: '#555',
                  }}>
                    Available
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroFadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes floatAlt {
          0%, 100% { transform: translateX(20px) translateY(0px); }
          50%       { transform: translateX(20px) translateY(-8px); }
        }
        @keyframes heroPulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(125,194,67,.25); }
          50%       { box-shadow: 0 0 0 6px rgba(125,194,67,.12); }
        }
        .hero-float-0 { animation: float 4.5s ease-in-out infinite; }
        .hero-float-1 { animation: floatAlt 5.2s ease-in-out infinite .8s; }
        .hero-float-2 { animation: float 3.8s ease-in-out infinite 1.4s; }
        .hero-cards { display: flex; }
        @media (max-width: 860px) {
          .hero-cards { display: none !important; }
        }
      `}</style>
    </section>
  );
}
