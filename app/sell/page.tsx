'use client';
import { useState, useRef } from 'react';
import Nav from '@/components/Nav';
import MpesaModal from '@/components/MpesaModal';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CONDITION_LABELS, getFeeTier } from '@/lib/constants';

const LOCATIONS = [
  'Westlands', 'Karen', 'Kilimani', 'Lavington', 'Runda',
  'Muthaiga', 'Kileleshwa', 'Gigiri', 'Parklands', 'Kasarani',
  'Ruaka', 'Kahawa West', 'Thika Road', 'Langata', 'South C',
  'Ngong Road', 'Embakasi', 'Rongai', 'Kitengela', 'Syokimau',
];

export default function SellPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    title: '', price: '', category: '', condition: '',
    description: '', location: '', seller_name: '', seller_phone: '',
    seller_whatsapp: '', seller_email: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'payment' | 'done'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [editToken, setEditToken] = useState<string | null>(null);

  const price = parseInt(form.price) || 0;
  const { tier, fee } = getFeeTier(price);

  function handleField(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  function handleImages(files: FileList | null) {
    if (!files) return;
    const picked = Array.from(files).slice(0, 4 - images.length);
    const newFiles = [...images, ...picked].slice(0, 4);
    setImages(newFiles);
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
  }

  function removeImage(i: number) {
    const newFiles = images.filter((_, idx) => idx !== i);
    setImages(newFiles);
    setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Item name required';
    if (!form.category) e.category = 'Pick a category';
    if (!form.condition) e.condition = 'Pick a condition';
    if (!form.location) e.location = 'Pick your location';
    if (!form.seller_name.trim()) e.seller_name = 'Your name is required';
    if (!form.seller_phone.trim()) e.seller_phone = 'Phone number is required';
    if (!/^0[17]\d{8}$/.test(form.seller_phone.trim())) e.seller_phone = 'Enter a valid Safaricom / Airtel number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (fee === 0) {
      // Donation -- submit directly
      await submitListing(null);
    } else {
      // Need to pay first -- create draft listing, then show payment
      await createDraftListing();
    }
  }

  async function createDraftListing() {
    setSubmitting(true);
    try {
      // Upload images first
      const imageUrls = await uploadImages();

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price) || 0,
          images: imageUrls,
          status: 'pending',
          fee_amount: fee,
          fee_tier: tier,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setListingId(data.id);
        if (data.edit_token) setEditToken(data.edit_token);
        setStep('payment');
      } else {
        setErrors({ submit: data.error || 'Failed to create listing' });
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function submitListing(mpesaCode: string | null) {
    setSubmitting(true);
    try {
      const imageUrls = images.length > 0 ? await uploadImages() : [];

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price) || 0,
          images: imageUrls,
          status: 'pending',
          fee_amount: fee,
          fee_tier: tier,
          mpesa_code: mpesaCode,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setListingId(data.id);
        if (data.edit_token) setEditToken(data.edit_token);
        setStep('done');
      } else {
        setErrors({ submit: data.error || 'Failed to submit listing' });
        setStep('form');
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadImages(): Promise<string[]> {
    if (images.length === 0) return [];
    const urls: string[] = [];
    for (const file of images) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    return urls;
  }

  async function handlePaymentSuccess(mpesaCode: string) {
    if (!listingId) return;
    // Update listing with mpesa code
    const res = await fetch(`/api/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mpesa_code: mpesaCode }),
    });
    if (res.ok) setStep('done');
  }

  // Done screen
  if (step === 'done') {
    return (
      <>
        <Nav/>
        <div className="container" style={{ padding: '60px 0', textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#E8F5E9', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ font: '700 26px Outfit,sans-serif', margin: '0 0 12px' }}>Listing submitted!</h1>
          <p style={{ font: '400 15px/1.65 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 8px' }}>
            Your listing is under review. We'll notify you once it goes live (usually within 24 hours).
          </p>

          {/* Quick links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '24px 0' }}>
            {listingId && (
              <a
                href={`/status/${listingId}`}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
              >
                Check listing status
              </a>
            )}
            {listingId && editToken && (
              <a
                href={`/edit/${listingId}?token=${editToken}`}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
              >
                Edit listing before review
              </a>
            )}
          </div>

          {/* Save links for seller */}
          {listingId && editToken && (
            <div style={{ background: '#FFF8F3', border: '1.5px solid #FFD4B0', borderRadius: 12, padding: '14px 16px', margin: '0 0 24px', textAlign: 'left' }}>
              <p style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 4px' }}>Save these links</p>
              <p style={{ font: '400 12px/1.55 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>
                Screenshot or bookmark your edit link -- you'll need the token to make changes before admin approval.
              </p>
            </div>
          )}

          <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 24px' }}>
            Questions? WhatsApp us at{' '}
            <a href="https://wa.me/254790784084" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)' }}>+254 790 784 084</a>
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/')} style={{ width: '100%' }}>
            Browse listings
          </button>
        </div>
      </>
    );
  }

  // Payment modal overlay
  if (step === 'payment' && listingId) {
    return (
      <>
        <Nav/>
        <MpesaModal
          listingId={listingId}
          feeAmount={fee}
          sellerPhone={form.seller_phone}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setStep('form')}
        />
      </>
    );
  }

  return (
    <>
      <Nav/>
      <div className="container" style={{ padding: '28px 0 80px', maxWidth: 560 }}>
        <h1 style={{ font: '700 24px Outfit,sans-serif', margin: '0 0 6px' }}>List an item</h1>
        <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 28px' }}>
          Connect buyers with great gear their kids have outgrown.
        </p>

        <form onSubmit={handleSubmitForm} noValidate>

          {/* ---- Item details ---- */}
          <h2 style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Item details</h2>

          <div className="field">
            <label>Item name *</label>
            <input type="text" value={form.title} onChange={e => handleField('title', e.target.value)}
              placeholder="e.g. Trek 20-inch kids bike -- blue" maxLength={120}/>
            {errors.title && <span style={{ color:'#e53935', font:'400 12px Outfit,sans-serif' }}>{errors.title}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Category *</label>
              <select value={form.category} onChange={e => handleField('category', e.target.value)}>
                <option value="">Select...</option>
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              {errors.category && <span style={{ color:'#e53935', font:'400 12px Outfit,sans-serif' }}>{errors.category}</span>}
            </div>
            <div className="field">
              <label>Condition *</label>
              <select value={form.condition} onChange={e => handleField('condition', e.target.value)}>
                <option value="">Select...</option>
                {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              {errors.condition && <span style={{ color:'#e53935', font:'400 12px Outfit,sans-serif' }}>{errors.condition}</span>}
            </div>
          </div>

          <div className="field">
            <label>Price (KES) -- enter 0 for donation / free</label>
            <input type="number" min="0" step="1" value={form.price} onChange={e => handleField('price', e.target.value)} placeholder="0"/>
          </div>

          {/* Fee indicator */}
          <div style={{ background: '#FFF8F3', border: '1.5px solid #FFD4B0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-1)', margin: 0 }}>
                Listing fee: {tier === 'donation' ? 'Free (donation)' : `KES ${fee}`}
              </p>
              <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                {tier === 'donation' && 'Items listed for free -- no charge'}
                {tier === 'starter' && 'Items under KES 1,500 -- KES 99 fee'}
                {tier === 'standard' && 'Items KES 1,500-8,000 -- KES 299 fee'}
                {tier === 'premium' && 'Items over KES 8,000 -- KES 499 fee'}
              </p>
            </div>
            <span className="badge badge-orange">{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
          </div>

          <div className="field">
            <label>Description (optional)</label>
            <textarea value={form.description} onChange={e => handleField('description', e.target.value)}
              placeholder="Age range, any wear, accessories included, reason for selling..."
              rows={3} style={{ resize: 'vertical' }}/>
          </div>

          {/* ---- Photos ---- */}
          <h2 style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '24px 0 16px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Photos (up to 4)</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {imagePreviews.map((src, i) => (
              <div key={i} style={{ position: 'relative', paddingTop: '100%', borderRadius: 10, overflow: 'hidden', background: '#f5f4f2' }}>
                <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                <button type="button" onClick={() => removeImage(i)} style={{
                  position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                  borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: 'none',
                  color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button type="button" onClick={() => fileRef.current?.click()} style={{
                paddingTop: '100%', borderRadius: 10, border: '2px dashed var(--border)',
                background: '#fafaf8', cursor: 'pointer', position: 'relative',
              }}>
                <span style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2"><path d="M12 5v14m-7-7h14"/></svg>
                  <span style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)' }}>Add photo</span>
                </span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
            onChange={e => handleImages(e.target.files)}/>

          {/* ---- Location ---- */}
          <h2 style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '24px 0 16px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Location</h2>

          <div className="field">
            <label>Neighbourhood *</label>
            <select value={form.location} onChange={e => handleField('location', e.target.value)}>
              <option value="">Select area...</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.location && <span style={{ color:'#e53935', font:'400 12px Outfit,sans-serif' }}>{errors.location}</span>}
          </div>

          {/* ---- Seller info ---- */}
          <h2 style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '24px 0 16px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Your details</h2>

          <div className="field">
            <label>Your name *</label>
            <input type="text" value={form.seller_name} onChange={e => handleField('seller_name', e.target.value)} placeholder="First name is fine"/>
            {errors.seller_name && <span style={{ color:'#e53935', font:'400 12px Outfit,sans-serif' }}>{errors.seller_name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Phone number *</label>
              <input type="tel" value={form.seller_phone} onChange={e => handleField('seller_phone', e.target.value)} placeholder="07XXXXXXXX"/>
              {errors.seller_phone && <span style={{ color:'#e53935', font:'400 12px Outfit,sans-serif' }}>{errors.seller_phone}</span>}
            </div>
            <div className="field">
              <label>WhatsApp (if different)</label>
              <input type="tel" value={form.seller_whatsapp} onChange={e => handleField('seller_whatsapp', e.target.value)} placeholder="07XXXXXXXX"/>
            </div>
          </div>

          <div className="field">
            <label>Email (optional)</label>
            <input type="email" value={form.seller_email} onChange={e => handleField('seller_email', e.target.value)} placeholder="you@example.com"/>
            <span style={{ font:'400 11px Outfit,sans-serif', color:'var(--text-3)', marginTop:2 }}>
              Only used for listing status updates -- never shared publicly.
            </span>
          </div>

          {errors.submit && (
            <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
              <p style={{ font: '400 13px Outfit,sans-serif', color: '#c62828', margin: 0 }}>{errors.submit}</p>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={submitting}>
            {submitting ? (
              <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                <span className="spinner" style={{ width:18,height:18,borderWidth:2,borderColor:'rgba(255,255,255,.3)',borderTopColor:'#fff' }}/>
                Submitting...
              </span>
            ) : fee === 0
              ? 'Submit listing for free'
              : `Continue to payment -- KES ${fee}`}
          </button>

          <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', textAlign: 'center', margin: '12px 0 0' }}>
            Listings are reviewed before going live. Usually approved within 24 hours.
          </p>
        </form>
      </div>
    </>
  );
}
