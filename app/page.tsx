import { Suspense } from 'react';
import Nav from '@/components/Nav';
import NayaChat from '@/components/NayaChat';
import ListingsPage from '@/components/ListingsPage';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Nav/>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #FFF5EE 0%, #F0FBE8 100%)',
        padding: '48px 0 40px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ font: '700 36px/1.2 Outfit,sans-serif', margin: '0 0 12px' }}>
            Kids\' gear your little ones<br/>
            <span style={{ color: 'var(--orange)' }}>have already outgrown</span>
          </h1>
          <p style={{ font: '400 16px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 24px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Buy, sell or donate bikes, strollers, toys, books, car seats and more -- right here in Nairobi.
          </p>
          <Link href="/sell" className="btn btn-primary btn-lg">
            List an item -- from KES 99
          </Link>
        </div>
      </section>

      {/* Listings */}
      <Suspense fallback={<div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{ margin:'0 auto' }}/></div>}>
        <ListingsPage/>
      </Suspense>

      <NayaChat/>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'32px 0 40px', marginTop: 60 }}>
        <div className="container" style={{ display:'flex', flexWrap:'wrap', gap:24, justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ font:'700 16px Outfit,sans-serif', margin:'0 0 4px' }}>MyTinyverse</p>
            <p style={{ font:'400 13px Outfit,sans-serif', color:'var(--text-3)', margin:0 }}>
              Nairobi's parent-to-parent marketplace
            </p>
          </div>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'center' }}>
            <Link href="/blog" style={{ font:'400 13px Outfit,sans-serif', color:'var(--text-3)' }}>
              Blog
            </Link>
            <Link href="/terms" style={{ font:'400 13px Outfit,sans-serif', color:'var(--text-3)' }}>
              Terms
            </Link>
            <Link href="/privacy" style={{ font:'400 13px Outfit,sans-serif', color:'var(--text-3)' }}>
              Privacy
            </Link>
            <a href="https://wa.me/254790784084" target="_blank" rel="noopener noreferrer"
              style={{ font:'400 13px Outfit,sans-serif', color:'var(--text-3)' }}>
              Contact
            </a>
            <Link href="/admin" style={{ font:'400 13px Outfit,sans-serif', color:'var(--text-3)' }}>
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
