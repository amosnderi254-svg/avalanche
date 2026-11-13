'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { Listing, Article, ArticleStatus } from '@/types';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '0784';
const WA_ADMIN = '254790784084';

// ── Form constants ────────────────────────────────────────────────────────────
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

// ── Types ─────────────────────────────────────────────────────────────────────
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

type AdminView   = 'home' | 'queue' | 'post' | 'market' | 'blog' | 'shops';
type ModTab      = 'pending' | 'live' | 'rejected';
type BlogEdMode  = 'generate' | 'manual';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtKES(n: number) { return n === 0 ? 'KES 0' : `KES ${n.toLocaleString()}`; }
function fmtMonth(yyyymm: string) {
  const [y, m] = yyyymm.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString('default', { month: 'short', year: '2-digit' });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}
function categoryLabel(c: string) {
  const M: Record<string,string> = {
    bikes:'Bikes', scooters:'Scooters', 'baby-gear':'Baby Gear',
    strollers:'Strollers', toys:'Toys', books:'Books',
    shoes:'Shoes', 'car-seats':'Car Seats', clothing:'Clothing', other:'Other',
  };
  return M[c] || c;
}
function tierLabel(t: string) {
  const M: Record<string,string> = {
    donation:'Donation (Free)', starter:'Starter (KES 99)',
    standard:'Standard (KES 299)', premium:'Premium (KES 499)',
  };
  return M[t] || t;
}
function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}
function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,80);
}

const STATUS_BADGE: Record<ArticleStatus, { bg: string; fg: string; label: string }> = {
  draft:     { bg: '#f5f4f2', fg: '#666',    label: 'Draft' },
  pending:   { bg: '#FFF8E1', fg: '#F57F17', label: 'Pending Review' },
  published: { bg: '#E8F5E9', fg: '#2E7D32', label: 'Published' },
};

