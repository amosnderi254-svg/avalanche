'use client';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function PartnerPage() {
  return (
    <>
      <Nav />
      <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

        {/* Hero */}
        <section style={{ background: 'var(--text-1)', padding: '64px 0 56px' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Partner with us
            </p>
            <h1 style={{ font: '700 40px/1.15 Outfit,sans-serif', color: '#fff', margin: '0 0 20px' }}>
              Become a MyTinyverse<br/>partner
            </h1>
            <p style={{ font: '400 18px/1.6 Outfit,sans-serif', color: 'rgba(255,255,255,0.8)', margin: 0, maxWidth: 580 }}>
              If you work with Kenyan parents and families, there is a place for you on MyTinyverse. We partner with nurseries, resale shops, parent communities, and brands that share our values.
            </p>
          </div>
        </section>

        {/* Partner types */}
        <section style={{ padding: '64px 0' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--orange)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Who we partner with
            </p>
            <h2 style={{ font: '700 32px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 40px' }}>
              Four types of partnerships
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                {
                  icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
                  badge: 'Nurseries and playgroups',
                  title: 'The school community connection',
                  body: 'Your parents are constantly cycling through gear as children grow. Partner with us to give them a trusted, easy channel to sell and buy within their school community. We can set up a school-specific browsing page and promotion.',
                  color: '#FFF3E0',
                  accent: 'var(--orange)',
                },
                {
                  icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
                  badge: 'Resale and thrift shops',
                  title: 'The stock overflow channel',
                  body: 'You have items that do not move in-store or that you acquire faster than you can display. List your surplus on MyTinyverse and reach thousands of Nairobi parents looking for exactly what you stock.',
                  color: '#EDF7E2',
                  accent: 'var(--green)',
                },
                {
                  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                  badge: 'Parent communities and networks',
                  title: 'The community amplifier',
                  body: 'You run a parent WhatsApp network, an Instagram page for Nairobi mums, or an estate community group. Partner with us and give your audience a better way to find and move gear - with a referral benefit for every listing your community drives.',
                  color: '#E8F4FF',
                  accent: '#1565C0',
                },
                {
                  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                  badge: 'Kids gear brands',
                  title: 'The brand presence play',
                  body: 'If you make or distribute quality kids gear in Kenya, there is an audience here that trusts second-hand value because they already trust the brand. Sponsor a category, run a campaign, or list refurbished items directly.',
                  color: '#FFF3E0',
                  accent: 'var(--orange)',
                },
              ].map(p => (
                <div key={p.badge} style={{ background: p.color, borderRadius: 16, padding: '28px 24px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={p.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={p.icon}/>
                    </svg>
                  </div>
                  <div>
                    <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: '3px 10px', font: '600 11px Outfit,sans-serif', color: p.accent, letterSpacing: '0.04em', marginBottom: 10 }}>{p.badge}</span>
                    <h3 style={{ font: '600 17px/1.3 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 8px' }}>{p.title}</h3>
                    <p style={{ font: '400 14px/1.6 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What partners get */}
        <section style={{ background: 'var(--card)', padding: '64px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--orange)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              What you get
            </p>
            <h2 style={{ font: '700 28px/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 36px' }}>
              Partner benefits
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {[
                { icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', label: 'Featured placement on category pages' },
                { icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', label: 'Mention in parent newsletters and community updates' },
                { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Monthly report on views, clicks and conversions from your listings' },
                { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Reduced or waived listing fees for verified partners' },
                { icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', label: 'Co-branded referral links for your community' },
                { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Direct WhatsApp line to our team for partner support' },
              ].map(b => (
                <div key={b.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '16px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={b.icon}/>
                    </svg>
                  </div>
                  <p style={{ font: '500 13px/1.5 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '64px 0' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <div style={{ background: 'var(--orange)', borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>
              <h2 style={{ font: '700 28px/1.2 Outfit,sans-serif', color: '#fff', margin: '0 0 12px' }}>
                Let us talk partnership
              </h2>
              <p style={{ font: '400 15px/1.6 Outfit,sans-serif', color: 'rgba(255,255,255,0.9)', margin: '0 0 28px', maxWidth: 460, marginInline: 'auto' }}>
                Every partnership is different. Send us a WhatsApp message, tell us who you are and who your audience is, and we will put together something that works for both sides.
              </p>
              <a
                href="https://wa.me/254790784084?text=Hello%20MyTinyverse%2C%20I%20am%20interested%20in%20a%20partnership."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: '#fff',
                  color: 'var(--orange)',
                  font: '600 15px Outfit,sans-serif',
                  padding: '12px 28px',
                  borderRadius: 8,
                  textDecoration: 'none',
                }}
              >
                Start the conversation
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
