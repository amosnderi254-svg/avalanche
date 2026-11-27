'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface EarningsData {
  total: number;
  count: number;
  period: string;
  period_label: string;
  by_category: Record<string, { total: number; count: number }>;
}

const CAT_LABELS: Record<string, string> = {
  bikes:     'Bikes',
  strollers: 'Strollers',
  shoes:     'Shoes',
  toys:      'Toys',
  books:     'Books',
  'car-seats': 'Car Seats',
  clothing:  'Clothing',
  'baby-gear': 'Baby Gear',
  other:     'Other',
};

const CAT_COLORS: Record<string, string> = {
  bikes:     '#7DC243',
  strollers: '#F07828',
  shoes:     '#1E88E5',
  toys:      '#AB47BC',
  books:     '#F9A825',
  'car-seats': '#00897B',
  clothing:  '#E91E63',
  'baby-gear': '#FF7043',
  other:     '#90A4AE',
};

function useCountUp(target: number, duration = 1400, trigger: boolean) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger || target === 0) { setValue(target); return; }
    const start = performance.now();
    const from = value;
    const run = (now: number) => {
      const pct = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - pct, 3);
      setValue(Math.round(from + (target - from) * ease));
      if (pct < 1) rafRef.current = requestAnimationFrame(run);
    };
    rafRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, trigger]);

  return value;
}

