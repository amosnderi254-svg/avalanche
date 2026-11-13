'use client';
import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import type { Listing } from '@/types';

const SAVED_KEY = 'mtv_saved';

function getSaved(): Listing[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function SavedPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setListings(getSaved());
    setMounted(true);

    // Listen for storage changes (e.g. user un-saves from card)
    function onStorage(e: StorageEvent) {
      if (e.key === SAVED_KEY) {
        setListings(getSaved());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Re-sync when user un-saves an item on this page
  // ListingCard writes to localStorage but doesn't fire the 'storage' event
  // in the same tab, so we poll on focus
  useEffect(() => {
    function onFocus() { setListings(getSaved()); }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  function clearAll() {
    try { localStorage.removeItem(SAVED_KEY); } catch {}
    setListings([]);
  }

  if (!mounted) {
    // Avoid hydration mismatch -- server has no localStorage
    return (
      <>
        <Nav/>
        <div className="container" style={{ padding: '40px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--r-md)', background: '#f5f4f2', paddingTop: '66%' }}/>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav/>
      <div className="container" style={{ padding: '28px 0 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ font: '700 24px Outfit,sans-serif', margin: '0 0 4px' }}>Saved items</h1>
            {listings.length > 0 && (
              <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                {listings.length} item{listings.length === 1 ? '' : 's'} saved
              </p>
            )}
          </div>
          {listings.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                background: 'none', border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-pill)', padding: '6px 14px',
                font: '400 13px Outfit,sans-serif', color: 'var(--text-3)',
                cursor: 'pointer', transition: 'border-color .15s',
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {listings.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#FFF4EE', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F07828" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h2 style={{ font: '700 20px Outfit,sans-serif', margin: '0 0 8px', color: 'var(--text-1)' }}>
              No saved items yet
            </h2>
            <p style={{ font: '400 14px/1.6 Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 28px', maxWidth: 320, marginInline: 'auto' }}>
              Tap the heart icon on any listing to save it here for later.
            </p>
            <a href="/" className="btn btn-primary">
              Browse listings
            </a>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
            }}>
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing}/>
              ))}
            </div>

            <p style={{
              textAlign: 'center', marginTop: 32,
              font: '400 12px Outfit,sans-serif', color: 'var(--text-3)',
            }}>
              Saved items are stored on this device only. They will be lost if you clear your browser data.
            </p>
          </>
        )}
      </div>
      <Footer/>
    </>
  );
}
