'use client';
import { useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 'all',        label: 'All Items',  icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id: 'bikes',      label: 'Bikes',      icon: 'M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM12 17v-5l-3-3 4-4 3 3h3' },
  { id: 'scooters',   label: 'Scooters',   icon: 'M5 17a2 2 0 100-4 2 2 0 000 4zM17 5v8M12 5h9M12 5v8h5' },
  { id: 'strollers',  label: 'Strollers',  icon: 'M4 16s-1-2 0-2h16s1 2 0 2M6 20h12M2 8h20M6 8V4h12v4' },
  { id: 'car-seats',  label: 'Car Seats',  icon: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-2 10a2 2 0 002 2h4a2 2 0 002-2V9a2 2 0 00-2-2h-4a2 2 0 00-2 2v8zm4-6h2' },
  { id: 'toys',       label: 'Toys',       icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'books',      label: 'Books',      icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 014 4.5v15z' },
  { id: 'baby-gear',  label: 'Baby Gear',  icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { id: 'shoes',      label: 'Shoes',      icon: 'M22 11.5A6.5 6.5 0 0015.5 5h-3L6 7.5V14l3-1 2 3h3.5A6.5 6.5 0 0022 11.5z' },
  { id: 'clothing',   label: 'Clothing',   icon: 'M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z' },
];

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

const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' stroke-linecap='round' fill='none'/%3E%3C/svg%3E")`;

export default function ListingsFilterBar() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  // Committed filter state (mirrors URL)
  const category = searchParams.get('cat')  || 'all';
  const query    = searchParams.get('q')    || '';
  const minPrice = searchParams.get('min')  || '';
  const maxPrice = searchParams.get('max')  || '';
  const area     = searchParams.get('area') || '';
  const sort     = searchParams.get('sort') || 'newest';

  // Local uncommitted state (live while typing)
  const [localMin,   setLocalMin]   = useState(minPrice);
  const [localMax,   setLocalMax]   = useState(maxPrice);
  const [localQuery, setLocalQuery] = useState(query);
  const [showFilters, setShowFilters] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Push filter changes to URL — scroll: false keeps position
  function pushFilters(overrides: Record<string, string>) {
    const merged: Record<string, string> = {
      cat: category, q: query, min: minPrice,
      max: maxPrice, area, sort, ...overrides,
    };
    const p = new URLSearchParams();
    if (merged.cat  && merged.cat  !== 'all')    p.set('cat',  merged.cat);
    if (merged.q)                                 p.set('q',    merged.q);
    if (merged.min)                               p.set('min',  merged.min);
    if (merged.max)                               p.set('max',  merged.max);
    if (merged.area)                              p.set('area', merged.area);
    if (merged.sort && merged.sort !== 'newest')  p.set('sort', merged.sort);
    router.push(`/?${p.toString()}`, { scroll: false });
  }

  function clearFilters() {
    setLocalMin('');
    setLocalMax('');
    const p = new URLSearchParams();
    if (category && category !== 'all') p.set('cat', category);
    if (query) p.set('q', query);
    router.push(`/?${p.toString()}`, { scroll: false });
  }

  function applyCustomPrice() {
    pushFilters({ min: localMin, max: localMax });
  }

  function handleSearchInput(val: string) {
    setLocalQuery(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      pushFilters({ q: val });
    }, 380);
  }

  function clearSearch() {
    setLocalQuery('');
    clearTimeout(searchTimerRef.current);
    pushFilters({ q: '' });
  }

  const matchesPreset = (p: typeof PRICE_PRESETS[0]) => p.min === minPrice && p.max === maxPrice;
  const hasActiveFilters = !!(minPrice || maxPrice || area || sort !== 'newest');
  const activeFilterCount = [minPrice || maxPrice ? 1 : 0, area ? 1 : 0, sort !== 'newest' ? 1 : 0].reduce((a, b) => a + b, 0);
  const catLabel = CATEGORIES.find(c => c.id === category)?.label || 'Items';

  return (
    <>
      {/* ============ STICKY SEARCH + FILTER BAR ============ */}
      <div className="listings-header lfb-bar" style={{
        background: 'rgba(255,253,249,.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,.07)',
        paddingBottom: 0,
      }}>

        {/* Search row */}
        <div className="container" style={{ paddingTop: 14, paddingBottom: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#fff',
            border: `2px solid ${localQuery ? '#F07828' : 'rgba(0,0,0,.1)'}`,
            borderRadius: 14,
            padding: '0 16px',
            boxShadow: localQuery
              ? '0 4px 24px rgba(240,120,40,.14), 0 1px 6px rgba(0,0,0,.04)'
              : '0 2px 12px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.03)',
            transition: 'box-shadow .2s, border-color .2s',
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
              stroke={localQuery ? '#F07828' : '#C0BAB0'}
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true" style={{ flexShrink: 0, transition: 'stroke .2s' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              value={localQuery}
              onChange={e => handleSearchInput(e.target.value)}
              placeholder={category !== 'all' ? `Search ${catLabel.toLowerCase()}...` : 'Search bikes, strollers, toys...'}
              style={{
                flex: 1,
                minWidth: 0,
                width: '100%',
                height: 52,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                font: '400 16px Outfit,sans-serif',
                color: 'var(--text-1)',
              }}
            />
            {localQuery && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                style={{
                  width: 28, height: 28,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,.07)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background .15s',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="#555" strokeWidth="2.5" strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category pills - horizontal scroll */}
        <div className="container" style={{
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingTop: 0,
          paddingBottom: 12,
        }}>
          <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
            {CATEGORIES.map(cat => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => pushFilters({ cat: cat.id, q: localQuery })}
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    height: 40,
                    padding: '0 16px',
                    borderRadius: 999,
                    border: `2px solid ${active ? '#F07828' : 'rgba(0,0,0,.09)'}`,
                    background: active ? '#F07828' : '#fff',
                    color: active ? '#fff' : '#555',
                    font: `${active ? '700' : '500'} 13.5px Outfit,sans-serif`,
                    cursor: 'pointer',
                    transition: 'all .18s cubic-bezier(.4,0,.2,1)',
                    whiteSpace: 'nowrap',
                    boxShadow: active
                      ? '0 4px 14px rgba(240,120,40,.32)'
                      : '0 1px 4px rgba(0,0,0,.05)',
                    letterSpacing: active ? '-.01em' : 'normal',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={active ? '#fff' : '#F07828'}
                    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={cat.icon}/>
                  </svg>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,.06)', background: 'rgba(248,245,240,.7)' }}>

          {/* Desktop filter bar */}
          <div className="container filter-desktop" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            paddingTop: 10,
            paddingBottom: 10,
            flexWrap: 'wrap',
          }}>
            {PRICE_PRESETS.map(preset => {
              const active = matchesPreset(preset);
              return (
                <button
                  key={preset.label}
                  onClick={() => matchesPreset(preset)
                    ? pushFilters({ min: '', max: '' })
                    : pushFilters({ min: preset.min, max: preset.max })
                  }
                  style={{
                    height: 34, padding: '0 13px',
                    borderRadius: 999,
                    border: `1.5px solid ${active ? '#F07828' : 'rgba(0,0,0,.1)'}`,
                    background: active ? '#FFF0E6' : '#fff',
                    color: active ? '#F07828' : '#555',
                    font: `${active ? '700' : '500'} 12.5px Outfit,sans-serif`,
                    cursor: 'pointer',
                    transition: 'all .15s',
                    flexShrink: 0,
                    boxShadow: active ? '0 2px 8px rgba(240,120,40,.18)' : '0 1px 3px rgba(0,0,0,.05)',
                  }}
                >
                  {preset.label}
                </button>
              );
            })}

            {/* Custom range */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <input
                type="number" placeholder="Min KES"
                value={localMin}
                onChange={e => setLocalMin(e.target.value)}
                onBlur={applyCustomPrice}
                onKeyDown={e => e.key === 'Enter' && applyCustomPrice()}
                style={{
                  width: 78, height: 34, padding: '0 10px',
                  borderRadius: 999,
                  border: `1.5px solid ${minPrice && !PRICE_PRESETS.some(p => p.min === minPrice) ? '#F07828' : 'rgba(0,0,0,.1)'}`,
                  font: '400 12px Outfit,sans-serif',
                  outline: 'none', background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                  color: '#333',
                }}
              />
              <span style={{ font: '500 13px Outfit,sans-serif', color: '#AAA' }}>–</span>
              <input
                type="number" placeholder="Max KES"
                value={localMax}
                onChange={e => setLocalMax(e.target.value)}
                onBlur={applyCustomPrice}
                onKeyDown={e => e.key === 'Enter' && applyCustomPrice()}
                style={{
                  width: 78, height: 34, padding: '0 10px',
                  borderRadius: 999,
                  border: `1.5px solid ${maxPrice && !PRICE_PRESETS.some(p => p.max === maxPrice) ? '#F07828' : 'rgba(0,0,0,.1)'}`,
                  font: '400 12px Outfit,sans-serif',
                  outline: 'none', background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                  color: '#333',
                }}
              />
            </div>

            <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,.1)', flexShrink: 0 }}/>

            {/* Area */}
            <select
              value={area}
              onChange={e => pushFilters({ area: e.target.value })}
              style={{
                height: 34, padding: '0 28px 0 12px',
                borderRadius: 999,
                border: `1.5px solid ${area ? '#F07828' : 'rgba(0,0,0,.1)'}`,
                background: `${area ? '#FFF0E6' : '#fff'} ${CHEVRON_SVG} no-repeat right 9px center`,
                color: area ? '#F07828' : '#555',
                font: `${area ? '700' : '500'} 12.5px Outfit,sans-serif`,
                cursor: 'pointer', outline: 'none',
                WebkitAppearance: 'none', appearance: 'none',
                flexShrink: 0,
                boxShadow: area ? '0 2px 8px rgba(240,120,40,.18)' : '0 1px 3px rgba(0,0,0,.05)',
              }}
            >
              <option value="">All areas</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  height: 34, padding: '0 12px',
                  border: '1.5px solid rgba(0,0,0,.08)',
                  borderRadius: 999,
                  background: '#fff',
                  font: '500 12px Outfit,sans-serif',
                  color: '#888', cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Clear
              </button>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }}/>

            {/* Sort - always visible on right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
              <span style={{
                font: '500 12px Outfit,sans-serif',
                color: '#999',
                letterSpacing: '.02em',
                textTransform: 'uppercase',
                fontSize: 11,
              }}>Sort</span>
              <select
                value={sort}
                onChange={e => pushFilters({ sort: e.target.value })}
                style={{
                  height: 34, padding: '0 28px 0 12px',
                  borderRadius: 999,
                  border: `1.5px solid ${sort !== 'newest' ? '#F07828' : 'rgba(0,0,0,.1)'}`,
                  background: `${sort !== 'newest' ? '#FFF0E6' : '#fff'} ${CHEVRON_SVG} no-repeat right 9px center`,
                  color: sort !== 'newest' ? '#F07828' : '#555',
                  font: `${sort !== 'newest' ? '700' : '500'} 12.5px Outfit,sans-serif`,
                  cursor: 'pointer', outline: 'none',
                  WebkitAppearance: 'none', appearance: 'none',
                  boxShadow: sort !== 'newest' ? '0 2px 8px rgba(240,120,40,.18)' : '0 1px 3px rgba(0,0,0,.05)',
                }}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile filter bar */}
          <div className="container filter-mobile" style={{
            display: 'none',
            alignItems: 'center',
            gap: 8,
            paddingTop: 10,
            paddingBottom: 10,
          }}>
            <button
              onClick={() => setShowFilters(true)}
              style={{
                height: 40, padding: '0 16px',
                borderRadius: 999,
                border: `1.5px solid ${activeFilterCount > 0 ? '#F07828' : 'rgba(0,0,0,.1)'}`,
                background: activeFilterCount > 0 ? '#FFF0E6' : '#fff',
                color: activeFilterCount > 0 ? '#F07828' : '#555',
                font: `${activeFilterCount > 0 ? '700' : '500'} 13px Outfit,sans-serif`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                flexShrink: 0,
                boxShadow: activeFilterCount > 0
                  ? '0 2px 10px rgba(240,120,40,.2)'
                  : '0 1px 4px rgba(0,0,0,.06)',
              }}
            >
              <svg width="14" height="13" viewBox="0 0 14 13" fill="none"
                stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="1" y1="2" x2="13" y2="2"/>
                <line x1="3" y1="6.5" x2="11" y2="6.5"/>
                <line x1="5.5" y1="11" x2="8.5" y2="11"/>
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 20, height: 20, borderRadius: 999,
                  padding: '0 5px',
                  background: '#F07828', color: '#fff',
                  font: '700 11px Outfit,sans-serif',
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={sort}
              onChange={e => pushFilters({ sort: e.target.value })}
              style={{
                flex: 1,
                height: 40, padding: '0 28px 0 12px',
                borderRadius: 999,
                border: `1.5px solid ${sort !== 'newest' ? '#F07828' : 'rgba(0,0,0,.1)'}`,
                background: `${sort !== 'newest' ? '#FFF0E6' : '#fff'} ${CHEVRON_SVG} no-repeat right 11px center`,
                color: sort !== 'newest' ? '#F07828' : '#555',
                font: `${sort !== 'newest' ? '700' : '500'} 13px Outfit,sans-serif`,
                cursor: 'pointer', outline: 'none',
                WebkitAppearance: 'none', appearance: 'none',
                boxShadow: sort !== 'newest' ? '0 2px 10px rgba(240,120,40,.2)' : '0 1px 4px rgba(0,0,0,.06)',
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* ============ END STICKY FILTER BAR ============ */}

      {/* ============ MOBILE FILTER BOTTOM SHEET ============ */}
      {showFilters && (
        <>
          <div
            onClick={() => setShowFilters(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,.45)',
              zIndex: 100,
              animation: 'lfb-fadeIn .2s ease',
            }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            zIndex: 101,
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'lfb-slideUp .25s cubic-bezier(.22,.68,0,1.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D8D1C6' }}/>
            </div>

            <div style={{ padding: '16px 20px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ font: '700 18px Outfit,sans-serif', margin: 0, color: 'var(--text-1)' }}>
                  Filters
                </h3>
                <button
                  onClick={() => { clearFilters(); setShowFilters(false); }}
                  style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Reset all
                </button>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ font: '600 14px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 12px' }}>Price</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  {PRICE_PRESETS.map(preset => {
                    const active = matchesPreset(preset);
                    return (
                      <button
                        key={preset.label}
                        onClick={() => {
                          if (active) { setLocalMin(''); setLocalMax(''); pushFilters({ min: '', max: '' }); }
                          else { setLocalMin(preset.min); setLocalMax(preset.max); pushFilters({ min: preset.min, max: preset.max }); }
                        }}
                        style={{
                          height: 36, padding: '0 14px', borderRadius: 999,
                          border: `1.5px solid ${active ? 'var(--orange)' : 'var(--border)'}`,
                          background: active ? '#FFF0E6' : '#fff',
                          color: active ? 'var(--orange)' : 'var(--text-2)',
                          font: `${active ? '600' : '400'} 13px Outfit,sans-serif`,
                          cursor: 'pointer',
                        }}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number" placeholder="Min (KES)" value={localMin}
                    onChange={e => setLocalMin(e.target.value)}
                    onBlur={applyCustomPrice}
                    onKeyDown={e => e.key === 'Enter' && applyCustomPrice()}
                    style={{ flex: 1, height: 44, padding: '0 12px', borderRadius: 'var(--r-sm,8px)', border: '1.5px solid var(--border)', font: '400 14px Outfit,sans-serif', outline: 'none' }}
                  />
                  <span style={{ font: '14px Outfit,sans-serif', color: 'var(--text-3)', flexShrink: 0 }}>to</span>
                  <input
                    type="number" placeholder="Max (KES)" value={localMax}
                    onChange={e => setLocalMax(e.target.value)}
                    onBlur={applyCustomPrice}
                    onKeyDown={e => e.key === 'Enter' && applyCustomPrice()}
                    style={{ flex: 1, height: 44, padding: '0 12px', borderRadius: 'var(--r-sm,8px)', border: '1.5px solid var(--border)', font: '400 14px Outfit,sans-serif', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Area */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ font: '600 14px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 12px' }}>Area in Nairobi</p>
                <select
                  value={area}
                  onChange={e => pushFilters({ area: e.target.value })}
                  style={{
                    width: '100%', height: 48, padding: '0 14px',
                    borderRadius: 'var(--r-sm,8px)',
                    border: `1.5px solid ${area ? 'var(--orange)' : 'var(--border)'}`,
                    font: '400 14px Outfit,sans-serif',
                    color: area ? 'var(--text-1)' : 'var(--text-3)',
                    cursor: 'pointer', outline: 'none', background: '#fff',
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

              {/* Sort */}
              <div style={{ marginBottom: 36 }}>
                <p style={{ font: '600 14px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 8px' }}>Sort by</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => pushFilters({ sort: opt.value })}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        height: 48, padding: '0 14px',
                        borderRadius: 'var(--r-sm,8px)', border: 'none',
                        background: sort === opt.value ? '#FFF0E6' : 'transparent',
                        font: `${sort === opt.value ? '600' : '400'} 15px Outfit,sans-serif`,
                        color: sort === opt.value ? 'var(--orange)' : 'var(--text-2)',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      {opt.label}
                      {sort === opt.value && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round"
                        >
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                See results
              </button>
            </div>
          </div>
        </>
      )}

      {/* ============ STYLES ============ */}
      <style>{`
        @keyframes lfb-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lfb-slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0);    }
        }
        /* Sticky only on desktop — mobile nav already handles navigation */
        .lfb-bar {
          position: sticky;
          top: 64px;
          z-index: 40;
        }
        @media (max-width: 639px) {
          .lfb-bar {
            position: relative;
            top: auto;
            z-index: auto;
          }
          .filter-desktop { display: none !important; }
          .filter-mobile  { display: flex !important; }
        }
        input[type="search"]::-webkit-search-cancel-button { display: none; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>
    </>
  );
}
