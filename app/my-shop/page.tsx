'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ShopLoginPage() {
  const router = useRouter();
  const [phone, setPhone]       = useState('');
  const [pin, setPin]           = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);
  const pinRef = useRef<HTMLInputElement>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    fetch('/api/my-shop/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.shop) router.replace('/my-shop/dashboard');
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/my-shop/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setPin('');
        pinRef.current?.focus();
      } else {
        router.replace('/my-shop/dashboard');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFDF9' }}>
        <div style={{ width: 24, height: 24, border: '2.5px solid #F07828', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Outfit, sans-serif; background: #FFFDF9; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .login-card { animation: fadeUp .4s ease both; }
        .login-input {
          width: 100%; height: 50px;
          border: 1.5px solid #E8E0D5; border-radius: 10px;
          padding: 0 16px; font: 400 15px Outfit,sans-serif; color: #111;
          background: #FEFCF8; outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .login-input:focus { border-color: #F07828; box-shadow: 0 0 0 3px rgba(240,120,40,.12); }
        .login-input::placeholder { color: #AAA; }
        .login-btn {
          width: 100%; height: 50px; border: none; border-radius: 10px;
          background: #F07828; color: #fff; font: 600 16px Outfit,sans-serif;
          cursor: pointer; transition: background .15s, transform .1s;
        }
        .login-btn:hover:not(:disabled) { background: #d9661f; }
        .login-btn:active:not(:disabled) { transform: scale(.98); }
        .login-btn:disabled { opacity: .6; cursor: default; }
        .error-box {
          background: #FFF2F0; border: 1px solid #FFCCC7; border-radius: 8px;
          padding: 10px 14px; font: 400 13px Outfit,sans-serif; color: #CF1322;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        background: 'linear-gradient(160deg, #FFFDF9 60%, #FFF5EC 100%)',
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 32 }}>
          <img src="/logo.png" alt="MyTinyverse" height={36} style={{ height: 36, width: 'auto' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ font: '700 20px Outfit,sans-serif', color: '#F07828' }}>MyTinyverse</span>
        </Link>

        {/* Card */}
        <div className="login-card" style={{
          width: '100%', maxWidth: 400,
          background: '#fff', border: '1px solid #E8E0D5',
          borderRadius: 20, padding: '36px 32px',
          boxShadow: '0 8px 40px rgba(0,0,0,.07)',
        }}>

          {/* Header */}
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #F07828, #FF9A4A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h1 style={{ font: '700 22px Outfit,sans-serif', color: '#1A1A1A', marginBottom: 6 }}>
              Shop Dashboard
            </h1>
            <p style={{ font: '400 14px Outfit,sans-serif', color: '#888' }}>
              Sign in to manage your listings
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {error && <div className="error-box">{error}</div>}

            <div>
              <label style={{ display: 'block', font: '500 13px Outfit,sans-serif', color: '#444', marginBottom: 7 }}>
                Phone number
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  font: '400 15px Outfit,sans-serif', color: '#888', pointerEvents: 'none',
                }}>+254</span>
                <input
                  className="login-input"
                  type="tel"
                  placeholder="7XX XXX XXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ paddingLeft: 56 }}
                  required
                  autoComplete="tel"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', font: '500 13px Outfit,sans-serif', color: '#444', marginBottom: 7 }}>
                Dashboard PIN
              </label>
              <input
                ref={pinRef}
                className="login-input"
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={e => setPin(e.target.value)}
                required
                autoComplete="current-password"
                inputMode="numeric"
                maxLength={8}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Help */}
          <p style={{ marginTop: 20, textAlign: 'center', font: '400 13px Outfit,sans-serif', color: '#AAA' }}>
            Don&apos;t have a PIN?{' '}
            <a href="https://wa.me/254790784084?text=Hi%2C%20I%20need%20help%20setting%20up%20my%20shop%20dashboard%20PIN"
              target="_blank" rel="noopener noreferrer"
              style={{ color: '#F07828', textDecoration: 'none', fontWeight: 500 }}>
              Contact support
            </a>
          </p>
        </div>

        {/* Back link */}
        <Link href="/" style={{ marginTop: 24, font: '400 13px Outfit,sans-serif', color: '#AAA', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to marketplace
        </Link>
      </div>
    </>
  );
}
