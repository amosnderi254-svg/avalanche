import Link from 'next/link';
import Nav from '@/components/Nav';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--orange)', lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>
          Page not found
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '360px' }}>
          This item may have been removed or the link might be wrong.
          Browse current listings below.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: 'var(--orange)',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '999px',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.95rem',
          }}
        >
          Browse listings
        </Link>
      </main>
    </>
  );
}
