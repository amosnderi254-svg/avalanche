/* Pure server component — CSS marquee only, no client JS needed */

const TICKS = [
  { type: 'sold',    text: 'Graco stroller sold in Westlands',          ago: '2 hrs ago'  },
  { type: 'new',     text: 'Chicco Oasys car seat listed in Lavington',  ago: 'just now'   },
  { type: 'sold',    text: 'Kids balance bike sold in Karen',            ago: '45 min ago' },
  { type: 'new',     text: '12 Oxford reading books listed in Kilimani', ago: '8 min ago'  },
  { type: 'sold',    text: 'Mountain bike 20 inch sold in Runda',        ago: '1 hr ago'   },
  { type: 'new',     text: 'Baby bouncer listed in Westlands',           ago: '15 min ago' },
  { type: 'sold',    text: 'Fire HD 8 Kids tablet sold in Gigiri',       ago: '3 hrs ago'  },
  { type: 'new',     text: 'Micro Scooter Mini listed in Lavington',     ago: '22 min ago' },
  { type: 'donated', text: 'Pushchair donated to a family in Kasarani',  ago: '4 hrs ago'  },
  { type: 'new',     text: 'Britax car seat listed in Muthaiga',         ago: '31 min ago' },
];

const DOT_COLOR: Record<string, string> = {
  sold:    '#F07828',
  new:     '#7DC243',
  donated: '#1565C0',
};

const LABEL_COLOR: Record<string, string> = {
  sold:    '#ffa654',
  new:     '#a5d97a',
  donated: '#90caf9',
};

export default function ActivityTicker() {
  return (
    <div
      style={{
        background: '#0d1117',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        overflow: 'hidden',
        height: 36,
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      <div className="ticker-track">
        {/* Two copies for seamless loop */}
        {[...TICKS, ...TICKS].map((tick, i) => (
          <span key={i} className="ticker-item">
            <span
              className="ticker-dot"
              style={{ background: DOT_COLOR[tick.type] ?? '#888' }}
            />
            <span
              style={{
                font: '600 11px Outfit,sans-serif',
                color: LABEL_COLOR[tick.type] ?? '#ccc',
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                marginRight: 6,
              }}
            >
              {tick.type === 'sold' ? 'SOLD' : tick.type === 'new' ? 'NEW' : 'FREE'}
            </span>
            <span
              style={{
                font: '400 12px Outfit,sans-serif',
                color: 'rgba(255,255,255,.65)',
              }}
            >
              {tick.text}
            </span>
            <span
              style={{
                font: '400 11px Outfit,sans-serif',
                color: 'rgba(255,255,255,.3)',
                marginLeft: 6,
              }}
            >
              {tick.ago}
            </span>
            <span className="ticker-sep" aria-hidden="true">|</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          align-items: center;
          white-space: nowrap;
          animation: ticker 50s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover { animation-play-state: paused; }
        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 0;
          padding: 0 20px 0 0;
        }
        .ticker-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-right: 8px;
        }
        .ticker-sep {
          color: rgba(255,255,255,.12);
          margin: 0 20px 0 20px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
