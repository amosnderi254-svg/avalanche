'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TopSeller {
  id:            string;
  shop_name:     string;
  profile_slug:  string;
  avatar_url:    string | null;
  verified:      boolean;
  total_sold:    number;
  live_listings: number;
  neighbourhood: string | null;
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

export default function TopSellersRow() {
  const [sellers, setSellers] = useState<TopSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/top-sellers')
      .then(r => r.json())
      .then(d => setSellers(d.sellers ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Render nothing if no sellers and not loading
  if (!loading && sellers.length === 0) return null;

  const skeletons = Array.from({ length: 6 });

  return (
    <section style={{
      padding: '56px 0 48px',
      background: '#FFFDF9',
      borderTop: '1px solid rgba(240,120,40,.10)',
    }}>
      <style>{`
        .tsr-card {
          flex: 0 0 220px;
          border: 1.5px solid rgba(240,120,40,.14);
          border-radius: 18px;
          padding: 24px 18px 20px;
          background: #fff;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          cursor: pointer;
          text-decoration: none;
          display: block;
          color: inherit;
        }
        .tsr-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 32px rgba(240,120,40,.13);
          border-color: rgba(240,120,40,.35);
        }
        .tsr-scroll {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding-bottom: 6px;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .tsr-scroll::-webkit-scrollbar { display: none; }
        @keyframes tsr-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: .45; }
        }
        .tsr-skeleton {
          flex: 0 0 220px;
          height: 210px;
          border-radius: 18px;
          background: #F5EEE6;
          animation: tsr-pulse 1.6s ease-in-out infinite;
        }
        @media (max-width: 480px) {
          .tsr-card, .tsr-skeleton { flex: 0 0 192px; }
        }
      `}</style>

      <div className="container">
        {/* Section header */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 28,
          gap: 12,
        }}>
          <div>
            <p style={{
              font: '700 11px Outfit,sans-serif',
              color: '#F07828',
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              margin: '0 0 7px',
            }}>
              Trusted Sellers
            </p>
            <h2 style={{
              font: '800 clamp(22px,3.5vw,30px)/1.15 Outfit,sans-serif',
              color: 'var(--text-1,#1A1A1A)',
              margin: 0,
              letterSpacing: '-.025em',
            }}>
              Shop with Nairobi&apos;s best
            </h2>
          </div>
          <Link
            href="/sellers"
            style={{
              font: '600 13px Outfit,sans-serif',
              color: '#F07828',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            See all →
          </Link>
        </div>

        {/* Scroll row */}
        <div className="tsr-scroll">
          {loading
            ? skeletons.map((_, i) => <div key={i} className="tsr-skeleton" />)
            : sellers.map(seller => (
                <Link
                  key={seller.id}
                  href={`/shop/${seller.profile_slug}`}
                  className="tsr-card"
                >
                  {/* Avatar + name row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
                    {seller.avatar_url ? (
                      <img
                        src={seller.avatar_url}
                        alt={seller.shop_name}
                        style={{
                          width: 48, height: 48,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0,
                          border: '2px solid rgba(240,120,40,.18)',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 48, height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F07828 0%, #D4601A 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '2px solid rgba(240,120,40,.20)',
                      }}>
                        <span style={{ font: '700 16px Outfit,sans-serif', color: '#fff' }}>
                          {getInitials(seller.shop_name)}
                        </span>
                      </div>
                    )}

                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        font: '700 13.5px/1.25 Outfit,sans-serif',
                        color: 'var(--text-1,#1A1A1A)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {seller.shop_name}
                      </p>
                      {seller.neighbourhood && (
                        <p style={{
                          font: '400 11.5px Outfit,sans-serif',
                          color: 'var(--text-3,#999)',
                          margin: '3px 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          📍 {seller.neighbourhood}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats pills */}
                  <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
                    {seller.total_sold > 0 && (
                      <span style={{
                        font: '600 11px Outfit,sans-serif',
                        color: '#5A9C2E',
                        background: '#EDF7E2',
                        padding: '3px 10px',
                        borderRadius: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        ✓ {seller.total_sold} sold
                      </span>
                    )}
                    {seller.live_listings > 0 && (
                      <span style={{
                        font: '600 11px Outfit,sans-serif',
                        color: '#888',
                        background: '#F5EEE6',
                        padding: '3px 10px',
                        borderRadius: 20,
                      }}>
                        {seller.live_listings} items
                      </span>
                    )}
                  </div>

                  {/* Verified badge */}
                  {seller.verified && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      marginBottom: 14,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          fill="#F07828"
                        />
                      </svg>
                      <span style={{ font: '600 11px Outfit,sans-serif', color: '#F07828' }}>
                        Verified Seller
                      </span>
                    </div>
                  )}

                  {/* CTA */}
                  <div style={{
                    font: '700 12.5px Outfit,sans-serif',
                    color: '#F07828',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 'auto',
                  }}>
                    Browse shop
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F07828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              ))
          }
        </div>
      </div>
    </section>
  );
}
