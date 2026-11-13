import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

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
  return new Date(iso).toLocaleDateString('en-KE', {
    month: 'long', year: 'numeric',
  });
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
}

// ── Metadata ──────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { identifier: string } },
): Promise<Metadata> {
  const res = await fetch(`${APP_URL}/api/sellers/${params.identifier}`, { cache: 'no-store' });
  if (!res.ok) return { title: 'Seller not found | MyTinyverse' };

  const { profile } = await res.json() as { profile: SellerProfile };
  if (!profile) return { title: 'Seller not found | MyTinyverse' };

  const title       = `${profile.display_name} - Seller Profile | MyTinyverse`;
  const description = profile.bio
    ? `${profile.bio} - Shop gently used kids items from ${profile.display_name} on MyTinyverse Kenya.`
    : `Browse gently used kids items listed by ${profile.display_name}${profile.neighbourhood ? ` from ${profile.neighbourhood}` : ''} on MyTinyverse Kenya.`;
  const url = `${APP_URL}/sellers/${profile.profile_slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'MyTinyverse',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

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

  // If accessed by phone, redirect to canonical slug URL
  if (params.identifier !== profile.profile_slug) {
    redirect(`/sellers/${profile.profile_slug}`);
  }

  // Build WhatsApp link (phone hidden from public HTML - only via button)
  const waLink = `https://wa.me/${profile.phone}?text=${encodeURIComponent(`Hi ${profile.display_name}, I found you on MyTinyverse. Do you have any items available?`)}`;

  // JSON-LD Person schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name:         profile.display_name,
    description:  profile.bio || undefined,
    url:          `${APP_URL}/sellers/${profile.profile_slug}`,
    ...(profile.neighbourhood ? {
      address: {
        '@type':           'PostalAddress',
        addressLocality:   profile.neighbourhood,
        addressCountry:    'KE',
      },
    } : {}),
    ...(profile.avatar_url ? { image: profile.avatar_url } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        .listing-mini:hover { border-color: var(--orange) !important; }
        .listing-mini:hover .listing-mini-title { color: var(--orange) !important; }
        .wa-btn:hover { background: #1aad57 !important; }
        @media (max-width:639px) {
          .profile-header { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .profile-actions { justify-content: center !important; }
          .listings-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width:399px) {
          .listings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Nav />

      <div className="container" style={{ padding: '20px 0 80px', maxWidth: 960 }}>
        {/* Breadcrumb */}
        <nav style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', marginBottom: 24 }}>
          <Link href="/" style={{ color: 'var(--text-3)' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-1)' }}>{profile.display_name}</span>
        </nav>

        {/* Profile header card */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '28px 32px',
          marginBottom: 32,
        }}>
          <div className="profile-header" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }}
              />
            ) : (
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'var(--orange)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '700 28px Outfit,sans-serif',
                flexShrink: 0,
                letterSpacing: '-0.5px',
              }}>
                {initials(profile.display_name)}
              </div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ font: '700 26px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 6px' }}>
                {profile.display_name}
              </h1>

              {/* Meta chips */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                {profile.neighbourhood && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 13px Outfit,sans-serif', color: 'var(--text-2)', background: '#f5f4f2', borderRadius: 'var(--r-pill)', padding: '4px 10px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {profile.neighbourhood}
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 13px Outfit,sans-serif', color: 'var(--text-2)', background: '#f5f4f2', borderRadius: 'var(--r-pill)', padding: '4px 10px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Member since {fmtDate(profile.created_at)}
                </span>
                {listingCount > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 13px Outfit,sans-serif', color: 'var(--green)', background: '#f0fbe8', borderRadius: 'var(--r-pill)', padding: '4px 10px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                    </svg>
                    {listingCount} active listing{listingCount !== 1 ? 's' : ''}
                  </span>
                )}
                {profile.total_sold > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 13px Outfit,sans-serif', color: 'var(--text-2)', background: '#f5f4f2', borderRadius: 'var(--r-pill)', padding: '4px 10px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    {profile.total_sold} sold
                  </span>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p style={{ font: '400 14px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 16px', maxWidth: 520 }}>
                  {profile.bio}
                </p>
              )}

              {/* Actions */}
              <div className="profile-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-btn btn btn-green btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, transition: 'background .15s' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
            <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {listings.map(l => (
                <Link key={l.id} href={`/listing/${l.id}`} style={{ textDecoration: 'none' }}>
                  <div className="listing-mini" style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    overflow: 'hidden',
                    transition: 'border-color .15s',
                  }}>
                    {/* Image */}
                    <div style={{ aspectRatio: '4/3', background: '#f5f4f2', overflow: 'hidden' }}>
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
          ) : (
            <div style={{
              background: '#f9f9f8',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--r-lg)',
              padding: '48px 24px',
              textAlign: 'center',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px' }}>
                <polyline points="21 8 21 21 3 21 3 8"/>
                <rect x="1" y="3" width="22" height="5"/>
                <line x1="10" y1="12" x2="14" y2="12"/>
              </svg>
              <p style={{ font: '500 15px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 16px' }}>
                No active listings right now
              </p>
              <Link href="/" className="btn btn-secondary btn-sm">Browse all listings</Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
