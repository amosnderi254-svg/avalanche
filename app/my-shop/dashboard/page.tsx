'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShopShell from '@/components/shop/ShopShell';

interface Shop {
  id: string;
  shop_name: string;
  display_name: string;
  profile_slug: string;
  neighbourhood: string;
  verified_shop: boolean;
  subscription_tier: string;
  subscription_expires_at: string | null;
  total_sold: number;
  live_listings: number;
  total_listings: number;
  avatar_url: string | null;
  created_at: string;
  shop_bio: string | null;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  status: string;
  images: string[];
  view_count: number;
  created_at: string;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 22px',
      border: '1px solid #EDE8E2', flex: '1 1 140px',
    }}>
      <div style={{ font: '400 12px Outfit,sans-serif', color: '#999', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {label}
      </div>
      <div style={{ font: `700 26px Outfit,sans-serif`, color: accent || '#1A1A1A', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ font: '400 12px Outfit,sans-serif', color: '#AAA', marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    live:     { bg: '#F0FBF0', color: '#389E0D', label: 'Live' },
    sold:     { bg: '#F5F0FF', color: '#722ED1', label: 'Sold' },
    pending:  { bg: '#FFF7E6', color: '#D46B08', label: 'Pending' },
    expired:  { bg: '#F5F5F5', color: '#888',    label: 'Expired' },
    archived: { bg: '#F5F5F5', color: '#888',    label: 'Archived' },
    rejected: { bg: '#FFF2F0', color: '#CF1322', label: 'Rejected' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 999,
      background: s.bg, color: s.color, font: '500 11px Outfit,sans-serif',
    }}>{s.label}</span>
  );
}

function formatPrice(p: number) {
  return 'KSh ' + p.toLocaleString('en-KE');
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function ShopDashboard() {
  const router = useRouter();
  const [shop, setShop]         = useState<Shop | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/my-shop/me').then(r => r.ok ? r.json() : null),
      fetch('/api/my-shop/listings?status=all').then(r => r.ok ? r.json() : null),
    ]).then(([meData, listingsData]) => {
      if (!meData?.shop) {
        router.replace('/my-shop');
        return;
      }
      setShop(meData.shop);
      setListings((listingsData?.listings || []).slice(0, 5));
      setLoading(false);
    }).catch(() => {
      router.replace('/my-shop');
    });
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F4F0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 28, height: 28, border: '2.5px solid #F07828', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <span style={{ font: '400 14px Outfit,sans-serif', color: '#AAA' }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!shop) return null;

  const isExpired = shop.subscription_expires_at && new Date(shop.subscription_expires_at) < new Date();
  const tierLabel: Record<string, string> = { free: 'Free', starter: 'Starter', pro: 'Pro' };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';

  return (
    <ShopShell shopName={shop.shop_name} profileSlug={shop.profile_slug}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .dash-content { animation: fadeIn .3s ease both; }
        .listing-row { display: grid; grid-template-columns: 48px 1fr auto; gap: 12px; align-items: center; padding: 12px 16px; border-bottom: 1px solid #F0EBE4; transition: background .1s; }
        .listing-row:last-child { border-bottom: none; }
        .listing-row:hover { background: #FDFBF8; }
        @media (max-width: 480px) {
          .stats-row { flex-wrap: wrap; }
          .listing-row { grid-template-columns: 40px 1fr; }
          .listing-row-meta { display: none !important; }
        }
      `}</style>

      <div className="dash-content" style={{ padding: '28px 28px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ font: '700 22px Outfit,sans-serif', color: '#1A1A1A', margin: 0 }}>
                {shop.shop_name}
              </h1>
              {shop.verified_shop && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E6F4FF', color: '#1677FF', font: '500 11px Outfit,sans-serif', padding: '2px 8px', borderRadius: 999 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <div style={{ font: '400 14px Outfit,sans-serif', color: '#888' }}>
              Good day! Here&apos;s how your shop is doing.
            </div>
          </div>
          <Link href="/sell" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#7DC243', color: '#fff', textDecoration: 'none',
            font: '600 14px Outfit,sans-serif', padding: '10px 18px', borderRadius: 10,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-row" style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard label="Live Listings" value={shop.live_listings} accent="#F07828" />
          <StatCard label="Total Sold" value={shop.total_sold} sub="all time" accent="#7DC243" />
          <StatCard label="Plan" value={tierLabel[shop.subscription_tier] || shop.subscription_tier}
            sub={isExpired ? 'Expired' : (shop.subscription_expires_at ? `Renews ${new Date(shop.subscription_expires_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}` : 'No expiry')}
            accent={isExpired ? '#CF1322' : undefined}
          />
          <StatCard label="Total Listings" value={shop.total_listings} />
        </div>

        {/* Two-column layout (recent + quick actions) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

          {/* Recent Listings */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E2', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 14px', borderBottom: '1px solid #F0EBE4' }}>
              <span style={{ font: '600 15px Outfit,sans-serif', color: '#1A1A1A' }}>Recent Listings</span>
              <Link href="/my-shop/listings" style={{ font: '500 13px Outfit,sans-serif', color: '#F07828', textDecoration: 'none' }}>
                View all
              </Link>
            </div>

            {listings.length === 0 ? (
              <div style={{ padding: '36px 24px', textAlign: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DDD" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px' }}>
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <p style={{ font: '400 14px Outfit,sans-serif', color: '#AAA', marginBottom: 14 }}>
                  No listings yet.
                </p>
                <Link href="/sell" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  font: '600 13px Outfit,sans-serif', color: '#F07828',
                  background: '#FFF5EC', padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                }}>
                  Post your first listing
                </Link>
              </div>
            ) : (
              <div>
                {listings.map(item => (
                  <div key={item.id} className="listing-row">
                    {/* Thumbnail */}
                    <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#F5F0E8', flexShrink: 0 }}>
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ font: '500 14px Outfit,sans-serif', color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ font: '600 13px Outfit,sans-serif', color: '#F07828', marginTop: 2 }}>
                        {formatPrice(item.price)}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                        <StatusBadge status={item.status} />
                        <span style={{ font: '400 11px Outfit,sans-serif', color: '#BBB' }} className="listing-row-meta">
                          {item.view_count} views &middot; {timeAgo(item.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <Link
                      href="/my-shop/listings"
                      style={{ color: '#CCC', flexShrink: 0 }}
                      title="Manage"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Shop info card */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E2', padding: 20 }}>
              <div style={{ font: '600 14px Outfit,sans-serif', color: '#1A1A1A', marginBottom: 14 }}>Your Shop</div>
              <div style={{ font: '400 13px Outfit,sans-serif', color: '#888', marginBottom: 10 }}>
                {shop.shop_bio || 'No bio set yet.'}
              </div>
              {shop.neighbourhood && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, font: '400 12px Outfit,sans-serif', color: '#AAA', marginBottom: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {shop.neighbourhood}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/my-shop/profile" style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  background: '#FFF5EC', color: '#F07828', font: '600 13px Outfit,sans-serif',
                  padding: '9px 12px', borderRadius: 9, textDecoration: 'none',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </Link>
                <a href={`/sellers/${shop.profile_slug}`} target="_blank" rel="noopener noreferrer" style={{
                  width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#F5F5F5', color: '#888', borderRadius: 9, textDecoration: 'none',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Share shop */}
            <div style={{ background: 'linear-gradient(135deg, #F07828, #FF9A4A)', borderRadius: 16, padding: 20, color: '#fff' }}>
              <div style={{ font: '600 14px Outfit,sans-serif', marginBottom: 8 }}>Share your shop</div>
              <div style={{ font: '400 12px Outfit,sans-serif', opacity: .85, marginBottom: 14, lineHeight: 1.5 }}>
                Send customers directly to your shop page.
              </div>
              <CopyLinkButton url={`${appUrl}/sellers/${shop.profile_slug}`} />
            </div>

            {/* Plan status */}
            {shop.subscription_tier !== 'free' && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E2', padding: 20 }}>
                <div style={{ font: '600 14px Outfit,sans-serif', color: '#1A1A1A', marginBottom: 8 }}>Subscription</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 999,
                    background: isExpired ? '#FFF2F0' : '#F0FBF0',
                    color: isExpired ? '#CF1322' : '#389E0D',
                    font: '600 12px Outfit,sans-serif',
                  }}>
                    {tierLabel[shop.subscription_tier]} Plan
                  </span>
                  {isExpired ? (
                    <span style={{ font: '400 12px Outfit,sans-serif', color: '#CF1322' }}>Expired</span>
                  ) : shop.subscription_expires_at ? (
                    <span style={{ font: '400 12px Outfit,sans-serif', color: '#888' }}>
                      Until {new Date(shop.subscription_expires_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  ) : null}
                </div>
                {isExpired && (
                  <a href="https://wa.me/254790784084?text=Hi%2C%20I%27d%20like%20to%20renew%20my%20shop%20subscription"
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-block', marginTop: 12, font: '600 13px Outfit,sans-serif', color: '#F07828', textDecoration: 'none' }}>
                    Renew subscription
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive override for single-column on tablet/mobile */}
      <style>{`
        @media (max-width: 900px) {
          .dash-content > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </ShopShell>
  );
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback: select text
    });
  }
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <input
        readOnly value={url}
        style={{
          flex: 1, background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)',
          borderRadius: 8, padding: '7px 10px', font: '400 11px Outfit,sans-serif',
          color: '#fff', outline: 'none', minWidth: 0,
        }}
        onClick={e => (e.target as HTMLInputElement).select()}
      />
      <button onClick={copy} style={{
        background: '#fff', color: '#F07828', border: 'none', borderRadius: 8,
        font: '600 12px Outfit,sans-serif', padding: '7px 12px', cursor: 'pointer', flexShrink: 0,
      }}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
