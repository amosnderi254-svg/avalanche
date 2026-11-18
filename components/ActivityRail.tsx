'use client';
import { useState, useEffect, useRef } from 'react';

interface ActivityListing {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  created_at: string;
}

interface ActivityStats {
  live_count: number;
  sold_count: number;
  recent_count: number;
}

// Category icon paths + accent colours
const CAT: Record<string, { d: string; color: string; bg: string }> = {
  bikes:       { d: 'M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM12 17v-5l-3-3 4-4 3 3h3', color: '#f97316', bg: 'rgba(249,115,22,.22)' },
  scooters:    { d: 'M5 17a2 2 0 100-4 2 2 0 000 4zM17 5v8M12 5h9M12 5v8h5',                                 color: '#7DC243', bg: 'rgba(125,194,67,.22)' },
  strollers:   { d: 'M4 16s-1-2 0-2h16s1 2 0 2M6 20h12M2 8h20M6 8V4h12v4',                                  color: '#38bdf8', bg: 'rgba(56,189,248,.22)' },
  'car-seats': { d: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-2 10a2 2 0 002 2h4a2 2 0 002-2V9a2 2 0 00-2-2h-4a2 2 0 00-2 2v8zm4-6h2', color: '#a78bfa', bg: 'rgba(167,139,250,.22)' },
  toys:        { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', color: '#f472b6', bg: 'rgba(244,114,182,.22)' },
  books:       { d: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 014 4.5v15z', color: '#2dd4bf', bg: 'rgba(45,212,191,.22)' },
  'baby-gear': { d: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', color: '#fb7185', bg: 'rgba(251,113,133,.22)' },
  shoes:       { d: 'M22 11.5A6.5 6.5 0 0015.5 5h-3L6 7.5V14l3-1 2 3h3.5A6.5 6.5 0 0022 11.5z', color: '#c084fc', bg: 'rgba(192,132,252,.22)' },
  clothing:    { d: 'M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z', color: '#F07828', bg: 'rgba(240,120,40,.22)' },
};

const DEFAULT_CAT = { d: 'M3 5h20M3 12h20M3 19h20', color: '#94a3b8', bg: 'rgba(148,163,184,.2)' };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtPrice(n: number) {
  if (n === 0) return 'Free';
  return 'KES ' + n.toLocaleString('en-KE', { maximumFractionDigits: 0 });
}

// Pad an array to at least `min` items by cycling
function pad<T>(arr: T[], min: number): T[] {
  if (!arr.length) return arr;
  const out = [...arr];
  while (out.length < min) out.push(...arr);
  return out;
}

/* ── Chip ──────────────────────────────────────────────────────────── */
function Chip({ listing }: { listing: ActivityListing }) {
  const img = listing.images?.[0] ?? '';
  const cat = CAT[listing.category] ?? DEFAULT_CAT;
  const title = listing.title.length > 23
    ? listing.title.slice(0, 21).trimEnd() + '...'
    : listing.title;
  const loc = (listing.location ?? '').split(',')[0].trim() || 'Nairobi';

  return (
    <div
      className="ar-chip"
      role="listitem"
      aria-label={`${listing.title}, ${fmtPrice(listing.price)}, ${loc}`}
    >
      {/* Thumbnail */}
      <div style={{
        width: 42, height: 42,
        borderRadius: 10,
        overflow: 'hidden',
        flexShrink: 0,
        background: cat.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${cat.color}44`,
      }}>
        {img ? (
          <img
            src={img}
            alt=""
            aria-hidden="true"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke={cat.color} strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={cat.d} />
          </svg>
        )}
      </div>

      {/* Text */}
      <div style={{ minWidth: 0 }}>
        <p style={{
          font: '600 13px/1.2 Outfit,sans-serif',
          color: '#fff',
          margin: '0 0 4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}>
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            font: '700 12px Outfit,sans-serif',
            color: '#F07828',
            flexShrink: 0,
          }}>
            {fmtPrice(listing.price)}
          </span>
          <span style={{
            font: '500 11px Outfit,sans-serif',
            color: 'rgba(255,255,255,.4)',
            background: 'rgba(255,255,255,.07)',
            padding: '1px 7px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {loc}
          </span>
          <span style={{
            font: '400 11px Outfit,sans-serif',
            color: 'rgba(255,255,255,.25)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {timeAgo(listing.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton chip ─────────────────────────────────────────────────── */
function SkeletonChip() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '10px 16px 10px 10px',
      borderRadius: 13,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      flexShrink: 0, width: 190,
    }}>
      <div className="ar-shimmer" style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="ar-shimmer" style={{ width: '75%', height: 12, borderRadius: 6, marginBottom: 7 }} />
        <div className="ar-shimmer" style={{ width: '55%', height: 10, borderRadius: 6 }} />
      </div>
    </div>
  );
}

/* ── Scrolling row ─────────────────────────────────────────────────── */
function ScrollRow({
  items,
  direction,
  speed,
  skeletons,
}: {
  items: ActivityListing[];
  direction: 'left' | 'right';
  speed: number;
  skeletons: boolean;
}) {
  const anim = direction === 'left' ? 'ar-scroll-l' : 'ar-scroll-r';

  if (skeletons) {
    return (
      <div style={{ overflow: 'hidden', paddingBottom: 6 }}>
        <div style={{
          display: 'flex', gap: 8,
          width: 'max-content',
          animation: `${anim} ${speed}s linear infinite`,
          paddingLeft: 8,
        }}>
          {Array.from({ length: 16 }, (_, i) => <SkeletonChip key={i} />)}
        </div>
      </div>
    );
  }

  const padded = pad(items, 10);
  const doubled = [...padded, ...padded]; // seamless loop

  return (
    <div
      className="ar-row"
      style={{ overflow: 'hidden', paddingBottom: 6 }}
    >
      <div
        className="ar-track"
        style={{
          display: 'flex', gap: 8,
          width: 'max-content',
          animation: `${anim} ${speed}s linear infinite`,
          paddingLeft: 8,
        }}
      >
        {doubled.map((listing, i) => (
          <Chip key={`${listing.id}-${i}`} listing={listing} />
        ))}
      </div>
    </div>
  );
}

/* ── ActivityRail ──────────────────────────────────────────────────── */
export default function ActivityRail() {
  const [listings, setListings] = useState<ActivityListing[]>([]);
  const [stats, setStats]       = useState<ActivityStats | null>(null);
  const [loaded, setLoaded]     = useState(false);
  const railRef = useRef<HTMLElement>(null);

  async function fetchActivity() {
    try {
      const res = await fetch('/api/activity');
      if (!res.ok) return;
      const data = await res.json();
      setListings(data.listings ?? []);
      setStats(data.stats ?? null);
    } catch { /* ignore */ } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    fetchActivity();
    const id = setInterval(fetchActivity, 60_000);
    return () => clearInterval(id);
  }, []);

  // Split into two rows; use all items for row2 if the first half is thin
  const half = Math.ceil(listings.length / 2);
  const row1 = listings.slice(0, half);
  const row2 = listings.slice(half).length >= 4
    ? listings.slice(half)
    : [...listings].reverse(); // reverse for variety when few items

  const skeletons = !loaded;
  const hidden = loaded && listings.length === 0;
  if (hidden) return null;

  return (
    <section
      ref={railRef}
      aria-label="Live marketplace activity"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0D0A2E 0%, #1a0845 35%, #2d1065 65%, #100A2A 100%)',
      }}
    >
      <style>{`
        @keyframes ar-scroll-l {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes ar-scroll-r {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @keyframes ar-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .45; transform: scale(.82); }
        }
        @keyframes ar-pulse-ring {
          0%   { transform: scale(1);   opacity: .6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes ar-shimmer {
          from { background-position: -300px 0; }
          to   { background-position:  300px 0; }
        }
        .ar-shimmer {
          background: linear-gradient(90deg,
            rgba(255,255,255,.07) 25%,
            rgba(255,255,255,.14) 50%,
            rgba(255,255,255,.07) 75%
          );
          background-size: 300px 100%;
          animation: ar-shimmer 1.5s infinite;
        }
        .ar-chip {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px 10px 10px;
          border-radius: 13px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          backdrop-filter: blur(6px);
          flex-shrink: 0;
          transition: background .2s, transform .2s, border-color .2s;
          cursor: default;
          user-select: none;
        }
        .ar-chip:hover {
          background: rgba(255,255,255,.13);
          border-color: rgba(255,255,255,.22);
          transform: scale(1.04) translateY(-1px);
        }
        .ar-row:hover .ar-track {
          animation-play-state: paused;
        }
        .ar-row:focus-within .ar-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* Left edge fade */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 72,
        background: 'linear-gradient(to right, #0D0A2E, transparent)',
        zIndex: 3, pointerEvents: 'none',
      }} />
      {/* Right edge fade */}
      <div aria-hidden="true" style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 72,
        background: 'linear-gradient(to left, #100A2A, transparent)',
        zIndex: 3, pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px 8px',
        gap: 12,
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* LIVE badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }} aria-hidden="true">
            {/* pulsing ring */}
            <div style={{
              position: 'absolute', inset: -2,
              borderRadius: '50%',
              background: 'rgba(239,68,68,.5)',
              animation: 'ar-pulse-ring 1.6s ease-out infinite',
            }} />
            {/* solid dot */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: '#ef4444',
              animation: 'ar-pulse 1.6s ease-in-out infinite',
            }} />
          </div>
          <span style={{
            font: '700 11px Outfit,sans-serif',
            color: '#ef4444',
            textTransform: 'uppercase',
            letterSpacing: '.1em',
          }}>
            Live
          </span>
          <span style={{
            font: '500 12px Outfit,sans-serif',
            color: 'rgba(255,255,255,.4)',
          }}>
            Marketplace activity in Nairobi
          </span>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            font: '500 12px Outfit,sans-serif',
            color: 'rgba(255,255,255,.35)',
          }}>
            {stats.live_count > 0 && (
              <span>
                <span style={{ color: '#7DC243', fontWeight: 700 }}>
                  {stats.live_count}
                </span>
                {' '}items live
              </span>
            )}
            {stats.recent_count > 0 && (
              <span>
                <span style={{ color: '#F07828', fontWeight: 700 }}>
                  {stats.recent_count}
                </span>
                {' '}added today
              </span>
            )}
            {stats.sold_count > 0 && (
              <span style={{ display: 'none' }} /* desktop+ only */>
                <span style={{ color: '#a78bfa', fontWeight: 700 }}>
                  {stats.sold_count}
                </span>
                {' '}sold
              </span>
            )}
          </div>
        )}
      </div>

      {/* Row 1 — scrolls left */}
      <ScrollRow
        items={row1}
        direction="left"
        speed={38}
        skeletons={skeletons}
      />

      {/* Row 2 — scrolls right */}
      <ScrollRow
        items={row2}
        direction="right"
        speed={50}
        skeletons={skeletons}
      />

      {/* Bottom padding strip */}
      <div style={{ height: 10 }} />
    </section>
  );
}
