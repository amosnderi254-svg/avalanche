import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';

export const metadata: Metadata = {
  title: 'Kids Shops in Nairobi | MyTinyverse',
  description: 'Discover verified second-hand kids stores in Nairobi. Browse gently used bikes, strollers, toys, clothes, car seats and more from trusted local shops.',
  alternates: { canonical: `${APP_URL}/shops` },
  openGraph: {
    title: 'Kids Shops in Nairobi | MyTinyverse',
    description: 'Discover verified second-hand kids stores in Nairobi. Browse gently used bikes, strollers, toys, clothes, car seats and more from trusted local shops.',
    url: `${APP_URL}/shops`,
    siteName: 'MyTinyverse',
    type: 'website',
  },
};

interface Shop {
  id: string;
  phone: string;
  display_name: string;
  profile_slug: string;
  neighbourhood: string | null;
  avatar_url: string | null;
  shop_name: string | null;
  shop_bio: string | null;
  shop_banner_url: string | null;
  shop_areas: string[];
  verified_shop: boolean;
  subscription_tier: string;
  listing_count: number;
  created_at: string;
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

// Nairobi neighbourhoods to filter by
const NAIROBI_AREAS = [
  'All areas',
  'Westlands',
  'Karen',
  'Kilimani',
  'Langata',
  'Lavington',
  'Runda',
  'Muthaiga',
  'Parklands',
  'Eastleigh',
  'Embakasi',
  'Kasarani',
  'Ruaka',
  'Kikuyu',
];

// Verified badge SVG
function VerifiedBadge() {
  return (
    <span title="Verified Shop" style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 4 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#7DC243">
        <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-.45 3.31 3.745 3.745 0 01-3.312.45 3.745 3.745 0 01-3.068 1.59 3.745 3.745 0 01-3.068-1.59 3.745 3.745 0 01-3.31-.45 3.745 3.745 0 01-.45-3.31A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 01.45-3.31 3.745 3.745 0 013.312-.45 3.745 3.745 0 013.068-1.59 3.745 3.745 0 013.068 1.59 3.745 3.745 0 013.31.45 3.745 3.745 0 01.45 3.31A3.745 3.745 0 0121 12z"/>
      </svg>
    </span>
  );
}

export default async function ShopsPage(
  { searchParams }: { searchParams: { area?: string } }
) {
  const area = searchParams.area || '';

  const url = `${APP_URL}/api/shops${area ? `?area=${encodeURIComponent(area)}` : ''}`;
  let shops: Shop[] = [];
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      shops = json.shops || [];
    }
  } catch {
    // fail silently, show empty state
  }

  const verifiedShops = shops.filter(s => s.verified_shop);
  const otherShops    = shops.filter(s => !s.verified_shop);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Second-hand kids shops on MyTinyverse Nairobi',
    numberOfItems: shops.length,
    itemListElement: shops.slice(0, 10).map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.shop_name || s.display_name,
      url: `${APP_URL}/sellers/${s.profile_slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>

      <style>{`
        .shop-card:hover { border-color: var(--orange) !important; transform: translateY(-2px); }
        .shop-card:hover .shop-card-name { color: var(--orange) !important; }
        .shop-card { transition: border-color .15s, transform .15s; }
        .area-chip:hover { border-color: var(--orange) !important; color: var(--orange) !important; }
        @media (max-width: 639px) {
          .shops-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .shops-hero { padding: 32px 0 24px !important; }
        }
        @media (max-width: 399px) {
          .shops-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Nav/>

      <div className="container" style={{ padding: '0 0 80px' }}>

        {/* Hero */}
        <div className="shops-hero" style={{ padding: '48px 0 32px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FEF3E8', borderRadius: 'var(--r-pill)', padding: '6px 16px', marginBottom: 16 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{ font: '600 12px Outfit,sans-serif', color: 'var(--orange)' }}>Nairobi Kids Shops</span>
          </div>
          <h1 style={{ font: '700 32px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 12px' }}>
            Find second-hand kids stores
          </h1>
          <p style={{ font: '400 16px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 auto 28px', maxWidth: 480 }}>
            Browse verified physical shops selling gently used bikes, strollers, clothes, toys and more for children.
          </p>

          {/* Area filter chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {NAIROBI_AREAS.map(a => {
              const val = a === 'All areas' ? '' : a;
              const active = area === val;
              return (
                <Link
                  key={a}
                  href={val ? `/shops?area=${encodeURIComponent(val)}` : '/shops'}
                  className="area-chip"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '6px 14px', borderRadius: 'var(--r-pill)',
                    font: '500 13px Outfit,sans-serif',
                    border: `1.5px solid ${active ? 'var(--orange)' : 'var(--border)'}`,
                    color: active ? 'var(--orange)' : 'var(--text-2)',
                    background: active ? '#FEF3E8' : '#fff',
                    textDecoration: 'none',
                    transition: 'border-color .15s, color .15s',
                  }}
                >
                  {a === 'All areas' ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  )}
                  {a}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        {shops.length > 0 && (
          <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', marginBottom: 24 }}>
            {shops.length} shop{shops.length !== 1 ? 's' : ''} found{area ? ` in ${area}` : ' in Nairobi'}
          </p>
        )}

        {/* Empty state */}
        {shops.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
          }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h2 style={{ font: '700 20px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 8px' }}>
              {area ? `No shops in ${area} yet` : 'No shops listed yet'}
            </h2>
            <p style={{ font: '400 14px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 24px', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
              {area
                ? 'Try a different area or browse all shops across Nairobi.'
                : 'We are onboarding verified kids shops. Check back soon.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {area && (
                <Link href="/shops" className="btn btn-primary btn-sm">View all shops</Link>
              )}
              <Link href="/" className="btn btn-secondary btn-sm">Browse all listings</Link>
            </div>
          </div>
        )}

        {/* Verified shops section */}
        {verifiedShops.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            {otherShops.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <h2 style={{ font: '700 18px Outfit,sans-serif', color: 'var(--text-1)', margin: 0 }}>
                  Verified shops
                </h2>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '500 11px Outfit,sans-serif', color: '#7DC243', background: '#EDF7E2', borderRadius: 'var(--r-pill)', padding: '3px 8px' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-.45 3.31 3.745 3.745 0 01-3.312.45 3.745 3.745 0 01-3.068 1.59 3.745 3.745 0 01-3.068-1.59 3.745 3.745 0 01-3.31-.45 3.745 3.745 0 01-.45-3.31A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 01.45-3.31 3.745 3.745 0 013.312-.45 3.745 3.745 0 013.068-1.59 3.745 3.745 0 013.068 1.59 3.745 3.745 0 013.31.45 3.745 3.745 0 01.45 3.31A3.745 3.745 0 0121 12z"/>
                  </svg>
                  Verified
                </span>
              </div>
            )}
            <ShopGrid shops={verifiedShops}/>
          </div>
        )}

        {/* Other shops */}
        {otherShops.length > 0 && (
          <div>
            {verifiedShops.length > 0 && (
              <h2 style={{ font: '700 18px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 20px' }}>
                All shops
              </h2>
            )}
            <ShopGrid shops={otherShops}/>
          </div>
        )}

        {/* CTA: Are you a shop? */}
        <div style={{
          marginTop: 64, padding: '36px 32px',
          background: 'linear-gradient(135deg, #FEF3E8 0%, #FFF8F0 100%)',
          border: '1px solid #F5DCBC', borderRadius: 'var(--r-lg)',
          textAlign: 'center',
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h2 style={{ font: '700 22px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 8px' }}>
            Own a kids shop?
          </h2>
          <p style={{ font: '400 15px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 20px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            List your physical shop on MyTinyverse and reach thousands of Nairobi parents looking for gently used kids items.
          </p>
          <a
            href={`https://wa.me/254790784084?text=${encodeURIComponent('Hi MyTinyverse, I would like to list my kids shop on your platform. My shop is called: ')}`}
            target="_blank" rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Get listed on WhatsApp
          </a>
        </div>
      </div>

      <Footer/>
    </>
  );
}

// ── Shop card grid ────────────────────────────────────────────────────────────
function ShopGrid({ shops }: { shops: Shop[] }) {
  return (
    <div className="shops-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
      {shops.map(shop => <ShopCard key={shop.id} shop={shop}/>)}
    </div>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  const name = shop.shop_name || shop.display_name;
  const bio  = shop.shop_bio;
  const loc  = [shop.neighbourhood, ...(shop.shop_areas || [])].filter(Boolean).join(', ');

  return (
    <Link href={`/sellers/${shop.profile_slug}`} style={{ textDecoration: 'none' }}>
      <div
        className="shop-card"
        style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Banner */}
        <div style={{
          aspectRatio: '16/7',
          background: shop.shop_banner_url
            ? 'transparent'
            : `linear-gradient(135deg, #F07828 0%, #E06018 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {shop.shop_banner_url ? (
            <img
              src={shop.shop_banner_url}
              alt={`${name} banner`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          )}

          {/* Avatar overlay */}
          <div style={{ position: 'absolute', bottom: -20, left: 16 }}>
            {shop.avatar_url ? (
              <img
                src={shop.avatar_url}
                alt={name}
                style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '2px solid #fff', display: 'block' }}
              />
            ) : (
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: '#fff', color: 'var(--orange)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '700 16px Outfit,sans-serif',
                border: '2px solid rgba(255,255,255,.8)',
              }}>
                {initials(name)}
              </div>
            )}
          </div>

          {/* Verified badge */}
          {shop.verified_shop && (
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'rgba(255,255,255,.95)', borderRadius: 'var(--r-pill)',
                padding: '3px 8px', font: '600 11px Outfit,sans-serif', color: '#7DC243',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-.45 3.31 3.745 3.745 0 01-3.312.45 3.745 3.745 0 01-3.068 1.59 3.745 3.745 0 01-3.068-1.59 3.745 3.745 0 01-3.31-.45 3.745 3.745 0 01-.45-3.31A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 01.45-3.31 3.745 3.745 0 013.312-.45 3.745 3.745 0 013.068-1.59 3.745 3.745 0 013.068 1.59 3.745 3.745 0 013.31.45 3.745 3.745 0 01.45 3.31A3.745 3.745 0 0121 12z"/>
                </svg>
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '28px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <span
              className="shop-card-name"
              style={{
                font: '700 15px Outfit,sans-serif',
                color: 'var(--text-1)',
                transition: 'color .15s',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {name}
            </span>
            {shop.verified_shop && <VerifiedBadge/>}
          </div>

          {loc && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {loc}
              </span>
            </div>
          )}

          {bio && (
            <p style={{
              font: '400 12px/1.5 Outfit,sans-serif', color: 'var(--text-2)',
              margin: '0 0 10px',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {bio}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              font: '500 12px Outfit,sans-serif',
              color: shop.listing_count > 0 ? 'var(--green)' : 'var(--text-3)',
            }}>
              {shop.listing_count > 0 ? `${shop.listing_count} items` : 'No items yet'}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              font: '600 12px Outfit,sans-serif', color: 'var(--orange)',
            }}>
              View shop
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
