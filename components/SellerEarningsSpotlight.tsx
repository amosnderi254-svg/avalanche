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
  bikes:       'Bikes',
  strollers:   'Strollers',
  shoes:       'Shoes',
  toys:        'Toys',
  books:       'Books',
  'car-seats': 'Car Seats',
  clothing:    'Clothing',
  'baby-gear': 'Baby Gear',
  other:       'Other',
};

const CAT_COLORS: Record<string, string> = {
  bikes:       '#F07828',
  strollers:   '#7DC243',
  shoes:       '#1E88E5',
  toys:        '#AB47BC',
  books:       '#F9A825',
  'car-seats': '#00897B',
  clothing:    '#E91E63',
  'baby-gear': '#FF7043',
  other:       '#90A4AE',
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
  const [period, setPeriod]     = useState<'month' | 'all'>('month');
  const [category, setCategory] = useState('all');
  const [data, setData]         = useState<EarningsData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [inView, setInView]     = useState(false);
  const sectionRef              = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.25 }
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
  const topCats  = Object.entries(data?.by_category ?? {}).slice(0, 4);
  const maxCatTotal = topCats[0]?.[1]?.total ?? 1;

  const PERIODS = [
    { key: 'month', label: 'This Month' },
    { key: 'all',   label: 'All Time'   },
  ] as const;

  const ALL_CATS = ['all', ...Object.keys(CAT_LABELS)];

  return (
    <section
      ref={sectionRef}
      aria-label="Seller earnings spotlight"
      style={{
        background: '#FFF5EC',
        borderTop: '1px solid rgba(240,120,40,.12)',
        borderBottom: '1px solid rgba(240,120,40,.10)',
        padding: '64px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes pulseGreenDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .earn-bar { height: 6px; border-radius: 999px; transition: width .7s cubic-bezier(.4,0,.2,1); }
        .period-toggle {
          display:flex; gap:4px;
          background:#FFE8D2; border-radius:999px; padding:4px;
        }
        .period-btn-light {
          padding:6px 16px; border-radius:999px; border:none;
          font:600 12px Outfit,sans-serif; cursor:pointer; transition:all .15s;
          background:transparent; color:#C07030;
        }
        .period-btn-light.active { background:#F07828; color:#fff; }
        .period-btn-light:not(.active):hover { background:rgba(240,120,40,.12); color:#F07828; }
        .cat-pill-light {
          border-radius:999px; border:1.5px solid #F4D5BC;
          background:#fff; color:#8C4A1A;
          font:500 12px Outfit,sans-serif; padding:6px 14px;
          cursor:pointer; transition:all .15s; white-space:nowrap;
        }
        .cat-pill-light:hover { border-color:#F07828; color:#F07828; background:#FFF5EC; }
        .cat-pill-light.active { background:#F07828; border-color:#F07828; color:#fff; }
        .earn-skel {
          border-radius:8px;
          background:linear-gradient(90deg,#FFE8D2 25%,#FFF0E0 50%,#FFE8D2 75%);
          background-size:400px 100%;
          animation:shimEarn 1.3s infinite;
        }
        @keyframes shimEarn { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
      `}</style>

      {/* Decorative blobs — orange only, light */}
      <div aria-hidden="true" style={{ position:'absolute', top:-120, right:-80, width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(240,120,40,.08) 0%,transparent 70%)', pointerEvents:'none' }}/>
      <div aria-hidden="true" style={{ position:'absolute', bottom:-80, left:-40, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,180,80,.10) 0%,transparent 70%)', pointerEvents:'none' }}/>

      <div className="container" style={{ position:'relative', zIndex:1 }}>

        {/* Section label */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14, marginBottom:32 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#DCFCE7', border:'1px solid #BBF7D0', borderRadius:999, padding:'4px 10px' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E', display:'inline-block', animation:'pulseGreenDot 1.6s infinite' }}/>
                <span style={{ font:'600 10px Outfit,sans-serif', color:'#15803D', textTransform:'uppercase', letterSpacing:'.08em' }}>Live data</span>
              </span>
            </div>
            <h2 style={{ font:'800 clamp(22px,3vw,30px)/1.2 Outfit,sans-serif', color:'#1A1A1A', margin:0, letterSpacing:'-.02em' }}>
              What parents are earning
            </h2>
            <p style={{ font:'400 14px Outfit,sans-serif', color:'#A07050', margin:'4px 0 0' }}>
              Real cash. Real parents. Right here in Nairobi.
            </p>
          </div>
          <div className="period-toggle">
            {PERIODS.map(p => (
              <button
                key={p.key}
                className={`period-btn-light${period === p.key ? ' active' : ''}`}
                onClick={() => { setPeriod(p.key); setCategory('all'); }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Big number + breakdown — two-col */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:40, alignItems:'start', flexWrap:'wrap' }}>

          {/* Left — number + category pills */}
          <div>
            {/* KSh counter */}
            <div style={{ marginBottom:24 }}>
              {loading ? (
                <div className="earn-skel" style={{ width:260, height:68, marginBottom:8 }}/>
              ) : (
                <div style={{ animation:'fadeUp .4s ease both' }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap' }}>
                    <span style={{
                      font:'900 clamp(44px,7vw,72px)/1 Outfit,sans-serif',
                      color:'#F07828',
                      letterSpacing:'-.03em',
                    }}>
                      KSh {animated.toLocaleString('en-KE')}
                    </span>
                    {data && data.count > 0 && (
                      <span style={{ font:'500 14px Outfit,sans-serif', color:'#C07030', paddingBottom:6 }}>
                        from {data.count.toLocaleString()} item{data.count !== 1 ? 's' : ''} sold
                      </span>
                    )}
                  </div>
                  <p style={{ font:'400 14px/1.5 Outfit,sans-serif', color:'#A07050', margin:'6px 0 0' }}>
                    {category === 'all'
                      ? "Nairobi parents earned this selling kids' gear"
                      : `Nairobi parents earned this selling ${CAT_LABELS[category] ?? category}`}
                    {' · '}
                    <span style={{ color:'#F07828', fontWeight:600 }}>{data?.period_label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Category pills */}
            <div>
              <p style={{ font:'500 11px Outfit,sans-serif', color:'#C09070', textTransform:'uppercase', letterSpacing:'.08em', margin:'0 0 10px' }}>
                Filter by category
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {ALL_CATS.map(cat => (
                  <button
                    key={cat}
                    className={`cat-pill-light${category === cat ? ' active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat === 'all' ? 'All categories' : CAT_LABELS[cat] ?? cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — top earners breakdown */}
          {category === 'all' && topCats.length > 0 && !loading && (
            <div style={{ minWidth:200 }}>
              <p style={{ font:'500 11px Outfit,sans-serif', color:'#C09070', textTransform:'uppercase', letterSpacing:'.08em', margin:'0 0 14px' }}>
                Top categories
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {topCats.map(([cat, stats]) => {
                  const pct   = Math.round((stats.total / maxCatTotal) * 100);
                  const color = CAT_COLORS[cat] ?? '#F07828';
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{ background:'none', border:'none', padding:0, cursor:'pointer', textAlign:'left' }}
                    >
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5, gap:12 }}>
                        <span style={{ font:'600 12px Outfit,sans-serif', color:'#5A3010' }}>
                          {CAT_LABELS[cat] ?? cat}
                        </span>
                        <span style={{ font:'700 11px Outfit,sans-serif', color, flexShrink:0 }}>
                          KSh {stats.total.toLocaleString('en-KE')}
                        </span>
                      </div>
                      <div style={{ height:6, background:'#FFE0C0', borderRadius:999, overflow:'hidden', width:200 }}>
                        <div
                          className="earn-bar"
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

        {/* Footer CTA */}
        <div style={{ marginTop:36, paddingTop:24, borderTop:'1px solid #FFD5A8', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <p style={{ font:'400 13px Outfit,sans-serif', color:'#A07050', margin:0 }}>
            List yours in under 5 minutes. Cash on handover, no middleman.
          </p>
          <a
            href="/sell"
            style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'#F07828', color:'#fff',
              font:'700 14px Outfit,sans-serif',
              padding:'11px 22px', borderRadius:12,
              textDecoration:'none', flexShrink:0,
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
