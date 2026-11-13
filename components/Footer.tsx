import Link from 'next/link';

const FOUNDED = 2024;

function getCopyrightYear(): string {
  const current = new Date().getFullYear();
  return current > FOUNDED ? `${FOUNDED} - ${current}` : `${FOUNDED}`;
}

export default function Footer() {
  const year = getCopyrightYear();

  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border)',
      background: '#fafaf8',
    }}>
      <div className="container" style={{ padding: '48px 0 24px' }}>

        {/* Top row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', marginBottom: 36 }}>

          {/* Brand */}
          <div style={{ minWidth: 180, maxWidth: 260 }}>
            <div style={{ font: '700 18px Outfit,sans-serif', color: 'var(--orange)', marginBottom: 8 }}>
              MyTinyverse
            </div>
            <p style={{ font: '400 13px/1.65 Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 16px', maxWidth: 220 }}>
              Nairobi&apos;s trusted marketplace for gently used kids gear - bikes, strollers, toys and more.
            </p>
            <a
              href="https://wa.me/254790784084?text=Hello%20MyTinyverse%2C%20I%20have%20a%20question."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                font: '500 13px Outfit,sans-serif', color: 'var(--green)',
                textDecoration: 'none',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat with us on WhatsApp
            </a>
          </div>

          {/* Marketplace */}
          <div>
            <div style={{ font: '600 11px Outfit,sans-serif', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Marketplace
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '/', label: 'Browse all items' },
                { href: '/sell', label: 'Sell your gear' },
                { href: '/saved', label: 'Saved listings' },
                { href: '/?cat=bikes', label: 'Bikes and scooters' },
                { href: '/?cat=strollers', label: 'Strollers' },
                { href: '/?cat=toys', label: 'Toys and games' },
                { href: '/?cat=baby-gear', label: 'Baby gear' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-2)', textDecoration: 'none' }}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <div style={{ font: '600 11px Outfit,sans-serif', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Company
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '/about', label: 'About us' },
                { href: '/how-it-works', label: 'How it works' },
                { href: '/faq', label: 'FAQs' },
                { href: '/blog', label: 'Parenting blog' },
                { href: '/terms', label: 'Terms of use' },
                { href: '/privacy', label: 'Privacy policy' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-2)', textDecoration: 'none' }}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Grow with us */}
          <div>
            <div style={{ font: '600 11px Outfit,sans-serif', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Grow with us
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '/partner', label: 'Become a partner' },
                { href: '/referral', label: 'Referral program' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-2)', textDecoration: 'none' }}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
            &copy; {year} MyTinyverse. All rights reserved.
          </p>
          <p style={{ font: '400 12px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
            M-Pesa: Lipa na M-Pesa - Till 5002337
          </p>
        </div>
      </div>
    </footer>
  );
}
