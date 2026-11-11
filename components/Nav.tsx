'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

export default function Nav() {
  const router = useRouter();
  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#fff', borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', gap: 12, height: 64,
      }}>

        {/* Logo */}
        {!searchActive && (
          <Link href="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            {/* Full logo on desktop, icon-only on mobile */}
            <img
              src="/logo.png"
              alt="MyTinyverse"
              height={36}
              style={{ height: 36, width: 'auto', display: 'block' }}
              className="hide-mobile"
            />
            <img
              src="/favicon-source.png"
              alt="MyTinyverse"
              width={32}
              height={32}
              style={{ width: 32, height: 32, borderRadius: 8, display: 'block' }}
              className="show-mobile"
            />
          </Link>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          maxWidth: searchActive ? '100%' : 420,
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <svg style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="search"
              placeholder="Search bikes, strollers, toys..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setSearchActive(true)}
              onBlur={() => setTimeout(() => setSearchActive(false), 150)}
              style={{
                width: '100%', height: 40,
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-pill)',
                padding: '0 14px 0 42px',
                font: '400 14px Outfit,sans-serif',
                color: '#111',
                background: '#fafaf8',
                outline: 'none',
              }}
            />
          </div>
          {searchActive && (
            <button type="button" onClick={() => { setQuery(''); setSearchActive(false); inputRef.current?.blur(); }}
              style={{ background:'none', border:'none', font:'600 13px Outfit,sans-serif', color:'var(--orange)', cursor:'pointer', flexShrink:0 }}>
              Cancel
            </button>
          )}
        </form>

        {/* Actions */}
        {!searchActive && (
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            {/* Saved */}
            <Link
              href="/saved"
              title="Saved listings"
              style={{
                width: 38, height: 38, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid var(--border)', background: '#fff',
                color: 'var(--text-2)', textDecoration: 'none',
                transition: 'border-color .15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </Link>
            <Link href="/sell" className="btn btn-primary btn-sm">
              + Sell
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
