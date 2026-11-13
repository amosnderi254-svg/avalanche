'use client';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

        {/* Hero */}
        <section style={{ background: 'var(--orange)', padding: '64px 0 56px' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Our story
            </p>
            <h1 style={{ font: '700 40px/1.15 Outfit,sans-serif', color: '#fff', margin: '0 0 20px' }}>
              Built for Nairobi parents,<br/>by a Nairobi parent
            </h1>
            <p style={{ font: '400 18px/1.6 Outfit,sans-serif', color: 'rgba(255,255,255,0.9)', margin: 0, maxWidth: 600 }}>
              Kids outgrow things fast. The good gear piles up in storerooms. The affordable gear is hard to find. MyTinyverse exists to close that gap.
            </p>
          </div>
        </section>

        {/* The problem */}
        <section style={{ padding: '64px 0' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
              <div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                </div>
                <h2 style={{ font: '600 20px/1.3 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 12px' }}>The storeroom problem</h2>
                <p style={{ font: '400 15px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>
                  Every Nairobi home with kids has one - the room where the good stuff goes when children outgrow it. A bike used for one season. A stroller that cost KES 25,000 and saw two years of use. A set of board books that taught a child to read. All sitting idle.
                </p>
              </div>
              <div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EDF7E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <h2 style={{ font: '600 20px/1.3 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 12px' }}>The finding problem</h2>
                <p style={{ font: '400 15px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>
                  On the other side: parents who know exactly what they need, do not want to pay brand-new prices, and cannot spend hours scrolling through Facebook Marketplace groups hoping to find something in their area.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section style={{ background: 'var(--card)', padding: '64px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--orange)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              What we believe
            </p>
            <h2 style={{ font: '700 32px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 24px' }}>
              Good gear deserves a second life
            </h2>
            <p style={{ font: '400 16px/1.7 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 20px' }}>
              A well-made stroller that carried one child through Karen can carry another through Kasarani. A set of Legos that sparked an engineer in Westlands can do the same in Embakasi. The item is not worn out - the child just grew up.
            </p>
            <p style={{ font: '400 16px/1.7 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>
              MyTinyverse is built on the idea that parent-to-parent trade is the most efficient and most human way to move kids gear. No middlemen. No warehouses. No unnecessary markup. One parent who is done with something, connecting directly to one who needs it.
            </p>
          </div>
        </section>

        {/* What we are */}
        <section style={{ padding: '64px 0' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--orange)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              What we are
            </p>
            <h2 style={{ font: '700 32px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 36px' }}>
              A marketplace built for Kenyan parents
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {[
                {
                  icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                  title: 'Category-first browsing',
                  body: 'We focus on kids gear - bikes, strollers, car seats, toys, books, clothes, and more. Not phones. Not furniture. Just what parents actually need for their children.',
                },
                {
                  icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
                  title: 'Neighbourhood-aware',
                  body: 'We show listings by area so you can find gear close to home. No need to drive across the city for a bike when there is one two estates away.',
                },
                {
                  icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
                  title: 'WhatsApp-native transactions',
                  body: 'Kenyan parents do not use in-app messaging. They use WhatsApp. So that is exactly where we send buyer inquiries - straight to the seller with no friction.',
                },
                {
                  icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                  title: 'M-Pesa native',
                  body: 'List fees are paid via M-Pesa. Buyer-to-seller payments are via M-Pesa. No international cards. No USD pricing. Just how Kenya works.',
                },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#FFF3E0', padding: '56px 0', borderTop: '1px solid #FFD5B0' }}>
          <div className="container" style={{ maxWidth: 760, textAlign: 'center' }}>
            <h2 style={{ font: '700 28px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 12px' }}>
              Join the community
            </h2>
            <p style={{ font: '400 16px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 28px', maxWidth: 480, marginInline: 'auto' }}>
              Thousands of Nairobi parents are already buying and selling on MyTinyverse. Your storeroom does not have to stay full.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/sell" className="btn btn-primary">List an item</Link>
              <Link href="/" className="btn btn-secondary">Browse listings</Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
