'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ListingCard from './ListingCard';
import type { Listing } from '@/types';
import { CATEGORIES } from '@/lib/constants';

const PAGE_SIZE = 20;

const AREAS = [
  'CBD', 'Westlands', 'Karen', 'Lavington', 'Kilimani', 'Kileleshwa',
  'Runda', 'Muthaiga', 'Parklands', 'Upperhill', 'Ngong Road',
  'South B', 'South C', 'Kasarani', 'Embakasi', 'Ruaka', 'Kikuyu',
  'Langata', 'Thika Road', 'Kitisuru', 'Loresho', 'Gigiri',
  'Spring Valley', 'Ridgeways', 'Donholm', 'Buruburu', 'Eastlands',
  'Mombasa Road', 'Ruiru', 'Athi River', 'Syokimau',
];

const PRICE_PRESETS = [
  { label: 'Free',      min: '0',    max: '0'    },
  { label: 'Under 500', min: '',     max: '500'  },
  { label: '500-2K',    min: '500',  max: '2000' },
  { label: '2K-5K',     min: '2000', max: '5000' },
  { label: '5K+',       min: '5000', max: ''     },
];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first'       },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

// Custom chevron SVG as data-URI for <select> backgrounds
const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' stroke-linecap='round' fill='none'/%3E%3C/svg%3E")`;

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- Listings state ---
  const [listings, setListings]     = useState<Listing[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(false);
  const [total, setTotal]           = useState(0);

  // --- URL-driven filter state ---
  const [category, setCategory] = useState(searchParams.get('cat')  || 'all');
  const [query,    setQuery]    = useState(searchParams.get('q')    || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min')  || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max')  || '');
  const [area,     setArea]     = useState(searchParams.get('area') || '');
  const [sort,     setSort]     = useState(searchParams.get('sort') || 'newest');

  // Local (uncommitted) state for custom price inputs
  const [localMin, setLocalMin] = useState(searchParams.get('min') || '');
  const [localMax, setLocalMax] = useState(searchParams.get('max') || '');

  // Mobile bottom-sheet
  const [showFilters, setShowFilters] = useState(false);

  // Tracks the last filter combination to prevent duplicate fetches
  const filterKeyRef = useRef('');

  // -------------------------------------------------------
  // Build API query string
  // -------------------------------------------------------
  function buildApiParams(
    cat: string, q: string, min: string, max: string,
    ar: string, srt: string, pg: number,
  ) {
    const p = new URLSearchParams();
    if (cat && cat !== 'all') p.set('category', cat);
    if (q)                    p.set('q', q);
    if (min)                  p.set('min', min);
    if (max)                  p.set('max', max);
    if (ar)                   p.set('area', ar);
    if (srt && srt !== 'newest') p.set('sort', srt);
    p.set('page',  String(pg));
    p.set('limit', String(PAGE_SIZE));
    return p;
  }

  // -------------------------------------------------------
  // Fetch
  // -------------------------------------------------------
  const fetchListings = useCallback(async (
    cat: string, q: string, min: string, max: string,
    ar: string, srt: string, pg: number, append: boolean,
  ) => {
    if (pg === 1) setLoading(true);
    else          setLoadingMore(true);
    try {
      const res  = await fetch(`/api/listings?${buildApiParams(cat, q, min, max, ar, srt, pg)}`);
      const data = await res.json();
      const items: Listing[] = data.listings || [];
      setListings(prev => append ? [...prev, ...items] : items);
      setHasMore(data.hasMore ?? false);
      setTotal(data.total   ?? 0);
    } catch {
      if (!append) setListings([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // -------------------------------------------------------
  // Sync state from URL whenever search params change
  // -------------------------------------------------------
  useEffect(() => {
    const cat = searchParams.get('cat')  || 'all';
    const q   = searchParams.get('q')    || '';
    const min = searchParams.get('min')  || '';
    const max = searchParams.get('max')  || '';
    const ar  = searchParams.get('area') || '';
    const srt = searchParams.get('sort') || 'newest';
    const key = `${cat}|${q}|${min}|${max}|${ar}|${srt}`;

    if (key !== filterKeyRef.current) {
      filterKeyRef.current = key;
      setCategory(cat);
      setQuery(q);
      setMinPrice(min);
      setMaxPrice(max);
      setLocalMin(min);
      setLocalMax(max);
      setArea(ar);
      setSort(srt);
      setPage(1);
      fetchListings(cat, q, min, max, ar, srt, 1, false);
    }
  }, [searchParams, fetchListings]);

  // -------------------------------------------------------
  // Push filter changes to URL
  // -------------------------------------------------------
  function pushFilters(overrides: Record<string, string>) {
    const merged: Record<string, string> = {
      cat: category, q: query, min: minPrice,
      max: maxPrice, area, sort, ...overrides,
    };
    const p = new URLSearchParams();
    if (merged.cat  && merged.cat  !== 'all')     p.set('cat',  merged.cat);
    if (merged.q)                                  p.set('q',    merged.q);
    if (merged.min)                                p.set('min',  merged.min);
    if (merged.max)                                p.set('max',  merged.max);
    if (merged.area)                               p.set('area', merged.area);
    if (merged.sort && merged.sort !== 'newest')   p.set('sort', merged.sort);
    router.push(`/?${p.toString()}`);
  }

  function clearFilters() {
    setLocalMin('');
    setLocalMax('');
    const p = new URLSearchParams();
    if (category && category !== 'all') p.set('cat', category);
    if (query) p.set('q', query);
    router.push(`/?${p.toString()}`);
  }

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings(category, query, minPrice, maxPrice, area, sort, nextPage, true);
  }

  function applyCustomPrice() {
    pushFilters({ min: localMin, max: localMax });
  }

  // -------------------------------------------------------
  // Derived state
  // -------------------------------------------------------
  const matchesPreset = (p: typeof PRICE_PRESETS[0]) =>
    p.min === minPrice && p.max === maxPrice;

  const activeFilterCount = [
    minPrice || maxPrice ? 1 : 0,
    area     ? 1 : 0,
    sort !== 'newest' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const hasActiveFilters =
    !!(minPrice || maxPrice || area || sort !== 'newest');

  // -------------------------------------------------------
  // Shared select style builder
  // -------------------------------------------------------
  function selectStyle(active: boolean): React.CSSProperties {
    return {
      height: 32,
      padding: '0 28px 0 10px',
      borderRadius: 'var(--r-pill)',
      border: `1.5px solid ${active ? 'var(--orange)' : 'var(--border)'}`,
      background: active ? '#FFF0E6' : '#fff',
      color: active ? 'var(--orange)' : 'var(--text-2)',
      font: `${active ? '600' : '400'} 12px Outfit,sans-serif`,
      cursor: 'pointer',
      outline: 'none',
      WebkitAppearance: 'none',
      appearance: 'none',
      backgroundImage: CHEVRON_SVG,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
    };
  }

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <section style={{ padding: '24px 0 60px' }}>
      <div className="container">

        {/* ---- Category pills ---- */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none', marginBottom: 16,
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => pushFilters({ cat: cat.id })}
              style={{
                flexShrink: 0,
                height: 36,
                padding: '0 14px',
                borderRadius: 'var(--r-pill)',
                border: `1.5px solid ${category === cat.id ? 'var(--orange)' : 'var(--border)'}`,
                background: category === cat.id ? 'var(--orange)' : '#fff',
                color: category === cat.id ? '#fff' : 'var(--text-2)',
                font: `${category === cat.id ? '600' : '400'} 13px Outfit,sans-serif`,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ---- Desktop filter bar ---- */}
        <div
          className="filter-desktop"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          {/* Price presets */}
          {PRICE_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() =>
                matchesPreset(preset)
                  ? pushFilters({ min: '', max: '' })
                  : pushFilters({ min: preset.min, max: preset.max })
              }
              style={{
                flexShrink: 0,
                height: 32,
                padding: '0 12px',
                borderRadius: 'var(--r-pill)',
                border: `1.5px solid ${matchesPreset(preset) ? 'var(--orange)' : 'var(--border)'}`,
                background: matchesPreset(preset) ? '#FFF0E6' : '#fff',
                color: matchesPreset(preset) ? 'var(--orange)' : 'var(--text-2)',
                font: `${matchesPreset(preset) ? '600' : '400'} 12px Outfit,sans-serif`,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {preset.label}
            </button>
          ))}

          {/* Custom price range inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="number"
              placeholder="Min KES"
              value={localMin}
              onChange={e => setLocalMin(e.target.value)}
              onBlur={applyCustomPrice}
              onKeyDown={e => e.key === 'Enter' && applyCustomPrice()}
              style={{
                width: 76, height: 32, padding: '0 8px',
                borderRadius: 'var(--r-pill)',
                border: `1.5px solid ${minPrice && !PRICE_PRESETS.some(p => p.min === minPrice) ? 'var(--orange)' : 'var(--border)'}`,
                font: '400 12px Outfit,sans-serif',
                outline: 'none',
              }}
            />
            <span style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)' }}>-</span>
            <input
              type="number"
              placeholder="Max KES"
              value={localMax}
              onChange={e => setLocalMax(e.target.value)}
              onBlur={applyCustomPrice}
              onKeyDown={e => e.key === 'Enter' && applyCustomPrice()}
              style={{
                width: 76, height: 32, padding: '0 8px',
                borderRadius: 'var(--r-pill)',
                border: `1.5px solid ${maxPrice && !PRICE_PRESETS.some(p => p.max === maxPrice) ? 'var(--orange)' : 'var(--border)'}`,
                font: '400 12px Outfit,sans-serif',
                outline: 'none',
              }}
            />
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }}/>

          {/* Area */}
          <select
            value={area}
            onChange={e => pushFilters({ area: e.target.value })}
            style={selectStyle(!!area)}
          >
            <option value="">All areas</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => pushFilters({ sort: e.target.value })}
            style={selectStyle(sort !== 'newest')}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                height: 32, padding: '0 10px',
                border: 'none', background: 'none',
                font: '400 12px Outfit,sans-serif',
                color: 'var(--text-3)',
                cursor: 'pointer',
                textDecoration: 'underline',
                flexShrink: 0,
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* ---- Mobile filter bar ---- */}
        <div
          className="filter-mobile"
          style={{ display: 'none', alignItems: 'center', gap: 8, marginBottom: 20 }}
        >
          {/* Filters button with badge */}
          <button
            onClick={() => setShowFilters(true)}
            style={{
              height: 36, padding: '0 14px',
              borderRadius: 'var(--r-pill)',
              border: `1.5px solid ${activeFilterCount > 0 ? 'var(--orange)' : 'var(--border)'}`,
              background: activeFilterCount > 0 ? '#FFF0E6' : '#fff',
              color: activeFilterCount > 0 ? 'var(--orange)' : 'var(--text-2)',
              font: '500 13px Outfit,sans-serif',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              flexShrink: 0,
            }}
          >
            {/* Filter icon */}
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="2" x2="12" y2="2"/>
              <line x1="3" y1="6" x2="10" y2="6"/>
              <line x1="5" y1="10" x2="8" y2="10"/>
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--orange)', color: '#fff',
                font: '700 11px Outfit,sans-serif',
                flexShrink: 0,
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Mobile sort */}
          <select
            value={sort}
            onChange={e => pushFilters({ sort: e.target.value })}
            style={{
              ...selectStyle(sort !== 'newest'),
              height: 36,
              font: `${sort !== 'newest' ? '600' : '400'} 13px Outfit,sans-serif`,
            }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* ---- Results header ---- */}
        {!loading && (
          <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 16px' }}>
            {listings.length === 0
              ? (query ? `No results for "${query}"` : 'No listings yet -- be the first to sell!')
              : `${total.toLocaleString()} item${total === 1 ? '' : 's'}${query ? ` for "${query}"` : ''}`
            }
          </p>
        )}

        {/* ---- Grid ---- */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--r-md)', background: '#f5f4f2', paddingTop: '66%', animation: 'pulse 1.4s ease-in-out infinite' }}/>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ font: '700 18px Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 8px' }}>Nothing here yet</p>
            <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 20px' }}>
              {query ? 'Try a different search term or browse all categories.' : (hasActiveFilters ? 'No items match your filters -- try adjusting them.' : 'Be the first parent to list something!')}
            </p>
            {(query || hasActiveFilters) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setLocalMin(''); setLocalMax(''); router.push('/'); }}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing}/>
              ))}
            </div>

            {/* Load more */}
            {(hasMore || loadingMore) && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                {loadingMore ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 16 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{ borderRadius: 'var(--r-md)', background: '#f5f4f2', paddingTop: '66%', animation: 'pulse 1.4s ease-in-out infinite' }}/>
                    ))}
                  </div>
                ) : (
                  <button className="btn btn-secondary" onClick={loadMore} style={{ minWidth: 180 }}>
                    Load more
                  </button>
                )}
              </div>
            )}

            {!hasMore && !loadingMore && total > PAGE_SIZE && (
              <p style={{ textAlign: 'center', font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', marginTop: 28 }}>
                All {total.toLocaleString()} items shown
              </p>
            )}
          </>
        )}
      </div>

      {/* ---- Mobile filters bottom-sheet ---- */}
      {showFilters && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShowFilters(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.42)',
              zIndex: 100,
              animation: 'fadeIn .2s ease',
            }}
          />

          {/* Sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            zIndex: 101,
            maxHeight: '88vh',
            overflowY: 'auto',
            animation: 'slideUp .25s ease',
          }}>
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e0e0e0' }}/>
            </div>

            <div style={{ padding: '16px 20px 36px' }}>
              {/* Sheet header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ font: '700 18px Outfit,sans-serif', margin: 0, color: 'var(--text-1)' }}>Filters</h3>
                <button
                  onClick={() => { clearFilters(); setShowFilters(false); }}
                  style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Reset all
                </button>
              </div>

              {/* Price section */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ font: '600 14px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 12px' }}>Price</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  {PRICE_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        if (matchesPreset(preset)) {
                          setLocalMin(''); setLocalMax('');
                          pushFilters({ min: '', max: '' });
                        } else {
                          setLocalMin(preset.min); setLocalMax(preset.max);
                          pushFilters({ min: preset.min, max: preset.max });
                        }
                      }}
                      style={{
                        height: 36, padding: '0 14px',
                        borderRadius: 'var(--r-pill)',
                        border: `1.5px solid ${matchesPreset(preset) ? 'var(--orange)' : 'var(--border)'}`,
                        background: matchesPreset(preset) ? '#FFF0E6' : '#fff',
                        color: matchesPreset(preset) ? 'var(--orange)' : 'var(--text-2)',
                        font: `${matchesPreset(preset) ? '600' : '400'} 13px Outfit,sans-serif`,
                        cursor: 'pointer',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom range */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    placeholder="Min (KES)"
                    value={localMin}
                    onChange={e => setLocalMin(e.target.value)}
                    onBlur={applyCustomPrice}
                    onKeyDown={e => e.key === 'Enter' && applyCustomPrice()}
                    style={{
                      flex: 1, height: 42, padding: '0 12px',
                      borderRadius: 'var(--r-sm)',
                      border: '1.5px solid var(--border)',
                      font: '400 14px Outfit,sans-serif',
                      outline: 'none',
                    }}
                  />
                  <span style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', flexShrink: 0 }}>to</span>
                  <input
                    type="number"
                    placeholder="Max (KES)"
                    value={localMax}
                    onChange={e => setLocalMax(e.target.value)}
                    onBlur={applyCustomPrice}
                    onKeyDown={e => e.key === 'Enter' && applyCustomPrice()}
                    style={{
                      flex: 1, height: 42, padding: '0 12px',
                      borderRadius: 'var(--r-sm)',
                      border: '1.5px solid var(--border)',
                      font: '400 14px Outfit,sans-serif',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Area section */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ font: '600 14px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 12px' }}>Area</p>
                <select
                  value={area}
                  onChange={e => pushFilters({ area: e.target.value })}
                  style={{
                    width: '100%', height: 44, padding: '0 12px',
                    borderRadius: 'var(--r-sm)',
                    border: `1.5px solid ${area ? 'var(--orange)' : 'var(--border)'}`,
                    font: '400 14px Outfit,sans-serif',
                    color: area ? 'var(--text-1)' : 'var(--text-3)',
                    cursor: 'pointer', outline: 'none',
                    background: '#fff',
                    WebkitAppearance: 'none', appearance: 'none',
                    backgroundImage: CHEVRON_SVG,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                  }}
                >
                  <option value="">All areas in Nairobi</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Sort section */}
              <div style={{ marginBottom: 36 }}>
                <p style={{ font: '600 14px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 8px' }}>Sort by</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => pushFilters({ sort: opt.value })}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        height: 44, padding: '0 14px',
                        borderRadius: 'var(--r-sm)',
                        border: 'none',
                        background: sort === opt.value ? '#FFF0E6' : 'transparent',
                        font: `${sort === opt.value ? '600' : '400'} 14px Outfit,sans-serif`,
                        color: sort === opt.value ? 'var(--orange)' : 'var(--text-2)',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      {opt.label}
                      {sort === opt.value && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply button */}
              <button
                onClick={() => setShowFilters(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {total > 0 ? `See ${total.toLocaleString()} result${total === 1 ? '' : 's'}` : 'Apply filters'}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: .5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0);    }
        }
        /* Hide desktop filters, show mobile bar on small screens */
        @media (max-width: 639px) {
          .filter-desktop { display: none   !important; }
          .filter-mobile  { display: flex   !important; }
        }
      `}</style>
    </section>
  );
}
