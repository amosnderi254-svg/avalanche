'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import Link from 'next/link';
import type { Listing } from '@/types';

export default function ListingStatusPage({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${params.id}?notrack=1`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setNotFound(true);
        else setListing(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { color: string; bg: string; label: string; desc: string }> = {
      pending: {
        color: '#E65100', bg: '#FFF3E0',
        label: 'Under review',
        desc: 'Your listing is being reviewed by our team. This usually takes less than 24 hours.',
      },
      live: {
        color: '#2E7D32', bg: '#E8F5E9',
        label: 'Live',
        desc: 'Your listing is live and visible to buyers on MyTinyverse.',
      },
      rejected: {
        color: '#c62828', bg: '#FFEBEE',
        label: 'Not approved',
        desc: 'Your listing was not approved. Contact us on WhatsApp for details.',
      },
    };
    const c = config[status] || config.pending;
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{
          display: 'inline-block', padding: '6px 18px', borderRadius: 20,
          background: c.bg, color: c.color,
          font: '700 14px Outfit,sans-serif',
        }}>
          {c.label}
        </span>
        <p style={{ font: '400 14px/1.55 Outfit,sans-serif', color: 'var(--text-2)', margin: 0, textAlign: 'center' }}>
          {c.desc}
        </p>
      </div>
    );
  }

  return (
    <>
      <Nav/>
      <div className="container" style={{ padding: '48px 0 80px', maxWidth: 480, textAlign: 'center' }}>

        {loading && (
          <div style={{ padding: 60 }}>
            <div className="spinner" style={{ margin: '0 auto' }}/>
          </div>
        )}

        {!loading && notFound && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f5f4f2', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            </div>
            <h1 style={{ font: '700 22px Outfit,sans-serif', margin: '0 0 8px' }}>Listing not found</h1>
            <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 28px' }}>
              Double-check your listing ID or contact us if you think this is an error.
            </p>
            <Link href="/" className="btn btn-secondary btn-sm">Back to homepage</Link>
          </>
        )}

        {!loading && listing && (
          <>
            {/* Status icon */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
              background: listing.status === 'live' ? '#E8F5E9' : listing.status === 'rejected' ? '#FFEBEE' : '#FFF3E0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {listing.status === 'live' && (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {listing.status === 'pending' && (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              )}
              {listing.status === 'rejected' && (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              )}
            </div>

            <h1 style={{ font: '700 22px Outfit,sans-serif', margin: '0 0 6px' }}>Listing status</h1>
            <p style={{ font: '600 16px Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 20px' }}>
              {listing.title}
            </p>

            <StatusBadge status={listing.status}/>

            {/* Submitted date */}
            <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: '20px 0 0' }}>
              Submitted {new Date(listing.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            {/* Expiry for live listings */}
            {listing.status === 'live' && listing.expires_at && (
              <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: '4px 0 0' }}>
                Listing active until {new Date(listing.expires_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}

            {/* Push notification tip */}
            {listing.status === 'pending' && (
              <div style={{ background: '#F3F8FF', border: '1.5px solid #BBDEFB', borderRadius: 12, padding: '14px 16px', margin: '24px 0', textAlign: 'left' }}>
                <p style={{ font: '600 13px Outfit,sans-serif', color: '#1565C0', margin: '0 0 4px' }}>
                  Get notified instantly
                </p>
                <p style={{ font: '400 12px/1.55 Outfit,sans-serif', color: '#1565C0', margin: 0 }}>
                  Subscribe to push notifications at{' '}
                  <a
                    href={`https://ntfy.sh/mytinyverse-${listing.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1565C0', fontWeight: 600 }}
                  >
                    ntfy.sh/mytinyverse-{listing.id.slice(0, 8)}...
                  </a>
                  {' '}using the free ntfy app (iOS / Android / Web). We'll push a notification the moment your listing is reviewed.
                </p>
              </div>
            )}

            {/* Live listing link */}
            {listing.status === 'live' && (
              <div style={{ margin: '24px 0' }}>
                <Link href={`/listing/${listing.id}`} className="btn btn-primary btn-sm">
                  View your listing
                </Link>
              </div>
            )}

            {/* Contact admin */}
            <div style={{ margin: '20px 0 0', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <a
                href="https://wa.me/254790784084"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-green btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contact admin
              </a>
              <Link href="/" style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>
                Back to homepage
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
