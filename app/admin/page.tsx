'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Nav from '@/components/Nav';
import Link from 'next/link';
import type { Listing, Article, ArticleStatus } from '@/types';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '0784';

// ── Form constants (shared with /sell) ───────────────────────────────────────
// Use same IDs as lib/constants.ts so category filtering works on the marketplace
const CATEGORIES = [
  { id: 'bikes',     label: 'Bikes' },
  { id: 'scooters',  label: 'Scooters' },
  { id: 'strollers', label: 'Strollers' },
  { id: 'car-seats', label: 'Car Seats' },
  { id: 'toys',      label: 'Toys and Games' },
  { id: 'books',     label: 'Books' },
  { id: 'baby-gear', label: 'Baby Gear' },
  { id: 'shoes',     label: 'Shoes' },
  { id: 'clothing',  label: 'Clothing' },
];
const AGE_RANGES = ['0 to 6 months','6 to 18 months','1 to 3 years','3 to 5 years','5 to 8 years','8 and above','All ages'];
const CONDITIONS = [
  { id: 'like_new', label: 'Like new', desc: 'Used once or twice. Looks brand new.' },
  { id: 'good', label: 'Good', desc: 'Some wear but works perfectly.' },
  { id: 'fair', label: 'Fair', desc: 'Visible wear. Fully functional.' },
];
const NAIROBI_HOODS = [
  'Westlands','Kilimani','Karen','Lavington','Runda','Muthaiga','Spring Valley',
  'Kitisuru','Parklands','Upperhill','Kileleshwa','Hurlingham','Langata',
  'Ngong Road','South B','South C','Embakasi','Kasarani','Ruaka','Kikuyu',
  'Thika Road','Eastleigh','Zimmerman','Githurai','Rongai','Kitengela',
  'Syokimau','Ruiru','Juja','Kabete','Ridgeways',
];

// ── Types ────────────────────────────────────────────────────────────────────

interface StatsData {
  tiles: {
    live_listings: number;
    pending_review: number;
    total_listings: number;
    total_revenue: number;
    approval_rate: number;
    total_views: number;
    total_wa_clicks: number;
    submitted_last_30d: number;
  };
  revenue_by_month: { month: string; revenue: number }[];
  revenue_by_tier: { tier: string; revenue: number }[];
  category_stats: {
    category: string; live: number; views: number;
    whatsapp_clicks: number; click_rate: number; avg_price: number;
  }[];
  expiring_soon: Partial<Listing & { expires_at: string }>[];
  recent_pending: Partial<Listing>[];
  top_searches: { query: string; count: number }[];
  demand_gaps: { query: string; count: number }[];
}

type BlogEditorMode = 'generate' | 'manual';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtKES(n: number) {
  return n === 0 ? 'KES 0' : `KES ${n.toLocaleString()}`;
}

