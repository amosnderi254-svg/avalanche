'use client';
import { useEffect } from 'react';
import Nav from '@/components/Nav';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    // Log error to console for debugging -- swap for Sentry/Datadog in production
    console.error('[MyTinyverse error]', error);
  }, [error]);

  return (
    <>
      <Nav/>
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: '#FFF3E0',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F07828" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h1 style={{ font: '700 22px Outfit,sans-serif', margin: '0 0 10px', color: 'var(--text-1)' }}>
          Something went wrong
        </h1>
        <p style={{ font: '400 14px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 28px' }}>
          An unexpected error occurred. Please try again -- if the problem continues,{' '}
          <a href="https://wa.me/254790784084" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--green)' }}>
            WhatsApp us
          </a>{' '}
          and we'll sort it out.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={reset}
          >
            Try again
          </button>
          <a href="/" className="btn btn-secondary btn-sm">
            Go home
          </a>
        </div>
      </div>
    </>
  );
}
