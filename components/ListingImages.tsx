'use client';
import { useState, useEffect, useCallback } from 'react';

interface Props {
  images: string[];
  title: string;
}

export default function ListingImages({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const prev  = useCallback(() => setLightbox(i => (i !== null && i > 0) ? i - 1 : i), []);
  const next  = useCallback(() => setLightbox(i => (i !== null && i < images.length - 1) ? i + 1 : i), [images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, close, prev, next]);

  if (!images || images.length === 0) return null;

  const single = images.length === 1;

  return (
    <>
      {/* ── Gallery ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: single ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 8,
      }}>
        {images.slice(0, 4).map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightbox(i)}
            aria-label={`View ${title} photo ${i + 1}`}
            style={{
              all: 'unset',
              display: 'block',
              position: 'relative',
              paddingTop: single ? '62%' : '75%',
              borderRadius: 14,
              overflow: 'hidden',
              background: '#F5EFE6',
              cursor: 'zoom-in',
            }}
          >
            <img
              src={src}
              alt={`${title}${images.length > 1 ? ` ${i + 1}` : ''}`}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'contain',
              }}
            />
            {/* Zoom hint */}
            <div style={{
              position: 'absolute', bottom: 10, right: 10,
              background: 'rgba(0,0,0,.42)',
              backdropFilter: 'blur(4px)',
              borderRadius: 7,
              padding: '5px 9px',
              display: 'flex', alignItems: 'center', gap: 5,
              pointerEvents: 'none',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              <span style={{ font: '600 11px Outfit,sans-serif', color: '#fff' }}>Zoom</span>
            </div>
            {/* Multi-image count badge on last visible tile */}
            {!single && i === Math.min(images.length, 4) - 1 && images.length > 4 && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ font: '700 22px Outfit,sans-serif', color: '#fff' }}>+{images.length - 4}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — photo ${lightbox + 1} of ${images.length}`}
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(10,8,6,.93)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Main image */}
          <img
            src={images[lightbox]}
            alt={`${title} — photo ${lightbox + 1}`}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '88vh',
              objectFit: 'contain',
              borderRadius: 10,
              boxShadow: '0 24px 80px rgba(0,0,0,.7)',
            }}
          />

          {/* Close */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); close(); }}
            aria-label="Close photo"
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.18)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Prev arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); prev(); }}
              disabled={lightbox === 0}
              aria-label="Previous photo"
              style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                width: 46, height: 46, borderRadius: '50%',
                background: 'rgba(255,255,255,.1)',
                border: '1px solid rgba(255,255,255,.18)',
                color: '#fff', cursor: lightbox === 0 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                opacity: lightbox === 0 ? 0.25 : 1,
                transition: 'opacity .15s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); next(); }}
              disabled={lightbox === images.length - 1}
              aria-label="Next photo"
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                width: 46, height: 46, borderRadius: '50%',
                background: 'rgba(255,255,255,.1)',
                border: '1px solid rgba(255,255,255,.18)',
                color: '#fff', cursor: lightbox === images.length - 1 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                opacity: lightbox === images.length - 1 ? 0.25 : 1,
                transition: 'opacity .15s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)',
              font: '500 13px Outfit,sans-serif',
              color: 'rgba(255,255,255,.65)',
              background: 'rgba(0,0,0,.35)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--r-pill, 999px)',
              padding: '5px 14px',
            }}>
              {lightbox + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
