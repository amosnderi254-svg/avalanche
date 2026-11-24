'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ShopShell from '@/components/shop/ShopShell';

interface ShopProfile {
  shop_name: string;
  display_name: string;
  shop_bio: string;
  neighbourhood: string;
  shop_areas: string[];
  profile_slug: string;
  phone: string;
  avatar_url: string | null;
  shop_banner_url: string | null;
}

const NAIROBI_AREAS = [
  'Westlands', 'Karen', 'Kilimani', 'Lavington', 'Parklands',
  'Kileleshwa', 'Loresho', 'Spring Valley', 'Runda', 'Muthaiga',
  'Gigiri', 'Ridgeways', 'Kitisuru', 'Nyari', 'Ruaka',
  'Thika Road', 'Kasarani', 'Roysambu', 'Ruaraka', 'Githurai',
  'South B', 'South C', 'Langata', 'Rongai', 'Ngong Road',
  'Upperhill', 'Hurlingham', 'Adams Arcade', 'Dagoretti', 'Kikuyu',
  'Eastleigh', 'Buruburu', 'Embakasi', 'Utawala', 'Syokimau',
  'Kitengela', 'Athi River', 'Ruiru', 'Juja', 'Limuru',
];

function SuccessBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#F0FBF0', border: '1px solid #B7EB8F', borderRadius: 10,
      padding: '11px 14px', marginBottom: 20,
      font: '400 13px Outfit,sans-serif', color: '#389E0D',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
      </svg>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8BC34A', display: 'flex', padding: 2 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

