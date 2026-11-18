'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ── Waveform bars — deterministic, looks like a real audio fingerprint ─────────
const NUM_BARS = 58;
const BARS: number[] = Array.from({ length: NUM_BARS }, (_, i) => {
  const v = Math.abs(
    Math.sin(i * 0.42) * 0.42 +
    Math.sin(i * 1.27) * 0.28 +
    Math.sin(i * 3.91) * 0.18 +
    Math.sin(i * 0.09) * 0.12
  );
  return Math.round(14 + v * 86); // 14–100 range
});

const KNOWN_DURATION = 74.84; // seconds — from ffprobe

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const [open,     setOpen]    = useState(false);
  const [playing,  setPlaying] = useState(false);
  const [progress, setProgress]= useState(0);   // 0–1
  const [current,  setCurrent] = useState(0);   // seconds

  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef   = useRef<number>(0);

  // rAF progress ticker
  const tick = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    const dur = a.duration || KNOWN_DURATION;
    setCurrent(a.currentTime);
    setProgress(a.currentTime / dur);
    if (!a.paused) rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startPlay = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      await a.play();
      setPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (_) { /* autoplay blocked — user will retry */ }
  }, [tick]);

  const pause = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    setPlaying(false);
    cancelAnimationFrame(rafRef.current);
  }, []);

  const toggle = useCallback(() => {
    playing ? pause() : startPlay();
  }, [playing, pause, startPlay]);

  const handlePillClick = () => {
    if (!open) {
      setOpen(true);
      // Auto-play when first opening
      setTimeout(() => startPlay(), 50);
    } else {
      toggle();
    }
  };

  const handleClose = () => {
    pause();
    setOpen(false);
  };

  const seekTo = (pct: number) => {
    const a = audioRef.current;
    if (!a) return;
    const dur = a.duration || KNOWN_DURATION;
    a.currentTime = pct * dur;
    setProgress(pct);
    setCurrent(a.currentTime);
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrent(0);
      cancelAnimationFrame(rafRef.current);
    };
    a.addEventListener('ended', onEnded);
    return () => {
      a.removeEventListener('ended', onEnded);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const filledBars = Math.round(progress * NUM_BARS);

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/audio/introduction-to-mytinyverse.mp3"
        preload="metadata"
      />

      {/* Fixed wrapper — bottom-left, above mobile nav */}
      <div
        style={{
          position: 'fixed',
          left: 16,
          bottom: 16,
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        {/* ── Expanded player ───────────────────────── */}
        {open && (
          <div
            role="region"
            aria-label="Audio player"
            style={{
              width: 'min(calc(100vw - 48px), 320px)',
              background: 'rgba(8,8,8,0.88)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 18,
              padding: '14px 14px 12px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
              animation: 'ap-rise 0.38s cubic-bezier(.22,.68,0,1.2)',
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{
                  font: '500 9.5px/1 Outfit,sans-serif',
                  color: '#F07828',
                  letterSpacing: '.07em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}>
                  Brand Story
                </div>
                <div style={{ font: '600 13px/1.3 Outfit,sans-serif', color: '#fff' }}>
                  Introduction to MyTinyverse
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close player"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '2px 2px 2px 6px', lineHeight: 1,
                  opacity: 0.45,
                  flexShrink: 0,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* ── Waveform ─────────────────────────── */}
            <div
              role="slider"
              aria-label="Audio progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              tabIndex={0}
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                seekTo((e.clientX - rect.left) / rect.width);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') seekTo(Math.min(1, progress + 0.05));
                if (e.key === 'ArrowLeft')  seekTo(Math.max(0, progress - 0.05));
              }}
              style={{ cursor: 'pointer', marginBottom: 10, outline: 'none' }}
            >
              <svg
                viewBox={`0 0 ${NUM_BARS * 5 - 2} 52`}
                width="100%"
                height="46"
                style={{ display: 'block', overflow: 'visible' }}
                aria-hidden="true"
              >
                {BARS.map((h, i) => {
                  const barH   = h * 0.50;             // scale to max ~50px
                  const y      = (52 - barH) / 2;
                  const pct    = i / NUM_BARS;
                  const filled = i < filledBars;
                  const isHead = i === filledBars;
                  const isTail = i > filledBars;
                  let fill: string;
                  if (filled)       fill = `hsl(${24 + pct * 36},${90 - pct*20}%,${55 + pct*10}%)`;
                  else if (isHead)  fill = '#FFAD6B';
                  else              fill = isTail ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.14)';

                  return (
                    <rect
                      key={i}
                      x={i * 5}
                      y={y}
                      width={3}
                      height={barH}
                      rx={1.5}
                      fill={fill}
                      style={
                        playing && (isHead || i === filledBars - 1)
                          ? { filter: 'brightness(1.5)' }
                          : undefined
                      }
                    />
                  );
                })}
              </svg>
            </div>

            {/* Controls row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Play/Pause */}
              <button
                onClick={toggle}
                aria-label={playing ? 'Pause' : 'Play'}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#F07828',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 12px rgba(240,120,40,0.45)',
                  transition: 'transform .15s, box-shadow .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {playing ? (
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="#fff">
                    <rect x="0" y="0" width="3.5" height="12" rx="1"/>
                    <rect x="6.5" y="0" width="3.5" height="12" rx="1"/>
                  </svg>
                ) : (
                  <svg width="11" height="13" viewBox="0 0 11 13" fill="#fff">
                    <polygon points="1,0 11,6.5 1,13"/>
                  </svg>
                )}
              </button>

              {/* Thin progress track */}
              <div
                role="presentation"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  seekTo((e.clientX - rect.left) / rect.width);
                }}
                style={{
                  flex: 1, height: 2.5,
                  background: 'rgba(255,255,255,0.10)',
                  borderRadius: 99, cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${progress * 100}%`,
                  background: 'linear-gradient(90deg,#F07828,#FFAD6B)',
                  borderRadius: 99,
                  transition: playing ? 'none' : 'width .15s',
                }}/>
              </div>

              {/* Time */}
              <div style={{
                font: '500 10.5px/1 "Outfit",monospace',
                color: 'rgba(255,255,255,0.38)',
                flexShrink: 0,
                letterSpacing: '.01em',
                whiteSpace: 'nowrap',
              }}>
                {fmt(current)} / {fmt(KNOWN_DURATION)}
              </div>
            </div>
          </div>
        )}

        {/* ── Pill button ───────────────────────────── */}
        <button
          onClick={handlePillClick}
          aria-label={open ? (playing ? 'Pause brand story' : 'Play brand story') : 'Listen to our story'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 15px 9px 11px',
            background: open
              ? 'rgba(12,12,12,0.86)'
              : 'rgba(240,120,40,0.90)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.11)',
            borderRadius: 999,
            cursor: 'pointer',
            boxShadow: open
              ? '0 4px 20px rgba(0,0,0,0.35)'
              : '0 4px 20px rgba(240,120,40,0.35)',
            transition: 'background .25s, box-shadow .25s',
          }}
        >
          {/* Icon: waveform lines or animated equalizer */}
          {playing ? (
            /* Animated equalizer bars */
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 15, width: 16 }}>
              {[0.55, 1, 0.65, 0.9, 0.5].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 2.5,
                    height: `${h * 100}%`,
                    background: '#fff',
                    borderRadius: 999,
                    animation: `eq${i} ${0.48 + i * 0.09}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          ) : (
            /* Music note icon */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6"  cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          )}

          <span style={{
            font: '600 12.5px/1 Outfit,sans-serif',
            color: '#fff',
            letterSpacing: '.01em',
          }}>
            {open
              ? (playing ? 'Playing...' : 'Our story')
              : 'Our story'}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes ap-rise {
          from { opacity: 0; transform: translateY(10px) scale(.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }
        @keyframes eq0 { from { transform: scaleY(.25); } to { transform: scaleY(1);    } }
        @keyframes eq1 { from { transform: scaleY(.4);  } to { transform: scaleY(.85);  } }
        @keyframes eq2 { from { transform: scaleY(.3);  } to { transform: scaleY(.95);  } }
        @keyframes eq3 { from { transform: scaleY(.5);  } to { transform: scaleY(.75);  } }
        @keyframes eq4 { from { transform: scaleY(.2);  } to { transform: scaleY(1);    } }

        @media (max-width: 480px) {
          /* nudge up slightly on small screens to clear any bottom nav bar */
          .ap-wrapper { bottom: 20px !important; }
        }
      `}</style>
    </>
  );
}
