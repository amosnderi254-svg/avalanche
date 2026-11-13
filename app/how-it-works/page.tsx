'use client';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function HowItWorksPage() {
  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

        {/* Hero */}
        <section style={{ background: 'var(--orange)', padding: '64px 0 56px' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Simple from start to finish
            </p>
            <h1 style={{ font: '700 40px/1.15 Outfit,sans-serif', color: '#fff', margin: '0 0 20px' }}>
              How MyTinyverse works
            </h1>
            <p style={{ font: '400 18px/1.6 Outfit,sans-serif', color: 'rgba(255,255,255,0.9)', margin: 0, maxWidth: 580 }}>
              Whether you are selling gear your kids outgrew or finding something for the next stage - the whole process takes minutes, not days.
            </p>
          </div>
        </section>

        {/* Tab nav */}
        <section style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div className="container" style={{ maxWidth: 760, display: 'flex', gap: 0 }}>
            <a href="#selling" style={{ padding: '16px 24px', font: '600 15px Outfit,sans-serif', color: 'var(--orange)', borderBottom: '2px solid var(--orange)', textDecoration: 'none' }}>
              For sellers
            </a>
            <a href="#buying" style={{ padding: '16px 24px', font: '500 15px Outfit,sans-serif', color: 'var(--text-2)', borderBottom: '2px solid transparent', textDecoration: 'none' }}>
              For buyers
            </a>
          </div>
        </section>

        {/* Selling steps */}
        <section id="selling" style={{ padding: '64px 0' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--orange)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Selling your gear
            </p>
            <h2 style={{ font: '700 32px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 48px' }}>
              List it in under 5 minutes
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                {
                  step: '01',
                  icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
                  title: 'Take clear photos',
                  body: 'Three to five photos from different angles. Good lighting. Honest shots - show any scratches or wear. Listings with real photos sell faster.',
                },
                {
                  step: '02',
                  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                  title: 'Fill in the listing form',
                  body: 'Title, category, condition, price, and your location area. Add a short description. The form takes under 3 minutes.',
                },
                {
                  step: '03',
                  icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
                  title: 'Pay the small listing fee via M-Pesa',
                  body: 'Send to Buy Goods Till 5002337 (Yumtyme Solutions). The STK push goes straight to your phone. Confirm and your listing goes live within minutes.',
                },
                {
                  step: '04',
                  icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
                  title: 'Receive buyer inquiries on WhatsApp',
                  body: 'When a buyer is interested, they tap "Contact seller" and are taken straight to your WhatsApp. You negotiate directly - no middlemen, no delays.',
                },
                {
                  step: '05',
                  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
                  title: 'Meet and hand over',
                  body: 'Agree on a meeting point - preferably a public place like a petrol station, mall entrance, or estate gate. Inspect together, collect M-Pesa or cash, hand over the item.',
                },
              ].map((item, i, arr) => (
                <div key={item.step} style={{ display: 'flex', gap: 24, paddingBottom: i < arr.length - 1 ? 40 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon}/>
                      </svg>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 8, minHeight: 32 }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 10 }}>
                    <span style={{ font: '700 11px Outfit,sans-serif', color: 'var(--orange)', letterSpacing: '0.1em' }}>STEP {item.step}</span>
                    <h3 style={{ font: '600 18px/1.3 Outfit,sans-serif', color: 'var(--text-1)', margin: '6px 0 10px' }}>{item.title}</h3>
                    <p style={{ font: '400 14px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 48 }}>
              <Link href="/sell" className="btn btn-primary">Start listing now</Link>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ background: 'var(--card)', padding: '64px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--orange)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Listing fees
            </p>
            <h2 style={{ font: '700 28px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 32px' }}>
              Simple, low-cost pricing
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { tier: 'Donation', price: 'Free', desc: 'You choose to give it away - we list it free', color: '#EDF7E2', accent: 'var(--green)' },
                { tier: 'Starter', price: 'KES 150', desc: 'Items under KES 1,500', color: '#FFF3E0', accent: 'var(--orange)' },
                { tier: 'Standard', price: 'KES 300', desc: 'Items KES 1,500 - 5,000', color: '#FFF3E0', accent: 'var(--orange)' },
                { tier: 'Premium', price: 'KES 500', desc: 'Items above KES 5,000', color: '#FFF3E0', accent: 'var(--orange)' },
              ].map(t => (
                <div key={t.tier} style={{ background: t.color, borderRadius: 12, padding: '20px 20px 18px' }}>
                  <p style={{ font: '700 22px Outfit,sans-serif', color: t.accent, margin: '0 0 4px' }}>{t.price}</p>
                  <p style={{ font: '600 14px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 6px' }}>{t.tier}</p>
                  <p style={{ font: '400 13px/1.5 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>{t.desc}</p>
                </div>
              ))}
            </div>
            <p style={{ font: '400 13px/1.5 Outfit,sans-serif', color: 'var(--text-3)', margin: '20px 0 0' }}>
              Fees are paid once when listing goes live. No commission charged on the sale price.
            </p>
          </div>
        </section>

        {/* Buying steps */}
        <section id="buying" style={{ padding: '64px 0' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Buying on MyTinyverse
            </p>
            <h2 style={{ font: '700 32px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 48px' }}>
              Find, contact, collect
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {[
                {
                  icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
                  title: 'Browse by category or area',
                  body: 'Filter by category, price range, or neighbourhood. No account needed. Everything is visible immediately.',
                },
                {
                  icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
                  title: 'Save listings you like',
                  body: 'Tap the heart on any listing to save it. Your saved items stay stored in your browser so you can compare and come back.',
                },
                {
                  icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
                  title: 'Contact the seller on WhatsApp',
                  body: 'Tap "Contact seller" and you go straight to WhatsApp with the listing details pre-filled. Ask questions, negotiate price, agree on a meeting.',
                },
                {
                  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                  title: 'Inspect before you pay',
                  body: 'Meet in a public place. Check the item thoroughly - condition, all parts present, any damage. Never pay before you have seen it in person.',
                },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EDF7E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon}/>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ font: '600 16px/1.3 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 6px' }}>{item.title}</h3>
                    <p style={{ font: '400 14px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 40 }}>
              <Link href="/" className="btn btn-green">Browse listings</Link>
            </div>
          </div>
        </section>

        {/* FAQ prompt */}
        <section style={{ background: '#FFF3E0', padding: '48px 0', borderTop: '1px solid #FFD5B0' }}>
          <div className="container" style={{ maxWidth: 760, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ font: '600 20px/1.3 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 6px' }}>Still have questions?</h2>
              <p style={{ font: '400 14px/1.5 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>Check the full FAQ or reach us on WhatsApp.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/faq" className="btn btn-secondary">Read the FAQ</Link>
              <a href="https://wa.me/254790784084?text=Hello%20MyTinyverse%2C%20I%20have%20a%20question." target="_blank" rel="noopener noreferrer" className="btn btn-primary">WhatsApp us</a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
