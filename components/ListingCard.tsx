'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Listing } from '@/types';
import { CONDITION_LABELS } from '@/lib/constants';

const SAVED_KEY = 'mtv_saved';

function getSaved(): Listing[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setSaved(listings: Listing[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(listings));
  } catch {
    // storage blocked or full -- silent fail
  }
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const [saved, setSavedState] = useState(false);

  useEffect(() => {
    const current = getSaved();
    setSavedState(current.some(l => l.id === listing.id));
  }, [listing.id]);

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const current = getSaved();
    if (current.some(l => l.id === listing.id)) {
      setSaved(current.filter(l => l.id !== listing.id));
      setSavedState(false);
    } else {
      setSaved([listing, ...current]);
      setSavedState(true);
    }
  }

  const hasImage = listing.images && listing.images.length > 0;
  const whatsappNum = listing.seller_whatsapp || `254${listing.seller_phone.replace(/^0/, '')}`;
  const waMessage = encodeURIComponent(
    `Hello ${listing.seller_name}, I have seen your ${listing.title} on Tinyverse and I was wondering if it is still available.`
  );

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <Link href={`/listing/${listing.id}`} style={{ display: 'block', position: 'relative', paddingTop: '66%', background: '#F5EFE6', overflow: 'hidden' }}>
        {hasImage ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
            {/* Box SVG icon -- no emoji */}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="21 8 21 21 3 21 3 8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
          </div>
        )}
        <span className="badge badge-gray" style={{ position: 'absolute', top: 10, left: 10 }}>
          {CONDITION_LABELS[listing.condition] || listing.condition}
        </span>

        {/* Heart / Save button */}
        <button
          onClick={toggleSave}
          title={saved ? 'Remove from saved' : 'Save listing'}
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,.9)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,.15)',
            transition: 'transform .1s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={saved ? '#e53935' : 'none'}
            stroke={saved ? '#e53935' : 'var(--text-3)'}
            strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </Link>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link href={`/listing/${listing.id}`}>
          <p style={{ font: '600 14px Outfit,sans-serif', color: 'var(--text-1)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {listing.title}
          </p>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ font: '700 18px Outfit,sans-serif', color: listing.price === 0 ? 'var(--green)' : 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 5 }}>
            {listing.price === 0 ? 'FREE' : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                KES {listing.price.toLocaleString()}
              </>
            )}
          </span>
        </div>

        <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
          {listing.location}
        </p>

        {/* Seller name links to profile */}
        <Link
          href={`/sellers/${listing.seller_phone.replace(/^0/, '254').replace(/\D/g, '')}`}
          style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: -2 }}
          onClick={e => e.stopPropagation()}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          {listing.seller_name}
        </Link>

        {/* CTA */}
        <a
          href={`https://wa.me/${whatsappNum.replace(/\D/g, '')}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-green btn-sm"
          style={{ marginTop: 'auto', width: '100%' }}
          onClick={() => {
            // Fire-and-forget click tracking -- never block the navigation
            fetch(`/api/listings/${listing.id}/click`, { method: 'POST' })
              .then(() => {}).catch(() => {});
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
