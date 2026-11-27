'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShopShell from '@/components/shop/ShopShell';

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
  total_earned: number;
  total_views: number;
  conversion_rate: number;
  avg_price: number;
  avatar_url: string | null;
  created_at: string;
  shop_bio: string | null;
  best_listing: Listing | null;
  recent_listings: Listing[];
}

function fmt(n: number) { return n.toLocaleString('en-KE'); }
function fmtKsh(n: number) { return 'KSh ' + fmt(n); }
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const STATUS_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  live:     { bg: '#ECFDF5', color: '#059669', label: 'Live' },
  sold:     { bg: '#F5F3FF', color: '#7C3AED', label: 'Sold' },
  pending:  { bg: '#FFFBEB', color: '#D97706', label: 'Pending' },
  expired:  { bg: '#F9FAFB', color: '#9CA3AF', label: 'Expired' },
  archived: { bg: '#F9FAFB', color: '#9CA3AF', label: 'Archived' },
  rejected: { bg: '#FEF2F2', color: '#DC2626', label: 'Rejected' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_COLOR[status] ?? STATUS_COLOR.pending;
  return (
    <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:999, background:s.bg, color:s.color, font:'600 10px Outfit,sans-serif', letterSpacing:'.04em', textTransform:'uppercase' }}>
      {s.label}
    </span>
  );
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display:'flex', gap:6 }}>
      <input readOnly value={url} onClick={e => (e.target as HTMLInputElement).select()}
        style={{ flex:1, background:'#fff', border:'1.5px solid #EEE9E0', borderRadius:8, padding:'8px 10px', font:'400 11px Outfit,sans-serif', color:'#5A3010', outline:'none', minWidth:0 }}
      />
      <button onClick={() => { navigator.clipboard.writeText(url).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
        style={{ background:'#F07828', color:'#fff', border:'none', borderRadius:8, font:'700 12px Outfit,sans-serif', padding:'8px 14px', cursor:'pointer', flexShrink:0 }}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default function ShopDashboard() {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/my-shop/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.shop) { router.replace('/my-shop'); return; }
        setShop(data.shop);
        setLoading(false);
      })
      .catch(() => router.replace('/my-shop'));
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F4F0' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:28, height:28, border:'2.5px solid #F07828', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 12px' }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <span style={{ font:'400 14px Outfit,sans-serif', color:'#AAA' }}>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (!shop) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';
  const shopUrl = `${appUrl}/sellers/${shop.profile_slug}`;
  const isExpired = shop.subscription_expires_at && new Date(shop.subscription_expires_at) < new Date();
  const tierLabel: Record<string, string> = { free:'Free', starter:'Starter', pro:'Pro' };

  // Profile completeness
  const checks = [!!shop.avatar_url, !!shop.shop_bio, !!shop.neighbourhood, shop.verified_shop];
  const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return (
    <ShopShell shopName={shop.shop_name} profileSlug={shop.profile_slug}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        .dash-fade { animation: fadeUp .35s ease both; }
        .kpi-card { background:#fff; border-radius:16px; padding:22px 24px; border:1px solid #EDEAE5; transition:box-shadow .2s; }
        .kpi-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.07); }
        .action-btn { display:flex; align-items:center; gap:10px; padding:13px 16px; border-radius:12px; text-decoration:none; font:600 14px Outfit,sans-serif; transition:background .15s, transform .15s; cursor:pointer; border:none; width:100%; text-align:left; }
        .action-btn:hover { transform:translateX(3px); }
        .listing-row { display:grid; grid-template-columns:48px 1fr 90px; gap:14px; align-items:center; padding:13px 20px; border-bottom:1px solid #F3EEE8; transition:background .12s; }
        .listing-row:last-child { border-bottom:none; }
        .listing-row:hover { background:#FDFAF7; }
        @media(max-width:900px) {
          .dash-grid { grid-template-columns: 1fr !important; }
          .kpi-row { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width:480px) {
          .listing-row { grid-template-columns: 40px 1fr; }
          .listing-status { display:none; }
        }
      `}</style>

      {/* ── Warm header band ─────────────────────────────────────── */}
      <div style={{ background:'#FFF5EC', borderBottom:'1px solid rgba(240,120,40,.15)', padding:'32px 32px 36px', position:'relative', overflow:'hidden' }}>
        {/* Warm decorative blobs */}
        <div aria-hidden="true" style={{ position:'absolute', top:-60, right:-40, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle, rgba(240,120,40,.10) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div aria-hidden="true" style={{ position:'absolute', bottom:-40, left:60, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle, rgba(125,194,67,.08) 0%, transparent 70%)', pointerEvents:'none' }}/>

        <div style={{ position:'relative', zIndex:1 }}>
          {/* Top row: identity */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap', marginBottom:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              {/* Avatar */}
              <div style={{ width:52, height:52, borderRadius:14, background:'#FFE8D2', border:'2px solid rgba(240,120,40,.35)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                {shop.avatar_url
                  ? <img src={shop.avatar_url} alt={shop.shop_name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <span style={{ font:'700 22px Outfit,sans-serif', color:'#F07828' }}>{shop.shop_name.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <h1 style={{ font:'700 20px/1 Outfit,sans-serif', color:'#1A1310', margin:0 }}>{shop.shop_name}</h1>
                  {shop.verified_shop && (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#EDF7E2', color:'#5a9e2f', font:'600 10px Outfit,sans-serif', padding:'3px 8px', borderRadius:999, border:'1px solid #7DC24380' }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      Verified
                    </span>
                  )}
                  <span style={{ display:'inline-block', background:'#FFE8D2', color:'#B05810', font:'500 10px Outfit,sans-serif', padding:'3px 8px', borderRadius:999, textTransform:'capitalize', border:'1px solid rgba(240,120,40,.25)' }}>
                    {tierLabel[shop.subscription_tier] || shop.subscription_tier} Plan
                  </span>
                </div>
                <div style={{ font:'400 12px Outfit,sans-serif', color:'#A07050' }}>
                  {shop.neighbourhood && `${shop.neighbourhood} · `}Member since {new Date(shop.created_at).toLocaleDateString('en-KE', { month:'long', year:'numeric' })}
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <Link href="/sell" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#F07828', color:'#fff', textDecoration:'none', font:'700 14px Outfit,sans-serif', padding:'11px 20px', borderRadius:12, flexShrink:0, boxShadow:'0 2px 12px rgba(240,120,40,.3)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Listing
            </Link>
          </div>

          {/* Hero metrics */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="kpi-row">
            {/* Earned */}
            <div style={{ background:'#fff', border:'1.5px solid rgba(240,120,40,.18)', borderRadius:16, padding:'20px 24px', boxShadow:'0 1px 8px rgba(240,120,40,.06)' }}>
              <div style={{ font:'500 11px Outfit,sans-serif', color:'#A07050', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Total Earned</div>
              <div style={{ font:'800 32px/1 Outfit,sans-serif', color:'#F07828', letterSpacing:'-.02em' }}>
                {fmtKsh(shop.total_earned)}
              </div>
              <div style={{ font:'400 12px Outfit,sans-serif', color:'#C0A890', marginTop:6 }}>
                from {fmt(shop.total_sold)} items sold
              </div>
            </div>

            {/* Views */}
            <div style={{ background:'#fff', border:'1.5px solid rgba(125,194,67,.2)', borderRadius:16, padding:'20px 24px', boxShadow:'0 1px 8px rgba(125,194,67,.06)' }}>
              <div style={{ font:'500 11px Outfit,sans-serif', color:'#6A8C50', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Total Views</div>
              <div style={{ font:'800 32px/1 Outfit,sans-serif', color:'#7DC243', letterSpacing:'-.02em' }}>
                {fmt(shop.total_views)}
              </div>
              <div style={{ font:'400 12px Outfit,sans-serif', color:'#A0C880', marginTop:6 }}>
                across {fmt(shop.total_listings)} listing{shop.total_listings !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="dash-fade" style={{ padding:'24px 28px 48px', background:'#F7F4F0', minHeight:'60vh' }}>

        {/* KPI strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:24 }} className="kpi-row">
          {[
            { label:'Live Now', value: fmt(shop.live_listings), color:'#059669', icon:'M5 3l14 9-14 9V3z' },
            { label:'Total Sold', value: fmt(shop.total_sold), color:'#7C3AED', icon:'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3' },
            { label:'Conversion', value: `${shop.conversion_rate}%`, color:'#D97706', icon:'M18 20V10M12 20V4M6 20v-6' },
            { label:'Avg Price', value: shop.avg_price > 0 ? fmtKsh(shop.avg_price) : '—', color:'#F07828', icon:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-4H9l3-3 3 3h-2v4z' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ font:'500 11px Outfit,sans-serif', color:'#999', textTransform:'uppercase', letterSpacing:'.06em' }}>{k.label}</span>
                <div style={{ width:28, height:28, borderRadius:8, background:`${k.color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={k.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={k.icon}/>
                  </svg>
                </div>
              </div>
              <div style={{ font:'700 22px/1 Outfit,sans-serif', color:'#1A1A1A' }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Two-column grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, alignItems:'start' }} className="dash-grid">

          {/* Left: Recent listings */}
          <div>
            {/* Best performer */}
            {shop.best_listing && shop.best_listing.view_count > 0 && (
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #EDEAE5', padding:'18px 20px', marginBottom:16, display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:8, height:48, borderRadius:4, background:'linear-gradient(180deg,#F07828,#FFB347)', flexShrink:0 }}/>
                <div style={{ width:48, height:48, borderRadius:10, overflow:'hidden', background:'#F5EFE6', flexShrink:0 }}>
                  {shop.best_listing.images?.[0]
                    ? <img src={shop.best_listing.images[0]} alt={shop.best_listing.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ font:'500 10px Outfit,sans-serif', color:'#F07828', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>⭐ Best performer</div>
                  <div style={{ font:'600 14px Outfit,sans-serif', color:'#1A1A1A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{shop.best_listing.title}</div>
                  <div style={{ font:'400 12px Outfit,sans-serif', color:'#999', marginTop:2 }}>{fmt(shop.best_listing.view_count)} views · {fmtKsh(shop.best_listing.price)}</div>
                </div>
                <StatusPill status={shop.best_listing.status} />
              </div>
            )}

            {/* Recent activity */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #EDEAE5', overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 14px', borderBottom:'1px solid #F0EBE4' }}>
                <span style={{ font:'600 15px Outfit,sans-serif', color:'#1A1A1A' }}>Recent Activity</span>
                <Link href="/my-shop/listings" style={{ font:'500 13px Outfit,sans-serif', color:'#F07828', textDecoration:'none' }}>View all →</Link>
              </div>

              {shop.recent_listings.length === 0 ? (
                <div style={{ padding:'40px 24px', textAlign:'center' }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:'#F5EFE6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F07828" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  </div>
                  <p style={{ font:'500 14px Outfit,sans-serif', color:'#555', marginBottom:4 }}>No listings yet</p>
                  <p style={{ font:'400 13px Outfit,sans-serif', color:'#AAA', marginBottom:16 }}>Post your first item — takes under 5 minutes.</p>
                  <Link href="/sell" style={{ display:'inline-flex', alignItems:'center', gap:6, font:'600 13px Outfit,sans-serif', color:'#fff', background:'#F07828', padding:'9px 18px', borderRadius:10, textDecoration:'none' }}>
                    Post first listing
                  </Link>
                </div>
              ) : (
                shop.recent_listings.map(item => (
                  <div key={item.id} className="listing-row">
                    {/* Thumbnail */}
                    <div style={{ width:48, height:48, borderRadius:9, overflow:'hidden', background:'#F5EFE6', flexShrink:0 }}>
                      {item.images?.[0]
                        ? <img src={item.images[0]} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="21 15 16 10 5 21"/></svg></div>
                      }
                    </div>

                    {/* Info */}
                    <div style={{ minWidth:0 }}>
                      <div style={{ font:'500 14px Outfit,sans-serif', color:'#1A1A1A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                        <span style={{ font:'600 13px Outfit,sans-serif', color:'#F07828' }}>{fmtKsh(item.price)}</span>
                        <span style={{ font:'400 11px Outfit,sans-serif', color:'#BBB' }}>{fmt(item.view_count)} views · {timeAgo(item.created_at)}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="listing-status" style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:6 }}>
                      <StatusPill status={item.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Actions + Shop info */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Quick actions */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #EDEAE5', overflow:'hidden' }}>
              <div style={{ font:'600 13px Outfit,sans-serif', color:'#999', textTransform:'uppercase', letterSpacing:'.06em', padding:'16px 18px 12px', borderBottom:'1px solid #F0EBE4' }}>
                Quick Actions
              </div>
              <div style={{ padding:'8px 10px' }}>
                {[
                  { href:'/sell',              label:'Add a new listing',   sub:'Goes live instantly', bg:'#FFF5EC', color:'#F07828', icon:'M12 5v14M5 12h14' },
                  { href:'/my-shop/listings',  label:'Manage listings',     sub:'Edit, archive, mark sold', bg:'#EDF7E2', color:'#059669', icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                  { href:'/my-shop/profile',   label:'Edit shop profile',   sub:'Bio, photo, areas', bg:'#EFF6FF', color:'#2563EB', icon:'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
                ].map(a => (
                  <Link key={a.href} href={a.href} className="action-btn" style={{ background:'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FDFAF7')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width:36, height:36, borderRadius:10, background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={a.icon}/></svg>
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ font:'600 13px Outfit,sans-serif', color:'#1A1A1A' }}>{a.label}</div>
                      <div style={{ font:'400 11px Outfit,sans-serif', color:'#AAA' }}>{a.sub}</div>
                    </div>
                    <svg style={{ marginLeft:'auto', flexShrink:0, color:'#DDD' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Share shop */}
            <div style={{ background:'linear-gradient(135deg, #1A1A1A 0%, #2C1810 100%)', borderRadius:16, padding:'18px 20px' }}>
              <div style={{ font:'600 14px Outfit,sans-serif', color:'#fff', marginBottom:4 }}>Your shop link</div>
              <div style={{ font:'400 12px Outfit,sans-serif', color:'rgba(255,255,255,.45)', marginBottom:14 }}>
                Share this with buyers. Opens your full shop.
              </div>
              <CopyLinkButton url={shopUrl} />
              <a href={shopUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:5, font:'500 12px Outfit,sans-serif', color:'rgba(255,255,255,.45)', textDecoration:'none', marginTop:12 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Preview shop page
              </a>
            </div>

            {/* Profile completeness */}
            {completeness < 100 && (
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #EDEAE5', padding:'18px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <span style={{ font:'600 13px Outfit,sans-serif', color:'#1A1A1A' }}>Shop Completeness</span>
                  <span style={{ font:'700 14px Outfit,sans-serif', color: completeness >= 75 ? '#059669' : '#F07828' }}>{completeness}%</span>
                </div>
                <div style={{ height:6, background:'#F0EBE4', borderRadius:999, overflow:'hidden', marginBottom:12 }}>
                  <div style={{ height:'100%', width:`${completeness}%`, background: completeness >= 75 ? '#7DC243' : '#F07828', borderRadius:999, transition:'width .4s ease' }}/>
                </div>
                {[
                  { done:!!shop.avatar_url, label:'Add a profile photo' },
                  { done:!!shop.shop_bio, label:'Write a shop bio' },
                  { done:!!shop.neighbourhood, label:'Set your neighbourhood' },
                  { done:shop.verified_shop, label:'Get verified' },
                ].filter(c => !c.done).slice(0, 2).map(c => (
                  <div key={c.label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <div style={{ width:16, height:16, borderRadius:'50%', border:'1.5px solid #DDD', flexShrink:0 }}/>
                    <span style={{ font:'400 12px Outfit,sans-serif', color:'#888' }}>{c.label}</span>
                  </div>
                ))}
                <Link href="/my-shop/profile" style={{ display:'inline-block', marginTop:8, font:'600 12px Outfit,sans-serif', color:'#F07828', textDecoration:'none' }}>
                  Complete profile →
                </Link>
              </div>
            )}

            {/* Subscription (non-free) */}
            {shop.subscription_tier !== 'free' && (
              <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${isExpired ? '#FECACA' : '#EDEAE5'}`, padding:'18px 20px' }}>
                <div style={{ font:'600 13px Outfit,sans-serif', color:'#1A1A1A', marginBottom:10 }}>Subscription</div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:isExpired ? 12 : 0 }}>
                  <span style={{ padding:'4px 10px', borderRadius:999, background: isExpired ? '#FEF2F2' : '#ECFDF5', color: isExpired ? '#DC2626' : '#059669', font:'600 11px Outfit,sans-serif' }}>
                    {tierLabel[shop.subscription_tier]} Plan
                  </span>
                  {!isExpired && shop.subscription_expires_at && (
                    <span style={{ font:'400 12px Outfit,sans-serif', color:'#888' }}>
                      Until {new Date(shop.subscription_expires_at).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                  )}
                  {isExpired && <span style={{ font:'400 12px Outfit,sans-serif', color:'#DC2626' }}>Expired</span>}
                </div>
                {isExpired && (
                  <a href="https://wa.me/254790784084?text=Hi%2C%20I%27d%20like%20to%20renew%20my%20shop%20subscription"
                    target="_blank" rel="noopener noreferrer"
                    style={{ display:'inline-flex', alignItems:'center', gap:6, font:'600 13px Outfit,sans-serif', color:'#fff', background:'#F07828', padding:'8px 14px', borderRadius:9, textDecoration:'none' }}>
                    Renew subscription
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
