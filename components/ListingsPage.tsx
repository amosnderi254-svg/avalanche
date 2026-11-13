'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ListingCard from './ListingCard';
import EmptyState from './EmptyState';
import type { Listing } from '@/types';

const PAGE_SIZE = 20;

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

// Category-specific empty state content
const EMPTY_STATE: Record<string, { headline: string; sub: string; cta: string; icon: string }> = {
  'bikes': {
    headline: 'No bikes listed yet',
    sub: 'Be the first Nairobi parent to list a kids bike here. Someone is looking for one right now.',
    cta: 'List your bike',
    icon: 'M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM12 17v-5l-3-3 4-4 3 3h3',
  },
  'car-seats': {
    headline: 'No car seats here yet',
    sub: 'Got a car seat your little one has outgrown? Help another Nairobi family stay safe.',
    cta: 'List your car seat',
    icon: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-2 10a2 2 0 002 2h4a2 2 0 002-2V9a2 2 0 00-2-2h-4a2 2 0 00-2 2v8zm4-6h2',
  },
  'strollers': {
    headline: 'No strollers listed yet',
    sub: 'Your stroller deserves a second life. List it here and find it a new family.',
    cta: 'List your stroller',
    icon: 'M4 16s-1-2 0-2h16s1 2 0 2M6 20h12M2 8h20M6 8V4h12v4',
  },
  'toys': {
    headline: 'No toys yet',
    sub: 'Your kids have outgrown something fun. List it here and declutter your home.',
    cta: 'List a toy',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  'books': {
    headline: 'No books listed yet',
    sub: 'Share the love of reading. List kids books that have found a new chapter to tell.',
    cta: 'List your books',
    icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 014 4.5v15z',
  },
  'scooters': {
    headline: 'No scooters here yet',
    sub: 'Got a scooter gathering dust? List it and let another kid zoom around Nairobi.',
    cta: 'List your scooter',
    icon: 'M5 17a2 2 0 100-4 2 2 0 000 4zM17 5v8M12 5h9M12 5v8h5',
  },
  'baby-gear': {
    headline: 'No baby gear yet',
    sub: 'Baby items are only useful for such a short time. Pass them on to another family.',
    cta: 'List baby gear',
    icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  },
  'shoes': {
    headline: 'No shoes listed yet',
    sub: 'Kids outgrow shoes so fast. List the ones sitting at the door -- they deserve more steps.',
    cta: 'List shoes',
    icon: 'M22 11.5A6.5 6.5 0 0015.5 5h-3L6 7.5V14l3-1 2 3h3.5A6.5 6.5 0 0022 11.5z',
  },
  'clothing': {
    headline: 'No clothing listed yet',
    sub: 'Kids grow out of everything. Pass on the clothes that no longer fit.',
    cta: 'List clothing',
    icon: 'M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z',
  },
};

const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' stroke-linecap='round' fill='none'/%3E%3C/svg%3E")`;

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings]       = useState<Listing[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(false);
  const [total, setTotal]             = useState(0);

  const [category, setCategory] = useState(searchParams.get('cat')  || 'all');
  const [query,    setQuery]    = useState(searchParams.get('q')    || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min')  || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max')  || '');
  const [area,     setArea]     = useState(searchParams.get('area') || '');
  const [sort,     setSort]     = useState(searchParams.get('sort') || 'newest');

  // Local uncommitted state
  const [localMin,   setLocalMin]   = useState(searchParams.get('min') || '');
  const [localMax,   setLocalMax]   = useState(searchParams.get('max') || '');
  const [localQuery, setLocalQuery] = useState(searchParams.get('q') || '');

  const [showFilters, setShowFilters] = useState(false);
  const filterKeyRef  = useRef('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

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

  // Sync URL -> state
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
      setLocalQuery(q);
      setArea(ar);
      setSort(srt);
      setPage(1);
      fetchListings(cat, q, min, max, ar, srt, 1, false);
    }
  }, [searchParams, fetchListings]);

  // Push filters to URL -- NEVER scroll to top
  function pushFilters(overrides: Record<string, string>) {
    const merged: Record<string, string> = {
      cat: category, q: query, min: minPrice,
      max: maxPrice, area, sort, ...overrides,
    };
    const p = new URLSearchParams();
    if (merged.cat  && merged.cat  !== 'all')   p.set('cat',  merged.cat);
    if (merged.q)                                p.set('q',    merged.q);
    if (merged.min)                              p.set('min',  merged.min);
    if (merged.max)                              p.set('max',  merged.max);
    if (merged.area)                             p.set('area', merged.area);
    if (merged.sort && merged.sort !== 'newest') p.set('sort', merged.sort);
    // scroll: false is critical -- keeps user exactly where they are
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

  function clearAll() {
    setLocalMin('');
    setLocalMax('');
    setLocalQuery('');
    router.push('/', { scroll: false });
  }

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings(category, query, minPrice, maxPrice, area, sort, nextPage, true);
  }

  function applyCustomPrice() {
    pushFilters({ min: localMin, max: localMax });
  }

  // Debounced search
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

  // Derived
  const matchesPreset = (p: typeof PRICE_PRESETS[0]) => p.min === minPrice && p.max === maxPrice;
  const hasActiveFilters = !!(minPrice || maxPrice || area || sort !== 'newest');
  const activeFilterCount = [minPrice || maxPrice ? 1 : 0, area ? 1 : 0, sort !== 'newest' ? 1 : 0].reduce((a, b) => a + b, 0);

  const catLabel = CATEGORIES.find(c => c.id === category)?.label || 'Items';
  const emptyContent = EMPTY_STATE[category] || {
    headline: query ? `No results for "${query}"` : 'Nothing here yet',
    sub: query
      ? 'Try a different word, check the spelling, or browse all categories.'
      : hasActiveFilters
      ? 'No items match your current filters. Try widening your search.'
      : 'Be the first Nairobi parent to list something here.',
    cta: 'List an item',
    icon: 'M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-9 6H7m2-2H7m5-2H7',
  };

  const whatsappShareUrl = `https://wa.me/?text=Check%20out%20MyTinyverse%20-%20buy%20and%20sell%20gently%20used%20kids%20gear%20in%20Nairobi!%20https%3A%2F%2Fmytinyverse.co.ke`;

  // -------------------------------------------------------
  return (
    <section id="listings" style={{ padding: '0 0 72px' }}>

      {/* ============ STICKY SEARCH + FILTER BAR ============ */}
      <div className="listings-header" style={{
        position: 'sticky',
        top: 64,
        zIndex: 40,
        background: 'rgba(255,253,249,.97)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        paddingBottom: 0,
      }}>

        {/* Search row */}
        <div style={{ padding: '12px 20px 10px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#fff',
            border: `1.5px solid ${localQuery ? 'rgba(240,120,40,.4)' : 'rgba(240,120,40,.18)'}`,
            borderRadius: 12,
            padding: '0 14px',
            boxShadow: localQuery
              ? '0 2px 20px rgba(240,120,40,.12)'
              : '0 1px 8px rgba(0,0,0,.05)',
            transition: 'box-shadow .2s, border-color .2s',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke={localQuery ? 'var(--orange,#F07828)' : '#bbb'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true" style={{ flexShrink: 0 }}
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
                height: 44,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                font: '400 15px Outfit,sans-serif',
                color: 'var(--text-1)',
              }}
            />
            {localQuery && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                style={{
                  width: 24, height: 24,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#eee',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="#666" strokeWidth="2.5" strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category pills - horizontal scroll */}
        <div style={{
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          padding: '0 20px 10px',
          maxWidth: 1280,
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', gap: 6, minWidth: 'max-content' }}>
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
                    gap: 6,
                    height: 36,
                    padding: '0 14px',
                    borderRadius: 999,
                    border: `1.5px solid ${active ? 'var(--orange,#F07828)' : 'var(--border,#E8E6E1)'}`,
                    background: active ? 'var(--orange,#F07828)' : '#fff',
                    color: active ? '#fff' : 'var(--text-2,#555)',
                    font: `${active ? '600' : '500'} 13px Outfit,sans-serif`,
                    cursor: 'pointer',
                    transition: 'all .15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke={active ? '#fff' : 'var(--orange,#F07828)'}
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
        <div style={{ borderTop: '1px solid var(--border)', maxWidth: 1280, margin: '0 auto' }}>

          {/* Desktop filter bar */}
          <div className="filter-desktop" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 20px',
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
                    height: 30, padding: '0 11px',
                    borderRadius: 999,
                    border: `1.5px solid ${active ? 'var(--orange)' : 'var(--border)'}`,
                    background: active ? '#FFF0E6' : '#fff',
                    color: active ? 'var(--orange)' : 'var(--text-2)',
                    font: `${active ? '600' : '400'} 12px Outfit,sans-serif`,
                    cursor: 'pointer',
                    transition: 'all .15s',
                    flexShrink: 0,
                  }}
                >
                  {preset.label}
                </button>
              );
            })}

            {/* Custom range */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <input
                type="number" placeholder="Min KES"
                value={localMin}
                onChange={e => setLocalMin(e.target.value)}
                onBlur={applyCustomPrice}
                onKeyDown={e => e.key === 'Enter' && applyCustomPrice()}
                style={{
                  width: 72, height: 30, padding: '0 8px',
                  borderRadius: 999,
                  border: `1.5px solid ${minPrice && !PRICE_PRESETS.some(p => p.min === minPrice) ? 'var(--orange)' : 'var(--border)'}`,
                  font: '400 12px Outfit,sans-serif',
                  outline: 'none', background: '#fff',
                }}
              />
              <span style={{ font: '12px Outfit,sans-serif', color: 'var(--text-3)' }}>-</span>
              <input
                type="number" placeholder="Max KES"
                value={localMax}
                onChange={e => setLocalMax(e.target.value)}
                onBlur={applyCustomPrice}
                onKeyDown={e => e.key === 'Enter' && applyCustomPrice()}
                style={{
                  width: 72, height: 30, padding: '0 8px',
                  borderRadius: 999,
                  border: `1.5px solid ${maxPrice && !PRICE_PRESETS.some(p => p.max === maxPrice) ? 'var(--orange)' : 'var(--border)'}`,
                  font: '400 12px Outfit,sans-serif',
                  outline: 'none', background: '#fff',
                }}
              />
            </div>

            <div style={{ width: 1, height: 18, background: 'var(--border)', flexShrink: 0 }}/>

            {/* Area */}
            <select
              value={area}
              onChange={e => pushFilters({ area: e.target.value })}
              style={{
                height: 30, padding: '0 26px 0 10px',
                borderRadius: 999,
                border: `1.5px solid ${area ? 'var(--orange)' : 'var(--border)'}`,
                background: `${area ? '#FFF0E6' : '#fff'} ${CHEVRON_SVG} no-repeat right 8px center`,
                color: area ? 'var(--orange)' : 'var(--text-2)',
                font: `${area ? '600' : '400'} 12px Outfit,sans-serif`,
                cursor: 'pointer', outline: 'none',
                WebkitAppearance: 'none', appearance: 'none',
                flexShrink: 0,
              }}
            >
              <option value="">All areas</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  height: 30, padding: '0 10px',
                  border: 'none', background: 'none',
                  font: '400 12px Outfit,sans-serif',
                  color: 'var(--text-3)', cursor: 'pointer',
                  textDecoration: 'underline', flexShrink: 0,
                }}
              >
                Clear
              </button>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }}/>

            {/* Sort - always visible on right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)' }}>Sort:</span>
              <select
                value={sort}
                onChange={e => pushFilters({ sort: e.target.value })}
                style={{
                  height: 30, padding: '0 26px 0 10px',
                  borderRadius: 999,
                  border: `1.5px solid ${sort !== 'newest' ? 'var(--orange)' : 'var(--border)'}`,
                  background: `${sort !== 'newest' ? '#FFF0E6' : '#fff'} ${CHEVRON_SVG} no-repeat right 8px center`,
                  color: sort !== 'newest' ? 'var(--orange)' : 'var(--text-2)',
                  font: `${sort !== 'newest' ? '600' : '400'} 12px Outfit,sans-serif`,
                  cursor: 'pointer', outline: 'none',
                  WebkitAppearance: 'none', appearance: 'none',
                }}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile filter bar */}
          <div className="filter-mobile" style={{
            display: 'none',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
          }}>
            <button
              onClick={() => setShowFilters(true)}
              style={{
                height: 36, padding: '0 14px',
                borderRadius: 999,
                border: `1.5px solid ${activeFilterCount > 0 ? 'var(--orange)' : 'var(--border)'}`,
                background: activeFilterCount > 0 ? '#FFF0E6' : '#fff',
                color: activeFilterCount > 0 ? 'var(--orange)' : 'var(--text-2)',
                font: '500 13px Outfit,sans-serif',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                flexShrink: 0,
              }}
            >
              <svg width="13" height="12" viewBox="0 0 13 12" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                aria-hidden="true"
              >
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
                height: 36, padding: '0 26px 0 10px',
                borderRadius: 999,
                border: `1.5px solid ${sort !== 'newest' ? 'var(--orange)' : 'var(--border)'}`,
                background: `${sort !== 'newest' ? '#FFF0E6' : '#fff'} ${CHEVRON_SVG} no-repeat right 10px center`,
                color: sort !== 'newest' ? 'var(--orange)' : 'var(--text-2)',
                font: `${sort !== 'newest' ? '600' : '500'} 13px Outfit,sans-serif`,
                cursor: 'pointer', outline: 'none',
                WebkitAppearance: 'none', appearance: 'none',
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* ============ END STICKY HEADER ============ */}

      {/* ============ RESULTS AREA ============ */}
      <div className="container" style={{ paddingTop: 20 }}>

        {/* Result count row */}
        {!loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
              {listings.length === 0
                ? ''
                : `${total.toLocaleString()} item${total === 1 ? '' : 's'}${
                    query ? ` for "${query}"` : category !== 'all' ? ` in ${catLabel}` : ''
                  }`
              }
            </p>
            {/* Active filter chips */}
            {(query || hasActiveFilters) && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {query && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    height: 26, padding: '0 10px',
                    borderRadius: 999,
                    background: '#FFF0E6',
                    border: '1px solid rgba(240,120,40,.25)',
                    font: '500 12px Outfit,sans-serif',
                    color: 'var(--orange)',
                  }}>
                    "{query}"
                    <button
                      onClick={clearSearch}
                      style={{
                        width: 14, height: 14,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(240,120,40,.2)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0,
                      }}
                      aria-label="Remove search"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                        stroke="var(--orange)" strokeWidth="3" strokeLinecap="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </span>
                )}
                {area && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    height: 26, padding: '0 10px',
                    borderRadius: 999,
                    background: '#FFF0E6',
                    border: '1px solid rgba(240,120,40,.25)',
                    font: '500 12px Outfit,sans-serif',
                    color: 'var(--orange)',
                  }}>
                    {area}
                    <button
                      onClick={() => pushFilters({ area: '' })}
                      style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: 'none', background: 'rgba(240,120,40,.2)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: 0,
                      }}
                      aria-label="Remove area"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                        stroke="var(--orange)" strokeWidth="3" strokeLinecap="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    height: 26, padding: '0 10px',
                    borderRadius: 999,
                    background: '#FFF0E6',
                    border: '1px solid rgba(240,120,40,.25)',
                    font: '500 12px Outfit,sans-serif',
                    color: 'var(--orange)',
                  }}>
                    {minPrice && maxPrice ? `KSh ${Number(minPrice).toLocaleString()} - ${Number(maxPrice).toLocaleString()}` :
                     minPrice ? `From KSh ${Number(minPrice).toLocaleString()}` :
                     `Up to KSh ${Number(maxPrice).toLocaleString()}`}
                    <button
                      onClick={() => pushFilters({ min: '', max: '' })}
                      style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: 'none', background: 'rgba(240,120,40,.2)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: 0,
                      }}
                      aria-label="Remove price"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                        stroke="var(--orange)" strokeWidth="3" strokeLinecap="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAll}
                  style={{
                    height: 26, padding: '0 10px',
                    border: 'none', background: 'none',
                    font: '400 12px Outfit,sans-serif',
                    color: 'var(--text-3)', cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============ SKELETON LOADING ============ */}
        {loading && (
          <div className="listings-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 'var(--r-md,12px)',
                  background: '#f0ede8',
                  paddingTop: '125%',
                  animation: 'pulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.07}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* ============ EMPTY STATE ============ */}
        {!loading && listings.length === 0 && (
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <EmptyState
              iconPath={emptyContent.icon}
              headline={emptyContent.headline}
              body={emptyContent.sub}
              compact
              actions={[
                {
                  label: 'Browse all categories',
                  variant: 'primary',
                  onClick: () => router.push('/', { scroll: false }),
                },
                {
                  label: `${emptyContent.cta} - KSh 99`,
                  variant: 'secondary',
                  href: '/sell',
                },
                {
                  label: 'Share with a Nairobi parent',
                  variant: 'ghost',
                  whatsapp: true,
                  externalHref: whatsappShareUrl,
                },
              ]}
              chips={category !== 'all'
                ? CATEGORIES
                    .filter(c => c.id !== 'all' && c.id !== category)
                    .slice(0, 5)
                    .map(cat => ({
                      label: cat.label,
                      iconPath: cat.icon,
                      onClick: () => pushFilters({ cat: cat.id, q: '' }),
                    }))
                : undefined
              }
              chipsLabel="Try these categories"
            />
          </div>
        )}

        {/* ============ LISTINGS GRID ============ */}
        {!loading && listings.length > 0 && (
          <>
            <div className="listings-grid">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing}/>
              ))}
            </div>

            {/* Load more */}
            {(hasMore || loadingMore) && (
              <div style={{ paddingTop: 32 }}>
                {loadingMore ? (
                  <div className="listings-grid" style={{ marginBottom: 16 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{
                        borderRadius: 'var(--r-md,12px)',
                        background: '#f0ede8',
                        paddingTop: '125%',
                        animation: 'pulse 1.4s ease-in-out infinite',
                      }}/>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={loadMore}
                      style={{ minWidth: 180 }}
                    >
                      Load more
                    </button>
                  </div>
                )}
              </div>
            )}

            {!hasMore && !loadingMore && total > PAGE_SIZE && (
              <p style={{
                textAlign: 'center',
                font: '400 13px Outfit,sans-serif',
                color: 'var(--text-3)',
                marginTop: 28,
              }}>
                All {total.toLocaleString()} items shown
              </p>
            )}
          </>
        )}
      </div>

      {/* ============ MOBILE FILTER BOTTOM SHEET ============ */}
      {showFilters && (
        <>
          <div
            onClick={() => setShowFilters(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,.45)',
              zIndex: 100,
              animation: 'fadeIn .2s ease',
            }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            zIndex: 101,
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'slideUp .25s cubic-bezier(.22,.68,0,1.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e0e0e0' }}/>
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
                {total > 0 ? `See ${total.toLocaleString()} result${total === 1 ? '' : 's'}` : 'Apply filters'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ============ STYLES ============ */}
      <style>{`
        .listings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 480px) {
          .listings-grid { gap: 16px; }
        }
        @media (min-width: 640px) {
          .listings-grid { grid-template-columns: repeat(3, 1fr); gap: 18px; }
        }
        @media (min-width: 900px) {
          .listings-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
        }
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
        @media (max-width: 639px) {
          .filter-desktop { display: none   !important; }
          .filter-mobile  { display: flex   !important; }
        }
        .cat-suggestion:hover {
          border-color: var(--orange) !important;
          color: var(--orange) !important;
          background: #FFF3EB !important;
        }
        input[type="search"]::-webkit-search-cancel-button { display: none; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