export default function ShopProfilePage() {
  const router  = useRouter();
  const bioRef  = useRef<HTMLTextAreaElement>(null);

  const [profile, setProfile]       = useState<ShopProfile | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // Form fields
  const [shopName, setShopName]     = useState('');
  const [displayName, setDisplayName] = useState('');
  const [shopBio, setShopBio]       = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [shopAreas, setShopAreas]   = useState<string[]>([]);
  const [areaSearch, setAreaSearch] = useState('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const BIO_MAX = 300;
  const bioCharsLeft = BIO_MAX - shopBio.length;

  useEffect(() => {
    fetch('/api/my-shop/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.shop) { router.replace('/my-shop'); return; }
        const s: ShopProfile = data.shop;
        setProfile(s);
        setShopName(s.shop_name || '');
        setDisplayName(s.display_name || '');
        setShopBio(s.shop_bio || '');
        setNeighbourhood(s.neighbourhood || '');
        setShopAreas(s.shop_areas || []);
        setLoading(false);
      })
      .catch(() => router.replace('/my-shop'));
  }, [router]);

  // Auto-resize bio textarea
  useEffect(() => {
    if (bioRef.current) {
      bioRef.current.style.height = 'auto';
      bioRef.current.style.height = bioRef.current.scrollHeight + 'px';
    }
  }, [shopBio]);

  function toggleArea(area: string) {
    setShopAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : prev.length < 10 ? [...prev, area] : prev
    );
  }

  const filteredAreas = NAIROBI_AREAS.filter(a =>
    a.toLowerCase().includes(areaSearch.toLowerCase()) && !shopAreas.includes(a)
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (shopName.trim().length < 2) { setError('Shop name must be at least 2 characters'); return; }
    if (shopName.trim().length > 60) { setError('Shop name must be 60 characters or fewer'); return; }
    if (shopBio.length > BIO_MAX) { setError(`Shop bio must be ${BIO_MAX} characters or fewer`); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/my-shop/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_name: shopName.trim(),
          display_name: displayName.trim(),
          shop_bio: shopBio.trim(),
          neighbourhood: neighbourhood.trim(),
          shop_areas: shopAreas,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Save failed. Please try again.');
      } else {
        setProfile(prev => prev ? { ...prev, shop_name: shopName.trim(), shop_bio: shopBio.trim(), neighbourhood: neighbourhood.trim(), shop_areas: shopAreas } : prev);
        setSuccess('Profile saved successfully.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F4F0' }}>
        <div style={{ width: 28, height: 28, border: '2.5px solid #F07828', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <ShopShell shopName={shopName || profile?.shop_name} profileSlug={profile?.profile_slug}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .profile-wrap{animation:fadeIn .3s ease both}
        .field-input{
          width:100%;border:1.5px solid #E8E0D5;border-radius:10px;
          padding:0 14px;font:400 15px Outfit,sans-serif;color:#111;
          background:#FEFCF8;outline:none;height:46px;
          transition:border-color .15s,box-shadow .15s;
        }
        .field-input:focus{border-color:#F07828;box-shadow:0 0 0 3px rgba(240,120,40,.12)}
        .field-label{display:block;font:500 13px Outfit,sans-serif;color:#444;margin-bottom:7px}
        .area-chip{
          display:inline-flex;align-items:center;gap:5px;
          padding:4px 10px;border-radius:999px;
          background:#FFF5EC;border:1.5px solid #FDD5B0;
          font:500 13px Outfit,sans-serif;color:#C85A00;
          cursor:pointer;transition:background .1s;
        }
        .area-chip:hover{background:#FFE8D0}
        .area-dropdown-item{
          padding:9px 14px;font:400 14px Outfit,sans-serif;color:#333;
          cursor:pointer;transition:background .1s;border-radius:6px;
        }
        .area-dropdown-item:hover{background:#FFF5EC;color:#F07828}
        @media(max-width:768px){
          .profile-cols{flex-direction:column!important}
        }
      `}</style>

      <div className="profile-wrap" style={{ padding: '28px 28px 60px', maxWidth: 820 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ font: '700 22px Outfit,sans-serif', color: '#1A1A1A', margin: '0 0 4px' }}>
            Shop Profile
          </h1>
          <p style={{ font: '400 14px Outfit,sans-serif', color: '#888', margin: 0 }}>
            Update your shop details visible to buyers.
          </p>
        </div>

        {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}
        {error && (
          <div style={{ background: '#FFF2F0', border: '1px solid #FFCCC7', borderRadius: 10, padding: '11px 14px', font: '400 13px Outfit,sans-serif', color: '#CF1322', marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="profile-cols" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

            {/* Left column */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Avatar preview */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E2', padding: '20px 20px 20px' }}>
                <div style={{ font: '600 14px Outfit,sans-serif', color: '#1A1A1A', marginBottom: 14 }}>Shop Identity</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 14, overflow: 'hidden',
                    background: 'linear-gradient(135deg, #F07828, #FF9A4A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={shopName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ font: '700 22px Outfit,sans-serif', color: '#fff' }}>
                        {(shopName || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={{ font: '600 15px Outfit,sans-serif', color: '#1A1A1A' }}>{shopName || 'Your Shop'}</div>
                    {profile?.profile_slug && (
                      <div style={{ font: '400 12px Outfit,sans-serif', color: '#AAA', marginTop: 2 }}>
                        mytinyverse.com/sellers/{profile.profile_slug}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="field-label">Shop name</label>
                    <input
                      className="field-input"
                      value={shopName}
                      onChange={e => setShopName(e.target.value)}
                      maxLength={60}
                      placeholder="e.g. Baby Boutique Westlands"
                      required
                    />
                    <div style={{ font: '400 11px Outfit,sans-serif', color: '#BBB', marginTop: 4 }}>
                      {shopName.length}/60 characters
                    </div>
                  </div>
                  <div>
                    <label className="field-label">Your name (optional)</label>
                    <input
                      className="field-input"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      maxLength={60}
                      placeholder="e.g. Sarah M."
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E2', padding: '20px' }}>
                <div style={{ font: '600 14px Outfit,sans-serif', color: '#1A1A1A', marginBottom: 14 }}>About Your Shop</div>
                <div>
                  <label className="field-label">Shop bio</label>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      ref={bioRef}
                      value={shopBio}
                      onChange={e => setShopBio(e.target.value)}
                      maxLength={BIO_MAX}
                      rows={4}
                      placeholder="Tell buyers about your shop, what you sell, and why they should buy from you..."
                      style={{
                        width: '100%', border: '1.5px solid #E8E0D5', borderRadius: 10,
                        padding: '12px 14px', font: '400 14px/1.6 Outfit,sans-serif', color: '#111',
                        background: '#FEFCF8', outline: 'none', resize: 'none', overflow: 'hidden',
                        transition: 'border-color .15s, box-shadow .15s',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#F07828'; e.target.style.boxShadow = '0 0 0 3px rgba(240,120,40,.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#E8E0D5'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <span style={{ font: '400 11px Outfit,sans-serif', color: bioCharsLeft < 30 ? '#F07828' : '#BBB' }}>
                      {bioCharsLeft} remaining
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Location */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E2', padding: '20px' }}>
                <div style={{ font: '600 14px Outfit,sans-serif', color: '#1A1A1A', marginBottom: 14 }}>Location</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="field-label">Neighbourhood</label>
                    <input
                      className="field-input"
                      value={neighbourhood}
                      onChange={e => setNeighbourhood(e.target.value)}
                      maxLength={60}
                      placeholder="e.g. Westlands, Nairobi"
                    />
                  </div>
                  <div>
                    <label className="field-label">
                      Delivery areas
                      <span style={{ font: '400 12px Outfit,sans-serif', color: '#AAA', marginLeft: 6 }}>
                        ({shopAreas.length}/10 selected)
                      </span>
                    </label>

                    {/* Selected chips */}
                    {shopAreas.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
                        {shopAreas.map(area => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => toggleArea(area)}
                            className="area-chip"
                          >
                            {area}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Area search */}
                    <div style={{ position: 'relative' }}>
                      <input
                        className="field-input"
                        value={areaSearch}
                        onChange={e => setAreaSearch(e.target.value)}
                        onFocus={() => setShowAreaDropdown(true)}
                        onBlur={() => setTimeout(() => setShowAreaDropdown(false), 150)}
                        placeholder="Search and add areas..."
                        style={{ paddingLeft: 38 }}
                        disabled={shopAreas.length >= 10}
                      />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2"
                        style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>

                      {/* Dropdown */}
                      {showAreaDropdown && filteredAreas.length > 0 && (
                        <div style={{
                          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                          background: '#fff', border: '1.5px solid #E8E0D5', borderRadius: 10,
                          boxShadow: '0 8px 24px rgba(0,0,0,.10)', marginTop: 4,
                          maxHeight: 200, overflowY: 'auto', padding: '4px',
                        }}>
                          {filteredAreas.slice(0, 12).map(area => (
                            <div
                              key={area}
                              className="area-dropdown-item"
                              onMouseDown={() => { toggleArea(area); setAreaSearch(''); }}
                            >
                              {area}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {shopAreas.length >= 10 && (
                      <div style={{ font: '400 11px Outfit,sans-serif', color: '#AAA', marginTop: 5 }}>
                        Maximum 10 delivery areas selected.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Read-only account info */}
              <div style={{ background: '#F9F7F4', borderRadius: 16, border: '1px solid #EDE8E2', padding: '20px' }}>
                <div style={{ font: '600 14px Outfit,sans-serif', color: '#1A1A1A', marginBottom: 14 }}>Account Info</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ font: '500 12px Outfit,sans-serif', color: '#AAA', marginBottom: 3 }}>Phone number</div>
                    <div style={{ font: '400 14px Outfit,sans-serif', color: '#555' }}>{profile?.phone || '--'}</div>
                  </div>
                  <div>
                    <div style={{ font: '500 12px Outfit,sans-serif', color: '#AAA', marginBottom: 3 }}>Shop URL</div>
                    <div style={{ font: '400 14px Outfit,sans-serif', color: '#555' }}>
                      /sellers/{profile?.profile_slug || '--'}
                    </div>
                  </div>
                </div>
                <p style={{ font: '400 12px Outfit,sans-serif', color: '#AAA', margin: '14px 0 0', lineHeight: 1.5 }}>
                  To change your phone number or shop URL,{' '}
                  <a href="https://wa.me/254790784084?text=Hi%2C%20I%20need%20to%20update%20my%20shop%20account%20details"
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: '#F07828', textDecoration: 'none' }}>
                    contact support
                  </a>.
                </p>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                if (profile) {
                  setShopName(profile.shop_name || '');
                  setShopBio(profile.shop_bio || '');
                  setNeighbourhood(profile.neighbourhood || '');
                  setShopAreas(profile.shop_areas || []);
                  setError('');
                }
              }}
              style={{
                height: 46, padding: '0 22px', background: '#F5F5F5', color: '#666',
                border: 'none', borderRadius: 10, font: '600 14px Outfit,sans-serif', cursor: 'pointer',
              }}
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                height: 46, padding: '0 28px', background: '#F07828', color: '#fff',
                border: 'none', borderRadius: 10, font: '600 14px Outfit,sans-serif',
                cursor: 'pointer', opacity: saving ? .6 : 1,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {saving ? (
                <>
                  <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  Saving...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ShopShell>
  );
}
