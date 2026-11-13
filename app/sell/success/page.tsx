'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Nav from '@/components/Nav';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function SuccessContent() {
  const params = useSearchParams();
  const ref = params.get('ref') ?? 'MTV00000';

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Success icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#edf7e2', margin: '0 auto 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h1 style={{ font: '700 28px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 12px' }}>
          Your item is live.
        </h1>
        <p style={{ font: '400 15px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 8px' }}>
          Nairobi parents can find it right now. Expect your first WhatsApp from a buyer soon.
        </p>
        <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 36px' }}>
          Reference: {ref}
        </p>

        {/* Share prompt */}
        <div className="card" style={{ padding: '24px', marginBottom: 24, textAlign: 'left' }}>
          <p style={{ font: '700 14px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 12px' }}>
            Share your listing
          </p>
          <p style={{ font: '400 13px/1.6 Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 16px' }}>
            Listings shared on WhatsApp and family groups sell 3x faster. Send it to your circle.
          </p>
          <a
            href={`https://wa.me/?text=I%20just%20listed%20something%20on%20MyTinyverse%20-%20Nairobi's%20marketplace%20for%20used%20kids'%20gear.%20Come%20see%20it%20at%20mytinyverse.co.ke`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ width: '100%', textAlign: 'center', display: 'block' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share on WhatsApp
            </span>
          </a>
        </div>

        {/* Referral teaser */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: 24, textAlign: 'left', background: '#f0fbe8', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <p style={{ font: '700 14px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 4px' }}>
                Refer a friend - earn KES 200
              </p>
              <p style={{ font: '400 13px/1.5 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 12px' }}>
                Know another parent with kids gear to sell? Send them your referral link and earn KES 200 when they list their first item.
              </p>
              <a
                href="https://wa.me/254790784084?text=Hi%20MyTinyverse%2C%20I%20want%20to%20join%20the%20referral%20program%20and%20get%20my%20referral%20link"
                target="_blank"
                rel="noopener noreferrer"
                style={{ font: '600 13px Outfit,sans-serif', color: 'var(--green)', textDecoration: 'none' }}
              >
                Get my referral link on WhatsApp
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4, verticalAlign: 'middle' }} aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/" className="btn btn-secondary">
            Browse marketplace
          </Link>
          <Link href="/sell" className="btn btn-primary">
            List another item
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <>
      <Nav/>
      <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}/></div>}>
        <SuccessContent/>
      </Suspense>
    </>
  );
}