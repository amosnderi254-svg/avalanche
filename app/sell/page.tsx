'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getFeeTier } from '@/lib/constants';

/* ── Types ───────────────────────────────────────────────────── */
type Step = 'details' | 'photos' | 'seller' | 'payment' | 'submitting';
type Condition = 'like_new' | 'good' | 'fair';

const CATEGORIES = [
  { id: 'bikes',      label: 'Bikes & Scooters' },
  { id: 'scooters',   label: 'Scooters' },
  { id: 'strollers',  label: 'Strollers' },
  { id: 'car-seats',  label: 'Car Seats' },
  { id: 'toys',       label: 'Toys' },
  { id: 'books',      label: 'Books' },
  { id: 'baby-gear',  label: 'Baby Gear' },
  { id: 'shoes',      label: 'Shoes' },
  { id: 'clothing',   label: 'Clothing' },
];

const CONDITIONS: { id: Condition; label: string; desc: string }[] = [
  { id: 'like_new', label: 'Like New', desc: 'Barely used, no visible wear' },
  { id: 'good',     label: 'Good',     desc: 'Minor signs of use, works perfectly' },
  { id: 'fair',     label: 'Fair',     desc: 'Visible wear but fully functional' },
];

const NAIROBI_AREAS = [
  'Westlands','Kilimani','Karen','Lavington','Runda','Muthaiga','Spring Valley',
  'Kitisuru','Parklands','Upperhill','Kileleshwa','Hurlingham','Lang\'ata',
  'Ngong Road','South B','South C','Embakasi','Kasarani','Ruaka','Kikuyu',
  'Thika Road','Eastleigh','Zimmerman','Githurai','Rongai','Kitengela',
  'Syokimau','Ruiru','Juja','Kabete','Ridgeways',
];

/* ── Progress bar ─────────────────────────────────────────────── */
const STEPS: { id: Step; label: string }[] = [
  { id: 'details',  label: 'Item details' },
  { id: 'photos',   label: 'Photos' },
  { id: 'seller',   label: 'Your info' },
  { id: 'payment',  label: 'Pay and list' },
];

