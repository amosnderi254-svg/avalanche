'use client';
import { useEffect, useState } from 'react';

interface SoldItem {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  updated_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function formatKsh(n: number): string {
  return 'KSh ' + n.toLocaleString('en-KE');
}

export default function RecentlySoldTicker() {
  const [items, setItems] = useState<SoldItem[]>([]);

  useEffect(() => {
    fetch('/api/public/recently-sold')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.items?.length) setItems(d.items); })
      .catch(() => {}); // silent — ticker is non-critical
  }, []);

  if (!items.length) return null;

  // Duplicate for seamless infinite scroll
  const doubled = [...items, ...items];

  return (
    <div style={{
      background: '#1A1A1A',
      borderBottom: '1px solid #2a2a2a',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Fade edges */}
      <div style={{
        position: 'absolute', inset: '0 auto 0 0',
        width: 48,
        background: 'linear-gradient(to right, #1A1A1A, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', inset: '0 0 0 auto',
        width: 48,
        background: 'linear-gradient(to left, #1A1A1A, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }}/>

      {/* Label */}
      <span style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        display: 'flex', alignItems: 'center',
        padding: '0 14px',
        background: '#F07828',
        font: '700 10px/1 Outfit,sans-serif',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: '.08em',
        zIndex: 3,
        whiteSpace: 'nowrap',
      }}>
        🛒 Just sold
      </span>

      {/* Scrolling track */}
      <div style={{
        display: 'flex',
        paddingLeft: 100, // clear the label
        animation: `ticker-scroll ${items.length * 5}s linear infinite`,
      }}>
        <style>{`
          @keyframes ticker-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-track:hover { animation-play-state: paused; }
        `}</style>
        <div
          className="ticker-track"
          style={{ display: 'flex', alignItems: 'center', gap: 0 }}
        >
          {doubled.map((item, i) => (
            <span
              key={`${item.id}-${i}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 20px',
                borderRight: '1px solid #2a2a2a',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{
                display: 'inline-block',
                background: '#7DC24322',
                color: '#7DC243',
                font: '700 10px Outfit,sans-serif',
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                borderRadius: 4,
                padding: '2px 6px',
              }}>
                SOLD
              </span>
              <span style={{ font: '500 13px Outfit,sans-serif', color: '#E8E8E8' }}>
                {item.title}
              </span>
              {item.location && (
                <span style={{ font: '400 12px Outfit,sans-serif', color: '#888', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {item.location}
                </span>
              )}
              <span style={{ font: '700 13px Outfit,sans-serif', color: '#F07828' }}>
                {formatKsh(item.price)}
              </span>
              <span style={{ font: '400 11px Outfit,sans-serif', color: '#555' }}>
                {timeAgo(item.updated_at)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
