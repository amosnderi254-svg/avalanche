'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ShopShell from '@/components/shop/ShopShell';

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  status: string;
  view_count: number;
  whatsapp_clicks: number;
  created_at: string;
  expires_at: string | null;
  fee_tier: string;
}

interface Shop { shop_name: string; profile_slug: string; phone: string; }

const STATUS_TABS = [
  { key: 'all',     label: 'All' },
  { key: 'live',    label: 'Live' },
  { key: 'sold',    label: 'Sold' },
  { key: 'pending', label: 'Pending' },
  { key: 'expired', label: 'Expired' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    live:     { bg: '#F0FBF0', color: '#389E0D', label: 'Live' },
    sold:     { bg: '#F5F0FF', color: '#722ED1', label: 'Sold' },
    pending:  { bg: '#FFF7E6', color: '#D46B08', label: 'Pending' },
    expired:  { bg: '#F5F5F5', color: '#888',    label: 'Expired' },
    archived: { bg: '#F5F5F5', color: '#888',    label: 'Archived' },
    rejected: { bg: '#FFF2F0', color: '#CF1322', label: 'Rejected' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 999, background: s.bg, color: s.color, font: '500 11px Outfit,sans-serif' }}>
      {s.label}
    </span>
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

// Edit modal
function EditModal({ listing, onClose, onSave }: {
  listing: Listing;
  onClose: () => void;
  onSave: (id: string, patch: Record<string, unknown>) => Promise<void>;
}) {
  const [title, setTitle]       = useState(listing.title);
  const [price, setPrice]       = useState(String(listing.price));
  const [condition, setCondition] = useState(listing.condition || '');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  async function handleSave() {
    setError('');
    const p = Number(price);
    if (isNaN(p) || p < 0) { setError('Enter a valid price'); return; }
    if (title.trim().length < 3) { setError('Title must be at least 3 characters'); return; }
    setSaving(true);
    try {
      await onSave(listing.id, { title: title.trim(), price: p, condition });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 'min(480px, calc(100vw - 32px))', background: '#fff', borderRadius: 20,
        padding: '28px 28px 24px', zIndex: 201,
        boxShadow: '0 20px 60px rgba(0,0,0,.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ font: '700 18px Outfit,sans-serif', color: '#1A1A1A', margin: 0 }}>Edit Listing</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AAA', display: 'flex', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && (
          <div style={{ background: '#FFF2F0', border: '1px solid #FFCCC7', borderRadius: 8, padding: '10px 14px', font: '400 13px Outfit,sans-serif', color: '#CF1322', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', font: '500 13px Outfit,sans-serif', color: '#444', marginBottom: 7 }}>Title</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              maxLength={100}
              style={{ width: '100%', height: 44, border: '1.5px solid #E8E0D5', borderRadius: 9, padding: '0 14px', font: '400 14px Outfit,sans-serif', color: '#111', outline: 'none', background: '#FEFCF8' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', font: '500 13px Outfit,sans-serif', color: '#444', marginBottom: 7 }}>Price (KSh)</label>
            <input
              type="number" min="0" value={price} onChange={e => setPrice(e.target.value)}
              style={{ width: '100%', height: 44, border: '1.5px solid #E8E0D5', borderRadius: 9, padding: '0 14px', font: '400 14px Outfit,sans-serif', color: '#111', outline: 'none', background: '#FEFCF8' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', font: '500 13px Outfit,sans-serif', color: '#444', marginBottom: 7 }}>Condition</label>
            <select
              value={condition} onChange={e => setCondition(e.target.value)}
              style={{ width: '100%', height: 44, border: '1.5px solid #E8E0D5', borderRadius: 9, padding: '0 14px', font: '400 14px Outfit,sans-serif', color: '#111', outline: 'none', background: '#FEFCF8' }}
            >
              <option value="">Select condition</option>
              <option value="new">New (never used)</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{
            flex: 1, height: 44, background: '#F5F5F5', color: '#666', border: 'none',
            borderRadius: 10, font: '600 14px Outfit,sans-serif', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, height: 44, background: '#F07828', color: '#fff', border: 'none',
            borderRadius: 10, font: '600 14px Outfit,sans-serif', cursor: 'pointer',
            opacity: saving ? .6 : 1,
          }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
}

// Confirm dialog
function ConfirmDialog({ message, onConfirm, onCancel, destructive }: {
  message: string; onConfirm: () => void; onCancel: () => void; destructive?: boolean;
}) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 'min(360px, calc(100vw - 32px))', background: '#fff', borderRadius: 16,
        padding: '28px 24px 24px', zIndex: 201,
        boxShadow: '0 20px 60px rgba(0,0,0,.18)',
      }}>
        <p style={{ font: '400 15px Outfit,sans-serif', color: '#333', margin: '0 0 22px', textAlign: 'center', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, height: 42, background: '#F5F5F5', color: '#666', border: 'none', borderRadius: 9, font: '600 14px Outfit,sans-serif', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, height: 42, background: destructive ? '#FF4D4F' : '#F07828', color: '#fff', border: 'none', borderRadius: 9, font: '600 14px Outfit,sans-serif', cursor: 'pointer' }}>
            Confirm
          </button>
        </div>
      </div>
    </>
  );
}

export default function ShopListingsPage() {
  const router = useRouter();
  const [shop, setShop]           = useState<Shop | null>(null);
  const [listings, setListings]   = useState<Listing[]>([]);
  const [statusTab, setStatusTab] = useState('all');
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState<Listing | null>(null);
  const [confirm, setConfirm]     = useState<{ id: string; action: 'sold' | 'archive' } | null>(null);

  const loadListings = useCallback(async (status: string) => {
    const r = await fetch(`/api/my-shop/listings?status=${status}`);
    if (r.ok) {
      const d = await r.json();
      setListings(d.listings || []);
    }
  }, []);

  useEffect(() => {
    fetch('/api/my-shop/me')
      .then(r => r.ok ? r.json() : null)
      .then(async data => {
        if (!data?.shop) { router.replace('/my-shop'); return; }
        setShop({ shop_name: data.shop.shop_name, profile_slug: data.shop.profile_slug, phone: data.shop.phone });
        await loadListings(statusTab);
        setLoading(false);
      })
      .catch(() => router.replace('/my-shop'));
  }, [router, loadListings, statusTab]);

  async function handleTabChange(tab: string) {
    setStatusTab(tab);
    setLoading(true);
    await loadListings(tab);
    setLoading(false);
  }

  async function handleSave(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/my-shop/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save');
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  }

  async function handleStatusChange(id: string, newStatus: 'sold' | 'archived') {
    const res = await fetch(`/api/my-shop/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    }
    setConfirm(null);
  }

  async function handleArchive(id: string) {
    const res = await fetch(`/api/my-shop/listings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setListings(prev => prev.filter(l => l.id !== id));
    }
    setConfirm(null);
  }

  if (loading && !shop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F4F0' }}>
        <div style={{ width: 28, height: 28, border: '2.5px solid #F07828', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const liveCount = listings.filter(l => l.status === 'live').length;

  return (
    <ShopShell shopName={shop?.shop_name} profileSlug={shop?.profile_slug}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .listings-wrap{animation:fadeIn .3s ease both}
        .listing-item{display:grid;grid-template-columns:56px 1fr auto;gap:14px;align-items:center;padding:14px 16px;border-bottom:1px solid #F0EBE4;transition:background .1s}
        .listing-item:last-child{border-bottom:none}
        .listing-item:hover{background:#FDFBF8}
        .action-btn{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;border:1.5px solid;border-radius:7px;font:500 12px Outfit,sans-serif;cursor:pointer;background:none;transition:background .12s,color .12s}
        @media(max-width:640px){
          .listing-item{grid-template-columns:44px 1fr}
          .listing-actions-row{flex-wrap:wrap;gap:6px}
          .listing-meta-row{display:none}
        }
      `}</style>

      <div className="listings-wrap" style={{ padding: '28px 28px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ font: '700 22px Outfit,sans-serif', color: '#1A1A1A', margin: '0 0 4px' }}>
              My Listings
            </h1>
            <div style={{ font: '400 14px Outfit,sans-serif', color: '#888' }}>
              {liveCount} listing{liveCount !== 1 ? 's' : ''} currently live
            </div>
          </div>
          <a href="/sell" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#7DC243', color: '#fff', textDecoration: 'none',
            font: '600 14px Outfit,sans-serif', padding: '10px 18px', borderRadius: 10,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Listing
          </a>
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#F0EBE4', borderRadius: 12, padding: 4, marginBottom: 20, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                flex: '1 0 auto', height: 36, border: 'none', borderRadius: 9,
                font: '500 13px Outfit,sans-serif', cursor: 'pointer',
                background: statusTab === tab.key ? '#fff' : 'transparent',
                color: statusTab === tab.key ? '#1A1A1A' : '#888',
                boxShadow: statusTab === tab.key ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                transition: 'background .15s, color .15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listings */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E2', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 10 }}>
              <div style={{ width: 20, height: 20, border: '2px solid #F07828', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              <span style={{ font: '400 14px Outfit,sans-serif', color: '#AAA' }}>Loading...</span>
            </div>
          ) : listings.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#DDD" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 14px' }}>
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <p style={{ font: '400 15px Outfit,sans-serif', color: '#AAA' }}>
                {statusTab === 'all' ? 'No listings yet.' : `No ${statusTab} listings.`}
              </p>
            </div>
          ) : (
            <div>
              {listings.map(item => (
                <div key={item.id} className="listing-item">
                  {/* Thumbnail */}
                  <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: '#F5F0E8', flexShrink: 0 }}>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ font: '500 15px Outfit,sans-serif', color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ font: '700 14px Outfit,sans-serif', color: '#F07828' }}>{formatPrice(item.price)}</span>
                      <StatusBadge status={item.status} />
                      <span className="listing-meta-row" style={{ font: '400 12px Outfit,sans-serif', color: '#BBB' }}>
                        {item.view_count} views &middot; {timeAgo(item.created_at)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="listing-actions-row" style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                      {/* Edit */}
                      <button
                        onClick={() => setEditing(item)}
                        className="action-btn"
                        style={{ borderColor: '#E8E0D5', color: '#666' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>

                      {/* Mark sold */}
                      {item.status === 'live' && (
                        <button
                          onClick={() => setConfirm({ id: item.id, action: 'sold' })}
                          className="action-btn"
                          style={{ borderColor: '#D3B6F5', color: '#722ED1' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Mark Sold
                        </button>
                      )}

                      {/* View public listing */}
                      <a href={`/item/${item.id}`} target="_blank" rel="noopener noreferrer"
                        className="action-btn"
                        style={{ borderColor: '#E8E0D5', color: '#888', textDecoration: 'none' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        View
                      </a>

                      {/* Remove */}
                      {item.status !== 'archived' && (
                        <button
                          onClick={() => setConfirm({ id: item.id, action: 'archive' })}
                          className="action-btn"
                          style={{ borderColor: '#FFCCC7', color: '#CF1322' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                          </svg>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile chevron (hidden on desktop) */}
                  <div className="listing-actions-row" style={{ display: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <EditModal
          listing={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {/* Confirm dialog */}
      {confirm && (
        <ConfirmDialog
          message={
            confirm.action === 'sold'
              ? 'Mark this listing as sold? This will remove it from the marketplace.'
              : 'Remove this listing? It will be archived and hidden from the marketplace.'
          }
          destructive={confirm.action === 'archive'}
          onCancel={() => setConfirm(null)}
          onConfirm={() =>
            confirm.action === 'sold'
              ? handleStatusChange(confirm.id, 'sold')
              : handleArchive(confirm.id)
          }
        />
      )}
    </ShopShell>
  );
}
