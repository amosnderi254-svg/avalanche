'use client';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function ReferralPage() {
  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

        {/* Hero */}
        <section style={{ background: 'var(--green)', padding: '64px 0 56px' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Earn while you share
            </p>
            <h1 style={{ font: '700 40px/1.15 Outfit,sans-serif', color: '#fff', margin: '0 0 20px' }}>
              The MyTinyverse<br/>Referral Program
            </h1>
            <p style={{ font: '400 18px/1.6 Outfit,sans-serif', color: 'rgba(255,255,255,0.9)', margin: 0, maxWidth: 560 }}>
              Tell another parent about MyTinyverse. When they list and sell, you earn credit toward your own next listing - for free.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section style={{ padding: '64px 0' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              How it works
            </p>
            <h2 style={{ font: '700 32px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 48px' }}>
              Three steps, then you earn
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                {
                  step: '01',
                  icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
                  title: 'Get your referral link',
                  body: 'Message us on WhatsApp and we set up a personal referral link for you within 24 hours. It is a simple link you can share anywhere.',
                },
                {
                  step: '02',
                  icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
                  title: 'Share it with other parents',
                  body: 'Send it to your WhatsApp groups, your school parent chats, your estate community pages. Anyone who signs up through your link is counted as your referral.',
                },
                {
                  step: '03',
                  icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                  title: 'Earn listing credit',
                  body: 'When a parent you referred successfully lists an item, you earn credit toward one free listing on MyTinyverse. The more you refer, the more you earn.',
                },
              ].map((item, i, arr) => (
                <div key={item.step} style={{ display: 'flex', gap: 24, paddingBottom: i < arr.length - 1 ? 40 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon}/>
                      </svg>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 8, minHeight: 32 }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 10 }}>
                    <span style={{ font: '700 11px Outfit,sans-serif', color: 'var(--green)', letterSpacing: '0.1em' }}>STEP {item.step}</span>
                    <h3 style={{ font: '600 18px/1.3 Outfit,sans-serif', color: 'var(--text-1)', margin: '6px 0 10px' }}>{item.title}</h3>
                    <p style={{ font: '400 14px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rewards */}
        <section style={{ background: 'var(--card)', padding: '64px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              What you earn
            </p>
            <h2 style={{ font: '700 28px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 32px' }}>
              Referral rewards
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                {
                  number: '1',
                  label: 'referral',
                  reward: 'KES 150 credit',
                  note: '1 free Starter listing',
                  color: '#EDF7E2',
                },
                {
                  number: '3',
                  label: 'referrals',
                  reward: 'KES 500 credit',
                  note: '1 free Premium listing',
                  color: '#EDF7E2',
                },
                {
                  number: '10',
                  label: 'referrals',
                  reward: 'KES 2,000 credit',
                  note: 'Free listings for the whole year',
                  color: '#d4f0bc',
                },
              ].map(r => (
                <div key={r.number} style={{ background: r.color, borderRadius: 12, padding: '24px 20px' }}>
                  <p style={{ font: '700 36px/1 Outfit,sans-serif', color: 'var(--green)', margin: '0 0 2px' }}>{r.number}</p>
                  <p style={{ font: '500 13px Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 16px' }}>{r.label}</p>
                  <p style={{ font: '700 16px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 4px' }}>{r.reward}</p>
                  <p style={{ font: '400 13px/1.4 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>{r.note}</p>
                </div>
              ))}
            </div>
            <p style={{ font: '400 13px/1.5 Outfit,sans-serif', color: 'var(--text-3)', margin: '20px 0 0' }}>
              Credit is applied automatically when your referred parent completes their first successful listing. No expiry.
            </p>
          </div>
        </section>

        {/* Who should refer */}
        <section style={{ padding: '64px 0' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <h2 style={{ font: '700 28px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 32px' }}>
              Who refers on MyTinyverse?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {[
                {
                  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                  title: 'Parent WhatsApp group admins',
                  body: 'You already share useful info with hundreds of parents. Add a referral link and earn while helping them find affordable gear.',
                },
                {
                  icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                  title: 'School parents association chairs',
                  body: 'Your school community has parents at every stage. Those with older kids have gear to sell. Those with younger kids are looking to buy. You are the connector.',
                },
                {
                  icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
                  title: 'Estate community managers',
                  body: 'If you manage the WhatsApp group for your estate, your residents are exactly the kind of neighbours who trade gear. The referral link earns you while adding value.',
                },
                {
                  icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
                  title: 'Satisfied sellers and buyers',
                  body: 'You just sold your stroller in 48 hours. Or you found a great bike for half the shop price. Tell someone. If they sign up through your link, you earn.',
                },
              ].map(item => (
                <div key={item.title} style={{ background: 'var(--card)', borderRadius: 12, padding: '20px', border: '1px solid var(--border)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EDF7E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon}/>
                    </svg>
                  </div>
                  <h3 style={{ font: '600 15px/1.3 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 8px' }}>{item.title}</h3>
                  <p style={{ font: '400 13px/1.5 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#EDF7E2', padding: '56px 0', borderTop: '1px solid #c8e8a8' }}>
          <div className="container" style={{ maxWidth: 760, textAlign: 'center' }}>
            <h2 style={{ font: '700 28px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 12px' }}>
              Ready to start referring?
            </h2>
            <p style={{ font: '400 15px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 28px', maxWidth: 440, marginInline: 'auto' }}>
              Message us on WhatsApp and we will get your personal referral link set up within 24 hours.
            </p>
            <a
              href="https://wa.me/254790784084?text=Hello%20MyTinyverse%2C%20I%20want%20to%20join%20the%20referral%20program."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-green"
            >
              Get my referral link
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