// WhatsApp SVG path
const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: AdminView; label: string; icon: string }[] = [
  { id: 'home',   label: 'Command', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { id: 'queue',  label: 'Queue',   icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'post',   label: 'Post',    icon: 'M12 5v14M5 12h14' },
  { id: 'market', label: 'Market',  icon: 'M18 20V10M12 20V4M6 20v-6' },
  { id: 'blog',   label: 'Blog',    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: 'shops',  label: 'Shops',   icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10' },
];

// ── Pin Screen ────────────────────────────────────────────────────────────────
function PinScreen({ onAuth }: { onAuth: () => void }) {
  const [digits, setDigits] = useState<string[]>([]);
  const [shake, setShake] = useState(false);

  function press(d: string) {
    if (digits.length >= 4 || shake) return;
    const next = [...digits, d];
    setDigits(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next.join('') === ADMIN_PIN) {
          onAuth();
        } else {
          setShake(true);
          setTimeout(() => { setDigits([]); setShake(false); }, 700);
        }
      }, 150);
    }
  }

  function erase() {
    if (!shake) setDigits(d => d.slice(0, -1));
  }

  const PAD = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(145deg, #FFF8F3 0%, #FFEEDD 60%, #FFF4E8 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', fontFamily: 'Outfit, sans-serif',
    }}>
      {/* Logo mark */}
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: '#F07828',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px', boxShadow: '0 6px 20px rgba(240,120,40,.30)',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <p style={{ font: '800 17px Outfit,sans-serif', color: '#1A1310', margin: '0 0 2px' }}>MyTinyverse</p>
        <p style={{ font: '400 12px Outfit,sans-serif', color: '#8B7355', margin: 0 }}>Admin Panel - Nairobi</p>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: 24, padding: '36px 32px',
        boxShadow: '0 4px 40px rgba(0,0,0,.08)', width: '100%', maxWidth: 300,
      }}>
        <p style={{ font: '600 13px Outfit,sans-serif', color: '#8B7355', textAlign: 'center', margin: '0 0 20px', letterSpacing: '.04em' }}>
          ENTER PIN
        </p>

        {/* Dot indicators */}
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 28,
          animation: shake ? 'adminShake .6s ease' : undefined,
        }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              transition: 'all .15s',
              background: i < digits.length ? '#F07828' : '#EEE9E0',
              boxShadow: i < digits.length ? '0 2px 8px rgba(240,120,40,.4)' : 'none',
              transform: i < digits.length ? 'scale(1.1)' : 'scale(1)',
            }}/>
          ))}
        </div>

        {/* Number pad */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {PAD.map((k, idx) => {
            if (k === '') return <div key={idx}/>;
            const isDel = k === 'del';
            return (
              <button
                key={k}
                onClick={() => isDel ? erase() : press(k)}
                style={{
                  height: 58, border: isDel ? 'none' : '1.5px solid #EEE9E0',
                  borderRadius: 14, background: isDel ? 'transparent' : '#FAFAF8',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font: '500 20px Outfit,sans-serif', color: isDel ? '#8B7355' : '#1A1310',
                  transition: 'background .1s, transform .08s', outline: 'none',
                }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(.94)'; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
              >
                {isDel ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6"/>
                  </svg>
                ) : k}
              </button>
            );
          })}
        </div>

        {shake && (
          <p style={{ font: '500 13px Outfit,sans-serif', color: '#E53935', textAlign: 'center', margin: '16px 0 0' }}>
            Incorrect PIN - try again
          </p>
        )}
      </div>

      <style>{`
        @keyframes adminShake {
          0%,100%{transform:translateX(0)}
          15%{transform:translateX(-10px)}
          30%{transform:translateX(10px)}
          45%{transform:translateX(-8px)}
          60%{transform:translateX(8px)}
          75%{transform:translateX(-4px)}
          90%{transform:translateX(4px)}
        }
      `}</style>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [view, setView]     = useState<AdminView>('home');

  // Stats
  const [stats, setStats]           = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Moderation
  const [modTab, setModTab]           = useState<ModTab>('pending');
  const [listings, setListings]       = useState<Listing[]>([]);
  const [modLoading, setModLoading]   = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Blog
  const [blogArticles, setBlogArticles]       = useState<Article[]>([]);
  const [blogLoading, setBlogLoading]         = useState(false);
  const [blogActionLoading, setBlogActionLoading] = useState<string | null>(null);
  const [blogDeleteConfirm, setBlogDeleteConfirm] = useState<string | null>(null);
  const [editingArticle, setEditingArticle]   = useState<Article | null>(null);
  const [isNewArticle, setIsNewArticle]       = useState(false);
  const [editorMode, setEditorMode]           = useState<BlogEdMode>('generate');
  const [saveStatus, setSaveStatus]           = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [form, setForm] = useState<Partial<Article & { tagsInput: string }>>({
    title: '', slug: '', excerpt: '', content: '', cover_image_url: '',
    meta_title: '', meta_description: '', tagsInput: '', author: 'MyTinyverse Team',
    reading_time_minutes: 5,
  });
  const [genTopic, setGenTopic]     = useState('');
  const [genKeywords, setGenKeywords] = useState('');
  const [genTone, setGenTone]       = useState<'friendly'|'professional'>('friendly');
  const [genLength, setGenLength]   = useState<'short'|'standard'|'long'>('standard');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError]     = useState('');

  // Post on behalf
  const [postForm, setPostForm] = useState({
    seller_name: '', seller_phone: '', seller_whatsapp: '',
    title: '', category: '', age_range: '', price: '', is_donation: false,
    condition: '', description: '', location: '', admin_note: '',
  });
  const [postPhotos, setPostPhotos]     = useState<File[]>([]);
  const [postPreviews, setPostPreviews] = useState<string[]>([]);
  const [postErrors, setPostErrors]     = useState<Record<string,string>>({});
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postSuccess, setPostSuccess]   = useState<{ id: string; title: string } | null>(null);
  const postFileRef = useRef<HTMLInputElement>(null);

  // Market sub-tab
  const [marketTab, setMarketTab] = useState<'categories'|'searches'|'revenue'|'expiring'>('categories');

  // Shops
  interface ShopRow { id: string; phone: string; display_name: string; profile_slug: string; neighbourhood: string | null; shop_name: string | null; shop_bio: string | null; shop_areas: string[]; is_shop: boolean; verified_shop: boolean; subscription_tier: string; subscription_expires_at: string | null; listing_count: number; created_at: string; }
  const [shops, setShops]               = useState<ShopRow[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [shopSearch, setShopSearch]     = useState('');
  const [onboardForm, setOnboardForm]   = useState({ phone: '', shop_name: '', shop_bio: '', neighbourhood: '', subscription_tier: 'free' });
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardMsg, setOnboardMsg]     = useState('');
  const [editShop, setEditShop]         = useState<ShopRow | null>(null);
  const [patchLoading, setPatchLoading] = useState(false);

  // ── API handlers (unchanged from original) ────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${ADMIN_PIN}` } });
      const data = await res.json();
      setStats(data);
    } catch { /* silent */ } finally { setStatsLoading(false); }
  }, []);

  const fetchListings = useCallback(async (status: string) => {
    setModLoading(true);
    try {
      const res = await fetch(`/api/admin/listings?status=${status}`, { headers: { 'x-admin-pin': ADMIN_PIN } });
      const data = await res.json();
      setListings(data.listings || []);
    } catch { setListings([]); } finally { setModLoading(false); }
  }, []);

  const fetchArticles = useCallback(async () => {
    setBlogLoading(true);
    try {
      const res = await fetch('/api/admin/articles', { headers: { 'x-admin-pin': ADMIN_PIN } });
      const data = await res.json();
      setBlogArticles(data.articles || []);
    } catch { setBlogArticles([]); } finally { setBlogLoading(false); }
  }, []);

  const fetchShops = useCallback(async () => {
    setShopsLoading(true);
    try {
      const res = await fetch('/api/admin/shops', { headers: { 'x-admin-pin': ADMIN_PIN } });
      const data = await res.json();
      setShops(data.shops || []);
    } catch { setShops([]); } finally { setShopsLoading(false); }
  }, []);

  useEffect(() => {
    if (authed && (view === 'home' || view === 'market')) fetchStats();
  }, [authed, view, fetchStats]);

  useEffect(() => {
    if (authed && view === 'queue') fetchListings(modTab);
  }, [authed, view, modTab, fetchListings]);

  useEffect(() => {
    if (authed && view === 'blog' && !editingArticle && !isNewArticle) fetchArticles();
  }, [authed, view, editingArticle, isNewArticle, fetchArticles]);

  useEffect(() => {
    if (authed && view === 'shops') fetchShops();
  }, [authed, view, fetchShops]);

  async function updateStatus(id: string, status: 'live' | 'rejected') {
    setActionLoading(id + status);
    try {
      await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': ADMIN_PIN },
        body: JSON.stringify({ id, status }),
      });
      await fetchListings(modTab);
      if (view === 'home') fetchStats();
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

  function openNewArticle() {
    setForm({ title:'', slug:'', excerpt:'', content:'', cover_image_url:'', meta_title:'', meta_description:'', tagsInput:'', author:'MyTinyverse Team', reading_time_minutes:5 });
    setEditingArticle(null); setIsNewArticle(true); setEditorMode('generate');
    setGenTopic(''); setGenKeywords(''); setGenError(''); setSaveStatus('idle');
  }

  function openEditArticle(article: Article) {
    setForm({ ...article, tagsInput: (article.tags || []).join(', ') });
    setEditingArticle(article); setIsNewArticle(false); setEditorMode('manual');
    setGenError(''); setSaveStatus('idle');
  }

  function closeEditor() { setEditingArticle(null); setIsNewArticle(false); fetchArticles(); }

  async function generateArticle() {
    if (!genTopic.trim()) { setGenError('Please enter a topic'); return; }
    setGenerating(true); setGenError('');
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
        title: a.title||'', slug: a.slug||'', excerpt: a.excerpt||'', content: a.content||'',
        cover_image_url: '', meta_title: a.meta_title||'', meta_description: a.meta_description||'',
        tagsInput: (a.tags||[]).join(', '), author: a.author||'MyTinyverse Team',
        reading_time_minutes: a.reading_time_minutes||5,
      });
      setEditorMode('manual');
    } catch (err) {
      setGenError((err as Error).message || 'Generation failed');
    } finally { setGenerating(false); }
  }

  async function saveArticle() {
    if (!form.title || !form.slug) { alert('Title and slug are required'); return; }
    setSaveStatus('saving');
    try {
      const payload = {
        title: form.title, slug: form.slug, excerpt: form.excerpt, content: form.content,
        cover_image_url: form.cover_image_url, meta_title: form.meta_title,
        meta_description: form.meta_description,
        tags: (form.tagsInput||'').split(',').map(t=>t.trim()).filter(Boolean),
        author: form.author, reading_time_minutes: Number(form.reading_time_minutes)||5,
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
        setForm(prev => ({ ...prev, ...data.article, tagsInput: (data.article.tags||[]).join(', ') }));
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
        setForm(prev => ({ ...prev, ...data.article, tagsInput: (data.article.tags||[]).join(', ') }));
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      alert((err as Error).message || 'Save failed');
    }
  }

  async function articleAction(id: string, action: 'submit'|'publish'|'unpublish') {
    setBlogActionLoading(id + action);
    try {
      await fetch('/api/admin/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': ADMIN_PIN },
        body: JSON.stringify({ id, action }),
      });
      await fetchArticles();
      if (editingArticle?.id === id) {
        const res = await fetch('/api/admin/articles', { headers: { 'x-admin-pin': ADMIN_PIN } });
        const data = await res.json();
        const updated = (data.articles||[]).find((a:Article) => a.id === id);
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

  async function submitOnBehalf() {
    const errors: Record<string,string> = {};
    if (!postForm.seller_name.trim())  errors.seller_name = 'Required';
    if (!postForm.seller_phone.trim()) errors.seller_phone = 'Required';
    if (!postForm.title.trim())        errors.title = 'Required';
    if (!postForm.category)            errors.category = 'Select a category';
    if (!postForm.condition)           errors.condition = 'Select a condition';
    if (!postForm.location)            errors.location = 'Select a neighbourhood';
    if (!postForm.is_donation && !postForm.price) errors.price = 'Enter a price or mark as free';
    if (Object.keys(errors).length > 0) { setPostErrors(errors); return; }

    setPostSubmitting(true); setPostErrors({});
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
        method: 'POST', headers: { 'x-admin-pin': ADMIN_PIN }, body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post listing');
      setPostSuccess(data.listing);
      setPostForm({ seller_name:'', seller_phone:'', seller_whatsapp:'', title:'', category:'', age_range:'', price:'', is_donation:false, condition:'', description:'', location:'', admin_note:'' });
      setPostPhotos([]); setPostPreviews([]);
    } catch (err) {
      setPostErrors({ _form: err instanceof Error ? err.message : 'Something went wrong' });
    } finally { setPostSubmitting(false); }
  }

  // ── PIN gate ──────────────────────────────────────────────────────────────
  if (!authed) return <PinScreen onAuth={() => setAuthed(true)} />;

  // ── Derived ───────────────────────────────────────────────────────────────
  const pendingCount = stats?.tiles?.pending_review ?? 0;

  // ── Shared style helpers ──────────────────────────────────────────────────
  const S = {
    card: { background: '#fff', borderRadius: 14, border: '1px solid #EEE9E0', overflow: 'hidden' } as React.CSSProperties,
    input: { width: '100%', padding: '10px 12px', border: '1.5px solid #E8E3DB', borderRadius: 10, font: '400 14px Outfit,sans-serif', color: '#1A1310', background: '#fff', boxSizing: 'border-box', outline: 'none' } as React.CSSProperties,
    label: { font: '600 11px Outfit,sans-serif', color: '#8B7355', textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 5, display: 'block' },
    section: { font: '700 15px Outfit,sans-serif', color: '#1A1310', margin: '0 0 14px', paddingBottom: 10, borderBottom: '1px solid #EEE9E0' } as React.CSSProperties,
  };

  function subTabBtn(active: boolean, label: string, onClick: () => void) {
    return (
      <button onClick={onClick} style={{
        padding: '7px 16px', border: 'none', borderRadius: 20,
        background: active ? '#F07828' : 'transparent',
        color: active ? '#fff' : '#5C4B3A',
        font: `${active ? '600' : '400'} 13px Outfit,sans-serif`,
        cursor: 'pointer', transition: 'all .15s',
      }}>
        {label}
      </button>
    );
  }

  // ── Signal helper for category health ────────────────────────────────────
  function signal(cr: number, views: number) {
    if (cr >= 15) return { label: 'Hot',  bg: '#E8F5E9', fg: '#2E7D32' };
    if (cr >= 7)  return { label: 'Good', bg: '#FFF8E1', fg: '#F57F17' };
    if (views > 5) return { label: 'Slow', bg: '#FFF3E0', fg: '#E65100' };
    return { label: 'New', bg: '#f5f4f2', fg: '#888' };
  }

  // ========================================================================
  // VIEW: HOME (Command Center)
  // ========================================================================
  function renderHome() {
    return (
      <div>
        {/* Priority banner */}
        {pendingCount > 0 && (
          <div style={{
            background: 'linear-gradient(90deg, #FFF4EE 0%, #FFEEDD 100%)',
            border: '1.5px solid #F07828', borderRadius: 14,
            padding: '14px 18px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F07828', flexShrink: 0, boxShadow: '0 0 0 3px rgba(240,120,40,.2)' }}/>
              <p style={{ font: '600 14px Outfit,sans-serif', color: '#B85C1A', margin: 0 }}>
                {pendingCount} listing{pendingCount > 1 ? 's' : ''} waiting for review
              </p>
            </div>
            <button
              onClick={() => setView('queue')}
              style={{ padding: '8px 18px', background: '#F07828', color: '#fff', border: 'none', borderRadius: 20, font: '600 13px Outfit,sans-serif', cursor: 'pointer' }}>
              Review now
            </button>
          </div>
        )}

        {/* KPI tiles */}
        {statsLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ background: '#fff', border: '1px solid #EEE9E0', borderRadius: 14, padding: '20px 22px', height: 90 }}>
                <div style={{ width: '60%', height: 12, background: '#f5f4f2', borderRadius: 6, marginBottom: 10 }}/>
                <div style={{ width: '40%', height: 24, background: '#f5f4f2', borderRadius: 6 }}/>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Revenue', value: fmtKES(stats.tiles.total_revenue), sub: `KES ${(stats.tiles.total_revenue / Math.max(stats.tiles.total_listings||1, 1)).toFixed(0)} avg`, accent: false },
              { label: 'Live Listings', value: stats.tiles.live_listings, sub: `${stats.tiles.approval_rate?.toFixed(0)||0}% approval rate`, accent: true },
              { label: 'Expiring Soon', value: stats.expiring_soon?.length || 0, sub: 'Within 7 days', accent: (stats.expiring_soon?.length||0) > 0 },
              { label: 'Searches (30d)', value: stats.top_searches?.length || 0, sub: `${stats.demand_gaps?.length||0} demand gaps`, accent: false },
            ].map(tile => (
              <div key={tile.label} style={{
                ...S.card, padding: '18px 20px',
              }}>
                <p style={{ font: '500 11px Outfit,sans-serif', color: '#8B7355', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.07em' }}>{tile.label}</p>
                <p style={{ font: '700 26px Outfit,sans-serif', color: tile.accent ? '#F07828' : '#1A1310', margin: '0 0 4px' }}>{tile.value}</p>
                <p style={{ font: '400 11px Outfit,sans-serif', color: '#B09070', margin: 0 }}>{tile.sub}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          <button onClick={() => setView('queue')} style={{
            flex: 1, minWidth: 120, padding: '12px 16px', background: '#F07828', color: '#fff',
            border: 'none', borderRadius: 12, font: '600 14px Outfit,sans-serif', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Review Queue {pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
          <button onClick={() => { setView('post'); setPostSuccess(null); }} style={{
            flex: 1, minWidth: 120, padding: '12px 16px', background: '#7DC243', color: '#fff',
            border: 'none', borderRadius: 12, font: '600 14px Outfit,sans-serif', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Post Listing
          </button>
          <a href={`https://wa.me/${WA_ADMIN}`} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, minWidth: 120, padding: '12px 16px', background: '#25D366', color: '#fff',
            border: 'none', borderRadius: 12, font: '600 14px Outfit,sans-serif', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d={WA_PATH}/></svg>
            Open CRM
          </a>
        </div>

        {/* Recent submissions */}
        {stats?.recent_pending && stats.recent_pending.length > 0 && (
          <>
            <h3 style={S.section}>Recent Submissions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, ...S.card }}>
              {stats.recent_pending.slice(0, 6).map((l, i) => (
                <div key={l.id || i} style={{
                  padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
                  borderBottom: i < Math.min(stats.recent_pending.length, 6) - 1 ? '1px solid #F5F0E8' : 'none',
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#FFF4EE', flexShrink: 0, overflow: 'hidden' }}>
                    {l.images?.[0] ? (
                      <img src={l.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F07828" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9l4-4 4 4 4-4 4 4"/></svg>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ font: '600 14px Outfit,sans-serif', color: '#1A1310', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title || 'Untitled'}</p>
                    <p style={{ font: '400 12px Outfit,sans-serif', color: '#8B7355', margin: 0 }}>{categoryLabel(l.category||'')} - {l.location || 'Unknown area'}</p>
                  </div>
                  <div style={{ font: '600 13px Outfit,sans-serif', color: '#F07828', flexShrink: 0 }}>
                    {(l.price ?? 1) === 0 ? 'Free' : fmtKES(l.price || 0)}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setView('queue')} style={{
              width: '100%', padding: '12px', background: '#FAFAF8', border: '1.5px solid #EEE9E0',
              borderRadius: 12, marginTop: 10, font: '500 13px Outfit,sans-serif', color: '#5C4B3A',
              cursor: 'pointer',
            }}>
              View all pending - {pendingCount} total
            </button>
          </>
        )}

        {/* Live site link */}
        <div style={{ marginTop: 24, padding: '14px 18px', background: '#F7F4EF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ font: '400 13px Outfit,sans-serif', color: '#5C4B3A', margin: 0 }}>View the live marketplace</p>
          <Link href="/" target="_blank" style={{ font: '600 13px Outfit,sans-serif', color: '#F07828', textDecoration: 'none' }}>Open site</Link>
        </div>
      </div>
    );
  }

  // ========================================================================
  // VIEW: QUEUE (Moderation)
  // ========================================================================
  function renderQueue() {
    const tabBg = (t: ModTab) => modTab === t;
    return (
      <div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#F7F4EF', borderRadius: 12, padding: 5 }}>
          {(['pending','live','rejected'] as ModTab[]).map(t => (
            <button key={t} onClick={() => setModTab(t)} style={{
              flex: 1, padding: '8px 12px', border: 'none', borderRadius: 8,
              background: tabBg(t) ? '#fff' : 'transparent',
              color: tabBg(t) ? '#F07828' : '#5C4B3A',
              font: `${tabBg(t) ? '600' : '400'} 13px Outfit,sans-serif`,
              cursor: 'pointer', transition: 'all .15s',
              boxShadow: tabBg(t) ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
              textTransform: 'capitalize',
            }}>
              {t}{t === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
            </button>
          ))}
        </div>

        {modLoading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #F07828', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}/>
          </div>
        )}

        {!modLoading && listings.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#8B7355' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C8B89A" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4"/>
            </svg>
            <p style={{ font: '500 15px Outfit,sans-serif', margin: 0 }}>No {modTab} listings</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {listings.map(listing => {
            const isLoading = actionLoading?.startsWith(listing.id);
            const waNum = listing.seller_whatsapp || listing.seller_phone || '';
            const waMsg = `Hi ${listing.seller_name||'there'}, this is about your listing "${listing.title||''}" on MyTinyverse.`;
            const tierCost = listing.fee_tier === 'starter' ? 99 : listing.fee_tier === 'standard' ? 299 : listing.fee_tier === 'premium' ? 499 : 0;

            return (
              <div key={listing.id} style={{ ...S.card }}>
                {/* Top: photo + details */}
                <div style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {/* Thumbnail */}
                  <div style={{ width: 72, height: 72, borderRadius: 10, background: '#FFF4EE', flexShrink: 0, overflow: 'hidden' }}>
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8B89A" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ font: '600 15px Outfit,sans-serif', color: '#1A1310', margin: '0 0 4px', lineHeight: 1.3 }}>{listing.title}</p>
                    <p style={{ font: '400 12px Outfit,sans-serif', color: '#8B7355', margin: '0 0 6px' }}>
                      {categoryLabel(listing.category||'')} - {listing.condition?.replace('_',' ')} - {listing.location}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ font: '700 15px Outfit,sans-serif', color: listing.price === 0 ? '#7DC243' : '#F07828' }}>
                        {listing.price === 0 ? 'Free donation' : fmtKES(listing.price||0)}
                      </span>
                      {listing.fee_tier && (
                        <span style={{ font: '500 11px Outfit,sans-serif', color: '#8B7355', background: '#F7F4EF', padding: '2px 8px', borderRadius: 20 }}>
                          {listing.fee_tier}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* M-Pesa verification strip */}
                {modTab === 'pending' && listing.mpesa_code && (
                  <div style={{ margin: '0 18px 14px', background: '#FFF8E1', border: '1px solid #FFECB3', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ font: '500 10px Outfit,sans-serif', color: '#8B7355', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '.06em' }}>M-Pesa Code</p>
                        <p style={{ font: '700 16px monospace', color: '#1A1310', margin: 0, letterSpacing: '.1em' }}>{listing.mpesa_code}</p>
                      </div>
                      {tierCost > 0 && (
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ font: '500 10px Outfit,sans-serif', color: '#8B7355', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Expected</p>
                          <p style={{ font: '700 16px Outfit,sans-serif', color: '#F57F17', margin: 0 }}>KES {tierCost}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Seller + actions */}
                <div style={{ padding: '12px 18px', background: '#FAFAF8', borderTop: '1px solid #F5F0E8', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <p style={{ font: '500 13px Outfit,sans-serif', color: '#1A1310', margin: 0 }}>{listing.seller_name || 'Unknown seller'}</p>
                    <p style={{ font: '400 11px Outfit,sans-serif', color: '#8B7355', margin: 0 }}>{listing.seller_phone || ''}</p>
                  </div>

                  {/* WA quick-dial */}
                  {waNum && (
                    <a
                      href={`https://wa.me/${waNum.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(waMsg)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: '#E8F5E5', border: '1px solid #25D36660', borderRadius: 8, textDecoration: 'none', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d={WA_PATH}/></svg>
                      <span style={{ font: '600 12px Outfit,sans-serif', color: '#1B7A3C' }}>Chat</span>
                    </a>
                  )}

                  {/* Moderation actions */}
                  {modTab === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(listing.id, 'live')}
                        disabled={!!isLoading}
                        style={{ padding: '7px 14px', background: '#7DC243', color: '#fff', border: 'none', borderRadius: 8, font: '600 12px Outfit,sans-serif', cursor: 'pointer', opacity: isLoading ? .6 : 1 }}>
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(listing.id, 'rejected')}
                        disabled={!!isLoading}
                        style={{ padding: '7px 14px', background: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80', borderRadius: 8, font: '600 12px Outfit,sans-serif', cursor: 'pointer', opacity: isLoading ? .6 : 1 }}>
                        Reject
                      </button>
                    </>
                  )}
                  {modTab === 'live' && (
                    <button
                      onClick={() => updateStatus(listing.id, 'rejected')}
                      disabled={!!isLoading}
                      style={{ padding: '7px 14px', background: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80', borderRadius: 8, font: '600 12px Outfit,sans-serif', cursor: 'pointer', opacity: isLoading ? .6 : 1 }}>
                      Remove
                    </button>
                  )}
                  {modTab === 'rejected' && (
                    <button
                      onClick={() => updateStatus(listing.id, 'live')}
                      disabled={!!isLoading}
                      style={{ padding: '7px 14px', background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', borderRadius: 8, font: '600 12px Outfit,sans-serif', cursor: 'pointer', opacity: isLoading ? .6 : 1 }}>
                      Re-approve
                    </button>
                  )}
                  {deleteConfirm === listing.id ? (
                    <>
                      <button onClick={() => deleteListing(listing.id)} style={{ padding: '7px 12px', background: '#E53935', color: '#fff', border: 'none', borderRadius: 8, font: '600 12px Outfit,sans-serif', cursor: 'pointer' }}>Confirm</button>
                      <button onClick={() => setDeleteConfirm(null)} style={{ padding: '7px 10px', background: 'none', border: 'none', font: '400 12px Outfit,sans-serif', color: '#8B7355', cursor: 'pointer' }}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(listing.id)} style={{ padding: '7px 10px', background: 'none', border: 'none', font: '400 12px Outfit,sans-serif', color: '#B09070', cursor: 'pointer' }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ========================================================================
  // VIEW: POST (Post on behalf)
  // ========================================================================
  function renderPost() {
    if (postSuccess) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#E8F5E9', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 style={{ font: '700 20px Outfit,sans-serif', color: '#1A1310', margin: '0 0 8px' }}>Listing created</h2>
          <p style={{ font: '400 14px Outfit,sans-serif', color: '#8B7355', margin: '0 0 28px' }}>{postSuccess.title}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setPostSuccess(null); }} style={{ padding: '10px 24px', background: '#F07828', color: '#fff', border: 'none', borderRadius: 20, font: '600 14px Outfit,sans-serif', cursor: 'pointer' }}>
              Post another
            </button>
            <button onClick={() => setView('queue')} style={{ padding: '10px 24px', background: '#F7F4EF', color: '#5C4B3A', border: '1.5px solid #EEE9E0', borderRadius: 20, font: '600 14px Outfit,sans-serif', cursor: 'pointer' }}>
              Go to queue
            </button>
          </div>
        </div>
      );
    }

    function pf<K extends keyof typeof postForm>(k: K, v: (typeof postForm)[K]) {
      setPostForm(prev => ({ ...prev, [k]: v }));
      if (postErrors[k as string]) setPostErrors(prev => { const n={...prev}; delete n[k as string]; return n; });
    }

    const fErr = (k: string) => postErrors[k] ? (
      <span style={{ font: '400 11px Outfit,sans-serif', color: '#E53935', marginTop: 3, display: 'block' }}>{postErrors[k]}</span>
    ) : null;

    return (
      <div>
        <h3 style={S.section}>Post Listing on Behalf of Seller</h3>

        {postErrors._form && (
          <div style={{ background: '#FEECEC', border: '1px solid #FFCDD2', borderRadius: 10, padding: '12px 16px', marginBottom: 20, font: '400 13px Outfit,sans-serif', color: '#B71C1C' }}>
            {postErrors._form}
          </div>
        )}

        {/* Seller info */}
        <div style={{ ...S.card, padding: '18px', marginBottom: 16 }}>
          <p style={{ font: '600 13px Outfit,sans-serif', color: '#1A1310', margin: '0 0 14px' }}>Seller Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={S.label}>Name *</label>
              <input style={{ ...S.input, borderColor: postErrors.seller_name ? '#E53935' : '#E8E3DB' }}
                value={postForm.seller_name} onChange={e => pf('seller_name', e.target.value)} placeholder="Parent name"/>
              {fErr('seller_name')}
            </div>
            <div>
              <label style={S.label}>Phone *</label>
              <input style={{ ...S.input, borderColor: postErrors.seller_phone ? '#E53935' : '#E8E3DB' }}
                value={postForm.seller_phone} onChange={e => pf('seller_phone', e.target.value)} placeholder="0712 345 678"/>
              {fErr('seller_phone')}
            </div>
            <div>
              <label style={S.label}>WhatsApp (if different)</label>
              <input style={S.input} value={postForm.seller_whatsapp} onChange={e => pf('seller_whatsapp', e.target.value)} placeholder="0712 345 678"/>
            </div>
          </div>
        </div>

        {/* Item info */}
        <div style={{ ...S.card, padding: '18px', marginBottom: 16 }}>
          <p style={{ font: '600 13px Outfit,sans-serif', color: '#1A1310', margin: '0 0 14px' }}>Item Details</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={S.label}>Title *</label>
              <input style={{ ...S.input, borderColor: postErrors.title ? '#E53935' : '#E8E3DB' }}
                value={postForm.title} onChange={e => pf('title', e.target.value)} placeholder="e.g. Thule Sport stroller, great condition"/>
              {fErr('title')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              <div>
                <label style={S.label}>Category *</label>
                <select style={{ ...S.input, borderColor: postErrors.category ? '#E53935' : '#E8E3DB' }}
                  value={postForm.category} onChange={e => pf('category', e.target.value)}>
                  <option value="">Select...</option>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                {fErr('category')}
              </div>
              <div>
                <label style={S.label}>Age range</label>
                <select style={S.input} value={postForm.age_range} onChange={e => pf('age_range', e.target.value)}>
                  <option value="">Any age</option>
                  {AGE_RANGES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Condition *</label>
                <select style={{ ...S.input, borderColor: postErrors.condition ? '#E53935' : '#E8E3DB' }}
                  value={postForm.condition} onChange={e => pf('condition', e.target.value)}>
                  <option value="">Select...</option>
                  {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                {fErr('condition')}
              </div>
              <div>
                <label style={S.label}>Neighbourhood *</label>
                <select style={{ ...S.input, borderColor: postErrors.location ? '#E53935' : '#E8E3DB' }}
                  value={postForm.location} onChange={e => pf('location', e.target.value)}>
                  <option value="">Select...</option>
                  {NAIROBI_HOODS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                {fErr('location')}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={S.label}>Price (KES) *</label>
                <input style={{ ...S.input, borderColor: postErrors.price ? '#E53935' : '#E8E3DB' }}
                  type="number" min={0} value={postForm.price} onChange={e => pf('price', e.target.value)}
                  disabled={postForm.is_donation} placeholder="e.g. 3500"/>
                {fErr('price')}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingBottom: 10 }}>
                <input type="checkbox" checked={postForm.is_donation} onChange={e => pf('is_donation', e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#7DC243' }}/>
                <span style={{ font: '500 13px Outfit,sans-serif', color: '#1A1310' }}>Free / Donation</span>
              </label>
            </div>
            <div>
              <label style={S.label}>Description</label>
              <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }}
                value={postForm.description} onChange={e => pf('description', e.target.value)}
                placeholder="Condition details, what's included, any defects..."/>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div style={{ ...S.card, padding: '18px', marginBottom: 16 }}>
          <p style={{ font: '600 13px Outfit,sans-serif', color: '#1A1310', margin: '0 0 14px' }}>Photos</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {postPreviews.map((p, i) => (
              <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 10, overflow: 'hidden' }}>
                <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                <button onClick={() => {
                  setPostPhotos(arr => arr.filter((_,j) => j !== i));
                  setPostPreviews(arr => arr.filter((_,j) => j !== i));
                }} style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, border: 'none', borderRadius: '50%', background: 'rgba(0,0,0,.55)', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
              </div>
            ))}
            {postPhotos.length < 5 && (
              <button onClick={() => postFileRef.current?.click()} style={{
                width: 72, height: 72, border: '2px dashed #C8B89A', borderRadius: 10,
                background: '#FAFAF8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8B89A" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                <span style={{ font: '400 10px Outfit,sans-serif', color: '#B09070' }}>Add</span>
              </button>
            )}
            <input ref={postFileRef} type="file" accept="image/*" multiple hidden onChange={e => {
              const files = Array.from(e.target.files || []).slice(0, 5 - postPhotos.length);
              setPostPhotos(p => [...p, ...files]);
              files.forEach(f => {
                const r = new FileReader();
                r.onload = ev => setPostPreviews(p => [...p, ev.target?.result as string]);
                r.readAsDataURL(f);
              });
              e.target.value = '';
            }}/>
          </div>
        </div>

        {/* Admin note */}
        <div style={{ ...S.card, padding: '18px', marginBottom: 20 }}>
          <label style={S.label}>Admin Note (internal only)</label>
          <input style={S.input} value={postForm.admin_note} onChange={e => pf('admin_note', e.target.value)} placeholder="e.g. Received via WhatsApp, photos sent by seller"/>
        </div>

        <button
          onClick={submitOnBehalf}
          disabled={postSubmitting}
          style={{
            width: '100%', padding: '14px', background: postSubmitting ? '#B09070' : '#F07828',
            color: '#fff', border: 'none', borderRadius: 12, font: '700 15px Outfit,sans-serif',
            cursor: postSubmitting ? 'not-allowed' : 'pointer', transition: 'background .15s',
          }}>
          {postSubmitting ? 'Posting...' : 'Post Listing'}
        </button>
      </div>
    );
  }

  // ========================================================================
  // VIEW: MARKET (Intelligence)
  // ========================================================================
  function renderMarket() {
    return (
      <div>
        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#F7F4EF', borderRadius: 12, padding: 5, overflowX: 'auto' }}>
          {(['categories','searches','revenue','expiring'] as const).map(t => (
            subTabBtn(marketTab === t, t.charAt(0).toUpperCase() + t.slice(1), () => setMarketTab(t))
          ))}
        </div>

        {statsLoading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #F07828', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}/>
          </div>
        )}

        {!statsLoading && stats && (
          <>
            {/* Categories tab */}
            {marketTab === 'categories' && (
              <div>
                <h3 style={S.section}>Category Health</h3>
                <div style={{ overflowX: 'auto', ...S.card }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', font: '400 13px Outfit,sans-serif' }}>
                    <thead>
                      <tr style={{ background: '#FAFAF8' }}>
                        {['Category','Live','Views','WA Clicks','Click Rate','Avg Price','Signal'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', font: '600 11px Outfit,sans-serif', color: '#8B7355', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid #EEE9E0', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.category_stats?.map((row, i) => {
                        const sig = signal(row.click_rate, row.views);
                        return (
                          <tr key={row.category} style={{ borderBottom: '1px solid #F5F0E8' }}>
                            <td style={{ padding: '12px 14px', font: '500 13px Outfit,sans-serif', color: '#1A1310' }}>{categoryLabel(row.category)}</td>
                            <td style={{ padding: '12px 14px', color: '#5C4B3A' }}>{row.live}</td>
                            <td style={{ padding: '12px 14px', color: '#5C4B3A' }}>{row.views?.toLocaleString()}</td>
                            <td style={{ padding: '12px 14px', color: '#5C4B3A' }}>{row.whatsapp_clicks}</td>
                            <td style={{ padding: '12px 14px', color: '#5C4B3A' }}>{row.click_rate?.toFixed(1)}%</td>
                            <td style={{ padding: '12px 14px', color: '#5C4B3A' }}>{fmtKES(Math.round(row.avg_price||0))}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ display: 'inline-block', background: sig.bg, color: sig.fg, font: '600 11px Outfit,sans-serif', padding: '3px 10px', borderRadius: 20 }}>{sig.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Searches tab */}
            {marketTab === 'searches' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                <div>
                  <h3 style={S.section}>Top Searches (30 days)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1, ...S.card }}>
                    {stats.top_searches?.slice(0,15).map((s, i) => (
                      <div key={s.query} style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < Math.min(stats.top_searches.length,15)-1 ? '1px solid #F5F0E8' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ font: '600 11px Outfit,sans-serif', color: '#B09070', width: 20 }}>{i+1}</span>
                          <span style={{ font: '400 13px Outfit,sans-serif', color: '#1A1310' }}>{s.query}</span>
                        </div>
                        <span style={{ font: '600 13px Outfit,sans-serif', color: '#F07828' }}>{s.count}</span>
                      </div>
                    ))}
                    {(!stats.top_searches || stats.top_searches.length === 0) && (
                      <p style={{ padding: 20, font: '400 13px Outfit,sans-serif', color: '#8B7355', margin: 0, textAlign: 'center' }}>No search data yet</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 style={S.section}>Demand Gaps (zero results)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1, ...S.card }}>
                    {stats.demand_gaps?.slice(0,15).map((s, i) => (
                      <div key={s.query} style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < Math.min(stats.demand_gaps.length,15)-1 ? '1px solid #F5F0E8' : 'none' }}>
                        <span style={{ font: '400 13px Outfit,sans-serif', color: '#1A1310' }}>{s.query}</span>
                        <span style={{ font: '600 12px Outfit,sans-serif', color: '#E65100', background: '#FFF3E0', padding: '2px 8px', borderRadius: 20 }}>{s.count}x</span>
                      </div>
                    ))}
                    {(!stats.demand_gaps || stats.demand_gaps.length === 0) && (
                      <p style={{ padding: 20, font: '400 13px Outfit,sans-serif', color: '#8B7355', margin: 0, textAlign: 'center' }}>No gap data yet</p>
                    )}
                  </div>
                  <p style={{ font: '400 11px Outfit,sans-serif', color: '#B09070', margin: '10px 4px 0' }}>Searches with no matching listings - sourcing opportunities</p>
                </div>
              </div>
            )}

            {/* Revenue tab */}
            {marketTab === 'revenue' && (
              <div>
                {/* Monthly bar chart */}
                <h3 style={S.section}>Revenue by Month</h3>
                {stats.revenue_by_month?.length > 0 ? (
                  <div style={{ ...S.card, padding: '18px', marginBottom: 20 }}>
                    <div style={{ overflowX: 'auto' }}>
                      <svg width={Math.max((stats.revenue_by_month.length * 48), 300)} height={130} style={{ display: 'block' }}>
                        {(() => {
                          const max = Math.max(...stats.revenue_by_month.map(d => d.revenue), 1);
                          return stats.revenue_by_month.map((d, i) => {
                            const barH = Math.max(4, Math.round((d.revenue / max) * 90));
                            const x = i * 48;
                            return (
                              <g key={d.month}>
                                <rect x={x+4} y={96-barH} width={36} height={barH} fill={barH > 4 ? '#F07828' : '#EEE9E0'} rx={5}/>
                                {d.revenue > 0 && (
                                  <text x={x+22} y={91-barH} textAnchor="middle" style={{ font: '500 9px Outfit,sans-serif', fill: '#8B7355' }}>
                                    {d.revenue >= 1000 ? `${(d.revenue/1000).toFixed(0)}k` : d.revenue}
                                  </text>
                                )}
                                <text x={x+22} y={116} textAnchor="middle" style={{ font: '400 10px Outfit,sans-serif', fill: '#8B7355' }}>
                                  {fmtMonth(d.month)}
                                </text>
                              </g>
                            );
                          });
                        })()}
                      </svg>
                    </div>
                    <div style={{ marginTop: 10, padding: '12px 0 0', borderTop: '1px solid #F5F0E8', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ font: '400 12px Outfit,sans-serif', color: '#8B7355' }}>Total revenue</span>
                      <span style={{ font: '700 16px Outfit,sans-serif', color: '#F07828' }}>{fmtKES(stats.tiles.total_revenue)}</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#8B7355', font: '400 13px Outfit,sans-serif' }}>No revenue data yet</p>
                )}

                {/* Tier breakdown */}
                <h3 style={S.section}>Revenue by Tier</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, ...S.card }}>
                  {stats.revenue_by_tier?.map((r, i) => (
                    <div key={r.tier} style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < stats.revenue_by_tier.length-1 ? '1px solid #F5F0E8' : 'none' }}>
                      <span style={{ font: '400 14px Outfit,sans-serif', color: '#1A1310' }}>{tierLabel(r.tier)}</span>
                      <span style={{ font: '700 15px Outfit,sans-serif', color: '#F07828' }}>{fmtKES(r.revenue)}</span>
                    </div>
                  ))}
                  {(!stats.revenue_by_tier || stats.revenue_by_tier.length === 0) && (
                    <p style={{ padding: 20, font: '400 13px Outfit,sans-serif', color: '#8B7355', margin: 0, textAlign: 'center' }}>No tier data yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Expiring tab */}
            {marketTab === 'expiring' && (
              <div>
                <h3 style={S.section}>Expiring Within 7 Days ({stats.expiring_soon?.length || 0})</h3>
                {stats.expiring_soon?.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 48, color: '#8B7355' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C8B89A" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px' }}>
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/>
                    </svg>
                    <p style={{ font: '500 15px Outfit,sans-serif', margin: 0 }}>All clear - no listings expiring soon</p>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.expiring_soon?.map(l => {
                    const days = l.expires_at ? daysUntil(l.expires_at) : 99;
                    return (
                      <div key={l.id} style={{ ...S.card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: '#FFF4EE', flexShrink: 0, overflow: 'hidden' }}>
                          {l.images?.[0] ? <img src={l.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : null}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ font: '500 14px Outfit,sans-serif', color: '#1A1310', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</p>
                          <p style={{ font: '400 12px Outfit,sans-serif', color: '#8B7355', margin: 0 }}>{l.seller_name} - {l.location}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ font: '700 13px Outfit,sans-serif', color: days <= 2 ? '#E53935' : '#F57F17', display: 'block' }}>{days}d left</span>
                          {l.expires_at && <span style={{ font: '400 11px Outfit,sans-serif', color: '#B09070' }}>{fmtDate(l.expires_at)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {!statsLoading && !stats && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <button onClick={fetchStats} style={{ padding: '10px 24px', background: '#F07828', color: '#fff', border: 'none', borderRadius: 20, font: '600 14px Outfit,sans-serif', cursor: 'pointer' }}>Load data</button>
          </div>
        )}
      </div>
    );
  }

  // ========================================================================
  // VIEW: SHOPS (B2B2C shop management)
  // ========================================================================
  function renderShops() {
    const NAIROBI_HOODS_SHOPS = ['Westlands','Kilimani','Karen','Lavington','Runda','Muthaiga','Parklands','Langata','Upperhill','Kileleshwa','Embakasi','Kasarani','Ruaka','Kikuyu','Thika Road','Eastleigh','Rongai','Kitengela'];
    const TIERS = ['free','starter','pro'];
    const tierColor = (t: string) => t === 'pro' ? '#7DC243' : t === 'starter' ? '#F07828' : '#8B7355';
    const tierBg    = (t: string) => t === 'pro' ? '#EDF7E2' : t === 'starter' ? '#FEF3E8' : '#F5F0E8';

    const filtered = shops.filter(s => {
      const q = shopSearch.toLowerCase();
      return !q || (s.shop_name || s.display_name).toLowerCase().includes(q) || (s.neighbourhood || '').toLowerCase().includes(q) || s.phone.includes(q);
    });

    async function handleOnboard(e: React.FormEvent) {
      e.preventDefault();
      if (!onboardForm.phone || !onboardForm.shop_name) return;
      setOnboardLoading(true); setOnboardMsg('');
      try {
        const res = await fetch('/api/admin/shops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-pin': ADMIN_PIN },
          body: JSON.stringify(onboardForm),
        });
        const data = await res.json();
        if (res.ok) {
          setOnboardMsg(`Shop ${data.action === 'promoted' ? 'promoted' : 'created'} successfully.`);
          setOnboardForm({ phone: '', shop_name: '', shop_bio: '', neighbourhood: '', subscription_tier: 'free' });
          fetchShops();
        } else {
          setOnboardMsg(`Error: ${data.error}`);
        }
      } catch { setOnboardMsg('Network error.'); } finally { setOnboardLoading(false); }
    }

    async function handlePatch(id: string, patch: Record<string, unknown>) {
      setPatchLoading(true);
      try {
        const res = await fetch('/api/admin/shops', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-pin': ADMIN_PIN },
          body: JSON.stringify({ id, ...patch }),
        });
        if (res.ok) { setEditShop(null); fetchShops(); }
      } finally { setPatchLoading(false); }
    }

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ font: '700 22px Outfit,sans-serif', color: '#1A1310', margin: '0 0 4px' }}>Shop Management</h1>
            <p style={{ font: '400 13px Outfit,sans-serif', color: '#8B7355', margin: 0 }}>Onboard and manage B2B2C store profiles</p>
          </div>
          <span style={{ background: '#FEF3E8', border: '1.5px solid #F07828', borderRadius: 20, padding: '4px 12px', font: '600 13px Outfit,sans-serif', color: '#F07828' }}>
            {shops.length} shop{shops.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Onboard new shop */}
        <div style={{ background: '#fff', border: '1.5px solid #EEE9E0', borderRadius: 16, padding: '24px', marginBottom: 28 }}>
          <h2 style={{ font: '700 16px Outfit,sans-serif', color: '#1A1310', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Onboard new shop
          </h2>
          <form onSubmit={handleOnboard}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', font: '500 12px Outfit,sans-serif', color: '#8B7355', marginBottom: 5 }}>Phone (required)</label>
                <input
                  type="text" placeholder="0712345678"
                  value={onboardForm.phone}
                  onChange={e => setOnboardForm(f => ({ ...f, phone: e.target.value }))}
                  style={{ width: '100%', height: 38, border: '1.5px solid #EEE9E0', borderRadius: 8, padding: '0 12px', font: '400 14px Outfit,sans-serif', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', font: '500 12px Outfit,sans-serif', color: '#8B7355', marginBottom: 5 }}>Shop name (required)</label>
                <input
                  type="text" placeholder="e.g. Tiny Treasures Westlands"
                  value={onboardForm.shop_name}
                  onChange={e => setOnboardForm(f => ({ ...f, shop_name: e.target.value }))}
                  style={{ width: '100%', height: 38, border: '1.5px solid #EEE9E0', borderRadius: 8, padding: '0 12px', font: '400 14px Outfit,sans-serif', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', font: '500 12px Outfit,sans-serif', color: '#8B7355', marginBottom: 5 }}>Neighbourhood</label>
                <select
                  value={onboardForm.neighbourhood}
                  onChange={e => setOnboardForm(f => ({ ...f, neighbourhood: e.target.value }))}
                  style={{ width: '100%', height: 38, border: '1.5px solid #EEE9E0', borderRadius: 8, padding: '0 12px', font: '400 14px Outfit,sans-serif', boxSizing: 'border-box' }}
                >
                  <option value="">Select area</option>
                  {NAIROBI_HOODS_SHOPS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', font: '500 12px Outfit,sans-serif', color: '#8B7355', marginBottom: 5 }}>Subscription tier</label>
                <select
                  value={onboardForm.subscription_tier}
                  onChange={e => setOnboardForm(f => ({ ...f, subscription_tier: e.target.value }))}
                  style={{ width: '100%', height: 38, border: '1.5px solid #EEE9E0', borderRadius: 8, padding: '0 12px', font: '400 14px Outfit,sans-serif', boxSizing: 'border-box' }}
                >
                  {TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', font: '500 12px Outfit,sans-serif', color: '#8B7355', marginBottom: 5 }}>Shop bio</label>
              <input
                type="text" placeholder="One-line shop description"
                value={onboardForm.shop_bio}
                onChange={e => setOnboardForm(f => ({ ...f, shop_bio: e.target.value }))}
                style={{ width: '100%', height: 38, border: '1.5px solid #EEE9E0', borderRadius: 8, padding: '0 12px', font: '400 14px Outfit,sans-serif', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="submit" disabled={onboardLoading}
                style={{ padding: '8px 20px', background: '#F07828', color: '#fff', border: 'none', borderRadius: 8, font: '600 13px Outfit,sans-serif', cursor: 'pointer' }}>
                {onboardLoading ? 'Onboarding...' : 'Onboard shop'}
              </button>
              {onboardMsg && (
                <span style={{ font: '500 13px Outfit,sans-serif', color: onboardMsg.startsWith('Error') ? '#E53935' : '#7DC243' }}>
                  {onboardMsg}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B7355', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search" placeholder="Search shops by name, phone or area..."
            value={shopSearch}
            onChange={e => setShopSearch(e.target.value)}
            style={{ width: '100%', height: 38, border: '1.5px solid #EEE9E0', borderRadius: 8, padding: '0 12px 0 36px', font: '400 14px Outfit,sans-serif', boxSizing: 'border-box' }}
          />
        </div>

        {/* Shop list */}
        {shopsLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#8B7355', font: '400 14px Outfit,sans-serif' }}>Loading shops...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#8B7355', font: '400 14px Outfit,sans-serif' }}>
            {shopSearch ? 'No shops matching your search.' : 'No shops onboarded yet.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(shop => {
              const name = shop.shop_name || shop.display_name;
              const isEditing = editShop?.id === shop.id;
              return (
                <div key={shop.id} style={{ background: '#fff', border: `1.5px solid ${isEditing ? '#F07828' : '#EEE9E0'}`, borderRadius: 14, padding: 16, transition: 'border-color .15s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ font: '700 15px Outfit,sans-serif', color: '#1A1310' }}>{name}</span>
                        {shop.verified_shop && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#EDF7E2', borderRadius: 20, padding: '2px 8px', font: '600 11px Outfit,sans-serif', color: '#7DC243' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-.45 3.31 3.745 3.745 0 01-3.312.45 3.745 3.745 0 01-3.068 1.59 3.745 3.745 0 01-3.068-1.59 3.745 3.745 0 01-3.31-.45 3.745 3.745 0 01-.45-3.31A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 01.45-3.31 3.745 3.745 0 013.312-.45 3.745 3.745 0 013.068-1.59 3.745 3.745 0 013.068 1.59 3.745 3.745 0 013.31.45 3.745 3.745 0 01.45 3.31A3.745 3.745 0 0121 12z"/>
                            </svg>
                            Verified
                          </span>
                        )}
                        <span style={{ background: tierBg(shop.subscription_tier), borderRadius: 20, padding: '2px 8px', font: '600 11px Outfit,sans-serif', color: tierColor(shop.subscription_tier) }}>
                          {shop.subscription_tier.charAt(0).toUpperCase() + shop.subscription_tier.slice(1)}
                        </span>
                        {shop.listing_count > 0 && (
                          <span style={{ font: '500 12px Outfit,sans-serif', color: '#7DC243' }}>{shop.listing_count} items</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 12, font: '400 12px Outfit,sans-serif', color: '#8B7355' }}>
                        {shop.neighbourhood && <span>{shop.neighbourhood}</span>}
                        <span>{shop.phone}</span>
                        <Link href={`/sellers/${shop.profile_slug}`} target="_blank" style={{ color: '#F07828', textDecoration: 'none' }}>View profile</Link>
                        <a href={`https://wa.me/${shop.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>WhatsApp</a>
                      </div>
                      {shop.shop_bio && <p style={{ font: '400 12px/1.5 Outfit,sans-serif', color: '#666', margin: '6px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{shop.shop_bio}</p>}
                    </div>
                    <button
                      onClick={() => setEditShop(isEditing ? null : shop)}
                      style={{ padding: '6px 14px', background: isEditing ? '#F07828' : 'transparent', color: isEditing ? '#fff' : '#8B7355', border: `1.5px solid ${isEditing ? '#F07828' : '#EEE9E0'}`, borderRadius: 8, font: '600 12px Outfit,sans-serif', cursor: 'pointer', flexShrink: 0 }}
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {/* Edit panel */}
                  {isEditing && editShop && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #EEE9E0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label style={{ display: 'block', font: '500 11px Outfit,sans-serif', color: '#8B7355', marginBottom: 4 }}>Shop name</label>
                          <input type="text" value={editShop.shop_name || ''} onChange={e => setEditShop(s => s ? ({ ...s, shop_name: e.target.value }) : s)}
                            style={{ width: '100%', height: 34, border: '1.5px solid #EEE9E0', borderRadius: 7, padding: '0 10px', font: '400 13px Outfit,sans-serif', boxSizing: 'border-box' }}/>
                        </div>
                        <div>
                          <label style={{ display: 'block', font: '500 11px Outfit,sans-serif', color: '#8B7355', marginBottom: 4 }}>Neighbourhood</label>
                          <select value={editShop.neighbourhood || ''} onChange={e => setEditShop(s => s ? ({ ...s, neighbourhood: e.target.value }) : s)}
                            style={{ width: '100%', height: 34, border: '1.5px solid #EEE9E0', borderRadius: 7, padding: '0 10px', font: '400 13px Outfit,sans-serif', boxSizing: 'border-box' }}>
                            <option value="">Select area</option>
                            {NAIROBI_HOODS_SHOPS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', font: '500 11px Outfit,sans-serif', color: '#8B7355', marginBottom: 4 }}>Subscription tier</label>
                          <select value={editShop.subscription_tier} onChange={e => setEditShop(s => s ? ({ ...s, subscription_tier: e.target.value }) : s)}
                            style={{ width: '100%', height: 34, border: '1.5px solid #EEE9E0', borderRadius: 7, padding: '0 10px', font: '400 13px Outfit,sans-serif', boxSizing: 'border-box' }}>
                            {TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', font: '500 11px Outfit,sans-serif', color: '#8B7355', marginBottom: 4 }}>Subscription expires</label>
                          <input type="date" value={editShop.subscription_expires_at ? editShop.subscription_expires_at.slice(0,10) : ''}
                            onChange={e => setEditShop(s => s ? ({ ...s, subscription_expires_at: e.target.value || null }) : s)}
                            style={{ width: '100%', height: 34, border: '1.5px solid #EEE9E0', borderRadius: 7, padding: '0 10px', font: '400 13px Outfit,sans-serif', boxSizing: 'border-box' }}/>
                        </div>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <label style={{ display: 'block', font: '500 11px Outfit,sans-serif', color: '#8B7355', marginBottom: 4 }}>Shop bio</label>
                        <input type="text" value={editShop.shop_bio || ''} onChange={e => setEditShop(s => s ? ({ ...s, shop_bio: e.target.value }) : s)}
                          style={{ width: '100%', height: 34, border: '1.5px solid #EEE9E0', borderRadius: 7, padding: '0 10px', font: '400 13px Outfit,sans-serif', boxSizing: 'border-box' }}/>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 12px Outfit,sans-serif', color: '#1A1310', cursor: 'pointer' }}>
                          <input type="checkbox" checked={editShop.verified_shop} onChange={e => setEditShop(s => s ? ({ ...s, verified_shop: e.target.checked }) : s)} style={{ accentColor: '#7DC243' }}/>
                          Verified shop
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 12px Outfit,sans-serif', color: '#1A1310', cursor: 'pointer' }}>
                          <input type="checkbox" checked={editShop.is_shop} onChange={e => setEditShop(s => s ? ({ ...s, is_shop: e.target.checked }) : s)} style={{ accentColor: '#F07828' }}/>
                          Active shop
                        </label>
                        <div style={{ flex: 1 }}/>
                        <button onClick={() => handlePatch(editShop.id, {
                          shop_name: editShop.shop_name, shop_bio: editShop.shop_bio,
                          neighbourhood: editShop.neighbourhood, is_shop: editShop.is_shop,
                          verified_shop: editShop.verified_shop, subscription_tier: editShop.subscription_tier,
                          subscription_expires_at: editShop.subscription_expires_at,
                        })} disabled={patchLoading}
                          style={{ padding: '7px 18px', background: '#F07828', color: '#fff', border: 'none', borderRadius: 8, font: '600 13px Outfit,sans-serif', cursor: 'pointer' }}>
                          {patchLoading ? 'Saving...' : 'Save changes'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // VIEW: BLOG (CMS - full logic preserved)
  // ========================================================================
  function renderBlog() {
    // ── Blog editor ──
    if (editingArticle || isNewArticle) {
      const isSaving = saveStatus === 'saving';
      const badge = editingArticle ? STATUS_BADGE[editingArticle.status as ArticleStatus] : null;

      return (
        <div>
          {/* Editor header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={closeEditor} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4, font: '400 13px Outfit,sans-serif' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                All articles
              </button>
              <span style={{ color: '#C8B89A' }}>/</span>
              <span style={{ font: '500 14px Outfit,sans-serif', color: '#1A1310' }}>{isNewArticle ? 'New article' : (form.title || 'Edit article')}</span>
              {badge && <span style={{ background: badge.bg, color: badge.fg, font: '500 11px Outfit,sans-serif', padding: '3px 10px', borderRadius: 20 }}>{badge.label}</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {saveStatus === 'saved' && <span style={{ font: '400 12px Outfit,sans-serif', color: '#7DC243' }}>Saved</span>}
              {saveStatus === 'error' && <span style={{ font: '400 12px Outfit,sans-serif', color: '#E53935' }}>Error</span>}
              <button onClick={saveArticle} disabled={isSaving} style={{ padding: '8px 20px', background: isSaving ? '#B09070' : '#F07828', color: '#fff', border: 'none', borderRadius: 20, font: '600 13px Outfit,sans-serif', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              {editingArticle && (
                <>
                  {editingArticle.status === 'draft' && (
                    <button onClick={() => articleAction(editingArticle.id, 'submit')} disabled={!!blogActionLoading} style={{ padding: '8px 16px', background: '#FFF8E1', color: '#F57F17', border: '1px solid #FFECB3', borderRadius: 20, font: '600 13px Outfit,sans-serif', cursor: 'pointer' }}>Submit</button>
                  )}
                  {editingArticle.status === 'pending' && (
                    <button onClick={() => articleAction(editingArticle.id, 'publish')} disabled={!!blogActionLoading} style={{ padding: '8px 16px', background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', borderRadius: 20, font: '600 13px Outfit,sans-serif', cursor: 'pointer' }}>Publish</button>
                  )}
                  {editingArticle.status === 'published' && (
                    <button onClick={() => articleAction(editingArticle.id, 'unpublish')} disabled={!!blogActionLoading} style={{ padding: '8px 16px', background: '#f5f4f2', color: '#666', border: '1px solid #ddd', borderRadius: 20, font: '600 13px Outfit,sans-serif', cursor: 'pointer' }}>Unpublish</button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mode toggle (new articles only) */}
          {(isNewArticle && !form.content) && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#F7F4EF', borderRadius: 12, padding: 5 }}>
              <button onClick={() => setEditorMode('generate')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 8, background: editorMode === 'generate' ? '#fff' : 'transparent', color: editorMode === 'generate' ? '#F07828' : '#5C4B3A', font: `${editorMode === 'generate' ? '600' : '400'} 13px Outfit,sans-serif`, cursor: 'pointer', boxShadow: editorMode === 'generate' ? '0 1px 4px rgba(0,0,0,.08)' : 'none' }}>
                AI Generate
              </button>
              <button onClick={() => setEditorMode('manual')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 8, background: editorMode === 'manual' ? '#fff' : 'transparent', color: editorMode === 'manual' ? '#F07828' : '#5C4B3A', font: `${editorMode === 'manual' ? '600' : '400'} 13px Outfit,sans-serif`, cursor: 'pointer', boxShadow: editorMode === 'manual' ? '0 1px 4px rgba(0,0,0,.08)' : 'none' }}>
                Manual
              </button>
            </div>
          )}

          {/* AI Generate panel */}
          {editorMode === 'generate' && !form.content && (
            <div style={{ ...S.card, padding: '20px', marginBottom: 20 }}>
              <p style={{ font: '600 14px Outfit,sans-serif', color: '#1A1310', margin: '0 0 16px' }}>Generate article with AI</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={S.label}>Topic *</label>
                  <input style={S.input} value={genTopic} onChange={e => setGenTopic(e.target.value)} placeholder="e.g. Best stroller brands for Nairobi roads"/>
                </div>
                <div>
                  <label style={S.label}>Target keywords</label>
                  <input style={S.input} value={genKeywords} onChange={e => setGenKeywords(e.target.value)} placeholder="e.g. stroller Nairobi, baby gear Kenya"/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={S.label}>Tone</label>
                    <select style={S.input} value={genTone} onChange={e => setGenTone(e.target.value as 'friendly'|'professional')}>
                      <option value="friendly">Friendly</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Length</label>
                    <select style={S.input} value={genLength} onChange={e => setGenLength(e.target.value as 'short'|'standard'|'long')}>
                      <option value="short">Short (~500 words)</option>
                      <option value="standard">Standard (~900 words)</option>
                      <option value="long">Long (~1500 words)</option>
                    </select>
                  </div>
                </div>
                {genError && <p style={{ font: '400 12px Outfit,sans-serif', color: '#E53935', margin: 0 }}>{genError}</p>}
                <button onClick={generateArticle} disabled={generating} style={{ padding: '11px', background: generating ? '#B09070' : '#F07828', color: '#fff', border: 'none', borderRadius: 10, font: '600 14px Outfit,sans-serif', cursor: generating ? 'not-allowed' : 'pointer' }}>
                  {generating ? 'Generating...' : 'Generate Article'}
                </button>
              </div>
            </div>
          )}

          {/* Manual editor */}
          {editorMode === 'manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ ...S.card, padding: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={S.label}>Title *</label>
                    <input style={S.input} value={form.title||''} onChange={e => {
                      const v = e.target.value;
                      setForm(p => ({ ...p, title: v, slug: p.slug || slugify(v) }));
                    }} placeholder="Article title"/>
                  </div>
                  <div>
                    <label style={S.label}>Slug *</label>
                    <input style={S.input} value={form.slug||''} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}/>
                  </div>
                  <div>
                    <label style={S.label}>Excerpt</label>
                    <textarea style={{ ...S.input, minHeight: 64, resize: 'vertical' }} value={form.excerpt||''} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short description for cards and SEO"/>
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, padding: '18px' }}>
                <label style={S.label}>Content (Markdown)</label>
                <textarea style={{ ...S.input, minHeight: 320, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} value={form.content||''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write your article in Markdown..."/>
              </div>
              <div style={{ ...S.card, padding: '18px' }}>
                <p style={{ font: '600 13px Outfit,sans-serif', color: '#1A1310', margin: '0 0 12px' }}>SEO & Meta</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={S.label}>Cover image URL</label>
                    <input style={S.input} value={form.cover_image_url||''} onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))} placeholder="https://..."/>
                  </div>
                  <div>
                    <label style={S.label}>Meta title</label>
                    <input style={S.input} value={form.meta_title||''} onChange={e => setForm(p => ({ ...p, meta_title: e.target.value }))}/>
                  </div>
                  <div>
                    <label style={S.label}>Meta description</label>
                    <textarea style={{ ...S.input, minHeight: 64, resize: 'vertical' }} value={form.meta_description||''} onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))}/>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={S.label}>Tags (comma separated)</label>
                      <input style={S.input} value={form.tagsInput||''} onChange={e => setForm(p => ({ ...p, tagsInput: e.target.value }))} placeholder="nairobi, parenting, gear"/>
                    </div>
                    <div>
                      <label style={S.label}>Author</label>
                      <input style={S.input} value={form.author||''} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}/>
                    </div>
                  </div>
                  <div>
                    <label style={S.label}>Reading time (minutes)</label>
                    <input style={{ ...S.input, maxWidth: 120 }} type="number" min={1} max={60} value={form.reading_time_minutes||5} onChange={e => setForm(p => ({ ...p, reading_time_minutes: Number(e.target.value) }))}/>
                  </div>
                </div>
              </div>

              {/* Delete */}
              {editingArticle && (
                <div style={{ padding: '14px 0' }}>
                  {blogDeleteConfirm === editingArticle.id ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ font: '400 13px Outfit,sans-serif', color: '#5C4B3A' }}>Delete permanently?</span>
                      <button onClick={() => deleteArticle(editingArticle.id)} style={{ padding: '7px 16px', background: '#E53935', color: '#fff', border: 'none', borderRadius: 8, font: '600 13px Outfit,sans-serif', cursor: 'pointer' }}>Delete</button>
                      <button onClick={() => setBlogDeleteConfirm(null)} style={{ padding: '7px 12px', background: 'none', border: 'none', font: '400 13px Outfit,sans-serif', color: '#8B7355', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setBlogDeleteConfirm(editingArticle.id)} style={{ background: 'none', border: 'none', font: '400 13px Outfit,sans-serif', color: '#B09070', cursor: 'pointer', padding: 0 }}>
                      Delete article
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // ── Blog list view ──
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ font: '700 16px Outfit,sans-serif', color: '#1A1310', margin: 0 }}>Blog Articles ({blogArticles.length})</h3>
          <button onClick={openNewArticle} style={{ padding: '9px 20px', background: '#F07828', color: '#fff', border: 'none', borderRadius: 20, font: '600 13px Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            New article
          </button>
        </div>

        {blogLoading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #F07828', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}/>
          </div>
        )}

        {!blogLoading && blogArticles.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C8B89A" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px' }}>
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <p style={{ font: '500 15px Outfit,sans-serif', color: '#8B7355', margin: '0 0 16px' }}>No articles yet</p>
            <button onClick={openNewArticle} style={{ padding: '10px 24px', background: '#F07828', color: '#fff', border: 'none', borderRadius: 20, font: '600 14px Outfit,sans-serif', cursor: 'pointer' }}>Write first article</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {blogArticles.map(article => {
            const badge = STATUS_BADGE[article.status as ArticleStatus] || STATUS_BADGE.draft;
            return (
              <div key={article.id} style={{ ...S.card, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {article.cover_image_url && (
                  <div style={{ width: 60, height: 60, borderRadius: 10, flexShrink: 0, overflow: 'hidden' }}>
                    <img src={article.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ background: badge.bg, color: badge.fg, font: '500 11px Outfit,sans-serif', padding: '2px 8px', borderRadius: 20 }}>{badge.label}</span>
                    {article.reading_time_minutes && <span style={{ font: '400 11px Outfit,sans-serif', color: '#B09070' }}>{article.reading_time_minutes} min read</span>}
                  </div>
                  <p style={{ font: '600 14px Outfit,sans-serif', color: '#1A1310', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</p>
                  {article.excerpt && <p style={{ font: '400 12px Outfit,sans-serif', color: '#8B7355', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.excerpt}</p>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => openEditArticle(article)} style={{ padding: '5px 12px', background: '#F7F4EF', border: '1px solid #EEE9E0', borderRadius: 8, font: '500 12px Outfit,sans-serif', color: '#5C4B3A', cursor: 'pointer' }}>Edit</button>
                    {article.status === 'draft' && (
                      <button onClick={() => articleAction(article.id, 'submit')} disabled={!!blogActionLoading} style={{ padding: '5px 12px', background: '#FFF8E1', border: '1px solid #FFECB3', borderRadius: 8, font: '500 12px Outfit,sans-serif', color: '#F57F17', cursor: 'pointer' }}>Submit</button>
                    )}
                    {article.status === 'pending' && (
                      <button onClick={() => articleAction(article.id, 'publish')} disabled={!!blogActionLoading} style={{ padding: '5px 12px', background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 8, font: '500 12px Outfit,sans-serif', color: '#2E7D32', cursor: 'pointer' }}>Publish</button>
                    )}
                    {article.status === 'published' && (
                      <>
                        <button onClick={() => articleAction(article.id, 'unpublish')} disabled={!!blogActionLoading} style={{ padding: '5px 12px', background: '#f5f4f2', border: '1px solid #ddd', borderRadius: 8, font: '500 12px Outfit,sans-serif', color: '#666', cursor: 'pointer' }}>Unpublish</button>
                        <Link href={`/blog/${article.slug}`} target="_blank" style={{ padding: '5px 12px', background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 8, font: '500 12px Outfit,sans-serif', color: '#2E7D32', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>View</Link>
                      </>
                    )}
                    {blogDeleteConfirm === article.id ? (
                      <>
                        <button onClick={() => deleteArticle(article.id)} style={{ padding: '5px 12px', background: '#E53935', border: 'none', borderRadius: 8, font: '500 12px Outfit,sans-serif', color: '#fff', cursor: 'pointer' }}>Confirm</button>
                        <button onClick={() => setBlogDeleteConfirm(null)} style={{ padding: '5px 10px', background: 'none', border: 'none', font: '400 12px Outfit,sans-serif', color: '#8B7355', cursor: 'pointer' }}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setBlogDeleteConfirm(article.id)} style={{ padding: '5px 10px', background: 'none', border: 'none', font: '400 12px Outfit,sans-serif', color: '#B09070', cursor: 'pointer' }}>Delete</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ========================================================================
  // ADMIN SHELL RENDER
  // ========================================================================
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', background: '#F7F4EF', fontFamily: 'Outfit, sans-serif' }}>

      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-sidebar { display: flex; }
        .admin-mobile-header { display: none; }
        .admin-bottom-nav { display: none; }
        @media (max-width: 767px) {
          .admin-sidebar { display: none !important; }
          .admin-mobile-header { display: flex !important; }
          .admin-bottom-nav { display: flex !important; }
        }
        .admin-nav-btn:hover { background: #FFF4EE !important; }
        .admin-pad-btn:hover { background: #F5F0E8 !important; }
      `}</style>

      {/* ================================================================
          SIDEBAR (desktop only)
      ================================================================ */}
      <aside className="admin-sidebar" style={{
        width: 220, flexShrink: 0, background: '#fff',
        borderRight: '1px solid #EEE9E0', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #EEE9E0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F07828', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <p style={{ font: '700 13px Outfit,sans-serif', margin: 0, color: '#1A1310' }}>MyTinyverse</p>
              <p style={{ font: '400 11px Outfit,sans-serif', margin: 0, color: '#B09070' }}>Admin - Nairobi</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {NAV_ITEMS.map(item => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                className="admin-nav-btn"
                onClick={() => {
                  if (item.id === 'post') setPostSuccess(null);
                  if (item.id === 'blog') { setEditingArticle(null); setIsNewArticle(false); }
                  setView(item.id);
                }}
                style={{
                  width: '100%', padding: '10px 12px', border: 'none', borderRadius: 10,
                  background: active ? '#FFF4EE' : 'transparent',
                  borderLeft: `3px solid ${active ? '#F07828' : 'transparent'}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                  font: `${active ? '600' : '400'} 14px Outfit,sans-serif`,
                  color: active ? '#F07828' : '#5C4B3A', marginBottom: 2, transition: 'all .15s',
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                {item.label}
                {item.id === 'queue' && pendingCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#F07828', color: '#fff', borderRadius: 10, padding: '1px 7px', font: '700 11px Outfit,sans-serif' }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div style={{ padding: '12px 8px 16px', borderTop: '1px solid #EEE9E0' }}>
          <a href={`https://wa.me/${WA_ADMIN}`} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10,
            background: '#25D366', color: '#fff', textDecoration: 'none',
            font: '600 13px Outfit,sans-serif', marginBottom: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d={WA_PATH}/></svg>
            Open WhatsApp CRM
          </a>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
            background: 'transparent', color: '#8B7355', textDecoration: 'none',
            font: '400 12px Outfit,sans-serif',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
            Live site
          </a>
        </div>
      </aside>

      {/* ================================================================
          MAIN CONTENT AREA
      ================================================================ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Mobile header */}
        <header className="admin-mobile-header" style={{
          background: '#fff', borderBottom: '1px solid #EEE9E0',
          padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F07828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ font: '700 15px Outfit,sans-serif', color: '#1A1310' }}>
              {NAV_ITEMS.find(n => n.id === view)?.label || 'Admin'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {pendingCount > 0 && view !== 'queue' && (
              <button onClick={() => setView('queue')} style={{ background: '#FFF4EE', border: '1.5px solid #F07828', borderRadius: 8, padding: '5px 10px', font: '600 11px Outfit,sans-serif', color: '#F07828', cursor: 'pointer' }}>
                {pendingCount} pending
              </button>
            )}
            <a href={`https://wa.me/${WA_ADMIN}`} target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, borderRadius: 8, background: '#E8F5E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d={WA_PATH}/></svg>
            </a>
          </div>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 20px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {view === 'home'   && renderHome()}
            {view === 'queue'  && renderQueue()}
            {view === 'post'   && renderPost()}
            {view === 'market' && renderMarket()}
            {view === 'blog'   && renderBlog()}
            {view === 'shops'  && renderShops()}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="admin-bottom-nav" style={{
          background: '#fff', borderTop: '1px solid #EEE9E0',
          height: 62, flexShrink: 0,
        }}>
          {NAV_ITEMS.map(item => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'post') setPostSuccess(null);
                  if (item.id === 'blog') { setEditingArticle(null); setIsNewArticle(false); }
                  setView(item.id);
                }}
                style={{
                  flex: 1, border: 'none', background: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 3, color: active ? '#F07828' : '#8B7355', position: 'relative',
                  transition: 'color .15s',
                }}>
                {item.id === 'queue' && pendingCount > 0 && (
                  <div style={{
                    position: 'absolute', top: 7, right: 'calc(50% - 14px)',
                    width: 16, height: 16, borderRadius: '50%', background: '#F07828',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    font: '700 9px Outfit,sans-serif', color: '#fff',
                  }}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </div>
                )}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? '2.2' : '1.6'} strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                <span style={{ font: `${active ? '600' : '400'} 10px Outfit,sans-serif` }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
