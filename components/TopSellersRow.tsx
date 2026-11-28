'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TopSeller {
  id:               string;
  shop_name:        string;
  profile_slug:     string;
  avatar_url:       string | null;
  shop_banner_url:  string | null;
  verified:         boolean;
  total_sold:       number;
  live_listings:    number;
  neighbourhood:    string | null;
  primary_category: string;
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

// Curated Unsplash photo IDs per category
// Source: images.unsplash.com (hotlinked with attribution)
// TODO: Register at unsplash.com/oauth/applications for a proper API key
const CATEGORY_PHOTOS: Record<string, string> = {
  bikes:       '1596461404969-9ae70f2830c1',
  strollers:   '1573612664822-d7d347da7b80',
  shoes:       '1491553895911-0055eca6402d',
  toys:        '1566576912321-d58ddd7a6088',
  books:       '1512436991641-6745cdb1723f',
  'car-seats': '1544484831-2d41d0d4c58b',
  clothing:    '1594938298603-c8148c4b4357',
  'baby-gear': '1555861496-0a51369a34b8',
  other:       '1471286174890-9c112ffaa5f1',
};

function getCardImage(seller: TopSeller): string {
  if (seller.shop_banner_url) return seller.shop_banner_url;
  const id = CATEGORY_PHOTOS[seller.primary_category] ?? CATEGORY_PHOTOS.other;
  return `https://images.unsplash.com/photo-${id}?w=560&h=370&fit=crop&auto=format&q=85`;
}

