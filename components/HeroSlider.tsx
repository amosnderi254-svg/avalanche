'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    id: 0,
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=80',
    fallback: '#1a3d2b',
    tag: 'Bikes and scooters',
    h1a: 'Your child outgrew it.',
    h1b: 'Another family needs it.',
    sub: 'List your kid\'s bike, scooter or skateboard today. Cash on handover, Nairobi-wide.',
    cta:  { label: 'List yours for KES 99', href: '/sell' },
    alt:  { label: 'Browse bikes', href: '/?cat=bikes' },
  },
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=1400&q=80',
    fallback: '#1a2a40',
    tag: 'Baby gear',
    h1a: 'Strollers, car seats',
    h1b: 'at prices that make sense.',
    sub: 'Quality baby gear from Nairobi families who have been exactly where you are.',
    cta:  { label: 'Find baby gear', href: '/?cat=baby-gear' },
    alt:  { label: 'Sell yours', href: '/sell' },
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1400&q=80',
    fallback: '#2a1a40',
    tag: 'Toys, books and games',
    h1a: 'Still in great shape.',
    h1b: 'Should be in a child\'s hands.',
    sub: 'Toys and books with plenty of life left. Listed by parents, priced for parents.',
    cta:  { label: 'Browse toys and books', href: '/?cat=toys' },
    alt:  { label: 'Sell yours', href: '/sell' },
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
      setAnimKey(k => k + 1);
    }, 5500);
  }

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goTo(idx: number) {
    if (idx === current) return;
    setCurrent(idx);
    setAnimKey(k => k + 1);
    resetTimer();
  }

  const s = SLIDES[current];

  return (
    <section style={{ position: 'relative', height: 540, overflow: 'hidden' }}>

      {/* Slide backgrounds */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== current}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${slide.img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            backgroundColor: slide.fallback,
            opacity: i === current ? 1 : 0,
            transition: 'opacity .75s ease',
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.46) 55%, rgba(0,0,0,.18) 100%)',
        zIndex: 1,
      }}/>

      {/* Slide content */}
      <div className="container" style={{
        position: 'relative', zIndex: 2,
        height: '100%',
        display: 'flex', alignItems: 'center',
        paddingBottom: 60,
      }}>
        <div key={animKey} className="slider-content" style={{ maxWidth: 580 }}>

          {/* Category pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,.1)',
            border: '1px solid rgba(255,255,255,.18)',
            borderRadius: 'var(--r-pill)',
            padding: '6px 16px', marginBottom: 22,
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', display: 'inline-block', flexShrink: 0 }}/>
            <span style={{ font: '600 11px Outfit,sans-serif', color: 'rgba(255,255,255,.88)', textTransform: 'uppercase', letterSpacing: '.09em' }}>
              {s.tag}
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-h1" style={{
            margin: '0 0 18px',
            color: '#fff',
            fontFamily: 'Outfit,sans-serif',
            textShadow: '0 2px 20px rgba(0,0,0,.35)',
          }}>
            {s.h1a}<br/>
            <span style={{ color: '#ffa654' }}>{s.h1b}</span>
          </h1>

          {/* Sub */}
          <p className="hero-subtitle" style={{
            color: 'rgba(255,255,255,.82)',
            fontFamily: 'Outfit,sans-serif',
            margin: '0 0 34px',
            maxWidth: 480,
            fontWeight: 400,
          }}>
            {s.sub}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={s.cta.href} className="btn btn-primary btn-lg">
              {s.cta.label}
            </Link>
            <Link
              href={s.alt.href}
              style={{
                display: 'inline-flex', alignItems: 'center',
                height: 52, padding: '0 24px',
                borderRadius: 'var(--r-pill)',
                border: '1.5px solid rgba(255,255,255,.38)',
                font: '600 15px Outfit,sans-serif',
                color: '#fff', textDecoration: 'none',
                background: 'rgba(255,255,255,.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {s.alt.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Dot nav */}
      <div style={{
        position: 'absolute', bottom: 22, left: '50%',
        transform: 'translateX(-50%)', zIndex: 3,
        display: 'flex', gap: 7,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === current ? 28 : 8, height: 8,
              borderRadius: 'var(--r-pill)',
              background: i === current ? '#fff' : 'rgba(255,255,255,.38)',
              border: 'none', padding: 0, cursor: 'pointer',
              transition: 'all .35s ease',
            }}
          />
        ))}
      </div>

      {/* Arrow prev */}
      <button
        onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Previous slide"
        style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          zIndex: 3, width: 42, height: 42, borderRadius: '50%',
          background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      {/* Arrow next */}
      <button
        onClick={() => goTo((current + 1) % SLIDES.length)}
        aria-label="Next slide"
        style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          zIndex: 3, width: 42, height: 42, borderRadius: '50%',
          background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <style>{`
        .slider-content {
          animation: sliderFadeUp .5s ease both;
        }
        @keyframes sliderFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
