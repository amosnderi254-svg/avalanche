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

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings]       = useState<Listing[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(false);
  const [total, setTotal]             = useState(0);

  // Read filter values directly from URL — no duplicate state
  const category = searchParams.get('cat')  || 'all';
  const query    = searchParams.get('q')    || '';
  const minPrice = searchParams.get('min')  || '';
  const maxPrice = searchParams.get('max')  || '';
  const area     = searchParams.get('area') || '';
  const sort     = searchParams.get('sort') || 'newest';

  const filterKeyRef = useRef('');

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

  // Sync URL -> fetch when filters change
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
      setPage(1);
      fetchListings(cat, q, min, max, ar, srt, 1, false);
    }
  }, [searchParams, fetchListings]);

  // Minimal push for result-area chips — scroll: false keeps position
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
    router.push(`/?${p.toString()}`, { scroll: false });
  }

  function clearSearch() {
    pushFilters({ q: '' });
  }

  function clearAll() {
    router.push('/', { scroll: false });
  }

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings(category, query, minPrice, maxPrice, area, sort, nextPage, true);
  }

  // Derived
  const hasActiveFilters = !!(minPrice || maxPrice || area || sort !== 'newest');
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
