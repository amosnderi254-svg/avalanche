'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface ShopShellProps {
  children: React.ReactNode;
  shopName?: string;
  profileSlug?: string;
}

const NAV = [
  {
    href: '/my-shop/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/my-shop/listings',
    label: 'Listings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    href: '/my-shop/profile',
    label: 'Profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function ShopShell({ children, shopName, profileSlug }: ShopShellProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/my-shop/logout', { method: 'POST' }).catch(() => {});
    router.replace('/my-shop');
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: Outfit, sans-serif; background: #F7F4F0; margin: 0; }

        /* Sidebar */
        .shop-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; width: 220px;
          background: #fff; border-right: 1px solid #E8E0D5;
          display: flex; flex-direction: column; z-index: 50;
        }
        .shop-main { margin-left: 220px; min-height: 100vh; }
        .shop-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; border-radius: 9px;
          font: 500 14px Outfit,sans-serif; color: #666;
          text-decoration: none; cursor: pointer; border: none;
          background: none; width: 100%; text-align: left;
          transition: background .12s, color .12s;
        }
        .shop-nav-item:hover { background: #FFF5EC; color: #F07828; }
        .shop-nav-item.active { background: #FFF5EC; color: #F07828; font-weight: 600; }
        .shop-nav-item.active svg { stroke: #F07828; }

        /* Mobile bottom nav */
        .shop-bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #fff; border-top: 1px solid #E8E0D5;
          z-index: 50; padding: 0;
        }
        .shop-bottom-item {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; padding: 10px 4px 12px;
          font: 500 10px Outfit,sans-serif; color: #999;
          text-decoration: none; border: none; background: none; cursor: pointer;
          transition: color .12s;
        }
        .shop-bottom-item.active { color: #F07828; }
        .shop-bottom-item.active svg { stroke: #F07828; }

        /* Mobile header */
        .shop-mobile-header {
          display: none; position: sticky; top: 0; z-index: 40;
          background: #fff; border-bottom: 1px solid #E8E0D5;
          padding: 0 16px; height: 56px;
          align-items: center; justify-content: space-between;
        }

        @media (max-width: 768px) {
          .shop-sidebar { display: none !important; }
          .shop-main { margin-left: 0; padding-bottom: 70px; }
          .shop-bottom-nav { display: flex; }
          .shop-mobile-header { display: flex; }
        }
      `}</style>

      {/* Sidebar (desktop) */}
      <aside className="shop-sidebar">
        {/* Logo */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #F0EBE4' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 14 }}>
            <img src="/favicon-source.png" alt="MTV" width={28} height={28} style={{ borderRadius: 7 }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span style={{ font: '700 15px Outfit,sans-serif', color: '#F07828' }}>MyTinyverse</span>
          </Link>
          <div style={{ font: '600 13px Outfit,sans-serif', color: '#1A1A1A', lineHeight: 1.3, wordBreak: 'break-word' }}>
            {shopName || 'My Shop'}
          </div>
          <div style={{ font: '400 11px Outfit,sans-serif', color: '#AAA', marginTop: 2 }}>Shop Dashboard</div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`shop-nav-item${pathname === item.href ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {profileSlug && (
            <a
              href={`/sellers/${profileSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shop-nav-item"
              style={{ marginTop: 4 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              View Public Shop
            </a>
          )}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #F0EBE4' }}>
          <Link href="/sell" className="shop-nav-item" style={{ color: '#7DC243', marginBottom: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add New Listing
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="shop-nav-item"
            style={{ color: '#999', marginTop: 2 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {loggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="shop-mobile-header">
        <span style={{ font: '600 15px Outfit,sans-serif', color: '#1A1A1A' }}>
          {shopName || 'My Shop'}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          {profileSlug && (
            <a href={`/sellers/${profileSlug}`} target="_blank" rel="noopener noreferrer"
              style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #E8E0D5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          )}
          <button onClick={handleLogout} disabled={loggingOut}
            style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #E8E0D5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#999' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="shop-main">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="shop-bottom-nav">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`shop-bottom-item${pathname === item.href ? ' active' : ''}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        <Link href="/sell" className="shop-bottom-item" style={{ color: '#7DC243' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Add
        </Link>
      </nav>
    </>
  );
}
