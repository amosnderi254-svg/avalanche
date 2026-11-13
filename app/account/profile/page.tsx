'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────
interface SellerProfile {
  id: string;
  display_name: string;
  bio: string | null;
  neighbourhood: string | null;
  avatar_url: string | null;
  profile_slug: string;
  total_sold: number;
  created_at: string;
  updated_at?: string;
}

// ── Nairobi neighbourhoods (matches ListingsPage) ─────────
const NEIGHBOURHOODS = [
  'Westlands','Kilimani','Karen','Lavington','Runda','Muthaiga','Spring Valley',
  'Kitisuru','Parklands','Upperhill','Kileleshwa','Hurlingham','Lang\'ata',
  'Ngong Road','South B','South C','Embakasi','Kasarani','Ruaka','Kikuyu',
  'Thika Road','Eastleigh','Zimmerman','Githurai','Rongai','Kitengela',
  'Syokimau','Ruiru','Juja','Kabete','Ridgeways',
];

// ── Inner component (uses hooks) ──────────────────────────
function EditProfileContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token') || '';

  const [status, setStatus]       = useState<'loading' | 'invalid' | 'ready' | 'saving' | 'saved' | 'error'>('loading');
  const [profile, setProfile]     = useState<SellerProfile | null>(null);
  const [phone, setPhone]         = useState('');
  const [errorMsg, setErrorMsg]   = useState('');

  // Form state
  const [displayName, setDisplayName]   = useState('');
  const [bio, setBio]                   = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!token) { setStatus('invalid'); return; }
    try {
      // Look up profile by edit_token -- we do a POST to verify+load
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) { setStatus('invalid'); return; }
      const { profile: p, phone: ph } = await res.json();
      setProfile(p);
      setPhone(ph || '');
      setDisplayName(p.display_name || '');
      setBio(p.bio || '');
      setNeighbourhood(p.neighbourhood || '');
      setStatus('ready');
    } catch {
      setStatus('invalid');
    }
  }, [token]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !displayName.trim()) return;
    setStatus('saving');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/sellers/${profile.profile_slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edit_token: token,
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          neighbourhood: neighbourhood || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Save failed');
      }
      const updated = await res.json();
      setProfile(updated);
      setStatus('saved');
      // If slug changed, update URL
      const newSlug = updated.profile_slug || profile.profile_slug;
      if (newSlug !== profile.profile_slug) {
        router.replace(`/account/profile?token=${token}`);
      }
      setTimeout(() => setStatus('ready'), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save. Please try again.');
      setStatus('error');
      setTimeout(() => setStatus('ready'), 4000);
    }
  }

  // ── Render: loading ───
  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #f0f0f0', borderTopColor: 'var(--orange)', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ font: '400 15px Outfit,sans-serif', color: 'var(--text-3)' }}>Loading your profile...</p>
      </div>
    );
  }

  // ── Render: invalid token ───
  if (status === 'invalid' || !profile) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, background: '#fff0ee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 style={{ font: '700 22px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 10px' }}>
          Invalid or expired link
        </h2>
        <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 24px' }}>
          This profile edit link is not valid. Check the WhatsApp message you received when your listing was approved, or contact us for help.
        </p>
        <Link href="/" className="btn btn-secondary btn-sm">Go home</Link>
      </div>
    );
  }

  const bioLength = bio.length;
  const BIO_MAX   = 160;

  // ── Render: edit form ───
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 0 60px' }}>
      {/* Profile view link */}
      <div style={{ background: '#f0fbe8', border: '1px solid #c8ecae', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-2)' }}>
          Your public profile:
        </span>
        <Link href={`/sellers/${profile.profile_slug}`}
          style={{ font: '600 13px Outfit,sans-serif', color: 'var(--green)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          View profile
        </Link>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Display name */}
        <div>
          <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
            Display name *
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            maxLength={60}
            placeholder="e.g. Grace Wambua"
            style={{ width: '100%', boxSizing: 'border-box', height: 44, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px', font: '400 15px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none' }}
          />
          <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '5px 0 0' }}>
            Shown on your profile and listings. Changing this may update your profile URL.
          </p>
        </div>

        {/* Neighbourhood */}
        <div>
          <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
            Your area in Nairobi
          </label>
          <select
            value={neighbourhood}
            onChange={e => setNeighbourhood(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', height: 44, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px', font: '400 15px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">-- Select neighbourhood --</option>
            {NEIGHBOURHOODS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div>
          <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
            Short bio
            <span style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', marginLeft: 8 }}>optional</span>
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, BIO_MAX))}
            maxLength={BIO_MAX}
            rows={3}
            placeholder="e.g. Mum of two in Westlands. I sell items my kids have outgrown - all in great condition!"
            style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px', font: '400 15px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none', resize: 'vertical', lineHeight: 1.55 }}
          />
          <p style={{ font: '400 11px Outfit,sans-serif', color: bioLength >= BIO_MAX ? '#e53935' : 'var(--text-3)', margin: '4px 0 0', textAlign: 'right' }}>
            {bioLength}/{BIO_MAX}
          </p>
        </div>

        {/* Phone display (read-only) */}
        {phone && (
          <div>
            <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
              Phone (not public)
            </label>
            <input
              type="text"
              value={phone.replace(/^254/, '0')}
              readOnly
              style={{ width: '100%', boxSizing: 'border-box', height: 44, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px', font: '400 15px Outfit,sans-serif', color: 'var(--text-3)', background: '#f9f9f8', outline: 'none', cursor: 'default' }}
            />
            <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '5px 0 0' }}>
              Your WhatsApp number. Not visible to the public - buyers contact you via the button on your listings.
            </p>
          </div>
        )}

        {/* Error / success messages */}
        {status === 'error' && errorMsg && (
          <div style={{ background: '#fff0ee', border: '1px solid #f9c5be', borderRadius: 'var(--r-md)', padding: '12px 16px', font: '400 13px Outfit,sans-serif', color: '#c62828' }}>
            {errorMsg}
          </div>
        )}
        {status === 'saved' && (
          <div style={{ background: '#f0fbe8', border: '1px solid #c8ecae', borderRadius: 'var(--r-md)', padding: '12px 16px', font: '400 13px Outfit,sans-serif', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Profile saved successfully!
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'saving' || !displayName.trim()}
          className="btn btn-primary"
          style={{ height: 48, font: '600 15px Outfit,sans-serif', cursor: status === 'saving' ? 'default' : 'pointer', opacity: status === 'saving' ? 0.7 : 1, transition: 'opacity .15s' }}
        >
          {status === 'saving' ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────
export default function EditProfilePage() {
  return (
    <>
      <Nav />
      <div className="container" style={{ padding: '32px 0 80px', maxWidth: 640 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ font: '700 26px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 6px' }}>
            Edit your profile
          </h1>
          <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
            Your profile helps buyers know who they are buying from.
          </p>
        </div>
        <Suspense fallback={
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #f0f0f0', borderTopColor: 'var(--orange)', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        }>
          <EditProfileContent />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
