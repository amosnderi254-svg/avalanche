'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchTerm { query: string; count: number; }
interface DemandData {
  top_searches: SearchTerm[];
  demand_gaps:  SearchTerm[];
  updated_at:   string;
}

function inferCategory(query: string): string {
  const q = query.toLowerCase();
  if (/bike|bicycle|cycle|scooter/.test(q))               return 'bikes';
  if (/stroller|pram|buggy|pushchair/.test(q))             return 'strollers';
  if (/shoe|sneaker|boot|sandal/.test(q))                  return 'shoes';
  if (/toy|lego|doll|game|puzzle/.test(q))                 return 'toys';
  if (/book|read|novel|textbook/.test(q))                  return 'books';
  if (/car seat|carseat|booster|infant seat/.test(q))      return 'car-seats';
  if (/cloth|outfit|dress|shirt|trouser|uniform/.test(q))  return 'clothing';
  if (/baby|diaper|nappy|crib|bassinet|playpen/.test(q))   return 'baby-gear';
  return '';
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function pillSize(count: number, max: number) {
  const r = max > 0 ? count / max : 0;
  if (r > 0.7) return { fontSize:'14px', padding:'9px 18px' };
  if (r > 0.4) return { fontSize:'13px', padding:'8px 15px' };
  return             { fontSize:'12px', padding:'7px 12px' };
}

type Tab = 'trending' | 'gaps';

export default function LiveDemandFeed() {
  const router = useRouter();
  const [data, setData]       = useState<DemandData | null>(null);
  const [tab, setTab]         = useState<Tab>('trending');
  const [loading, setLoading] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const [countdown, setCountdown] = useState(300);
  const [hovered, setHovered] = useState<string | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await fetch('/api/public/demand', { cache: 'no-store' });
      if (r.ok) { setData(await r.json()); setAnimKey(k => k + 1); setCountdown(300); }
    } catch { /* silent */ }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => { if (c <= 1) { fetchData(true); return 300; } return c - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [fetchData]);

  const switchTab = (t: Tab) => { setTab(t); setAnimKey(k => k + 1); };

  const terms    = data ? (tab === 'trending' ? data.top_searches : data.demand_gaps) : [];
  const maxCount = terms[0]?.count ?? 1;
  const noData   = !loading && terms.length === 0;

  return (
    <section
      aria-label="Live buyer demand"
      style={{
        background: '#FFFDF9',
        borderTop: '1px solid #EDEAE5',
        padding: '64px 0',
      }}
    >
      <style>{`
        @keyframes pulseLive { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes pillIn {
          from { opacity:0; transform:translateY(7px) scale(.95) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }
        @keyframes shimD {
          0%{background-position:-400px 0} 100%{background-position:400px 0}
        }
        .demand-pill {
          display:inline-flex; align-items:center; gap:7px;
          border-radius:999px; cursor:pointer; border:none;
          font-family:Outfit,sans-serif; font-weight:600;
          transition:transform .15s, box-shadow .15s, background .15s, border-color .15s;
        }
        .demand-pill:hover { transform:translateY(-2px); }
        .demand-pill.trending {
          background:#fff; border:1.5px solid #E8DED4; color:#2A1A0A;
          box-shadow:0 1px 4px rgba(0,0,0,.05);
        }
        .demand-pill.trending:hover {
          background:#FFF5EC; border-color:#F07828;
          box-shadow:0 4px 16px rgba(240,120,40,.18);
        }
        .demand-pill.gap {
          background:#F5FFF0; border:1.5px dashed #A8D88A; color:#3A6020;
        }
        .demand-pill.gap:hover {
          background:#ECFFE0; border-color:#7DC243;
          box-shadow:0 4px 14px rgba(125,194,67,.2);
        }
        .tab-btn-d {
          padding:8px 20px; border-radius:999px; border:none;
          font:600 13px Outfit,sans-serif; cursor:pointer; transition:all .15s;
        }
        .tab-btn-d.active  { background:#1A1A1A; color:#fff; }
        .tab-btn-d.inactive { background:transparent; color:#999; }
        .tab-btn-d.inactive:hover { background:#F5EFE6; color:#1A1A1A; }
        .skel-pill {
          display:inline-block; height:36px; border-radius:999px;
          background:linear-gradient(90deg,#F5EFE6 25%,#FFF5EC 50%,#F5EFE6 75%);
          background-size:400px 100%; animation:shimD 1.4s infinite;
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:14, marginBottom:28 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#ECFDF5', border:'1px solid #BBF7D0', borderRadius:999, padding:'4px 10px' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E', display:'inline-block', animation:'pulseLive 1.6s infinite' }}/>
                <span style={{ font:'600 10px Outfit,sans-serif', color:'#15803D', textTransform:'uppercase', letterSpacing:'.08em' }}>Live</span>
              </span>
              {data && (
                <span style={{ font:'400 12px Outfit,sans-serif', color:'#C0A890' }}>
                  Updated {timeAgo(data.updated_at)} · refreshing in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                </span>
              )}
            </div>
            <h2 style={{ font:'800 clamp(20px,3vw,28px)/1.2 Outfit,sans-serif', color:'#1A1A1A', margin:0, letterSpacing:'-.02em' }}>
              What parents are searching for
            </h2>
            <p style={{ font:'400 14px Outfit,sans-serif', color:'#A07050', margin:'4px 0 0' }}>
              {tab === 'trending'
                ? 'Click any term to browse matching listings.'
                : 'Zero-result searches — a gap only you can fill.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display:'flex', gap:5, background:'#F5EFE6', padding:4, borderRadius:999 }}>
            <button className={`tab-btn-d ${tab === 'trending' ? 'active' : 'inactive'}`} onClick={() => switchTab('trending')}>
              🔍 Trending
            </button>
            <button className={`tab-btn-d ${tab === 'gaps' ? 'active' : 'inactive'}`} onClick={() => switchTab('gaps')}>
              💡 Demand Gaps
            </button>
          </div>
        </div>

        {/* Pill cloud */}
        <div
          key={`${animKey}-${tab}`}
          style={{ display:'flex', flexWrap:'wrap', gap:10, minHeight:72, alignItems:'flex-start', alignContent:'flex-start' }}
        >
          {loading ? (
            [100,78,118,88,108,70,94,128,82,100].map((w, i) => (
              <span key={i} className="skel-pill" style={{ width:w, animationDelay:`${i * .08}s` }}/>
            ))
          ) : noData ? (
            <div style={{ padding:'20px 0', color:'#D0C0B0', font:'400 14px Outfit,sans-serif' }}>
              {tab === 'gaps' ? 'No demand gaps tracked yet — keep growing the marketplace!' : 'No search data yet.'}
            </div>
          ) : (
            terms.map((t, i) => {
              const size     = pillSize(t.count, maxCount);
              const isHov    = hovered === t.query;
              const isTrend  = tab === 'trending';
              return (
                <button
                  key={`${animKey}-${t.query}`}
                  className={`demand-pill ${isTrend ? 'trending' : 'gap'}`}
                  style={{ ...size, animation:`pillIn .28s ease ${i * .038}s both` }}
                  onClick={() => isTrend
                    ? router.push(`/?q=${encodeURIComponent(t.query)}`)
                    : router.push(inferCategory(t.query) ? `/sell?category=${inferCategory(t.query)}` : '/sell')
                  }
                  onMouseEnter={() => setHovered(t.query)}
                  onMouseLeave={() => setHovered(null)}
                  title={isTrend
                    ? `${t.count} searches in the last 30 days`
                    : `${t.count} buyers searched this — no listings found`}
                >
                  {isTrend ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke={isHov ? '#F07828' : '#C0A890'} strokeWidth="2.5"
                      style={{ transition:'stroke .15s', flexShrink:0 }}>
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="#7DC243" strokeWidth="2.5" style={{ flexShrink:0 }}>
                      <polyline points="12 5 12 19"/><polyline points="5 12 12 5 19 12"/>
                    </svg>
                  )}
                  <span style={{ textTransform:'capitalize' }}>{t.query}</span>
                  <span style={{
                    fontSize:'10px', fontWeight:700, borderRadius:999, padding:'2px 7px',
                    background: isTrend ? (isHov ? '#F07828' : '#FFE8D2') : (isHov ? '#7DC243' : '#D4EFC0'),
                    color: isTrend ? (isHov ? '#fff' : '#B05810') : (isHov ? '#fff' : '#3A6020'),
                    transition:'background .15s, color .15s',
                  }}>
                    {t.count}×
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        {!loading && !noData && (
          <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid #EDEAE5', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            {tab === 'trending' ? (
              <>
                <span style={{ font:'400 13px Outfit,sans-serif', color:'#C0A890' }}>
                  Top {terms.length} searches · last 30 days
                </span>
                <a href="/?q=" style={{ font:'600 13px Outfit,sans-serif', color:'#F07828', textDecoration:'none' }}>
                  Browse all listings →
                </a>
              </>
            ) : (
              <>
                <div>
                  <span style={{ font:'600 13px Outfit,sans-serif', color:'#1A1A1A', display:'block', marginBottom:2 }}>
                    These buyers found nothing. You could be first.
                  </span>
                  <span style={{ font:'400 12px Outfit,sans-serif', color:'#C0A890' }}>
                    Click any gap above — the sell form opens with the right category pre-filled.
                  </span>
                </div>
                <a
                  href="/sell"
                  style={{
                    display:'inline-flex', alignItems:'center', gap:8,
                    background:'#7DC243', color:'#fff',
                    font:'700 13px Outfit,sans-serif',
                    padding:'10px 20px', borderRadius:11,
                    textDecoration:'none', flexShrink:0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  List an item now
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
