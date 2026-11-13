import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import EmptyState from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';

// ── Types ─────────────────────────────────────────────────
interface SellerProfile {
  id: string;
  phone: string;
  display_name: string;
  bio: string | null;
  neighbourhood: string | null;
  avatar_url: string | null;
  profile_slug: string;
  total_sold: number;
  created_at: string;
  is_shop: boolean;
  shop_name: string | null;
  shop_bio: string | null;
  shop_banner_url: string | null;
  shop_areas: string[];
  verified_shop: boolean;
  subscription_tier: string;
}

interface ListingSnippet {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  location: string;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

// ── Metadata ──────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { identifier: string } },
): Promise<Metadata> {
  const res = await fetch(`${APP_URL}/api/sellers/${params.identifier}`, { cache: 'no-store' });
  if (!res.ok) return { title: 'Profile not found | MyTinyverse' };

  const { profile } = await res.json() as { profile: SellerProfile };
  if (!profile) return { title: 'Profile not found | MyTinyverse' };

  const name  = profile.is_shop ? (profile.shop_name || profile.display_name) : profile.display_name;
  const bio   = profile.is_shop ? profile.shop_bio : profile.bio;
  const title = profile.is_shop
    ? `${name} - Shop | MyTinyverse`
    : `${name} - Seller Profile | MyTinyverse`;
  const description = bio
    ? `${bio} - ${profile.is_shop ? 'Shop' : 'Seller'} on MyTinyverse Kenya.`
    : `Browse gently used kids items from ${name}${profile.neighbourhood ? ` in ${profile.neighbourhood}` : ''} on MyTinyverse Kenya.`;
  const url = `${APP_URL}/sellers/${profile.profile_slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url,
      siteName: 'MyTinyverse',
      type: 'profile',
      ...(profile.shop_banner_url ? { images: [profile.shop_banner_url] } : profile.avatar_url ? { images: [profile.avatar_url] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// ── Shared listing grid ───────────────────────────────────
function ListingGrid({ listings }: { listings: ListingSnippet[] }) {
  return (
    <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
      {listings.map(l => (
        <Link key={l.id} href={`/listing/${l.id}`} style={{ textDecoration: 'none' }}>
          <div className="listing-mini" style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', overflow: 'hidden', transition: 'border-color .15s',
          }}>
            <div style={{ aspectRatio: '4/3', background: '#F5EFE6', overflow: 'hidden' }}>
              {l.images?.[0] ? (
                <img src={l.images[0]} alt={l.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="21 8 21 21 3 21 3 8"/>
                    <rect x="1" y="3" width="22" height="5"/>
                    <line x1="10" y1="12" x2="14" y2="12"/>
                  </svg>
                </div>
              )}
            </div>
            <div style={{ padding: '12px 14px' }}>
              <p className="listing-mini-title" style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color .15s' }}>
                {l.title}
              </p>
              <p style={{ font: '700 15px Outfit,sans-serif', color: l.price === 0 ? 'var(--green)' : 'var(--text-1)', margin: 0 }}>
                {l.price === 0 ? 'FREE' : `KES ${l.price.toLocaleString()}`}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── WA icon path ──────────────────────────────────────────
const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';

// ── Page ──────────────────────────────────────────────────
export default async function SellerProfilePage(
  { params }: { params: { identifier: string } },
) {
  const res = await fetch(`${APP_URL}/api/sellers/${params.identifier}`, { cache: 'no-store' });
  if (!res.ok) notFound();

  const { profile, listings, listingCount } = await res.json() as {
    profile: SellerProfile;
    listings: ListingSnippet[];
    listingCount: number;
  };

  if (!profile) notFound();

  if (params.identifier !== profile.profile_slug) {
    redirect(`/sellers/${profile.profile_slug}`);
  }

  // ── Route to correct render ───────────────────────────
  return profile.is_shop
    ? renderShopPage(profile, listings, listingCount)
    : renderSellerPage(profile, listings, listingCount);
}

// ══════════════════════════════════════════════════════════
// SHOP PAGE  (is_shop = true)
// ══════════════════════════════════════════════════════════
function renderShopPage(profile: SellerProfile, listings: ListingSnippet[], listingCount: number) {
  const shopName = profile.shop_name || profile.display_name;
  const shopBio  = profile.shop_bio || profile.bio;
  const waLink   = `https://wa.me/${profile.phone}?text=${encodeURIComponent(`Hi ${shopName}, I found your shop on MyTinyverse. I am interested in your items.`)}`;
  const shareUrl = `${APP_URL}/sellers/${profile.profile_slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name:        shopName,
    description: shopBio || undefined,
    url:         shareUrl,
    telephone:   `+${profile.phone}`,
    ...(profile.neighbourhood ? {
      address: { '@type': 'PostalAddress', addressLocality: profile.neighbourhood, addressCountry: 'KE' },
    } : {}),
    ...(profile.shop_banner_url ? { image: profile.shop_banner_url } : profile.avatar_url ? { image: profile.avatar_url } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>

      <style>{`
        .listing-mini:hover { border-color: var(--orange) !important; }
        .listing-mini:hover .listing-mini-title { color: var(--orange) !important; }
        .shop-banner-overlay { background: linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,.55) 100%); }
        @media (max-width:639px) {
          .listings-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .shop-areas-row { flex-direction: column !important; align-items: flex-start !important; }
        }
        @media (max-width:399px) {
          .listings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Nav/>

      <div className="container" style={{ padding: '20px 0 80px', maxWidth: 960 }}>
        {/* Breadcrumb */}
        <nav style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', marginBottom: 20 }}>
          <Link href="/" style={{ color: 'var(--text-3)' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link href="/shops" style={{ color: 'var(--text-3)' }}>Shops</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-1)' }}>{shopName}</span>
        </nav>

        {/* Shop hero banner */}
        <div style={{
          position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden',
          background: profile.shop_banner_url ? 'transparent' : 'linear-gradient(135deg, #F07828 0%, #E06018 100%)',
          marginBottom: 0,
        }}>
          {profile.shop_banner_url ? (
            <>
              <img
                src={profile.shop_banner_url}
                alt={`${shopName} banner`}
                style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
              />
              <div className="shop-banner-overlay" style={{ position: 'absolute', inset: 0 }}/>
            </>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          )}

          {/* Shop badge anchored to banner bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '20px 24px',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16,
          }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={shopName}
                  style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', border: '3px solid #fff', flexShrink: 0 }}/>
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: 14,
                  background: '#fff', color: 'var(--orange)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font: '700 24px Outfit,sans-serif', flexShrink: 0,
                  border: '3px solid rgba(255,255,255,.3)',
                }}>
                  {initials(shopName)}
                </div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h1 style={{ font: '700 22px Outfit,sans-serif', color: '#fff', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>
                    {shopName}
                  </h1>
                  {profile.verified_shop && (
                    <span title="Verified Shop" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#7DC243">
                        <path d="M12 2l2.4 4.8 5.6.8-4 3.9.9 5.5L12 14.5l-4.9 2.5.9-5.5-4-3.9 5.6-.8z"/>
                      </svg>
                    </span>
                  )}
                </div>
                {profile.neighbourhood && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '500 12px Outfit,sans-serif', color: 'rgba(255,255,255,.85)', textShadow: '0 1px 3px rgba(0,0,0,.3)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {profile.neighbourhood}
                  </span>
                )}
              </div>
            </div>

            {/* WA button */}
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 'var(--r-pill)',
                background: '#25D366', color: '#fff',
                font: '600 14px Outfit,sans-serif', textDecoration: 'none',
                flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,.2)',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d={WA_PATH}/>
              </svg>
              <span className="hide-mobile">Chat with Shop</span>
            </a>
          </div>
        </div>

        {/* Shop info card */}
        <div style={{
          background: '#fff', border: '1px solid var(--border)', borderRadius: '0 0 var(--r-lg) var(--r-lg)',
          borderTop: 'none', padding: '20px 24px', marginBottom: 32,
        }}>
          <div className="shop-areas-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              {shopBio && (
                <p style={{ font: '400 14px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 12px', maxWidth: 560 }}>
                  {shopBio}
                </p>
              )}

              {/* Meta row */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 12px Outfit,sans-serif', color: 'var(--text-2)', background: 'var(--surface)', borderRadius: 'var(--r-pill)', padding: '4px 10px', border: '1px solid var(--border)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  On MyTinyverse since {fmtDate(profile.created_at)}
                </span>

                {listingCount > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 12px Outfit,sans-serif', color: 'var(--green)', background: '#EDF7E2', borderRadius: 'var(--r-pill)', padding: '4px 10px', border: '1px solid #c8e8a8' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
                      <path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
                      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
                    </svg>
                    {listingCount} items available
                  </span>
                )}

                {(profile.shop_areas?.length > 0) && profile.shop_areas.map(area => (
                  <span key={area} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 12px Outfit,sans-serif', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--r-pill)', padding: '4px 10px', border: '1px solid var(--border)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out ${shopName} on MyTinyverse: ${APP_URL}/sellers/${profile.profile_slug}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Share Shop
              </a>
            </div>
          </div>
        </div>

        {/* Listings section */}
        <div>
          <h2 style={{ font: '700 20px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 20px' }}>
            {listingCount > 0 ? `Items for sale (${listingCount})` : 'No items listed yet'}
          </h2>

          {listings.length > 0 ? (
            <ListingGrid listings={listings}/>
          ) : (
            <EmptyState
              iconPath="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              iconPath2="M9 22V12h6v10"
              headline={`${shopName} has nothing listed right now`}
              body="New items drop regularly. Chat with the shop directly on WhatsApp to ask what's coming in."
              actions={[
                { label: 'Chat with shop', variant: 'primary', href: waLink },
                { label: 'Browse all items', variant: 'secondary', href: '/' },
                { label: 'See other shops', variant: 'ghost', href: '/shops' },
              ]}
              chips={[
                { label: 'Bikes', iconPath: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v20M2 12h20', href: '/?category=bikes' },
                { label: 'Strollers', iconPath: 'M3 3h18v4H3zM12 7v14M5 21h14', href: '/?category=strollers' },
                { label: 'Car seats', iconPath: 'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3', href: '/?category=car-seats' },
                { label: 'Toys', iconPath: 'M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z', href: '/?category=toys' },
              ]}
              chipsLabel="Or explore by category:"
            />
          )}
        </div>
      </div>

      <Footer/>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// SELLER PAGE  (is_shop = false / legacy C2C)
// ══════════════════════════════════════════════════════════
function renderSellerPage(profile: SellerProfile, listings: ListingSnippet[], listingCount: number) {
  const waLink = `https://wa.me/${profile.phone}?text=${encodeURIComponent(`Hi ${profile.display_name}, I found you on MyTinyverse. Do you have any items available?`)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name:        profile.display_name,
    description: profile.bio || undefined,
    url:         `${APP_URL}/sellers/${profile.profile_slug}`,
    ...(profile.neighbourhood ? {
      address: { '@type': 'PostalAddress', addressLocality: profile.neighbourhood, addressCountry: 'KE' },
    } : {}),
    ...(profile.avatar_url ? { image: profile.avatar_url } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>

      <style>{`
        .listing-mini:hover { border-color: var(--orange) !important; }
        .listing-mini:hover .listing-mini-title { color: var(--orange) !important; }
        @media (max-width:639px) {
          .profile-header { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .profile-actions { justify-content: center !important; }
          .listings-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width:399px) {
          .listings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Nav/>

      <div className="container" style={{ padding: '20px 0 80px', maxWidth: 960 }}>
        {/* Breadcrumb */}
        <nav style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', marginBottom: 24 }}>
          <Link href="/" style={{ color: 'var(--text-3)' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-1)' }}>{profile.display_name}</span>
        </nav>

        {/* Profile header card */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px 32px', marginBottom: 32 }}>
          <div className="profile-header" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {/* Avatar */}
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name}
                style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }}/>
            ) : (
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'var(--orange)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '700 28px Outfit,sans-serif', flexShrink: 0,
              }}>
                {initials(profile.display_name)}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ font: '700 26px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 6px' }}>
                {profile.display_name}
              </h1>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                {profile.neighbourhood && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 13px Outfit,sans-serif', color: 'var(--text-2)', background: 'var(--surface)', borderRadius: 'var(--r-pill)', padding: '4px 10px', border: '1px solid var(--border)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {profile.neighbourhood}
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 13px Outfit,sans-serif', color: 'var(--text-2)', background: 'var(--surface)', borderRadius: 'var(--r-pill)', padding: '4px 10px', border: '1px solid var(--border)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Member since {fmtDate(profile.created_at)}
                </span>
                {listingCount > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 13px Outfit,sans-serif', color: 'var(--green)', background: '#EDF7E2', borderRadius: 'var(--r-pill)', padding: '4px 10px', border: '1px solid #c8e8a8' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
                    </svg>
                    {listingCount} active listing{listingCount !== 1 ? 's' : ''}
                  </span>
                )}
                {profile.total_sold > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 13px Outfit,sans-serif', color: 'var(--text-2)', background: 'var(--surface)', borderRadius: 'var(--r-pill)', padding: '4px 10px', border: '1px solid var(--border)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    {profile.total_sold} sold
                  </span>
                )}
              </div>

              {profile.bio && (
                <p style={{ font: '400 14px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 16px', maxWidth: 520 }}>
                  {profile.bio}
                </p>
              )}

              <div className="profile-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="btn btn-green btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d={WA_PATH}/>
                  </svg>
                  Chat on WhatsApp
                </a>
                <Link href="/" className="btn btn-secondary btn-sm">Browse all listings</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Listings grid */}
        <div>
          <h2 style={{ font: '700 20px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 20px' }}>
            {listingCount > 0
              ? `${profile.display_name.split(' ')[0]}'s listings (${listingCount})`
              : 'No active listings'}
          </h2>

          {listings.length > 0 ? (
            <ListingGrid listings={listings}/>
          ) : (
            <EmptyState
              iconPath="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
              iconPath2="M3 6h18M16 10a4 4 0 01-8 0"
              headline={`${profile.display_name.split(' ')[0]} isn't selling right now`}
              body="Check back soon - parents list new items every day. In the meantime, browse what other sellers have."
              actions={[
                { label: 'Browse all items', variant: 'primary', href: '/' },
                { label: 'List your own item', variant: 'secondary', href: '/sell' },
                {
                  label: 'Share this seller',
                  variant: 'ghost',
                  whatsapp: true,
                  externalHref: `https://wa.me/?text=${encodeURIComponent(`Check out ${profile.display_name}'s profile on MyTinyverse: ${APP_URL}/sellers/${profile.profile_slug}`)}`,
                },
              ]}
              chips={[
                { label: 'Bikes', iconPath: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v20M2 12h20', href: '/?category=bikes' },
                { label: 'Strollers', iconPath: 'M3 3h18v4H3zM12 7v14M5 21h14', href: '/?category=strollers' },
                { label: 'Car seats', iconPath: 'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3', href: '/?category=car-seats' },
                { label: 'Toys', iconPath: 'M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z', href: '/?category=toys' },
              ]}
              chipsLabel="Browse similar items:"
            />
          )}
        </div>
      </div>

      <Footer/>
    </>
  );
}