// Fallback: show orange gradient + initials when image fails to load
function ImageWithFallback({
  src, alt, initials,
}: { src: string; alt: string; initials: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform .4s ease',
          }}
          className="card-hero-img"
        />
      )}
      {failed && (
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(140deg, #F07828 0%, #D4601A 50%, #A84010 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            font: '900 42px Outfit,sans-serif',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '-0.02em',
          }}>
            {initials}
          </span>
        </div>
      )}
    </div>
  );
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

  if (!loading && sellers.length === 0) return null;

  const skeletons = Array.from({ length: 5 });

  return (
    <section style={{
      padding: '56px 0 52px',
      background: '#FFFDF9',
      borderTop: '1px solid rgba(240,120,40,.10)',
    }}>
      <style>{`
        /* ── Card ───────────────────────────────────── */
        .tsr-card {
          flex: 0 0 272px;
          border-radius: 20px;
          background: #fff;
          border: 1.5px solid rgba(0,0,0,.07);
          box-shadow: 0 2px 10px rgba(0,0,0,.06);
          overflow: hidden;
          transition: transform .22s ease, box-shadow .22s ease;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          position: relative;
        }
        .tsr-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0,0,0,.13);
        }
        .tsr-card:hover .card-hero-img {
          transform: scale(1.04);
        }

        /* ── Hero image wrapper ──────────────────── */
        .tsr-hero {
          width: 100%;
          height: 170px;
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
          background: #F5EEE6;
        }

        /* ── Verified badge on image ─────────────── */
        .tsr-verified-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(6px);
          border-radius: 999px;
          padding: 4px 9px 4px 7px;
          border: 1px solid rgba(240,120,40,.20);
          z-index: 2;
        }

        /* ── Card body ───────────────────────────── */
        .tsr-body {
          padding: 0 16px 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* ── Avatar row (overlapping) ────────────── */
        .tsr-avatar-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          margin-top: -20px;
          margin-bottom: 10px;
        }
        .tsr-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2.5px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,.14);
          flex-shrink: 0;
          overflow: hidden;
          background: linear-gradient(135deg, #F07828 0%, #D4601A 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Scroll row ──────────────────────────── */
        .tsr-scroll {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 6px;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .tsr-scroll::-webkit-scrollbar { display: none; }

        /* ── Skeleton ────────────────────────────── */
        @keyframes tsr-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: .45; }
        }
        .tsr-skeleton {
          flex: 0 0 272px;
          height: 320px;
          border-radius: 20px;
          background: #F5EEE6;
          animation: tsr-pulse 1.6s ease-in-out infinite;
          border: 1.5px solid rgba(0,0,0,.04);
        }

        /* ── CTA link ────────────────────────────── */
        .tsr-cta {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #F5EEE6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        /* ── Attribution ─────────────────────────── */
        .tsr-attr {
          position: absolute;
          bottom: 4px;
          left: 7px;
          font: 500 9px Outfit,sans-serif;
          color: rgba(255,255,255,.65);
          letter-spacing: .03em;
          z-index: 2;
          pointer-events: none;
        }

        @media (max-width: 480px) {
          .tsr-card, .tsr-skeleton { flex: 0 0 240px; }
          .tsr-hero { height: 148px; }
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
              color: '#1A1A1A',
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
            : sellers.map(seller => {
                const initials = getInitials(seller.shop_name);
                const heroSrc  = getCardImage(seller);
                const isUnsplash = heroSrc.includes('unsplash.com');

                return (
                  <Link
                    key={seller.id}
                    href={`/shop/${seller.profile_slug}`}
                    className="tsr-card"
                  >
                    {/* Hero image */}
                    <div className="tsr-hero">
                      <ImageWithFallback
                        src={heroSrc}
                        alt={`${seller.shop_name} items`}
                        initials={initials}
                      />
                      {/* Unsplash attribution — required by Unsplash guidelines */}
                      {isUnsplash && (
                        <span className="tsr-attr">Photo: Unsplash</span>
                      )}
                    </div>

                    {/* Verified badge overlaid on image */}
                    {seller.verified && (
                      <div className="tsr-verified-badge">
                        <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            fill="#F07828"
                          />
                        </svg>
                        <span style={{ font: '700 10px Outfit,sans-serif', color: '#F07828' }}>
                          Verified
                        </span>
                      </div>
                    )}

                    {/* Card body */}
                    <div className="tsr-body">
                      {/* Avatar + name row (avatar overlaps hero image) */}
                      <div className="tsr-avatar-row">
                        <div className="tsr-avatar">
                          {seller.avatar_url ? (
                            <img
                              src={seller.avatar_url}
                              alt={seller.shop_name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ font: '700 15px Outfit,sans-serif', color: '#fff' }}>
                              {initials}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Shop name */}
                      <p style={{
                        font: '800 15px/1.25 Outfit,sans-serif',
                        color: '#1A1A1A',
                        margin: '0 0 4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {seller.shop_name}
                      </p>

                      {/* Neighbourhood */}
                      {seller.neighbourhood && (
                        <p style={{
                          font: '400 12px Outfit,sans-serif',
                          color: '#999',
                          margin: '0 0 12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C5A585" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {seller.neighbourhood}
                        </p>
                      )}

                      {/* Stats pills */}
                      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 'auto' }}>
                        {seller.total_sold > 0 && (
                          <span style={{
                            font: '700 11px Outfit,sans-serif',
                            color: '#5A9C2E',
                            background: '#EDF7E2',
                            padding: '4px 10px',
                            borderRadius: 999,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#5A9C2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                            {seller.total_sold} sold
                          </span>
                        )}
                        {seller.live_listings > 0 && (
                          <span style={{
                            font: '600 11px Outfit,sans-serif',
                            color: '#888',
                            background: '#F5F5F5',
                            padding: '4px 10px',
                            borderRadius: 999,
                          }}>
                            {seller.live_listings} items
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="tsr-cta">
                        <span style={{
                          font: '700 12.5px Outfit,sans-serif',
                          color: '#F07828',
                        }}>
                          Browse shop
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                          style={{
                            background: '#FFF0E4',
                            borderRadius: '50%',
                            padding: '3px',
                            flexShrink: 0,
                          }}
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="#F07828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })
          }
        </div>
      </div>
    </section>
  );
}