function ProgressBar({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.id === current);
  if (current === 'submitting') return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
      {STEPS.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: i < idx ? 'var(--green)' : i === idx ? 'var(--orange)' : '#ebebeb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .2s',
              flexShrink: 0,
            }}>
              {i < idx ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <span style={{ font: '700 12px Outfit,sans-serif', color: i === idx ? '#fff' : '#aaa' }}>{i + 1}</span>
              )}
            </div>
            <span style={{ font: `${i === idx ? '600' : '400'} 11px Outfit,sans-serif`, color: i === idx ? 'var(--text-1)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < idx ? 'var(--green)' : '#ebebeb', margin: '0 4px', marginBottom: 18, transition: 'background .2s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Photo uploader ───────────────────────────────────────────── */
interface UploadedPhoto {
  url: string;
  previewUrl: string;
  name: string;
}

function PhotoUploader({ photos, setPhotos }: { photos: UploadedPhoto[]; setPhotos: (p: UploadedPhoto[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (photos.length + files.length > 5) {
      setUploadErr('Maximum 5 photos allowed.');
      return;
    }
    setUploading(true);
    setUploadErr('');
    const added: UploadedPhoto[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) { setUploadErr('Only image files are allowed.'); continue; }
      if (file.size > 5 * 1024 * 1024) { setUploadErr('Each photo must be under 5MB.'); continue; }
      const previewUrl = URL.createObjectURL(file);
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) { const d = await res.json(); setUploadErr(d.error || 'Upload failed.'); continue; }
        const { url } = await res.json();
        added.push({ url, previewUrl, name: file.name });
      } catch {
        setUploadErr('Upload failed. Please try again.');
      }
    }
    setPhotos([...photos, ...added]);
    setUploading(false);
  }, [photos, setPhotos]);

  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !uploading && fileRef.current?.click()}
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '32px 20px',
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          background: '#fafaf8',
          marginBottom: 16,
          transition: 'border-color .15s',
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div>
            <div style={{ width: 28, height: 28, border: '3px solid #f0f0f0', borderTopColor: 'var(--orange)', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin .8s linear infinite' }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>Uploading...</p>
          </div>
        ) : (
          <>
            <div style={{ width: 48, height: 48, background: '#fff4ec', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <p style={{ font: '600 15px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 4px' }}>
              Add photos ({photos.length}/5)
            </p>
            <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
              Tap to browse or drag photos here. Max 5MB each.
            </p>
          </>
        )}
      </div>

      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginBottom: 8 }}>
          {photos.map((p, i) => (
            <div key={p.url} style={{ position: 'relative', paddingTop: '75%', background: '#f5f4f2', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              <img src={p.previewUrl} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
              {i === 0 && (
                <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,.55)', color: '#fff', font: '600 9px Outfit,sans-serif', padding: '2px 6px', borderRadius: 'var(--r-pill)' }}>
                  COVER
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Remove photo"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="1.8" aria-hidden="true">
                  <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      {uploadErr && <p style={{ font: '400 13px Outfit,sans-serif', color: '#c62828', margin: '8px 0 0' }}>{uploadErr}</p>}
      <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '8px 0 0' }}>
        Clear photos sell faster. Good light, neutral background, show any wear honestly.
      </p>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function SellPage() {
  const router = useRouter();

  /* form state */
  const [step, setStep]           = useState<Step>('details');
  const [title, setTitle]         = useState('');
  const [category, setCategory]   = useState('');
  const [condition, setCondition] = useState<Condition | ''>('');
  const [price, setPrice]         = useState('');
  const [description, setDesc]    = useState('');

  /* AI assist state */
  const [aiOpen, setAiOpen]           = useState(false);
  const [aiNotes, setAiNotes]         = useState('');
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiErr, setAiErr]             = useState('');
  const [aiPriceSuggestion, setAiPrice] = useState('');
  const [photos, setPhotos]       = useState<UploadedPhoto[]>([]);
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [area, setArea]           = useState('');
  const [payPhone, setPayPhone]   = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const [stkSent, setStkSent]     = useState(false);
  const [stkLoading, setStkLoading] = useState(false);
  const [stkErr, setStkErr]       = useState('');
  const [submitErr, setSubmitErr] = useState('');

  const priceNum = Number(price) || 0;
  const { tier, fee } = getFeeTier(priceNum);
  const isFree = tier === 'donation';

  /* ── AI assist ── */
  async function runAiAssist() {
    if (!aiNotes.trim()) return;
    setAiLoading(true);
    setAiErr('');
    try {
      const res = await fetch('/api/ai/listing-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: aiNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI assist failed');
      if (data.title)       setTitle(data.title);
      if (data.category)    setCategory(data.category);
      if (data.condition)   setCondition(data.condition as Condition);
      if (data.description) setDesc(data.description);
      if (data.price_suggestion) setAiPrice(data.price_suggestion);
      setAiOpen(false);
    } catch (err: unknown) {
      setAiErr(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    }
    setAiLoading(false);
  }

  /* ── Validation ── */
  const detailsValid = title.trim().length >= 3 && category && condition && price !== '';
  const photosValid  = true; // photos optional but encouraged
  const sellerValid  = sellerName.trim().length >= 2 && sellerPhone.trim().length >= 9 && area;
  const paymentValid = isFree || (mpesaCode.trim().length >= 6);

  /* ── STK Push ── */
  async function sendStkPush() {
    setStkLoading(true);
    setStkErr('');
    const phone = payPhone.trim() || sellerPhone.trim();
    try {
      const res = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: fee, account_ref: 'TINYVERSE' }),
      });
      const data = await res.json();
      if (data.success) {
        setStkSent(true);
      } else {
        setStkErr(data.error || 'Could not send payment prompt. Please try again.');
      }
    } catch {
      setStkErr('Payment request failed. Please check your connection and try again.');
    }
    setStkLoading(false);
  }

  /* ── Submit listing ── */
  async function submitListing() {
    setStep('submitting');
    setSubmitErr('');
    try {
      const phone = sellerPhone.trim().replace(/\s+/g, '');
      const normalizedPhone = phone.startsWith('0') ? '254' + phone.slice(1) : phone;

      const payload = {
        title: title.trim(),
        price: priceNum,
        category,
        condition,
        description: description.trim() || null,
        location: area,
        seller_name: sellerName.trim(),
        seller_phone: normalizedPhone,
        seller_whatsapp: normalizedPhone,
        seller_email: sellerEmail.trim() || null,
        images: photos.map(p => p.url),
        status: 'pending',
        fee_tier: tier,
        fee_amount: fee,
        mpesa_code: isFree ? null : mpesaCode.trim().toUpperCase(),
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Submission failed');
      }

      const listing = await res.json();
      router.push(`/sell/success?ref=${listing.id}`);
    } catch (err: unknown) {
      setSubmitErr(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      setStep('payment');
    }
  }

  /* ── Render: submitting ── */
  if (step === 'submitting') {
    return (
      <>
        <Nav/>
        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #f0f0f0', borderTopColor: 'var(--orange)', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin .8s linear infinite' }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ font: '600 16px Outfit,sans-serif', color: 'var(--text-1)' }}>Publishing your listing...</p>
            <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>This will only take a moment.</p>
          </div>
        </div>
        <Footer/>
      </>
    );
  }

  return (
    <>
      <Nav/>

      {/* Page header */}
      <div style={{ background: 'var(--text-1)', padding: '32px 0 28px' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <p style={{ font: '600 11px Outfit,sans-serif', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '.09em', margin: '0 0 8px' }}>
            Sell on MyTinyverse
          </p>
          <h1 style={{ font: '700 26px/1.2 Outfit,sans-serif', color: '#fff', margin: 0 }}>
            List your item
          </h1>
          <p style={{ font: '400 14px Outfit,sans-serif', color: 'rgba(255,255,255,.55)', margin: '6px 0 0' }}>
            Fill in the details below. Listings are reviewed and go live within minutes.
          </p>
        </div>
      </div>

      {/* Fee strip */}
      <div style={{ background: '#fff4ec', borderBottom: '1px solid #ffd9b8', padding: '10px 0' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
            <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-2)' }}>
              Listing fee: <strong style={{ color: 'var(--orange)' }}>{isFree ? 'FREE (donation item)' : `KES ${fee}`}</strong>
              {!isFree && (
                <span style={{ color: 'var(--text-3)', marginLeft: 4 }}>
                  - paid via M-Pesa at the last step
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 640, padding: '36px 0 80px' }}>

        <ProgressBar current={step} />

        {/* ── STEP 1: Item details ── */}
        {step === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <h2 style={{ font: '700 20px Outfit,sans-serif', color: 'var(--text-1)', margin: 0 }}>
                Tell us about the item
              </h2>
              <button
                type="button"
                onClick={() => { setAiOpen(o => !o); setAiErr(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px',
                  border: '1.5px solid var(--orange)',
                  borderRadius: 'var(--r-pill)',
                  background: aiOpen ? 'var(--orange)' : '#fff4ec',
                  font: '600 13px Outfit,sans-serif',
                  color: aiOpen ? '#fff' : 'var(--orange)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all .15s',
                }}
              >
                {/* sparkle icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                AI Assist
              </button>
            </div>

            {/* AI assist panel */}
            {aiOpen && (
              <div style={{ border: '1.5px solid var(--orange)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', background: '#fff4ec', borderBottom: '1px solid #ffd9b8', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span style={{ font: '600 14px Outfit,sans-serif', color: 'var(--orange)' }}>
                    AI Listing Assistant
                  </span>
                  <span style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', marginLeft: 2 }}>
                    Describe the item and AI fills in the form
                  </span>
                </div>
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', font: '600 12px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
                      Describe what you are selling
                    </label>
                    <textarea
                      value={aiNotes}
                      onChange={e => setAiNotes(e.target.value)}
                      rows={3}
                      placeholder="e.g. Maclaren stroller, navy, used for about a year, folds easily, one small scratch on the frame, comes with rain cover"
                      style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 12px', font: '400 14px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
                    />
                    <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '4px 0 0' }}>
                      Include brand, size, age suitability, condition, what is included. The more detail, the better the result.
                    </p>
                  </div>
                  {aiErr && (
                    <p style={{ font: '400 13px Outfit,sans-serif', color: '#c62828', margin: 0 }}>{aiErr}</p>
                  )}
                  <button
                    type="button"
                    onClick={runAiAssist}
                    disabled={aiLoading || !aiNotes.trim()}
                    className="btn btn-primary"
                    style={{ height: 44, font: '600 14px Outfit,sans-serif', cursor: (aiLoading || !aiNotes.trim()) ? 'default' : 'pointer', opacity: (aiLoading || !aiNotes.trim()) ? 0.6 : 1 }}
                  >
                    {aiLoading ? (
                      <>
                        <div style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', marginRight: 8 }}/>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 7 }} aria-hidden="true">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        Fill in listing for me
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Price suggestion banner (shown after AI runs) */}
            {aiPriceSuggestion && !aiOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#edf7e2', border: '1px solid #c5e8a0', borderRadius: 'var(--r-md)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-2)' }}>
                  AI suggests: <strong style={{ color: 'var(--green)' }}>{aiPriceSuggestion}</strong>
                  <span style={{ color: 'var(--text-3)', marginLeft: 6 }}>-- set your price below</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAiPrice('')}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, display: 'flex' }}
                  aria-label="Dismiss"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Title */}
            <div>
              <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Maclaren Quest stroller, navy blue"
                maxLength={80}
                style={{ width: '100%', boxSizing: 'border-box', height: 48, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px', font: '400 15px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none' }}
              />
              <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '5px 0 0' }}>
                Be specific - brand, model, colour, size. Good titles get seen more.
              </p>
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 8 }}>
                Category *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '10px 12px',
                      border: `1.5px solid ${category === cat.id ? 'var(--orange)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-md)',
                      background: category === cat.id ? '#fff4ec' : '#fff',
                      font: `${category === cat.id ? '600' : '400'} 13px Outfit,sans-serif`,
                      color: category === cat.id ? 'var(--orange)' : 'var(--text-2)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .12s',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 8 }}>
                Condition *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CONDITIONS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCondition(c.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      border: `1.5px solid ${condition === c.id ? 'var(--orange)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-md)',
                      background: condition === c.id ? '#fff4ec' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .12s',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: `2px solid ${condition === c.id ? 'var(--orange)' : 'var(--border)'}`,
                      background: condition === c.id ? 'var(--orange)' : 'transparent',
                      flexShrink: 0, transition: 'all .12s',
                    }}/>
                    <div>
                      <div style={{ font: '600 14px Outfit,sans-serif', color: condition === c.id ? 'var(--orange)' : 'var(--text-1)' }}>
                        {c.label}
                      </div>
                      <div style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', marginTop: 1 }}>
                        {c.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
                Asking price *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', font: '400 15px Outfit,sans-serif', color: 'var(--text-3)', pointerEvents: 'none' }}>
                  KES
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0"
                  min={0}
                  style={{ width: '100%', boxSizing: 'border-box', height: 48, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px 0 56px', font: '400 15px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none' }}
                />
              </div>
              {price !== '' && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: isFree ? '#edf7e2' : '#fff4ec', borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isFree ? 'var(--green)' : 'var(--orange)'} strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ font: '400 12px Outfit,sans-serif', color: isFree ? 'var(--green)' : 'var(--orange)' }}>
                    {isFree ? 'Donation - no listing fee' : `Listing fee: KES ${fee} (paid by M-Pesa)`}
                  </span>
                </div>
              )}
              <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '5px 0 0' }}>
                Set 0 to give it away for free.
              </p>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
                Description
                <span style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', marginLeft: 8 }}>optional but recommended</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDesc(e.target.value)}
                rows={4}
                maxLength={600}
                placeholder="Age, dimensions, reason for selling, any wear to mention, accessories included..."
                style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 14px', font: '400 15px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none', resize: 'vertical', lineHeight: 1.55 }}
              />
              <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '5px 0 0', textAlign: 'right' }}>
                {description.length}/600
              </p>
            </div>

            <button
              className="btn btn-primary"
              disabled={!detailsValid}
              onClick={() => setStep('photos')}
              style={{ height: 50, font: '600 15px Outfit,sans-serif', cursor: detailsValid ? 'pointer' : 'default', opacity: detailsValid ? 1 : 0.5 }}
            >
              Continue to photos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }} aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        )}

        {/* ── STEP 2: Photos ── */}
        {step === 'photos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <h2 style={{ font: '700 20px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 6px' }}>
                Add photos
              </h2>
              <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                Listings with clear photos sell much faster. Add up to 5. The first photo becomes the cover.
              </p>
            </div>

            <PhotoUploader photos={photos} setPhotos={setPhotos} />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setStep('details')}
                style={{ height: 50, font: '600 15px Outfit,sans-serif' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }} aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep('seller')}
                style={{ flex: 1, height: 50, font: '600 15px Outfit,sans-serif' }}
              >
                {photos.length === 0 ? 'Skip photos and continue' : `Continue with ${photos.length} photo${photos.length > 1 ? 's' : ''}`}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }} aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Seller info ── */}
        {step === 'seller' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <h2 style={{ font: '700 20px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 6px' }}>
                Your contact details
              </h2>
              <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                Buyers will contact you directly on WhatsApp. Your phone number is never shown publicly in text.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
                Your name *
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={e => setSellerName(e.target.value)}
                placeholder="e.g. Grace Wambua"
                maxLength={60}
                style={{ width: '100%', boxSizing: 'border-box', height: 48, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px', font: '400 15px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
                WhatsApp number *
              </label>
              <input
                type="tel"
                value={sellerPhone}
                onChange={e => setSellerPhone(e.target.value)}
                placeholder="e.g. 0712 345 678"
                style={{ width: '100%', boxSizing: 'border-box', height: 48, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px', font: '400 15px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none' }}
              />
              <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '5px 0 0' }}>
                Buyers contact you here. Keep notifications on.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
                Your area in Nairobi *
              </label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', height: 48, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px', font: '400 15px Outfit,sans-serif', color: area ? 'var(--text-1)' : 'var(--text-3)', background: '#fff', outline: 'none', cursor: 'pointer' }}
              >
                <option value="" disabled>Select your neighbourhood</option>
                {NAIROBI_AREAS.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '5px 0 0' }}>
                Buyers prefer sellers nearby. This is shown on your listing.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
                Email address
                <span style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', marginLeft: 8 }}>optional</span>
              </label>
              <input
                type="email"
                value={sellerEmail}
                onChange={e => setSellerEmail(e.target.value)}
                placeholder="e.g. grace@gmail.com"
                style={{ width: '100%', boxSizing: 'border-box', height: 48, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px', font: '400 15px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setStep('photos')}
                style={{ height: 50, font: '600 15px Outfit,sans-serif' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }} aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!sellerValid}
                onClick={() => { if (sellerValid) { setPayPhone(sellerPhone); setStep('payment'); } }}
                style={{ flex: 1, height: 50, font: '600 15px Outfit,sans-serif', cursor: sellerValid ? 'pointer' : 'default', opacity: sellerValid ? 1 : 0.5 }}
              >
                {isFree ? 'Review and submit' : 'Go to payment'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }} aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Payment + summary ── */}
        {step === 'payment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ font: '700 20px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 6px' }}>
                {isFree ? 'Review and publish' : 'Pay the listing fee and publish'}
              </h2>
              <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                {isFree
                  ? 'Your donation listing is free. Review the summary below and hit publish.'
                  : `Pay KES ${fee} via M-Pesa, then confirm your listing.`
                }
              </p>
            </div>

            {/* Summary card */}
            <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ font: '700 15px Outfit,sans-serif', color: 'var(--text-1)', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 4 }}>
                Listing summary
              </div>
              {[
                { label: 'Title', value: title },
                { label: 'Category', value: CATEGORIES.find(c => c.id === category)?.label || category },
                { label: 'Condition', value: CONDITIONS.find(c => c.id === condition)?.label || condition },
                { label: 'Price', value: priceNum === 0 ? 'FREE (donation)' : `KES ${priceNum.toLocaleString()}` },
                { label: 'Location', value: area },
                { label: 'Photos', value: photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? 's' : ''}` : 'None added' },
                { label: 'Listing fee', value: isFree ? 'Free' : `KES ${fee}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', flexShrink: 0 }}>{row.label}</span>
                  <span style={{ font: '500 13px Outfit,sans-serif', color: 'var(--text-1)', textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* M-Pesa payment block */}
            {!isFree && (
              <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: '#00b050', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ font: '700 14px Outfit,sans-serif', color: 'var(--text-1)' }}>Pay KES {fee} via M-Pesa</div>
                      <div style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)' }}>Secure mobile payment</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  {!stkSent ? (
                    <>
                      <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
                        M-Pesa phone number
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="tel"
                          value={payPhone}
                          onChange={e => setPayPhone(e.target.value)}
                          placeholder="e.g. 0712 345 678"
                          style={{ flex: 1, height: 44, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px', font: '400 15px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', outline: 'none' }}
                        />
                        <button
                          onClick={sendStkPush}
                          disabled={stkLoading || !payPhone.trim()}
                          className="btn btn-green"
                          style={{ height: 44, padding: '0 18px', font: '600 14px Outfit,sans-serif', cursor: (stkLoading || !payPhone.trim()) ? 'default' : 'pointer', opacity: (stkLoading || !payPhone.trim()) ? 0.6 : 1, flexShrink: 0 }}
                        >
                          {stkLoading ? 'Sending...' : 'Send prompt'}
                        </button>
                      </div>
                      {stkErr && (
                        <p style={{ font: '400 12px Outfit,sans-serif', color: '#c62828', margin: '8px 0 0' }}>{stkErr}</p>
                      )}
                      <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '8px 0 0' }}>
                        We will send a payment prompt to this number. Check your phone and enter your M-Pesa PIN.
                      </p>
                    </>
                  ) : (
                    <div style={{ background: '#edf7e2', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 15 15"/>
                      </svg>
                      <div>
                        <div style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-1)', marginBottom: 2 }}>
                          Payment prompt sent to {payPhone}
                        </div>
                        <div style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-2)' }}>
                          Check your phone, enter your M-Pesa PIN to pay KES {fee}, then enter the confirmation code below.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* M-Pesa code entry */}
                  <div style={{ marginTop: stkSent ? 0 : 16 }}>
                    <label style={{ display: 'block', font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 6 }}>
                      M-Pesa confirmation code *
                    </label>
                    <input
                      type="text"
                      value={mpesaCode}
                      onChange={e => setMpesaCode(e.target.value.toUpperCase())}
                      placeholder="e.g. QKL1AB23CD"
                      maxLength={12}
                      style={{ width: '100%', boxSizing: 'border-box', height: 48, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0 14px', font: '500 16px Outfit,monospace', letterSpacing: '.05em', color: 'var(--text-1)', background: '#fff', outline: 'none' }}
                    />
                    <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '5px 0 0' }}>
                      Found in the SMS you received after paying. Looks like QKL1AB23CD.
                    </p>
                  </div>

                  {!stkSent && (
                    <div style={{ marginTop: 16, padding: '10px 14px', background: '#f9fafb', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                      <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                        Already paid? Enter the M-Pesa code above and publish directly.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {submitErr && (
              <div style={{ padding: '12px 16px', background: '#fff0ee', border: '1px solid #f9c5be', borderRadius: 'var(--r-md)', font: '400 13px Outfit,sans-serif', color: '#c62828' }}>
                {submitErr}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setStep('seller')}
                style={{ height: 50, font: '600 15px Outfit,sans-serif' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }} aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!paymentValid}
                onClick={submitListing}
                style={{ flex: 1, height: 50, font: '600 15px Outfit,sans-serif', cursor: paymentValid ? 'pointer' : 'default', opacity: paymentValid ? 1 : 0.5 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }} aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {isFree ? 'Publish my listing' : 'Confirm and publish listing'}
              </button>
            </div>

            <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', textAlign: 'center', margin: 0 }}>
              Your listing will be reviewed and go live within minutes. We will notify you on WhatsApp.
            </p>
          </div>
        )}
      </div>

      <Footer/>
    </>
  );
}
