'use client';
import { useRouter, useSearchParams } from 'next/navigation';

const AGE_BRACKETS = [
  { id: 'all',   label: 'All ages'      },
  { id: '0-6m',  label: '0 to 6 months'  },
  { id: '6-18m', label: '6 to 18 months' },
  { id: '1-3y',  label: '1 to 3 years'   },
  { id: '3-5y',  label: '3 to 5 years'   },
  { id: '5-8y',  label: '5 to 8 years'   },
  { id: '8plus', label: '8 and above'    },
];

export default function AgeFilter() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const activeAge    = searchParams.get('age') || 'all';

  function select(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'all') params.delete('age');
    else params.set('age', id);
    router.push('/?' + params.toString(), { scroll: false });
  }

  return (
    <div
      style={{
        padding: '20px 0',
        background: '#fff',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="container">
        <p
          style={{
            font: '600 11px Outfit,sans-serif',
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
            margin: '0 0 12px',
          }}
        >
          Shopping for a child aged...
        </p>
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: 2,
          }}
        >
          {AGE_BRACKETS.map(b => {
            const active = activeAge === b.id;
            return (
              <button
                key={b.id}
                onClick={() => select(b.id)}
                style={{
                  flexShrink: 0,
                  height: 36,
                  padding: '0 16px',
                  borderRadius: 'var(--r-pill)',
                  border: `1.5px solid ${active ? 'var(--orange)' : 'var(--border)'}`,
                  background: active ? 'var(--orange)' : '#fff',
                  color: active ? '#fff' : 'var(--text-2)',
                  font: `${active ? '600' : '400'} 13px Outfit,sans-serif`,
                  cursor: 'pointer',
                  transition: 'all .15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>
      <style>{`.age-filter-scroll::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
