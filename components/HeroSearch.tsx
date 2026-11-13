'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ── Static data ───────────────────────────────────── */
const POPULAR = ['Bikes', 'Strollers', 'Car seats', 'Lego', 'Baby bouncer', 'Scooter', 'Books', 'Shoes'];

const QUICK_CATS = [
  { id: 'bikes',     label: 'Bikes & Scooters', icon: 'M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM12 17v-5l-3-3 4-4 3 3h3' },
  { id: 'strollers', label: 'Strollers',        icon: 'M4 16s-1-2 0-2h16s1 2 0 2M6 20h12M2 8h20M6 8V4h12v4' },
  { id: 'car-seats', label: 'Car Seats',        icon: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3' },
  { id: 'toys',      label: 'Toys & Games',     icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'books',     label: 'Books',            icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 014 4.5v15z' },
  { id: 'baby-gear', label: 'Baby Gear',        icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
];

/* ── Types ─────────────────────────────────────────── */
type Suggestion = {
  id: string;
  label: string;
  price: string;
  location: string;
  category: string;
  href: string;
};

type MatchedCat = {
  id: string;
  label: string;
  href: string;
};

type NavItem = { href: string; label: string };

/* ── Component ─────────────────────────────────────── */
export default function HeroSearch() {
  const [query, setQuery]           = useState('');
  const [open, setOpen]             = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [matchedCats, setMatchedCats] = useState<MatchedCat[]>([]);
  const [loading, setLoading]       = useState(false);
  const [activeIdx, setActiveIdx]   = useState(-1);

  const router    = useRouter();
  const wrapRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout>>();

  /* ── Fetch ─────────────────────────────────────── */
  const fetchSuggestions = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json() as { suggestions: Suggestion[]; matchedCats: MatchedCat[] };
      setSuggestions(data.suggestions ?? []);
      setMatchedCats(data.matchedCats ?? []);
    } catch {
      setSuggestions([]);
      setMatchedCats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Input change ──────────────────────────────── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    clearTimeout(timerRef.current);
    if (val.length >= 2) {
      timerRef.current = setTimeout(() => fetchSuggestions(val), 280);
    } else {
      setSuggestions([]);
      setMatchedCats([]);
    }
  };

  /* ── Click outside ─────────────────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Keyboard nav ──────────────────────────────── */
  const flatItems: NavItem[] = [
    ...matchedCats.map(c => ({ href: c.href, label: c.label })),
    ...suggestions.map(s => ({ href: s.href, label: s.label })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, flatItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, -1));
        break;
      case 'Escape':
        setOpen(false);
        setActiveIdx(-1);
        break;
      case 'Enter':
        if (activeIdx >= 0 && flatItems[activeIdx]) {
          e.preventDefault();
          router.push(flatItems[activeIdx].href);
          setOpen(false);
        }
        break;
    }
  };

  /* ── Submit ────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : '/');
    setOpen(false);
  };

  /* ── Helpers ───────────────────────────────────── */
  const clear = () => {
    setQuery('');
    setSuggestions([]);
    setMatchedCats([]);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const showDropdown = open;
  const hasResults   = suggestions.length > 0 || matchedCats.length > 0;
  const isTyping     = query.length >= 2;

  /* ── Render ────────────────────────────────────── */
  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>

      {/* ── Search bar ─────────────────────────────── */}
      <form onSubmit={handleSubmit} role="search">
        <div
          style={{
            display: 'flex',
            border: '2.5px solid #1A1A1A',
            borderRadius: 14,
            boxShadow: open ? '0 4px 24px rgba(240,120,40,.18), 0 1px 4px rgba(0,0,0,.08)' : '0 2px 16px rgba(0,0,0,.1)',
            overflow: 'hidden',
            background: '#fff',
            transition: 'box-shadow .2s ease',
          }}
        >
          {/* Search icon / spinner */}
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 20, flexShrink: 0 }}>
            {loading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2a10 10 0 010 20" stroke="#F07828" strokeWidth="2.5" strokeLinecap="round">
                  <animateTransform
                    attributeName="transform" type="rotate"
                    from="0 12 12" to="360 12 12"
                    dur="0.75s" repeatCount="indefinite"
                  />
                </path>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={open ? '#F07828' : '#aaa'} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: 'stroke .2s' }} aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            name="q"
            type="text"
            autoComplete="off"
            spellCheck="false"
            value={query}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search bikes, strollers, toys..."
            aria-label="Search listings"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              font: '500 17px/1 Outfit,sans-serif',
              color: '#1A1A1A',
              background: 'transparent',
              padding: '20px 10px',
              minWidth: 0,
            }}
          />

          {/* Clear */}
          {query && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32,
                margin: 'auto 6px',
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                flexShrink: 0,
                color: '#666',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}

          {/* Search button */}
          <button
            type="submit"
            style={{
              padding: '0 30px',
              background: '#F07828',
              color: '#fff',
              border: 'none',
              font: '700 15px Outfit,sans-serif',
              cursor: 'pointer',
              letterSpacing: '.01em',
              flexShrink: 0,
              transition: 'background .15s',
            }}
          >
            Search
          </button>
        </div>
      </form>

      {/* ── Dropdown ───────────────────────────────── */}
      {showDropdown && (
        <div
          role="listbox"
          aria-label="Search suggestions"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            right: 0,
            background: '#fff',
            border: '2px solid #1A1A1A',
            borderRadius: 14,
            boxShadow: '0 8px 40px rgba(0,0,0,.14), 0 2px 8px rgba(0,0,0,.08)',
            zIndex: 200,
            overflow: 'hidden',
            animation: 'heroDropIn .15s ease',
          }}
        >
          {/* ── Empty: popular + categories ──────── */}
          {!isTyping && (
            <>
              <div style={{ padding: '16px 18px 12px' }}>
                <div style={{
                  font: '700 10px Outfit,sans-serif',
                  color: '#bbb',
                  textTransform: 'uppercase',
                  letterSpacing: '.1em',
                  marginBottom: 10,
                }}>
                  Popular searches
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {POPULAR.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { router.push(`/?q=${encodeURIComponent(p)}`); setOpen(false); }}
                      style={{
                        padding: '6px 13px',
                        background: '#FFF3EB',
                        border: '1.5px solid #FFD5B0',
                        borderRadius: 999,
                        font: '600 12px Outfit,sans-serif',
                        color: '#F07828',
                        cursor: 'pointer',
                        transition: 'background .1s',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f4f4f4', paddingBottom: 6 }}>
                <div style={{
                  padding: '12px 18px 6px',
                  font: '700 10px Outfit,sans-serif',
                  color: '#bbb',
                  textTransform: 'uppercase',
                  letterSpacing: '.1em',
                }}>
                  Browse by category
                </div>
                {QUICK_CATS.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/?cat=${cat.id}`}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 18px',
                      textDecoration: 'none',
                      color: '#1A1A1A',
                      transition: 'background .1s',
                    }}
                    className="hs-row"
                  >
                    <div style={{
                      width: 34, height: 34,
                      background: '#FFF3EB',
                      borderRadius: 9,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="#F07828" strokeWidth="1.75"
                        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                      >
                        <path d={cat.icon}/>
                      </svg>
                    </div>
                    <span style={{ font: '500 14px Outfit,sans-serif' }}>{cat.label}</span>
                    <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="14" height="14"
                      viewBox="0 0 24 24" fill="none"
                      stroke="#ccc" strokeWidth="2" strokeLinecap="round"
                    >
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* ── Typing: live results ──────────────── */}
          {isTyping && (
            <div>
              {/* Category matches */}
              {matchedCats.length > 0 && (
                <div style={{ borderBottom: suggestions.length > 0 ? '1px solid #f4f4f4' : 'none' }}>
                  <div style={{ padding: '12px 18px 6px', font: '700 10px Outfit,sans-serif', color: '#bbb', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    Categories
                  </div>
                  {matchedCats.map((cat, ci) => {
                    const isActive = activeIdx === ci;
                    return (
                      <Link
                        key={cat.id}
                        href={cat.href}
                        onClick={() => setOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 18px',
                          background: isActive ? '#FFF3EB' : 'transparent',
                          textDecoration: 'none',
                          color: '#1A1A1A',
                          transition: 'background .1s',
                        }}
                        className="hs-row"
                      >
                        <div style={{ width: 34, height: 34, background: '#FFF3EB', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F07828" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 5h20M3 12h20M3 19h20"/>
                          </svg>
                        </div>
                        <span style={{ font: '500 14px Outfit,sans-serif' }}>{cat.label}</span>
                        <span style={{ marginLeft: 'auto', font: '500 11px Outfit,sans-serif', color: '#F07828', background: '#FFF3EB', padding: '2px 8px', borderRadius: 999, flexShrink: 0 }}>Category</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Listing matches */}
              {suggestions.length > 0 && (
                <div style={{ paddingBottom: 6 }}>
                  <div style={{ padding: '12px 18px 6px', font: '700 10px Outfit,sans-serif', color: '#bbb', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    Listings
                  </div>
                  {suggestions.map((item, si) => {
                    const isActive = activeIdx === matchedCats.length + si;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 18px',
                          background: isActive ? '#FFF3EB' : 'transparent',
                          textDecoration: 'none',
                          color: '#1A1A1A',
                          transition: 'background .1s',
                        }}
                        className="hs-row"
                      >
                        <div style={{ width: 36, height: 36, background: '#f5f5f5', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ font: '500 14px Outfit,sans-serif', color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.label}
                          </div>
                          <div style={{ font: '400 12px Outfit,sans-serif', color: '#888', marginTop: 2 }}>
                            <span style={{ color: item.price === 'FREE' ? '#7DC243' : '#F07828', fontWeight: 600 }}>{item.price}</span>
                            {item.location ? ` - ${item.location}` : ''}
                          </div>
                        </div>
                        <svg style={{ flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* No results */}
              {!loading && !hasResults && (
                <div style={{ padding: '24px 18px', textAlign: 'center' }}>
                  <div style={{ font: '500 14px Outfit,sans-serif', color: '#999', marginBottom: 14 }}>
                    No listings found for &ldquo;{query}&rdquo;
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit as unknown as React.MouseEventHandler}
                    style={{
                      padding: '8px 18px',
                      background: '#FFF3EB',
                      border: '1.5px solid #F07828',
                      borderRadius: 8,
                      font: '600 13px Outfit,sans-serif',
                      color: '#F07828',
                      cursor: 'pointer',
                    }}
                  >
                    Search anyway
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes heroDropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hs-row:hover { background: #FFF9F5 !important; }
      `}</style>
    </div>
  );
}
