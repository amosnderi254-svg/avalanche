'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { CATEGORIES, CONDITION_LABELS } from '@/lib/constants';
import type { Listing } from '@/types';

const LOCATIONS = [
  'Westlands', 'Karen', 'Kilimani', 'Lavington', 'Runda',
  'Muthaiga', 'Kileleshwa', 'Gigiri', 'Parklands', 'Kasarani',
  'Ruaka', 'Kahawa West', 'Thika Road', 'Langata', 'South C',
  'Ngong Road', 'Embakasi', 'Rongai', 'Kitengela', 'Syokimau',
];

export default function EditListingPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state mirrors sell form
  const [form, setForm] = useState({
    title: '', price: '', category: '', condition: '',
    description: '', location: '', seller_name: '', seller_phone: '',
    seller_whatsapp: '', seller_email: '',
  });
  // Existing remote images (URLs already uploaded)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // New files to upload
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!token) { setTokenError(true); setLoading(false); return; }

    fetch(`/api/listings/${params.id}/edit?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then((data: Partial<Listing> & { error?: string }) => {
        if (data.error) {
          setTokenError(true);
        } else {
          setForm({
            title: data.title || '',
            price: String(data.price ?? ''),
            category: data.category || '',
            condition: data.condition || '',
            description: data.description || '',
            location: data.location || '',
            seller_name: data.seller_name || '',
            seller_phone: data.seller_phone || '',
            seller_whatsapp: data.seller_whatsapp || '',
            seller_email: data.seller_email || '',
          });
          setExistingImages(data.images || []);
        }
      })
      .catch(() => setTokenError(true))
      .finally(() => setLoading(false));
  }, [params.id, token]);

  function handleField(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  function handleNewImages(files: FileList | null) {
    if (!files) return;
    const total = existingImages.length + newFiles.length;
    const slots = Math.max(0, 4 - total);
    const picked = Array.from(files).slice(0, slots);
    const combined = [...newFiles, ...picked];
    setNewFiles(combined);
    setNewPreviews(combined.map(f => URL.createObjectURL(f)));
  }

  function removeExisting(i: number) {
    setExistingImages(prev => prev.filter((_, idx) => idx !== i));
  }

  function removeNew(i: number) {
    const next = newFiles.filter((_, idx) => idx !== i);
    setNewFiles(next);
    setNewPreviews(next.map(f => URL.createObjectURL(f)));
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

  async function uploadImages(): Promise<string[]> {
    const urls: string[] = [];
    for (const file of newFiles) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !token) return;

    setSubmitting(true);
    try {
      const newImageUrls = newFiles.length > 0 ? await uploadImages() : [];
      const allImages = [...existingImages, ...newImageUrls];

      const res = await fetch(`/api/listings/${params.id}/edit?token=${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price) || 0,
          images: allImages,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setErrors({ submit: data.error });
      } else {
        setDone(true);
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  // Success screen
  if (done) {
    return (
      <>
        <Nav/>
        <div className="container" style={{ padding: '60px 0', textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#E8F5E9', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ font: '700 24px Outfit,sans-serif', margin: '0 0 12px' }}>Listing updated!</h1>
          <p style={{ font: '400 14px/1.65 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 28px' }}>
            Your changes have been saved. The listing is still under review.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href={`/status/${params.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Check listing status
            </a>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/')} style={{ width: '100%' }}>
              Back to marketplace
            </button>
          </div>
        </div>
      </>
    );
  }

  // Token error
  if (!loading && tokenError) {
    return (
      <>
        <Nav/>
        <div className="container" style={{ padding: '60px 0', textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFEBEE', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </div>
          <h1 style={{ font: '700 22px Outfit,sans-serif', margin: '0 0 8px' }}>Can't edit this listing</h1>
          <p style={{ font: '400 14px/1.55 Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 28px' }}>
            The edit link is invalid, expired, or the listing has already been reviewed. Listings can only be edited while they're pending approval.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <a href="https://wa.me/254790784084" target="_blank" rel="noopener noreferrer" className="btn btn-green btn-sm">
              Contact admin on WhatsApp
            </a>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/')}>
              Back to homepage
            </button>
          </div>
        </div>
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <>
        <Nav/>
        <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }}/>
        </div>
      </>
    );
  }

  const totalImages = existingImages.length + newFiles.length;

  return (
    <>
      <Nav/>
      <div className="container" style={{ padding: '28px 0 80px', maxWidth: 560 }}>
        <h1 style={{ font: '700 24px Outfit,sans-serif', margin: '0 0 6px' }}>Edit listing</h1>
        <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 6px' }}>
          You can edit your listing while it's pending review.
        </p>
        <div style={{ background: '#FFF8F3', border: '1.5px solid #FFD4B0', borderRadius: 10, padding: '10px 14px', marginBottom: 24 }}>
          <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>
            Once approved by admin, the listing will go live and can no longer be edited from this link.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          <h2 style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Item details</h2>

          <div className="field">
            <label>Item name *</label>
            <input type="text" value={form.title} onChange={e => handleField('title', e.target.value)} maxLength={120}/>
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
            <label>Price (KES) -- 0 for donation / free</label>
            <input type="number" min="0" step="1" value={form.price} onChange={e => handleField('price', e.target.value)}/>
          </div>

          <div className="field">
            <label>Description (optional)</label>
            <textarea value={form.description} onChange={e => handleField('description', e.target.value)} rows={3} style={{ resize: 'vertical' }}/>
          </div>

          {/* Photos */}
          <h2 style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '24px 0 16px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Photos (up to 4)</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {/* Existing images */}
            {existingImages.map((src, i) => (
              <div key={`ex-${i}`} style={{ position: 'relative', paddingTop: '100%', borderRadius: 10, overflow: 'hidden', background: '#f5f4f2' }}>
                <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                <button type="button" onClick={() => removeExisting(i)} style={{
                  position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                  borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: 'none',
                  color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
            {/* New image previews */}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} style={{ position: 'relative', paddingTop: '100%', borderRadius: 10, overflow: 'hidden', background: '#f5f4f2' }}>
                <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                <button type="button" onClick={() => removeNew(i)} style={{
                  position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                  borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: 'none',
                  color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
            {totalImages < 4 && (
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
            onChange={e => handleNewImages(e.target.files)}/>

          {/* Location */}
          <h2 style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '24px 0 16px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Location</h2>
          <div className="field">
            <label>Neighbourhood *</label>
            <select value={form.location} onChange={e => handleField('location', e.target.value)}>
              <option value="">Select area...</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.location && <span style={{ color:'#e53935', font:'400 12px Outfit,sans-serif' }}>{errors.location}</span>}
          </div>

          {/* Seller info */}
          <h2 style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '24px 0 16px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Your details</h2>
          <div className="field">
            <label>Your name *</label>
            <input type="text" value={form.seller_name} onChange={e => handleField('seller_name', e.target.value)}/>
            {errors.seller_name && <span style={{ color:'#e53935', font:'400 12px Outfit,sans-serif' }}>{errors.seller_name}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Phone number *</label>
              <input type="tel" value={form.seller_phone} onChange={e => handleField('seller_phone', e.target.value)}/>
              {errors.seller_phone && <span style={{ color:'#e53935', font:'400 12px Outfit,sans-serif' }}>{errors.seller_phone}</span>}
            </div>
            <div className="field">
              <label>WhatsApp (if different)</label>
              <input type="tel" value={form.seller_whatsapp} onChange={e => handleField('seller_whatsapp', e.target.value)}/>
            </div>
          </div>
          <div className="field">
            <label>Email (optional)</label>
            <input type="email" value={form.seller_email} onChange={e => handleField('seller_email', e.target.value)}/>
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
                Saving...
              </span>
            ) : 'Save changes'}
          </button>
        </form>
      </div>
      <Footer/>
    </>
  );
}
