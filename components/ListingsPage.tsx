'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ListingCard from './ListingCard';
import type { Listing } from '@/types';
import { CATEGORIES } from '@/lib/constants';

const PAGE_SIZE = 20;

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState(searchParams.get('cat') || 'all');
  const [query, setQuery] = useState(searchParams.get('q') || '');

  // Track the current filter key so we reset page when it changes
  const filterKeyRef = useRef('');

  const buildParams = (cat: string, q: string, pg: number) => {
    const params = new URLSearchParams();
    if (cat && cat !== 'all') params.set('category', cat);
    if (q) params.set('q', q);
    params.set('page', String(pg));
    params.set('limit', String(PAGE_SIZE));
    return params;
  };

  const fetchListings = useCallback(async (cat: string, q: string, pg: number, append: boolean) => {
    if (pg === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`/api/listings?${buildParams(cat, q, pg)}`);
      const data = await res.json();
      const items: Listing[] = data.listings || [];
      setListings(prev => append ? [...prev, ...items] : items);
      setHasMore(data.hasMore ?? false);
      setTotal(data.total ?? 0);
    } catch {
      if (!append) setListings([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Respond to URL filter changes -- always reset to page 1
  useEffect(() => {
    const cat = searchParams.get('cat') || 'all';
    const q = searchParams.get('q') || '';
    const filterKey = `${cat}|${q}`;

    if (filterKey !== filterKeyRef.current) {
      filterKeyRef.current = filterKey;
      setCategory(cat);
      setQuery(q);
      setPage(1);
      fetchListings(cat, q, 1, false);
    }
  }, [searchParams, fetchListings]);

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings(category, query, nextPage, true);
  }

  function selectCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'all') params.delete('cat');
    else params.set('cat', cat);
    router.push(`/?${params.toString()}`);
  }

  return (
    <section style={{ padding: '24px 0 60px' }}>
      <div className="container">
        {/* Category filter */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none', marginBottom: 24,
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
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

        {/* Results header */}
        {!loading && (
          <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 16px' }}>
            {listings.length === 0
              ? query ? `No results for "${query}"` : 'No listings yet -- be the first to sell!'
              : `${total} item${total === 1 ? '' : 's'}${query ? ` for "${query}"` : ''}`}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--r-md)', background: '#f5f4f2', paddingTop: '66%', animation: 'pulse 1.4s ease-in-out infinite' }}/>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ font: '700 18px Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 8px' }}>Nothing here yet</p>
            <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 20px' }}>
              {query ? 'Try a different search term or browse all categories.' : 'Be the first parent to list something!'}
            </p>
            {query && (
              <button className="btn btn-secondary btn-sm" onClick={() => router.push('/')}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing}/>
              ))}
            </div>

            {/* Load more / skeleton */}
            {(hasMore || loadingMore) && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                {loadingMore ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{ borderRadius: 'var(--r-md)', background: '#f5f4f2', paddingTop: '66%', animation: 'pulse 1.4s ease-in-out infinite' }}/>
                    ))}
                  </div>
                ) : (
                  <button
                    className="btn btn-secondary"
                    onClick={loadMore}
                    style={{ minWidth: 180 }}
                  >
                    Load more
                  </button>
                )}
              </div>
            )}

            {/* End-of-results message when all loaded */}
            {!hasMore && !loadingMore && total > PAGE_SIZE && (
              <p style={{ textAlign: 'center', font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', marginTop: 28 }}>
                All {total} items shown
              </p>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </section>
  );
}