function fmtMonth(yyyymm: string) {
  const [y, m] = yyyymm.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function categoryLabel(c: string) {
  const MAP: Record<string, string> = {
    bikes: 'Bikes', scooters: 'Scooters', 'baby-gear': 'Baby Gear',
    strollers: 'Strollers', toys: 'Toys', books: 'Books',
    shoes: 'Shoes', 'car-seats': 'Car Seats', playpens: 'Playpens',
    other: 'Other',
  };
  return MAP[c] || c;
}

function tierLabel(t: string) {
  const MAP: Record<string, string> = {
    donation: 'Donation (Free)', starter: 'Starter (KES 99)',
    standard: 'Standard (KES 299)', premium: 'Premium (KES 499)',
  };
  return MAP[t] || t;
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}

const STATUS_BADGE: Record<ArticleStatus, { bg: string; fg: string; label: string }> = {
  draft:     { bg: '#f5f4f2', fg: '#666',     label: 'Draft' },
  pending:   { bg: '#FFF8E1', fg: '#F57F17',  label: 'Pending Review' },
  published: { bg: '#E8F5E9', fg: '#2E7D32',  label: 'Published' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatTile({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: boolean;
}) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 14,
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</p>
      <p style={{ font: '700 26px Outfit,sans-serif', color: accent ? 'var(--orange)' : 'var(--text-1)', margin: 0 }}>{value}</p>
      {sub && <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ font: '700 16px Outfit,sans-serif', color: 'var(--text-1)', margin: '32px 0 14px', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
      {children}
    </h2>
  );
}

function BarChart({ data }: { data: { month: string; revenue: number }[] }) {
  const max = Math.max(...data.map(d => d.revenue), 1);
  const barW = 36;
  const gap = 12;
  const chartH = 100;
  const totalW = data.length * (barW + gap) - gap;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(totalW, 300)} height={chartH + 32} style={{ display: 'block' }}>
        {data.map((d, i) => {
          const x = i * (barW + gap);
          const barH = Math.max(4, Math.round((d.revenue / max) * chartH));
          const y = chartH - barH;
          return (
            <g key={d.month}>
              <rect x={x} y={y} width={barW} height={barH}
                fill={barH > 4 ? 'var(--orange)' : '#e0e0e0'} rx={4}/>
              {d.revenue > 0 && (
                <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                  style={{ font: '500 9px Outfit,sans-serif', fill: 'var(--text-3)' }}>
                  {d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(1)}k` : d.revenue}
                </text>
              )}
              <text x={x + barW / 2} y={chartH + 18} textAnchor="middle"
                style={{ font: '400 10px Outfit,sans-serif', fill: 'var(--text-3)' }}>
                {fmtMonth(d.month)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pinError, setPinError] = useState('');
  const [view, setView] = useState<'dashboard' | 'moderation' | 'blog' | 'post' | 'reports'>('dashboard');

  // Dashboard state
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Moderation state
  const [modTab, setModTab] = useState<'pending' | 'live' | 'rejected'>('pending');
  const [listings, setListings] = useState<Listing[]>([]);
  const [modLoading, setModLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Blog state
  const [blogArticles, setBlogArticles] = useState<Article[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogActionLoading, setBlogActionLoading] = useState<string | null>(null);
  const [blogDeleteConfirm, setBlogDeleteConfirm] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isNewArticle, setIsNewArticle] = useState(false);
  const [editorMode, setEditorMode] = useState<BlogEditorMode>('generate');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Editor form
  const [form, setForm] = useState<Partial<Article & { tagsInput: string }>>({
    title: '', slug: '', excerpt: '', content: '', cover_image_url: '',
    meta_title: '', meta_description: '', tagsInput: '', author: 'MyTinyverse Team',
    reading_time_minutes: 5,
  });

  // AI generate form
  const [genTopic, setGenTopic] = useState('');
  const [genKeywords, setGenKeywords] = useState('');
  const [genTone, setGenTone] = useState<'friendly' | 'professional'>('friendly');
  const [genLength, setGenLength] = useState<'short' | 'standard' | 'long'>('standard');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // Post-on-behalf state
  const [postForm, setPostForm] = useState({
    seller_name: '', seller_phone: '', seller_whatsapp: '',
    title: '', category: '', age_range: '', price: '', is_donation: false,
    condition: '', description: '', location: '', admin_note: '',
  });
  const [postPhotos, setPostPhotos] = useState<File[]>([]);
  const [postPreviews, setPostPreviews] = useState<string[]>([]);
  const [postErrors, setPostErrors] = useState<Record<string, string>>({});
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState<{ id: string; title: string } | null>(null);
  const postFileRef = useRef<HTMLInputElement>(null);

  // ── Auth ──
  function handlePin(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) { setAuthed(true); setPinError(''); }
    else { setPinError('Incorrect PIN'); }
  }

  // ── Dashboard ──
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${ADMIN_PIN}` } });
      const data = await res.json();
      setStats(data);
    } catch { /* silent */ } finally { setStatsLoading(false); }
  }, []);

  // ── Moderation ──
  const fetchListings = useCallback(async (status: string) => {
    setModLoading(true);
    try {
      const res = await fetch(`/api/admin/listings?status=${status}`, { headers: { 'x-admin-pin': ADMIN_PIN } });
      const data = await res.json();
      setListings(data.listings || []);
    } catch { setListings([]); } finally { setModLoading(false); }
  }, []);

  // ── Blog ──
  const fetchArticles = useCallback(async () => {
    setBlogLoading(true);
    try {
      const res = await fetch('/api/admin/articles', { headers: { 'x-admin-pin': ADMIN_PIN } });
      const data = await res.json();
      setBlogArticles(data.articles || []);
    } catch { setBlogArticles([]); } finally { setBlogLoading(false); }
  }, []);

  useEffect(() => {
    if (authed && (view === 'dashboard' || view === 'reports')) fetchStats();
  }, [authed, view, fetchStats]);

  useEffect(() => {
    if (authed && view === 'moderation') fetchListings(modTab);
  }, [authed, view, modTab, fetchListings]);

  useEffect(() => {
    if (authed && view === 'blog' && !editingArticle && !isNewArticle) fetchArticles();
  }, [authed, view, editingArticle, isNewArticle, fetchArticles]);

  // ── Moderation actions ──
  async function updateStatus(id: string, status: 'live' | 'rejected') {
    setActionLoading(id + status);
    try {
      await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': ADMIN_PIN },
        body: JSON.stringify({ id, status }),
      });
      await fetchListings(modTab);
    } finally { setActionLoading(null); }
  }

  async function deleteListing(id: string) {
    setDeleteConfirm(null);
    setActionLoading(id + 'delete');
    try {
      await fetch('/api/admin/listings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': ADMIN_PIN },
        body: JSON.stringify({ id }),
      });
      await fetchListings(modTab);
    } finally { setActionLoading(null); }
  }

  // ── Blog actions ──
  function openNewArticle() {
    setForm({ title: '', slug: '', excerpt: '', content: '', cover_image_url: '', meta_title: '', meta_description: '', tagsInput: '', author: 'MyTinyverse Team', reading_time_minutes: 5 });
    setEditingArticle(null);
    setIsNewArticle(true);
    setEditorMode('generate');
    setGenTopic('');
    setGenKeywords('');
    setGenError('');
    setSaveStatus('idle');
  }

  function openEditArticle(article: Article) {
    setForm({
      ...article,
      tagsInput: (article.tags || []).join(', '),
    });
    setEditingArticle(article);
    setIsNewArticle(false);
    setEditorMode('manual');
    setGenError('');
    setSaveStatus('idle');
  }

  function closeEditor() {
    setEditingArticle(null);
    setIsNewArticle(false);
    fetchArticles();
  }

  async function generateArticle() {
    if (!genTopic.trim()) { setGenError('Please enter a topic'); return; }
    setGenerating(true);
    setGenError('');
    try {
      const res = await fetch('/api/admin/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': ADMIN_PIN },
        body: JSON.stringify({ topic: genTopic, keywords: genKeywords, tone: genTone, length: genLength }),
      });
      const data = await res.json();
      if (data.error) { setGenError(data.error); return; }
      const a = data.article;
      setForm({
        title: a.title || '',
        slug: a.slug || '',
        excerpt: a.excerpt || '',
        content: a.content || '',
        cover_image_url: '',
        meta_title: a.meta_title || '',
        meta_description: a.meta_description || '',
        tagsInput: (a.tags || []).join(', '),
        author: a.author || 'MyTinyverse Team',
        reading_time_minutes: a.reading_time_minutes || 5,
      });
      setEditorMode('manual');
    } catch (err) {
      setGenError((err as Error).message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  async function saveArticle() {
    if (!form.title || !form.slug) { alert('Title and slug are required'); return; }
    setSaveStatus('saving');
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        cover_image_url: form.cover_image_url,
        meta_title: form.meta_title,
        meta_description: form.meta_description,
        tags: (form.tagsInput || '').split(',').map(t => t.trim()).filter(Boolean),
        author: form.author,
        reading_time_minutes: Number(form.reading_time_minutes) || 5,
      };

      if (editingArticle) {
        const res = await fetch('/api/admin/articles', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-pin': ADMIN_PIN },
          body: JSON.stringify({ id: editingArticle.id, ...payload }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setEditingArticle(data.article);
        setForm(prev => ({ ...prev, ...data.article, tagsInput: (data.article.tags || []).join(', ') }));
      } else {
        const res = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-pin': ADMIN_PIN },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setEditingArticle(data.article);
        setIsNewArticle(false);
        setForm(prev => ({ ...prev, ...data.article, tagsInput: (data.article.tags || []).join(', ') }));
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      alert((err as Error).message || 'Save failed');
    }
  }

  async function articleAction(id: string, action: 'submit' | 'publish' | 'unpublish') {
    setBlogActionLoading(id + action);
    try {
      await fetch('/api/admin/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': ADMIN_PIN },
        body: JSON.stringify({ id, action }),
      });
      await fetchArticles();
      if (editingArticle?.id === id) {
        // Refresh editing article status
        const res = await fetch('/api/admin/articles', { headers: { 'x-admin-pin': ADMIN_PIN } });
        const data = await res.json();
        const updated = (data.articles || []).find((a: Article) => a.id === id);
        if (updated) setEditingArticle(updated);
      }
    } finally { setBlogActionLoading(null); }
  }

  async function deleteArticle(id: string) {
    setBlogDeleteConfirm(null);
    setBlogActionLoading(id + 'delete');
    try {
      await fetch('/api/admin/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': ADMIN_PIN },
        body: JSON.stringify({ id }),
      });
      if (editingArticle?.id === id) closeEditor();
      else await fetchArticles();
    } finally { setBlogActionLoading(null); }
  }

  // ── Post on behalf ──
  async function submitOnBehalf() {
    const errors: Record<string, string> = {};
    if (!postForm.seller_name.trim()) errors.seller_name = 'Required';
    if (!postForm.seller_phone.trim()) errors.seller_phone = 'Required';
    if (!postForm.title.trim()) errors.title = 'Required';
    if (!postForm.category) errors.category = 'Select a category';
    if (!postForm.condition) errors.condition = 'Select a condition';
    if (!postForm.location) errors.location = 'Select a neighbourhood';
    if (!postForm.is_donation && !postForm.price) errors.price = 'Enter a price or mark as free';
    if (Object.keys(errors).length > 0) { setPostErrors(errors); return; }

    setPostSubmitting(true);
    setPostErrors({});
    try {
      const fd = new FormData();
      fd.append('seller_name', postForm.seller_name.trim());
      fd.append('seller_phone', postForm.seller_phone.trim());
      fd.append('seller_whatsapp', postForm.seller_whatsapp.trim());
      fd.append('title', postForm.title.trim());
      fd.append('category', postForm.category);
      fd.append('age_range', postForm.age_range);
      fd.append('price', postForm.is_donation ? '0' : postForm.price);
      fd.append('is_donation', String(postForm.is_donation));
      fd.append('condition', postForm.condition);
      fd.append('description', postForm.description.trim());
      fd.append('location', postForm.location);
      fd.append('admin_note', postForm.admin_note.trim());
      postPhotos.forEach((f, i) => fd.append(`photo${i}`, f));

      const res = await fetch('/api/admin/create-listing', {
        method: 'POST',
        headers: { 'x-admin-pin': ADMIN_PIN },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post listing');

      setPostSuccess(data.listing);
      setPostForm({ seller_name: '', seller_phone: '', seller_whatsapp: '', title: '', category: '', age_range: '', price: '', is_donation: false, condition: '', description: '', location: '', admin_note: '' });
      setPostPhotos([]);
      setPostPreviews([]);
    } catch (err) {
      setPostErrors({ _form: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setPostSubmitting(false);
    }
  }

  // ── PIN gate ──
  if (!authed) {
    return (
      <>
        <Nav/>
        <div className="container" style={{ padding: '80px 0', maxWidth: 360, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF3E0', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 style={{ font: '700 22px Outfit,sans-serif', margin: '0 0 8px' }}>Admin Access</h1>
          <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 28px' }}>Enter your admin PIN to continue</p>
          <form onSubmit={handlePin}>
            <div className="field" style={{ textAlign: 'left' }}>
              <label>Admin PIN</label>
              <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="****" maxLength={8} autoFocus/>
              {pinError && <span style={{ color: '#e53935', font: '400 12px Outfit,sans-serif' }}>{pinError}</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Unlock</button>
          </form>
        </div>
      </>
    );
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
    font: `${active ? '600' : '400'} 14px Outfit,sans-serif`,
    color: active ? 'var(--orange)' : 'var(--text-3)',
    borderBottom: active ? '2px solid var(--orange)' : '2px solid transparent',
    marginBottom: -1,
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8,
    font: '400 14px Outfit,sans-serif', color: 'var(--text-1)', background: '#fff', boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    font: '600 12px Outfit,sans-serif', color: 'var(--text-3)', textTransform: 'uppercase',
    letterSpacing: '.06em', marginBottom: 5, display: 'block',
  };

  return (
    <>
      <Nav/>
      <div className="container" style={{ padding: '24px 0 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ font: '700 22px Outfit,sans-serif', margin: 0 }}>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="https://wa.me/254790784084" target="_blank" rel="noopener noreferrer" className="btn btn-green btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              CRM
            </a>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (view === 'dashboard' || view === 'reports') fetchStats();
                else if (view === 'moderation') fetchListings(modTab);
                else if (view === 'blog') fetchArticles();
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* View tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
          <button style={tabStyle(view === 'dashboard')} onClick={() => setView('dashboard')}>Dashboard</button>
          <button style={tabStyle(view === 'moderation')} onClick={() => setView('moderation')}>
            Moderation {stats && stats.tiles.pending_review > 0 ? `(${stats.tiles.pending_review})` : ''}
          </button>
          <button style={tabStyle(view === 'post')} onClick={() => { setView('post'); setPostSuccess(null); }}>
            Post Listing
          </button>
          <button style={tabStyle(view === 'reports')} onClick={() => setView('reports')}>
            Reports
          </button>
          <button style={tabStyle(view === 'blog')} onClick={() => { setView('blog'); setEditingArticle(null); setIsNewArticle(false); }}>
            Blog
          </button>
        </div>

        {/* ── DASHBOARD VIEW ── */}
        {view === 'dashboard' && (
          <>
            {statsLoading && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div className="spinner" style={{ margin: '0 auto' }}/>
              </div>
            )}
            {!statsLoading && stats && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  <StatTile label="Live Listings" value={stats.tiles.live_listings} accent/>
                  <StatTile label="Pending Review" value={stats.tiles.pending_review} sub={stats.tiles.pending_review > 0 ? 'Needs attention' : 'All clear'}/>
                  <StatTile label="Total Revenue" value={fmtKES(stats.tiles.total_revenue)}/>
                  <StatTile label="Approval Rate" value={`${stats.tiles.approval_rate}%`} sub={`${stats.tiles.total_listings} total submitted`}/>
                  <StatTile label="Total Views" value={stats.tiles.total_views.toLocaleString()} sub="live listings"/>
                  <StatTile label="WA Clicks" value={stats.tiles.total_wa_clicks.toLocaleString()} sub={stats.tiles.total_views > 0 ? `${Math.round((stats.tiles.total_wa_clicks / stats.tiles.total_views) * 100)}% click rate` : '--'}/>
                  <StatTile label="Submitted (30d)" value={stats.tiles.submitted_last_30d}/>
                </div>

                <SectionTitle>Revenue -- Last 6 Months</SectionTitle>
                {stats.revenue_by_month.every(d => d.revenue === 0) ? (
                  <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)' }}>No revenue data yet.</p>
                ) : (
                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
                    <BarChart data={stats.revenue_by_month}/>
                  </div>
                )}

                {stats.revenue_by_tier.length > 0 && (
                  <>
                    <SectionTitle>Revenue by Tier</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                      {stats.revenue_by_tier.sort((a, b) => b.revenue - a.revenue).map(t => (
                        <div key={t.tier} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                          <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>{tierLabel(t.tier)}</p>
                          <p style={{ font: '700 20px Outfit,sans-serif', margin: 0, color: t.revenue > 0 ? 'var(--green)' : 'var(--text-3)' }}>{fmtKES(t.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <SectionTitle>Category Performance</SectionTitle>
                {stats.category_stats.length === 0 ? (
                  <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)' }}>No live listings yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid var(--border)', borderRadius: 14 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', font: '400 13px Outfit,sans-serif' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: '#fafaf9' }}>
                          {['Category', 'Live', 'Views', 'WA Clicks', 'Click Rate', 'Avg Price'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', font: '600 12px Outfit,sans-serif', color: 'var(--text-3)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.category_stats.map((row, i) => (
                          <tr key={row.category} style={{ borderBottom: i < stats.category_stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <td style={{ padding: '10px 14px', font: '600 13px Outfit,sans-serif', color: 'var(--text-1)', whiteSpace: 'nowrap' }}>{categoryLabel(row.category)}</td>
                            <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{row.live}</td>
                            <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{row.views.toLocaleString()}</td>
                            <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{row.whatsapp_clicks.toLocaleString()}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ background: row.click_rate >= 10 ? '#e8f5e9' : row.click_rate >= 5 ? '#fff8e1' : '#f5f5f5', color: row.click_rate >= 10 ? '#2e7d32' : row.click_rate >= 5 ? '#f57f17' : 'var(--text-3)', borderRadius: 6, padding: '2px 8px', font: '600 12px Outfit,sans-serif' }}>
                                {row.click_rate}%
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{row.avg_price > 0 ? `KES ${row.avg_price.toLocaleString()}` : '--'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {stats.expiring_soon.length > 0 && (
                  <>
                    <SectionTitle>Expiring Soon -- Next 7 Days</SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {stats.expiring_soon.map(l => (
                        <div key={l.id} style={{ background: '#fff', border: '1px solid #ffe0b2', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <div>
                            <p style={{ font: '600 14px Outfit,sans-serif', margin: '0 0 2px', color: 'var(--text-1)' }}>{l.title}</p>
                            <p style={{ font: '400 12px Outfit,sans-serif', margin: 0, color: 'var(--text-3)' }}>{categoryLabel(l.category || '')} -- {fmtKES(l.price || 0)} -- {l.views || 0} views</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <span style={{ background: '#FFF3E0', color: 'var(--orange)', borderRadius: 6, padding: '4px 10px', font: '600 12px Outfit,sans-serif', whiteSpace: 'nowrap' }}>
                              {daysUntil(l.expires_at as string)}d left
                            </span>
                            <Link href={`/listing/${l.id}`} className="btn btn-secondary btn-sm" target="_blank">View</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
                  <div>
                    <SectionTitle>Top Searches (30d)</SectionTitle>
                    {stats.top_searches.length === 0 ? (
                      <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>No search data yet.</p>
                    ) : (
                      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '4px 0' }}>
                        {stats.top_searches.map((s, i) => (
                          <div key={s.query} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < stats.top_searches.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-2)' }}>{s.query}</span>
                            <span style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-3)', background: '#f5f4f2', borderRadius: 6, padding: '2px 8px' }}>{s.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <SectionTitle>Demand Gaps (0 results)</SectionTitle>
                    {stats.demand_gaps.length === 0 ? (
                      <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>No zero-result searches yet.</p>
                    ) : (
                      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '4px 0' }}>
                        {stats.demand_gaps.map((s, i) => (
                          <div key={s.query} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < stats.demand_gaps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-2)' }}>{s.query}</span>
                            <span style={{ font: '600 13px Outfit,sans-serif', color: '#e53935', background: '#ffebee', borderRadius: 6, padding: '2px 8px' }}>{s.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── MODERATION VIEW ── */}
        {view === 'moderation' && (
          <>
            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
              {(['pending', 'live', 'rejected'] as const).map(t => (
                <button key={t} style={tabStyle(modTab === t)} onClick={() => setModTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {modLoading ? (
              <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
            ) : listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f5f4f2', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5">
                    <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                  </svg>
                </div>
                <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>No {modTab} listings</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {listings.map(listing => (
                  <div key={listing.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt={listing.title} style={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}/>
                    ) : (
                      <div style={{ width: 80, height: 64, borderRadius: 8, background: '#f5f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5">
                          <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                        </svg>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <p style={{ font: '600 15px Outfit,sans-serif', margin: '0 0 4px', color: 'var(--text-1)' }}>{listing.title}</p>
                      <p style={{ font: '400 13px Outfit,sans-serif', margin: '0 0 2px', color: 'var(--text-2)' }}>{listing.price === 0 ? 'FREE' : `KES ${listing.price.toLocaleString()}`} -- {listing.location}</p>
                      <p style={{ font: '400 12px Outfit,sans-serif', margin: '0 0 2px', color: 'var(--text-3)' }}>Seller: {listing.seller_name} -- {listing.seller_phone}</p>
                      <p style={{ font: '400 12px Outfit,sans-serif', margin: 0, color: 'var(--text-3)' }}>Fee: KES {listing.fee_amount} ({listing.fee_tier}){listing.mpesa_code && ` -- M-Pesa: ${listing.mpesa_code}`}</p>
                      {modTab === 'live' && <p style={{ font: '400 11px Outfit,sans-serif', margin: '4px 0 0', color: 'var(--text-3)' }}>{listing.views || 0} views -- {(listing as Listing & { whatsapp_clicks?: number }).whatsapp_clicks || 0} WA clicks</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0, alignItems: 'flex-start' }}>
                      {modTab === 'pending' && (
                        <>
                          <button className="btn btn-green btn-sm" onClick={() => updateStatus(listing.id, 'live')} disabled={!!actionLoading}>{actionLoading === listing.id + 'live' ? '...' : 'Approve'}</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(listing.id, 'rejected')} disabled={!!actionLoading} style={{ color: '#e53935', borderColor: '#e53935' }}>{actionLoading === listing.id + 'rejected' ? '...' : 'Reject'}</button>
                        </>
                      )}
                      {modTab === 'live' && <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(listing.id, 'rejected')} disabled={!!actionLoading} style={{ color: '#e53935', borderColor: '#e53935' }}>{actionLoading === listing.id + 'rejected' ? '...' : 'Take down'}</button>}
                      {modTab === 'rejected' && <button className="btn btn-green btn-sm" onClick={() => updateStatus(listing.id, 'live')} disabled={!!actionLoading}>{actionLoading === listing.id + 'live' ? '...' : 'Approve'}</button>}
                      <Link href={`/listing/${listing.id}`} className="btn btn-secondary btn-sm" target="_blank">View</Link>
                      {deleteConfirm === listing.id ? (
                        <>
                          <button className="btn btn-sm" style={{ background: '#e53935', color: '#fff', border: 'none' }} onClick={() => deleteListing(listing.id)} disabled={!!actionLoading}>{actionLoading === listing.id + 'delete' ? '...' : 'Confirm delete'}</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(listing.id)} disabled={!!actionLoading} style={{ color: '#e53935', borderColor: '#e53935' }}>Delete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── POST LISTING VIEW ── */}
        {view === 'post' && (
          <>
            {postSuccess ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F5E9', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 style={{ font: '700 20px Outfit,sans-serif', margin: '0 0 8px' }}>Listing Posted!</h2>
                <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 24px' }}>
                  &ldquo;{postSuccess.title}&rdquo; is now live on the marketplace.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href={`/listing/${postSuccess.id}`} target="_blank" className="btn btn-green btn-sm">View Listing</Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => setPostSuccess(null)}>Post Another</button>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: 640 }}>
                <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 28px' }}>
                  Post a listing on behalf of a parent. It goes live immediately - no M-Pesa required.
                </p>

                {/* Seller Info */}
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
                  <h3 style={{ font: '700 14px Outfit,sans-serif', margin: '0 0 16px', color: 'var(--text-1)' }}>Seller Info</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Name *</label>
                      <input style={{ ...inputStyle, borderColor: postErrors.seller_name ? '#e53935' : 'var(--border)' }}
                        value={postForm.seller_name}
                        onChange={e => setPostForm(f => ({ ...f, seller_name: e.target.value }))}
                        placeholder="e.g. Jane Kamau"/>
                      {postErrors.seller_name && <span style={{ font: '400 11px Outfit,sans-serif', color: '#e53935', display: 'block', marginTop: 3 }}>{postErrors.seller_name}</span>}
                    </div>
                    <div>
                      <label style={labelStyle}>Phone *</label>
                      <input style={{ ...inputStyle, borderColor: postErrors.seller_phone ? '#e53935' : 'var(--border)' }}
                        value={postForm.seller_phone}
                        onChange={e => setPostForm(f => ({ ...f, seller_phone: e.target.value }))}
                        placeholder="07xx xxx xxx"/>
                      {postErrors.seller_phone && <span style={{ font: '400 11px Outfit,sans-serif', color: '#e53935', display: 'block', marginTop: 3 }}>{postErrors.seller_phone}</span>}
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <label style={labelStyle}>WhatsApp (if different from phone)</label>
                    <input style={inputStyle}
                      value={postForm.seller_whatsapp}
                      onChange={e => setPostForm(f => ({ ...f, seller_whatsapp: e.target.value }))}
                      placeholder="Leave blank to use phone number above"/>
                  </div>
                </div>

                {/* Item Details */}
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
                  <h3 style={{ font: '700 14px Outfit,sans-serif', margin: '0 0 16px', color: 'var(--text-1)' }}>Item Details</h3>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Title *</label>
                    <input style={{ ...inputStyle, borderColor: postErrors.title ? '#e53935' : 'var(--border)' }}
                      value={postForm.title}
                      onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Cybex Priam Stroller - excellent condition"/>
                    {postErrors.title && <span style={{ font: '400 11px Outfit,sans-serif', color: '#e53935', display: 'block', marginTop: 3 }}>{postErrors.title}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Category *</label>
                      <select style={{ ...inputStyle, borderColor: postErrors.category ? '#e53935' : 'var(--border)' }}
                        value={postForm.category}
                        onChange={e => setPostForm(f => ({ ...f, category: e.target.value }))}>
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                      {postErrors.category && <span style={{ font: '400 11px Outfit,sans-serif', color: '#e53935', display: 'block', marginTop: 3 }}>{postErrors.category}</span>}
                    </div>
                    <div>
                      <label style={labelStyle}>Age Range</label>
                      <select style={inputStyle}
                        value={postForm.age_range}
                        onChange={e => setPostForm(f => ({ ...f, age_range: e.target.value }))}>
                        <option value="">Select age range</option>
                        {AGE_RANGES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Condition *</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {CONDITIONS.map(c => (
                        <button key={c.id} type="button"
                          onClick={() => setPostForm(f => ({ ...f, condition: c.id }))}
                          style={{
                            padding: '8px 14px', border: `2px solid ${postForm.condition === c.id ? 'var(--orange)' : 'var(--border)'}`,
                            borderRadius: 8, background: postForm.condition === c.id ? '#FFF5EE' : '#fff',
                            cursor: 'pointer', textAlign: 'left',
                          }}>
                          <div style={{ font: '600 13px Outfit,sans-serif', color: postForm.condition === c.id ? 'var(--orange)' : 'var(--text-1)' }}>{c.label}</div>
                          <div style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)' }}>{c.desc}</div>
                        </button>
                      ))}
                    </div>
                    {postErrors.condition && <span style={{ font: '400 11px Outfit,sans-serif', color: '#e53935', display: 'block', marginTop: 4 }}>{postErrors.condition}</span>}
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Price *</label>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, font: '400 14px Outfit,sans-serif', cursor: 'pointer', flexShrink: 0 }}>
                        <input type="checkbox" checked={postForm.is_donation}
                          onChange={e => setPostForm(f => ({ ...f, is_donation: e.target.checked, price: '' }))}/>
                        Free / Donation
                      </label>
                      {!postForm.is_donation && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-2)' }}>KES</span>
                          <input style={{ ...inputStyle, maxWidth: 160, borderColor: postErrors.price ? '#e53935' : 'var(--border)' }}
                            type="number" min="0" placeholder="e.g. 8500"
                            value={postForm.price}
                            onChange={e => setPostForm(f => ({ ...f, price: e.target.value }))}/>
                        </div>
                      )}
                    </div>
                    {postErrors.price && <span style={{ font: '400 11px Outfit,sans-serif', color: '#e53935', display: 'block', marginTop: 4 }}>{postErrors.price}</span>}
                  </div>

                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' } as React.CSSProperties}
                      value={postForm.description}
                      onChange={e => setPostForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe the item - brand, size, any defects, what is included..."/>
                  </div>
                </div>

                {/* Photos */}
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
                  <h3 style={{ font: '700 14px Outfit,sans-serif', margin: '0 0 4px', color: 'var(--text-1)' }}>Photos</h3>
                  <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 14px' }}>Up to 5 photos. First photo is the cover image.</p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {postPreviews.map((src, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={src} alt="" style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block' }}/>
                        <button type="button"
                          onClick={() => {
                            setPostPhotos(prev => prev.filter((_, j) => j !== i));
                            setPostPreviews(prev => prev.filter((_, j) => j !== i));
                          }}
                          style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#e53935', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 11px sans-serif', lineHeight: 1 }}>
                          x
                        </button>
                        {i === 0 && (
                          <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'var(--orange)', color: '#fff', borderRadius: 4, padding: '1px 5px', font: '600 9px Outfit,sans-serif' }}>Cover</div>
                        )}
                      </div>
                    ))}
                    {postPhotos.length < 5 && (
                      <button type="button"
                        onClick={() => postFileRef.current?.click()}
                        style={{ width: 100, height: 80, border: '2px dashed var(--border)', borderRadius: 8, background: '#fafaf9', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span style={{ font: '400 10px Outfit,sans-serif', color: 'var(--text-3)' }}>Add photo</span>
                      </button>
                    )}
                  </div>
                  <input ref={postFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file || postPhotos.length >= 5) return;
                      const reader = new FileReader();
                      reader.onload = ev => {
                        setPostPhotos(prev => [...prev, file]);
                        setPostPreviews(prev => [...prev, ev.target?.result as string]);
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}/>
                </div>

                {/* Location + Admin Note */}
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 20 }}>
                  <h3 style={{ font: '700 14px Outfit,sans-serif', margin: '0 0 16px', color: 'var(--text-1)' }}>Location and Notes</h3>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Neighbourhood *</label>
                    <select style={{ ...inputStyle, borderColor: postErrors.location ? '#e53935' : 'var(--border)' }}
                      value={postForm.location}
                      onChange={e => setPostForm(f => ({ ...f, location: e.target.value }))}>
                      <option value="">Select neighbourhood</option>
                      {NAIROBI_HOODS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    {postErrors.location && <span style={{ font: '400 11px Outfit,sans-serif', color: '#e53935', display: 'block', marginTop: 3 }}>{postErrors.location}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>Admin Note (internal only - not shown to buyers)</label>
                    <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' } as React.CSSProperties}
                      value={postForm.admin_note}
                      onChange={e => setPostForm(f => ({ ...f, admin_note: e.target.value }))}
                      placeholder="Any notes about this listing or the parent..."/>
                  </div>
                </div>

                {postErrors._form && (
                  <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                    <p style={{ font: '400 14px Outfit,sans-serif', color: '#c62828', margin: 0 }}>{postErrors._form}</p>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-lg"
                  onClick={submitOnBehalf}
                  disabled={postSubmitting}
                  style={{ width: '100%' }}>
                  {postSubmitting ? 'Posting...' : 'Post Listing Now'}
                </button>
                <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', textAlign: 'center', margin: '10px 0 0' }}>
                  Listing goes live immediately. No M-Pesa required.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── REPORTS VIEW ── */}
        {view === 'reports' && (
          <>
            {statsLoading && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div className="spinner" style={{ margin: '0 auto' }}/>
              </div>
            )}
            {!statsLoading && !stats && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 16px' }}>Could not load report data.</p>
                <button className="btn btn-secondary btn-sm" onClick={fetchStats}>Retry</button>
              </div>
            )}
            {!statsLoading && stats && (
              <>
                {/* Inventory Snapshot */}
                <SectionTitle>Inventory Snapshot</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
                  <StatTile label="Live Listings" value={stats.tiles.live_listings} accent/>
                  <StatTile label="Pending Review" value={stats.tiles.pending_review} sub={stats.tiles.pending_review > 0 ? 'Needs attention' : 'All clear'}/>
                  <StatTile label="Total Submitted" value={stats.tiles.total_listings}/>
                  <StatTile label="Approval Rate" value={`${stats.tiles.approval_rate}%`} sub="live vs submitted"/>
                  <StatTile label="Submitted (30d)" value={stats.tiles.submitted_last_30d}/>
                  <StatTile label="Expiring Soon" value={stats.expiring_soon.length} sub="next 7 days"/>
                </div>

                {/* Inquiry Funnel */}
                <SectionTitle>Inquiry Funnel</SectionTitle>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 24px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Total Views', value: stats.tiles.total_views, bg: '#E3F2FD', fg: '#1565C0' },
                      { label: 'WA Clicks', value: stats.tiles.total_wa_clicks, bg: '#E8F5E9', fg: '#2E7D32' },
                    ].map((step, i, arr) => (
                      <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ background: step.bg, borderRadius: 12, padding: '18px 24px', textAlign: 'center', minWidth: 130 }}>
                          <div style={{ font: '700 26px Outfit,sans-serif', color: step.fg }}>{step.value.toLocaleString()}</div>
                          <div style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', marginTop: 3 }}>{step.label}</div>
                        </div>
                        {i < arr.length - 1 && (
                          <svg width="28" height="18" viewBox="0 0 28 18" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M2 9 L22 9 M15 3 L24 9 L15 15" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    ))}
                    <div style={{ background: '#FFF5EE', borderRadius: 12, padding: '18px 24px', textAlign: 'center', minWidth: 130 }}>
                      <div style={{ font: '700 26px Outfit,sans-serif', color: 'var(--orange)' }}>
                        {stats.tiles.total_views > 0 ? `${Math.round((stats.tiles.total_wa_clicks / stats.tiles.total_views) * 100)}%` : '--'}
                      </div>
                      <div style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', marginTop: 3 }}>Click Rate</div>
                    </div>
                  </div>
                  <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: '14px 0 0' }}>
                    {stats.tiles.total_views === 0 && 'No views recorded yet.'}
                    {stats.tiles.total_views > 0 && stats.tiles.total_wa_clicks / stats.tiles.total_views >= 0.1 && 'Strong engagement - over 10% of views result in a WhatsApp inquiry.'}
                    {stats.tiles.total_views > 0 && stats.tiles.total_wa_clicks / stats.tiles.total_views >= 0.05 && stats.tiles.total_wa_clicks / stats.tiles.total_views < 0.1 && 'Decent engagement. Better photos and pricing can improve click rate.'}
                    {stats.tiles.total_views > 0 && stats.tiles.total_wa_clicks / stats.tiles.total_views < 0.05 && 'Low click rate. Encourage sellers to add quality photos and competitive pricing.'}
                  </p>
                </div>

                {/* Category Health */}
                <SectionTitle>Category Health</SectionTitle>
                {stats.category_stats.length === 0 ? (
                  <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)' }}>No live listings yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid var(--border)', borderRadius: 14 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', font: '400 13px Outfit,sans-serif' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: '#fafaf9' }}>
                          {['Category', 'Live', 'Views', 'WA Clicks', 'Click Rate', 'Avg Price', 'Signal'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', font: '600 11px Outfit,sans-serif', color: 'var(--text-3)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...stats.category_stats].sort((a, b) => b.whatsapp_clicks - a.whatsapp_clicks).map((row, i, arr) => {
                          const signal = row.click_rate >= 10 ? { bg: '#E8F5E9', fg: '#2E7D32', label: 'Hot' }
                            : row.click_rate >= 5 ? { bg: '#FFF8E1', fg: '#F57F17', label: 'Good' }
                            : row.live > 0 ? { bg: '#FFF3E0', fg: '#E65100', label: 'Slow' }
                            : { bg: '#f5f5f5', fg: '#9e9e9e', label: 'None' };
                          return (
                            <tr key={row.category} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                              <td style={{ padding: '10px 14px', font: '600 13px Outfit,sans-serif', color: 'var(--text-1)', whiteSpace: 'nowrap' }}>{categoryLabel(row.category)}</td>
                              <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{row.live}</td>
                              <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{row.views.toLocaleString()}</td>
                              <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{row.whatsapp_clicks.toLocaleString()}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ background: row.click_rate >= 10 ? '#e8f5e9' : row.click_rate >= 5 ? '#fff8e1' : '#f5f5f5', color: row.click_rate >= 10 ? '#2e7d32' : row.click_rate >= 5 ? '#f57f17' : 'var(--text-3)', borderRadius: 6, padding: '2px 8px', font: '600 12px Outfit,sans-serif' }}>
                                  {row.click_rate}%
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{row.avg_price > 0 ? `KES ${row.avg_price.toLocaleString()}` : '--'}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ background: signal.bg, color: signal.fg, borderRadius: 6, padding: '2px 8px', font: '600 11px Outfit,sans-serif' }}>{signal.label}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Revenue */}
                <SectionTitle>Revenue</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <StatTile label="Total Revenue" value={fmtKES(stats.tiles.total_revenue)} accent/>
                  <StatTile label="Avg per Listing" value={stats.tiles.total_listings > 0 ? fmtKES(Math.round(stats.tiles.total_revenue / stats.tiles.total_listings)) : 'KES 0'} sub="all statuses"/>
                </div>
                {stats.revenue_by_tier.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '4px 0', marginBottom: 12 }}>
                    {[...stats.revenue_by_tier].sort((a, b) => b.revenue - a.revenue).map((t, i, arr) => (
                      <div key={t.tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-1)' }}>{tierLabel(t.tier)}</span>
                        <span style={{ font: '700 15px Outfit,sans-serif', color: t.revenue > 0 ? 'var(--green)' : 'var(--text-3)' }}>{fmtKES(t.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {stats.revenue_by_month.some(d => d.revenue > 0) && (
                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
                    <p style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 12px' }}>Revenue - Last 6 Months</p>
                    <BarChart data={stats.revenue_by_month}/>
                  </div>
                )}

                {/* Market Signals */}
                <SectionTitle>Market Signals</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 10px' }}>Top Searches (30d)</p>
                    {stats.top_searches.length === 0 ? (
                      <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>No data yet.</p>
                    ) : (
                      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '4px 0' }}>
                        {stats.top_searches.map((s, i) => (
                          <div key={s.query} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < stats.top_searches.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-2)' }}>{s.query}</span>
                            <span style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-3)', background: '#f5f4f2', borderRadius: 6, padding: '2px 8px' }}>{s.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p style={{ font: '600 13px Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 10px' }}>Demand Gaps (0 results)</p>
                    {stats.demand_gaps.length === 0 ? (
                      <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)' }}>No zero-result searches yet.</p>
                    ) : (
                      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '4px 0' }}>
                        {stats.demand_gaps.map((s, i) => (
                          <div key={s.query} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < stats.demand_gaps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-2)' }}>{s.query}</span>
                            <span style={{ font: '600 13px Outfit,sans-serif', color: '#e53935', background: '#ffebee', borderRadius: 6, padding: '2px 8px' }}>{s.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expiring Soon */}
                {stats.expiring_soon.length > 0 && (
                  <>
                    <SectionTitle>Expiring Soon - Next 7 Days</SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {stats.expiring_soon.map(l => (
                        <div key={l.id} style={{ background: '#fff', border: '1px solid #ffe0b2', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <div>
                            <p style={{ font: '600 14px Outfit,sans-serif', margin: '0 0 2px', color: 'var(--text-1)' }}>{l.title}</p>
                            <p style={{ font: '400 12px Outfit,sans-serif', margin: 0, color: 'var(--text-3)' }}>{l.seller_name} - {fmtKES(l.price || 0)}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <span style={{ background: '#FFF3E0', color: 'var(--orange)', borderRadius: 6, padding: '4px 10px', font: '600 12px Outfit,sans-serif', whiteSpace: 'nowrap' }}>
                              {daysUntil(l.expires_at as string)}d left
                            </span>
                            <Link href={`/listing/${l.id}`} className="btn btn-secondary btn-sm" target="_blank">View</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ── BLOG VIEW ── */}
        {view === 'blog' && (
          <>
            {/* Article Editor */}
            {(isNewArticle || editingArticle) ? (
              <div>
                {/* Editor Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={closeEditor}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                      All Articles
                    </button>
                    {editingArticle && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          background: STATUS_BADGE[editingArticle.status].bg,
                          color: STATUS_BADGE[editingArticle.status].fg,
                          borderRadius: 6, padding: '4px 10px', font: '600 11px Outfit,sans-serif',
                        }}>
                          {STATUS_BADGE[editingArticle.status].label}
                        </span>
                        {editingArticle.views > 0 && (
                          <span style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)' }}>
                            {editingArticle.views} views
                          </span>
                        )}
                      </div>
                    )}
                    {isNewArticle && <span style={{ font: '600 14px Outfit,sans-serif', color: 'var(--text-1)' }}>New Article</span>}
                  </div>

                  {/* Save & workflow actions */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {saveStatus === 'saved' && <span style={{ font: '400 13px Outfit,sans-serif', color: '#2e7d32' }}>Saved</span>}
                    {saveStatus === 'error' && <span style={{ font: '400 13px Outfit,sans-serif', color: '#e53935' }}>Save failed</span>}
                    <button className="btn btn-secondary btn-sm" onClick={saveArticle} disabled={saveStatus === 'saving'}>
                      {saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
                    </button>
                    {editingArticle && editingArticle.status === 'draft' && (
                      <button className="btn btn-secondary btn-sm" style={{ color: '#F57F17', borderColor: '#F57F17' }}
                        onClick={() => articleAction(editingArticle.id, 'submit')} disabled={!!blogActionLoading}>
                        {blogActionLoading === editingArticle.id + 'submit' ? '...' : 'Submit for Review'}
                      </button>
                    )}
                    {editingArticle && editingArticle.status === 'pending' && (
                      <button className="btn btn-green btn-sm"
                        onClick={() => articleAction(editingArticle.id, 'publish')} disabled={!!blogActionLoading}>
                        {blogActionLoading === editingArticle.id + 'publish' ? '...' : 'Approve & Publish'}
                      </button>
                    )}
                    {editingArticle && editingArticle.status === 'published' && (
                      <>
                        <Link href={`/blog/${editingArticle.slug}`} className="btn btn-secondary btn-sm" target="_blank">View Live</Link>
                        <button className="btn btn-secondary btn-sm" style={{ color: '#e53935', borderColor: '#e53935' }}
                          onClick={() => articleAction(editingArticle.id, 'unpublish')} disabled={!!blogActionLoading}>
                          {blogActionLoading === editingArticle.id + 'unpublish' ? '...' : 'Unpublish'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Mode tabs: Generate vs Manual */}
                <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
                  <button style={tabStyle(editorMode === 'generate')} onClick={() => setEditorMode('generate')}>
                    AI Generate
                  </button>
                  <button style={tabStyle(editorMode === 'manual')} onClick={() => setEditorMode('manual')}>
                    Edit Article
                  </button>
                </div>

                {/* ── AI GENERATE PANEL ── */}
                {editorMode === 'generate' && (
                  <div style={{ maxWidth: 640 }}>
                    <div style={{ background: 'linear-gradient(135deg,#FFF5EE 0%,#F0FBE8 100%)', border: '1px solid #f0d9c4', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                        </svg>
                        <p style={{ font: '700 14px Outfit,sans-serif', margin: 0, color: 'var(--text-1)' }}>AI-Powered Article Generator</p>
                      </div>
                      <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                        Describe your article topic and let AI write an SEO-optimised article for Nairobi parents. Review and edit before publishing.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Article Topic *</label>
                        <input
                          style={inputStyle}
                          placeholder="e.g. Best second-hand baby gear to buy in Nairobi"
                          value={genTopic}
                          onChange={e => setGenTopic(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Target Keywords (optional)</label>
                        <input
                          style={inputStyle}
                          placeholder="e.g. buy used stroller Nairobi, baby gear Kenya"
                          value={genKeywords}
                          onChange={e => setGenKeywords(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={labelStyle}>Tone</label>
                          <select
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            value={genTone}
                            onChange={e => setGenTone(e.target.value as 'friendly' | 'professional')}
                          >
                            <option value="friendly">Friendly and conversational</option>
                            <option value="professional">Professional and authoritative</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Article Length</label>
                          <select
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            value={genLength}
                            onChange={e => setGenLength(e.target.value as 'short' | 'standard' | 'long')}
                          >
                            <option value="short">Short (500-700 words)</option>
                            <option value="standard">Standard (800-1000 words)</option>
                            <option value="long">Long (1200-1500 words)</option>
                          </select>
                        </div>
                      </div>

                      {genError && (
                        <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: 8, padding: '12px 14px' }}>
                          <p style={{ font: '400 13px Outfit,sans-serif', color: '#c62828', margin: 0 }}>{genError}</p>
                        </div>
                      )}

                      <button
                        className="btn btn-primary"
                        onClick={generateArticle}
                        disabled={generating || !genTopic.trim()}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                        {generating ? (
                          <>
                            <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff' }}/>
                            Generating article...
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                            </svg>
                            Generate Article with AI
                          </>
                        )}
                      </button>

                      {!isNewArticle && editingArticle && (
                        <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                          Generating will replace the current article content. Your saved draft is preserved in the database.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── MANUAL EDITOR ── */}
                {editorMode === 'manual' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr min(480px, 38%)', gap: 24, alignItems: 'start' }}>

                    {/* Left: main content fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Title *</label>
                        <input
                          style={inputStyle}
                          value={form.title || ''}
                          onChange={e => {
                            const title = e.target.value;
                            setForm(p => ({ ...p, title, slug: p.slug || slugify(title) }));
                          }}
                          placeholder="Article title"
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Slug *</label>
                        <input
                          style={inputStyle}
                          value={form.slug || ''}
                          onChange={e => setForm(p => ({ ...p, slug: slugify(e.target.value) }))}
                          placeholder="url-friendly-slug"
                        />
                        <p style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)', margin: '4px 0 0' }}>
                          /blog/{form.slug || 'your-slug-here'}
                        </p>
                      </div>

                      <div>
                        <label style={labelStyle}>Excerpt</label>
                        <textarea
                          style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                          value={form.excerpt || ''}
                          onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                          placeholder="Brief description shown in article cards and search results (140-160 chars ideal)"
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <label style={{ ...labelStyle, margin: 0 }}>Content (HTML)</label>
                          <span style={{ font: '400 11px Outfit,sans-serif', color: 'var(--text-3)' }}>
                            Use h2, h3, p, ul, ol, li, strong, em tags
                          </span>
                        </div>
                        <textarea
                          style={{ ...inputStyle, height: 420, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
                          value={form.content || ''}
                          onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                          placeholder="<h2>First heading</h2>&#10;<p>Article body content...</p>"
                        />
                      </div>
                    </div>

                    {/* Right: metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>
                      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <p style={{ font: '700 13px Outfit,sans-serif', margin: 0, color: 'var(--text-1)' }}>Article Details</p>

                        <div>
                          <label style={labelStyle}>Cover Image URL</label>
                          <input
                            style={inputStyle}
                            value={form.cover_image_url || ''}
                            onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))}
                            placeholder="https://..."
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>Tags (comma-separated)</label>
                          <input
                            style={inputStyle}
                            value={form.tagsInput || ''}
                            onChange={e => setForm(p => ({ ...p, tagsInput: e.target.value }))}
                            placeholder="safety tips, budget, Nairobi"
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>Author</label>
                          <input
                            style={inputStyle}
                            value={form.author || ''}
                            onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                            placeholder="MyTinyverse Team"
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>Reading Time (minutes)</label>
                          <input
                            type="number"
                            style={inputStyle}
                            value={form.reading_time_minutes || 5}
                            min={1}
                            max={60}
                            onChange={e => setForm(p => ({ ...p, reading_time_minutes: Number(e.target.value) }))}
                          />
                        </div>
                      </div>

                      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                          </svg>
                          <p style={{ font: '700 13px Outfit,sans-serif', margin: 0, color: 'var(--text-1)' }}>SEO Metadata</p>
                        </div>

                        <div>
                          <label style={labelStyle}>Meta Title</label>
                          <input
                            style={inputStyle}
                            value={form.meta_title || ''}
                            onChange={e => setForm(p => ({ ...p, meta_title: e.target.value }))}
                            placeholder="50-60 character SEO title"
                          />
                          <p style={{ font: '400 11px Outfit,sans-serif', color: (form.meta_title || '').length > 60 ? '#e53935' : 'var(--text-3)', margin: '3px 0 0' }}>
                            {(form.meta_title || '').length}/60 chars
                          </p>
                        </div>

                        <div>
                          <label style={labelStyle}>Meta Description</label>
                          <textarea
                            style={{ ...inputStyle, height: 80, resize: 'none' }}
                            value={form.meta_description || ''}
                            onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))}
                            placeholder="150-160 character description for search results"
                          />
                          <p style={{ font: '400 11px Outfit,sans-serif', color: (form.meta_description || '').length > 160 ? '#e53935' : 'var(--text-3)', margin: '3px 0 0' }}>
                            {(form.meta_description || '').length}/160 chars
                          </p>
                        </div>
                      </div>

                      {/* Workflow actions for current article status */}
                      {editingArticle && (
                        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <p style={{ font: '700 13px Outfit,sans-serif', margin: 0, color: 'var(--text-1)' }}>Approval Workflow</p>
                          {editingArticle.status === 'draft' && (
                            <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                              Save your draft, then submit for review when ready.
                            </p>
                          )}
                          {editingArticle.status === 'pending' && (
                            <p style={{ font: '400 12px Outfit,sans-serif', color: '#F57F17', margin: 0 }}>
                              Article is pending review. Approve to publish it live.
                            </p>
                          )}
                          {editingArticle.status === 'published' && editingArticle.published_at && (
                            <p style={{ font: '400 12px Outfit,sans-serif', color: '#2E7D32', margin: 0 }}>
                              Published {fmtDate(editingArticle.published_at)}
                            </p>
                          )}

                          {/* Delete */}
                          {blogDeleteConfirm === editingArticle.id ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-sm" style={{ background: '#e53935', color: '#fff', border: 'none', flex: 1 }}
                                onClick={() => deleteArticle(editingArticle.id)} disabled={!!blogActionLoading}>
                                {blogActionLoading === editingArticle.id + 'delete' ? '...' : 'Yes, delete'}
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={() => setBlogDeleteConfirm(null)}>Cancel</button>
                            </div>
                          ) : (
                            <button className="btn btn-secondary btn-sm" style={{ color: '#e53935', borderColor: '#e53935' }}
                              onClick={() => setBlogDeleteConfirm(editingArticle.id)} disabled={!!blogActionLoading}>
                              Delete Article
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── ARTICLE LIST ── */
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <p style={{ font: '700 16px Outfit,sans-serif', margin: '0 0 2px', color: 'var(--text-1)' }}>Articles</p>
                    <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
                      Write AI-assisted articles to drive organic traffic. Approve and publish when ready.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                    <Link href="/blog" className="btn btn-secondary btn-sm" target="_blank">View Blog</Link>
                    <button className="btn btn-primary btn-sm" onClick={openNewArticle}>
                      + New Article
                    </button>
                  </div>
                </div>

                {blogLoading ? (
                  <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
                ) : blogArticles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid var(--border)', borderRadius: 16 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF0E6', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    </div>
                    <h3 style={{ font: '700 18px Outfit,sans-serif', margin: '0 0 8px' }}>No articles yet</h3>
                    <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 24px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
                      Create your first AI-powered article to start driving organic search traffic from Nairobi parents.
                    </p>
                    <button className="btn btn-primary" onClick={openNewArticle}>Write Your First Article</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {blogArticles.map(article => {
                      const badge = STATUS_BADGE[article.status];
                      return (
                        <div key={article.id} style={{
                          background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
                          padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
                        }}>
                          {/* Status indicator */}
                          <div style={{ width: 6, height: 40, borderRadius: 3, background: badge.fg, flexShrink: 0 }}/>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                              <p style={{ font: '600 14px Outfit,sans-serif', margin: 0, color: 'var(--text-1)' }}>{article.title}</p>
                              <span style={{ background: badge.bg, color: badge.fg, borderRadius: 5, padding: '2px 8px', font: '600 10px Outfit,sans-serif', whiteSpace: 'nowrap' }}>
                                {badge.label}
                              </span>
                            </div>
                            <p style={{ font: '400 12px Outfit,sans-serif', margin: 0, color: 'var(--text-3)' }}>
                              {(article.tags || []).join(', ') || 'No tags'}
                              {' -- '}
                              {article.reading_time_minutes} min read
                              {' -- '}
                              {article.views} views
                              {article.published_at && ` -- Published ${fmtDate(article.published_at)}`}
                              {!article.published_at && article.created_at && ` -- Created ${fmtDate(article.created_at)}`}
                            </p>
                          </div>

                          {/* Quick actions */}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
                            {article.status === 'pending' && (
                              <button className="btn btn-green btn-sm"
                                onClick={() => articleAction(article.id, 'publish')} disabled={!!blogActionLoading}>
                                {blogActionLoading === article.id + 'publish' ? '...' : 'Publish'}
                              </button>
                            )}
                            {article.status === 'published' && (
                              <Link href={`/blog/${article.slug}`} className="btn btn-secondary btn-sm" target="_blank">View</Link>
                            )}
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditArticle(article)}>Edit</button>
                            {blogDeleteConfirm === article.id ? (
                              <>
                                <button className="btn btn-sm" style={{ background: '#e53935', color: '#fff', border: 'none' }}
                                  onClick={() => deleteArticle(article.id)} disabled={!!blogActionLoading}>
                                  {blogActionLoading === article.id + 'delete' ? '...' : 'Confirm'}
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setBlogDeleteConfirm(null)}>Cancel</button>
                              </>
                            ) : (
                              <button className="btn btn-secondary btn-sm" style={{ color: '#e53935', borderColor: '#e53935' }}
                                onClick={() => setBlogDeleteConfirm(article.id)} disabled={!!blogActionLoading}>
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
