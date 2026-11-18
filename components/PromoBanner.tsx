'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Version key — bump to re-show the banner after a copy change
const BANNER_KEY = 'mtv_banner_v1';

export default function PromoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(BANNER_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(BANNER_KEY, '1'); } catch { /* ignore */ }
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes mtv-grad {
          0%   { background-position: 0% 50% }
          50%  { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @keyframes mtv-shine {
          0%   { transform: translateX(-120%) skewX(-20deg) }
          100% { transform: translateX(220%) skewX(-20deg) }
        }
        @keyframes mtv-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(219,39,119,0); transform: scale(1) }
          50%       { box-shadow: 0 0 0 5px rgba(219,39,119,.3); transform: scale(1.045) }
        }
        @keyframes mtv-fadein {
          from { opacity: 0; transform: translateY(-6px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        .mtv-banner-pill:hover {
          opacity: .9;
        }
      `}</style>

      <div
        role="banner"
        style={{
          background: 'linear-gradient(120deg, #0D0333 0%, #1A0845 20%, #6B21A8 60%, #DB2777 100%)',
          backgroundSize: '300% 300%',
          animation: 'mtv-grad 6s ease infinite, mtv-fadein .4s ease both',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: '11px 52px 11px 20px',
          position: 'relative',
          minHeight: 46,
          overflow: 'hidden',
        }}
      >
        {/* Sweeping light streak */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '40%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.13), transparent)',
            animation: 'mtv-shine 3.2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Copy */}
        <p style={{
          font: '500 14px/1.4 Outfit,sans-serif',
          color: '#fff',
          margin: 0,
          textAlign: 'center',
          letterSpacing: '.01em',
          position: 'relative',
          zIndex: 1,
        }}>
          Don&apos;t throw it away.{' '}
          <span style={{ fontWeight: 700 }}>
            A Nairobi parent is looking for exactly that.
          </span>
        </p>

        {/* CTA pill — pulses to draw the eye */}
        <Link
          href="/sell"
          className="mtv-banner-pill"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#fff',
            color: '#DB2777',
            font: '700 13px Outfit,sans-serif',
            padding: '7px 18px',
            borderRadius: 999,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            letterSpacing: '.01em',
            animation: 'mtv-pulse 2.4s ease-in-out infinite',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
            <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
          Sell Now
        </Link>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Close banner"
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,.75)',
            cursor: 'pointer',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            lineHeight: 1,
            transition: 'color .15s',
            zIndex: 1,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </>
  );
}
