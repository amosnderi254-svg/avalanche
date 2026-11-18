'use client';
import { useState, useEffect } from 'react';

interface ActivityStats {
  live_count: number;
  recent_count: number;
}

export default function ActivityRail() {
  const [stats, setStats] = useState<ActivityStats | null>(null);

  useEffect(() => {
    fetch('/api/activity')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setStats(d.stats))
      .catch(() => {/* silent */});
  }, []);

  // Don't render until we have something worth showing
  if (!stats || stats.live_count === 0) return null;

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      background: '#fff',
      padding: '0 20px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        height: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <style>{`
          @keyframes ar-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: .35; }
          }
        `}</style>

        {/* Pulsing dot */}
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 7, height: 7,
            borderRadius: '50%',
            background: '#7DC243',
            flexShrink: 0,
            animation: 'ar-pulse 2s ease-in-out infinite',
          }}
        />

        <span style={{
          font: '500 12px Outfit,sans-serif',
          color: 'var(--text-3)',
        }}>
          <span style={{ color: '#7DC243', fontWeight: 700 }}>
            {stats.live_count}
          </span>
          {' '}items live in Nairobi
          {stats.recent_count > 0 && (
            <>
              <span style={{ margin: '0 6px', opacity: .4 }}>&middot;</span>
              <span style={{ color: '#F07828', fontWeight: 600 }}>
                {stats.recent_count}
              </span>
              {' '}added today
            </>
          )}
        </span>
      </div>
    </div>
  );
}
