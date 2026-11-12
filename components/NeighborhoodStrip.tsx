'use client';
import { useRouter, useSearchParams } from 'next/navigation';

const NAIROBI_HOODS = [
  'Westlands',
  'Karen',
  'Kilimani',
  'Runda',
  'Gigiri',
  'Lavington',
  'Kasarani',
  'Thika Road',
  'Muthaiga',
  'Ruaka',
  'Langata',
  'Parklands',
];

export default function NeighborhoodStrip() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const activeHood   = searchParams.get('area') || '';

  function select(hood: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeHood === hood) params.delete('area');
    else params.set('area', hood);
    router.push('/?' + params.toString(), { scroll: false });
  }

  return (
    <div
      style={{
        padding: '32px 0',
        background: '#f9fafb',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <h2
            style={{
              font: '700 20px Outfit,sans-serif',
              color: 'var(--text-1)',
              margin: 0,
            }}
          >
            Browse by neighbourhood
          </h2>
          <span
            style={{
              font: '400 14px Outfit,sans-serif',
              color: 'var(--text-3)',
            }}
          >
            Sellers near you, buyers near you
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {NAIROBI_HOODS.map(hood => {
            const active = activeHood === hood;
            return (
              <button
                key={hood}
                onClick={() => select(hood)}
                style={{
                  height: 36,
                  padding: '0 14px',
                  borderRadius: 'var(--r-pill)',
                  border: `1.5px solid ${active ? 'var(--orange)' : 'var(--border)'}`,
                  background: active ? '#fff4ec' : '#fff',
                  color: active ? 'var(--orange)' : 'var(--text-2)',
                  font: `${active ? '600' : '400'} 13px Outfit,sans-serif`,
                  cursor: 'pointer',
                  transition: 'all .15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {active && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="4" fill="var(--orange)" />
                  </svg>
                )}
                {hood}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
