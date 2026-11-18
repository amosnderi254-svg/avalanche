'use client';
import { useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
type EventKind = 'listed' | 'sold';
interface ActivityEvent {
  kind: EventKind;
  item: string;
  price?: string;   // only for listed events
  area: string;
  mins: number;
}

// ── Mock events — realistic Nairobi data ─────────────────────────────────────
// When inventory grows, swap MOCK_EVENTS for a live fetch from /api/activity.
// Shape the API response to match ActivityEvent[] and pass it in as a prop.
const MOCK_EVENTS: ActivityEvent[] = [
  { kind: 'listed', item: 'Graco SnugRide 35',         price: 'KSh 12,000', area: 'Westlands',  mins: 3  },
  { kind: 'sold',   item: 'Maclaren Quest Stroller',                        area: 'Karen',       mins: 11 },
  { kind: 'listed', item: 'Trek Kids Bike 20"',         price: 'KSh 8,500',  area: 'Kilimani',   mins: 7  },
  { kind: 'sold',   item: 'BabyBjorn Bouncer',                              area: 'Lavington',   mins: 22 },
  { kind: 'listed', item: 'Chicco KeyFit 30',           price: 'KSh 15,000', area: 'Runda',      mins: 15 },
  { kind: 'sold',   item: 'Fisher-Price Activity Gym',                      area: 'Kileleshwa',  mins: 34 },
  { kind: 'listed', item: 'Bugaboo Cameleon 3',         price: 'KSh 24,000', area: 'Muthaiga',   mins: 19 },
  { kind: 'listed', item: 'Micro Mini Scooter',         price: 'KSh 4,500',  area: 'South C',    mins: 8  },
  { kind: 'sold',   item: 'Britax B-Safe 35',                               area: 'Parklands',   mins: 45 },
  { kind: 'listed', item: 'VTech Sit-to-Stand Walker',  price: 'KSh 2,800',  area: 'Langata',    mins: 12 },
  { kind: 'sold',   item: 'UPPAbaby Vista Stroller',                        area: 'Kileleshwa',  mins: 58 },
  { kind: 'listed', item: 'Peg Perego Primo Viaggio',   price: 'KSh 18,000', area: 'Ruaka',      mins: 24 },
];

type Phase = 'idle' | 'in' | 'hold' | 'out';

// ── Component ─────────────────────────────────────────────────────────────────
export default function HeroActivityToast() {
  const [idx,   setIdx]   = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    let gone = false;
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    async function cycle() {
      await wait(2800);           // let the hero settle before first toast
      let i = 0;
      while (!gone) {
        setIdx(i % MOCK_EVENTS.length);
        setPhase('in');
        await wait(420);          // slide-in duration
        if (gone) break;
        setPhase('hold');
        await wait(4000);         // visible dwell time
        if (gone) break;
        setPhase('out');
        await wait(360);          // slide-out duration
        if (gone) break;
        setPhase('idle');
        await wait(700);          // pause between toasts
        i++;
      }
    }

    cycle();
    return () => { gone = true; };
  }, []);

  if (phase === 'idle') return null;

  const ev        = MOCK_EVENTS[idx];
  const isListed  = ev.kind === 'listed';
  const accent    = isListed ? '#7DC243' : '#F07828';
  const animClass = phase === 'in' ? 'hat-in' : phase === 'out' ? 'hat-out' : '';

  return (
    <>
      <style>{`
        @keyframes hat-in {
          from { opacity: 0; transform: translateY(14px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }
        @keyframes hat-out {
          from { opacity: 1; transform: translateY(0)    scale(1);   }
          to   { opacity: 0; transform: translateY(-8px) scale(.97); }
        }
        .hat-in  { animation: hat-in  0.4s cubic-bezier(.22,.68,0,1.2) forwards; }
        .hat-out { animation: hat-out 0.32s ease-in forwards; }

        @media (max-width: 600px) {
          .hat-toast {
            right: 12px !important;
            bottom: 68px !important;
            max-width: 230px !important;
          }
        }
      `}</style>

      <div
        className={`hat-toast${animClass ? ' ' + animClass : ''}`}
        aria-live="polite"
        style={{
          position:  'absolute',
          right:     24,
          bottom:    88,
          zIndex:    10,
          display:   'flex',
          alignItems:'center',
          gap:       10,
          padding:   '10px 16px 10px 12px',
          background:'rgba(8,8,8,0.74)',
          backdropFilter:       'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border:       '1px solid rgba(255,255,255,0.10)',
          borderRadius: 14,
          maxWidth:     290,
          pointerEvents:'none',
          userSelect:   'none',
        }}
      >
        {/* Icon */}
        <div style={{
          width:  32, height: 32,
          borderRadius: 9,
          background: isListed ? 'rgba(125,194,67,.16)' : 'rgba(240,120,40,.16)',
          border: `1px solid ${accent}2e`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isListed ? (
            /* Plus icon — new listing */
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={accent} strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
          ) : (
            /* Checkmark — sold */
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>

        {/* Text */}
        <div style={{ minWidth: 0 }}>
          <div style={{
            font: '500 10.5px/1 Outfit,sans-serif',
            color: accent,
            marginBottom: 4,
            letterSpacing: '.015em',
            textTransform: 'uppercase',
          }}>
            {isListed ? `New listing · ${ev.area}` : `Sold · ${ev.area}`}
          </div>

          <div style={{
            font: '600 13px/1.3 Outfit,sans-serif',
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {ev.item}
            {isListed && ev.price && (
              <span style={{ fontWeight: 400, color: 'rgba(255,255,255,.48)', marginLeft: 6 }}>
                {ev.price}
              </span>
            )}
          </div>

          <div style={{
            font: '400 10.5px/1 Outfit,sans-serif',
            color: 'rgba(255,255,255,.35)',
            marginTop: 5,
          }}>
            {ev.mins} {ev.mins === 1 ? 'min' : 'mins'} ago
          </div>
        </div>
      </div>
    </>
  );
}
