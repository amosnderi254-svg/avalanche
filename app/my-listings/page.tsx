'use client';
import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  price: number;
  status: 'pending' | 'live' | 'sold' | 'rejected' | 'expired';
  category: string;
  location: string;
  images: string[];
  created_at: string;
  condition: string;
}

function fmt(n: number) {
  return 'KES ' + n.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const STATUS_LABEL: Record<string, string> = {
  pending:  'Under review',
  live:     'Live',
  sold:     'Sold',
  rejected: 'Not approved',
  expired:  'Expired',
};
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:  { bg: '#fff4ec', color: '#F07828' },
  live:     { bg: '#edf7e2', color: '#7DC243' },
  sold:     { bg: '#f0f0f0', color: '#888' },
  rejected: { bg: '#fdecea', color: '#c62828' },
  expired:  { bg: '#f0f0f0', color: '#888' },
};

function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.images?.[0] || '';
  const st = STATUS_COLOR[listing.status] || STATUS_COLOR.pending;
  const label = STATUS_LABEL[listing.status] || listing.status;
  const date = new Date(listing.created_at).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
      display: 'flex',
      gap: 0,
      flexDirection: 'column',
      transition: 'box-shadow .15s',
    }}>
      {/* Cover image */}
      <div style={{ position: 'relative', paddingTop: '62%', background: '#f5f4f2' }}>
        {cover ? (
          <>
            <img src={cover} alt="" aria-hidden="true"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(14px)', transform: 'scale(1.08)', opacity: 0.5 }}
            />
            <img src={cover} alt={listing.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        {/* Status badge */}
        <span style={{
          position: 'absolute', top: 8, right: 8,
          background: st.bg, color: st.color,
          font: '600 11px Outfit,sans-serif',
          padding: '3px 9px', borderRadius: 999,
          letterSpacing: '.02em',
        }}>
          {label}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{ font: '600 14px/1.3 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 4px' }}>
          {listing.title}
        </p>
        <p style={{ font: '700 16px Outfit,sans-serif', color: '#F07828', margin: '0 0 6px' }}>
          {listing.price === 0 ? 'Free' : fmt(listing.price)}
        </p>
        <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 10px' }}>
          {listing.location} &middot; {date}
        </p>
        {listing.status === 'live' && (
          <Link
            href={`/listings/${listing.id}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              font: '600 12px Outfit,sans-serif', color: '#7DC243',
              textDecoration: 'none',
            }}
          >
            View listing
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function MyListingsPage() {
  const [phone, setPhone]       = useState('');
  const [inputPhone, setInput]  = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');
  const [loaded, setLoaded]     = useState(false);

  /* On mount: check localStorage for cached seller phone */
  useEffect(() => {
    try {
      const cached = localStorage.getItem('mtv_seller');
      if (cached) {
        const { phone: p } = JSON.parse(cached);
        if (p) { setPhone(p); setInput(p); }
      }
    } catch { /* blocked */ }
    setLoaded(true);
  }, []);

  /* Auto-fetch when phone is known from cache */
  useEffect(() => {
    if (phone) fetchListings(phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  async function fetchListings(ph: string) {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`/api/my-listings?phone=${encodeURIComponent(ph)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load listings');
      setListings(data.listings ?? []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong');
    }
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = inputPhone.trim();
    if (!p || p.length < 9) { setErr('Enter a valid phone number'); return; }
    setPhone(p);
  }

  if (!loaded) return null;

  const liveCount    = listings.filter(l => l.status === 'live').length;
  const pendingCount = listings.filter(l => l.status === 'pending').length;

  return (
    <>
      <Nav/>

      {/* Page header */}
      <div style={{ background: 'var(--text-1)', padding: '32px 0 28px' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <p style={{ font: '600 11px Outfit,sans-serif', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '.09em', margin: '0 0 8px' }}>
            Seller dashboard
          </p>
          <h1 style={{ font: '700 26px/1.2 Outfit,sans-serif', color: '#fff', margin: '0 0 6px' }}>
            My listings
          </h1>
          <p style={{ font: '400 14px Outfit,sans-serif', color: 'rgba(255,255,255,.55)', margin: 0 }}>
            All items you have listed on MyTinyverse.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 760, padding: '36px 0 80px' }}>

        {/* Phone lookup form — shown when no phone is known or user wants to change */}
        <form onSubmit={handleSubmit} style={{ marginBottom: listings.length > 0 || loading ? 32 : 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={{ display: 'block', font: '600 12px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
                Your phone number
              </label>
              <input
                type="tel"
                value={inputPhone}
                onChange={e => setInput(e.target.value)}
                placeholder="0712 345 678"
                style={{ width: '100%', boxSizing: 'border-box', height: 46, border: '1.5px solid var(--border)', borderRadius: 10, padding: '0 14px', font: '400 15px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 46, padding: '0 22px',
                background: '#F07828', color: '#fff',
                border: 'none', borderRadius: 10,
                font: '600 14px Outfit,sans-serif',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
                flexShrink: 0,
              }}
            >
              {loading ? 'Loading...' : 'View my listings'}
            </button>
          </div>
          {err && (
            <p style={{ font: '400 13px Outfit,sans-serif', color: '#c62828', margin: '8px 0 0' }}>{err}</p>
          )}
        </form>

        {/* Summary strip */}
        {!loading && listings.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 20px', flex: 1, minWidth: 120 }}>
              <p style={{ font: '700 22px Outfit,sans-serif', color: '#F07828', margin: '0 0 2px' }}>{liveCount}</p>
              <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>Live now</p>
            </div>
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 20px', flex: 1, minWidth: 120 }}>
              <p style={{ font: '700 22px Outfit,sans-serif', color: '#F07828', margin: '0 0 2px' }}>{pendingCount}</p>
              <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>Under review</p>
            </div>
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 20px', flex: 1, minWidth: 120 }}>
              <p style={{ font: '700 22px Outfit,sans-serif', color: '#F07828', margin: '0 0 2px' }}>{listings.length}</p>
              <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>Total listed</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #f0f0f0', borderTopColor: '#F07828', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin .8s linear infinite' }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)' }}>Loading your listings...</p>
          </div>
        )}

        {/* No listings */}
        {!loading && phone && listings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 60, height: 60, background: '#f5f4f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <p style={{ font: '600 15px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 6px' }}>No listings found</p>
            <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 24px' }}>
              No listings found for {phone}. Try a different number.
            </p>
            <Link href="/sell" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#F07828', color: '#fff',
              font: '600 14px Outfit,sans-serif',
              padding: '12px 24px', borderRadius: 10,
              textDecoration: 'none',
            }}>
              List your first item
            </Link>
          </div>
        )}

        {/* Listings grid */}
        {!loading && listings.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/sell" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#F07828', color: '#fff',
                font: '600 14px Outfit,sans-serif',
                padding: '12px 22px', borderRadius: 10,
                textDecoration: 'none',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                List another item
              </Link>
              <Link href="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fff', color: 'var(--text-1)',
                border: '1.5px solid var(--border)',
                font: '600 14px Outfit,sans-serif',
                padding: '12px 22px', borderRadius: 10,
                textDecoration: 'none',
              }}>
                Browse marketplace
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer/>
    </>
  );
}