export default function SellerEarningsSpotlight() {
  const [period, setPeriod]   = useState<'month' | 'all'>('month');
  const [category, setCategory] = useState('all');
  const [data, setData]       = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inView, setInView]   = useState(false);
  const sectionRef            = useRef<HTMLElement>(null);

  // Intersection observer — trigger count-up once
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/public/seller-earnings?period=${period}&category=${category}`);
      if (r.ok) setData(await r.json());
    } catch { /* silent */ }
    setLoading(false);
  }, [period, category]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const animated = useCountUp(data?.total ?? 0, 1600, inView && !loading);

  if (!data && !loading) return null;

  // Top 3 categories from full data (always use 'all' category for breakdown)
  const topCats = Object.entries(data?.by_category ?? {}).slice(0, 4);
  const maxCatTotal = topCats[0]?.[1]?.total ?? 1;

  const PERIODS = [
    { key: 'month', label: 'This Month' },
    { key: 'all',   label: 'All Time' },
  ] as const;

  const ALL_CATS = ['all', ...Object.keys(CAT_LABELS)];

  return (
    <section
      ref={sectionRef}
      aria-label="Seller earnings spotlight"
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2C1810 60%, #1F2A14 100%)',
        padding: '52px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes pulseGlow {
          0%,100% { opacity: 1; transform: scale(1) }
          50%      { opacity: .6; transform: scale(1.15) }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(12px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .earnings-fade { animation: fadeSlideUp .4s ease both; }
        .period-btn { background:rgba(255,255,255,.1); color:rgba(255,255,255,.55); border:1px solid rgba(255,255,255,.12); border-radius:999px; padding:6px 16px; font:600 12px Outfit,sans-serif; cursor:pointer; transition:all .15s; }
        .period-btn:hover { background:rgba(255,255,255,.18); color:#fff; }
        .period-btn.active { background:rgba(240,120,40,.9); border-color:transparent; color:#fff; }
        .cat-pill { background:rgba(255,255,255,.08); color:rgba(255,255,255,.55); border:1px solid rgba(255,255,255,.1); border-radius:999px; padding:5px 13px; font:500 11px Outfit,sans-serif; cursor:pointer; transition:all .15s; white-space:nowrap; }
        .cat-pill:hover { background:rgba(255,255,255,.15); color:#fff; }
        .cat-pill.active { background:rgba(240,120,40,.85); border-color:transparent; color:#fff; }
        .bar-fill { height:100%; border-radius:999px; transition:width .6s cubic-bezier(.4,0,.2,1); }
      `}</style>

      {/* Decorative blobs */}
      <div aria-hidden="true" style={{ position:'absolute', top:-80, left:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(240,120,40,.12) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div aria-hidden="true" style={{ position:'absolute', bottom:-60, right:-40, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(125,194,67,.10) 0%, transparent 70%)', pointerEvents:'none' }}/>

      <div className="container" style={{ position:'relative', zIndex:1 }}>

        {/* Header row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Live pulse */}
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(125,194,67,.2)', border:'1px solid rgba(125,194,67,.3)', borderRadius:999, padding:'4px 10px' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#7DC243', display:'inline-block', animation:'pulseGlow 1.6s infinite' }}/>
              <span style={{ font:'600 10px Outfit,sans-serif', color:'#A8D97A', textTransform:'uppercase', letterSpacing:'.08em' }}>Live data</span>
            </span>
            <h2 style={{ font:'700 16px Outfit,sans-serif', color:'rgba(255,255,255,.65)', margin:0 }}>
              Seller Earnings
            </h2>
          </div>

          {/* Period toggle */}
          <div style={{ display:'flex', gap:6 }}>
            {PERIODS.map(p => (
              <button
                key={p.key}
                className={`period-btn${period === p.key ? ' active' : ''}`}
                onClick={() => { setPeriod(p.key); setCategory('all'); }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main earnings number */}
        <div style={{ marginBottom:24 }}>
          {loading ? (
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:220, height:60, borderRadius:12, background:'rgba(255,255,255,.07)', animation:'pulseGlow 1.4s infinite' }}/>
            </div>
          ) : (
            <div className="earnings-fade">
              <div style={{ display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap' }}>
                <span style={{ font:'900 clamp(42px,7vw,72px)/1 Outfit,sans-serif', color:'#F07828', letterSpacing:'-.03em' }}>
                  KSh {animated.toLocaleString('en-KE')}
                </span>
                {data && data.count > 0 && (
                  <span style={{ font:'400 14px Outfit,sans-serif', color:'rgba(255,255,255,.4)', paddingBottom:4 }}>
                    from {data.count.toLocaleString()} item{data.count !== 1 ? 's' : ''} sold
                  </span>
                )}
              </div>
              <p style={{ font:'400 15px/1.5 Outfit,sans-serif', color:'rgba(255,255,255,.5)', margin:'8px 0 0' }}>
                {category === 'all'
                  ? `Nairobi parents earned this selling kids' gear`
                  : `Nairobi parents earned this selling ${CAT_LABELS[category] ?? category}`
                }
                {' · '}<span style={{ color:'rgba(240,120,40,.8)' }}>{data?.period_label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Two-col layout: category pills + breakdown bars */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:32, alignItems:'start' }}>

          {/* Category filter pills */}
          <div>
            <p style={{ font:'500 11px Outfit,sans-serif', color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', margin:'0 0 10px' }}>
              Filter by category
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {ALL_CATS.map(cat => (
                <button
                  key={cat}
                  className={`cat-pill${category === cat ? ' active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat === 'all' ? 'All categories' : CAT_LABELS[cat] ?? cat}
                </button>
              ))}
            </div>
          </div>

          {/* Top earners breakdown — only when category = all */}
          {category === 'all' && topCats.length > 0 && !loading && (
            <div style={{ minWidth:200 }}>
              <p style={{ font:'500 11px Outfit,sans-serif', color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', margin:'0 0 12px' }}>
                Top categories
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {topCats.map(([cat, stats]) => {
                  const pct = Math.round((stats.total / maxCatTotal) * 100);
                  const color = CAT_COLORS[cat] ?? '#F07828';
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{ background:'none', border:'none', padding:0, cursor:'pointer', textAlign:'left' }}
                    >
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4, gap:12 }}>
                        <span style={{ font:'500 12px Outfit,sans-serif', color:'rgba(255,255,255,.65)' }}>
                          {CAT_LABELS[cat] ?? cat}
                        </span>
                        <span style={{ font:'600 11px Outfit,sans-serif', color, flexShrink:0 }}>
                          KSh {stats.total.toLocaleString('en-KE')}
                        </span>
                      </div>
                      <div style={{ height:4, background:'rgba(255,255,255,.08)', borderRadius:999, overflow:'hidden', width:200 }}>
                        <div
                          className="bar-fill"
                          style={{ width:`${inView ? pct : 0}%`, background:`linear-gradient(90deg, ${color}99, ${color})` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ marginTop:32, paddingTop:28, borderTop:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <p style={{ font:'400 13px Outfit,sans-serif', color:'rgba(255,255,255,.35)', margin:0 }}>
            Join thousands of Nairobi parents turning kids' gear into cash.
          </p>
          <a
            href="/sell"
            style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'#F07828', color:'#fff',
              font:'700 14px Outfit,sans-serif',
              padding:'11px 22px', borderRadius:12,
              textDecoration:'none',
              flexShrink:0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Start selling today
          </a>
        </div>
      </div>
    </section>
  );
}
