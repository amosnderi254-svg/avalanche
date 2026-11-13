'use client';
import { useState } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

type FAQ = { q: string; a: string };
type Category = { id: string; label: string; faqs: FAQ[] };

const CATEGORIES: Category[] = [
  {
    id: 'buying',
    label: 'Buying',
    faqs: [
      { q: 'Is it safe to buy second-hand car seats?', a: 'Car seats expire - check the date on the base. Never buy one that has been in an accident. Ask the seller directly. If in doubt, skip it. A new one is worth the peace of mind.' },
      { q: 'Do I need an account to browse or buy?', a: 'No. Browse freely without signing up. When you are ready to contact a seller, you are taken straight to WhatsApp - no account needed.' },
      { q: 'How do I know the item is as described?', a: 'We ask sellers to be honest about condition and upload real photos. If something looks off, ask for more pictures before meeting. Trust your gut.' },
      { q: 'What if the item is not what was advertised?', a: 'Do not pay until you have inspected the item in person. Examine it thoroughly before handing over money. Payment is final - we cannot process refunds for private transactions.' },
      { q: 'Where should I meet the seller?', a: 'Always a public place - a petrol station forecourt, mall entrance, or estate gate. Never invite strangers home or go to theirs.' },
      { q: 'Can I negotiate the price?', a: 'Yes, politely. Most sellers expect some negotiation. A fair offer is fine. Lowballing wastes everyone\'s time.' },
    ],
  },
  {
    id: 'selling',
    label: 'Selling',
    faqs: [
      { q: 'Is listing free?', a: 'Yes. Listing on MyTinyverse is free. We charge a small commission when your item sells.' },
      { q: 'What can I sell?', a: 'Bikes, scooters, strollers, car seats (not expired, not accident-damaged), toys, books, clothes, shoes, playpens, cots, highchairs, and all gently used kids gear up to age 12.' },
      { q: 'What cannot be sold?', a: 'Expired car seats. Items with active safety recalls. Damaged safety equipment. Items intended for newborns that have been recalled. When in doubt, check the brand\'s recall page first.' },
      { q: 'How quickly will my item sell?', a: 'Popular items (bikes, strollers) often sell within days. Niche items may take weeks. Good photos and honest pricing make the biggest difference.' },
      { q: 'How do I receive payment?', a: 'Directly from the buyer via M-Pesa or cash. We do not hold funds. Collect payment before handing over the item.' },
      { q: 'Can I list the same item on Facebook Marketplace too?', a: 'Yes. Just take it down from everywhere once sold to avoid wasted conversations.' },
    ],
  },
  {
    id: 'safety',
    label: 'Safety',
    faqs: [
      { q: 'How do you verify sellers?', a: 'We are early-stage and do not yet verify sellers with ID. We rely on WhatsApp numbers and community reputation. Meet in public, inspect before you pay.' },
      { q: 'Is my phone number shared publicly?', a: 'No. Your WhatsApp number is used for contact between buyer and seller only. We do not display it publicly on your listing.' },
      { q: 'Is my exact address visible?', a: 'Never. We only show your neighbourhood area and an approximate location circle on the map. Your exact address is shared only when you choose to give it to a buyer directly.' },
      { q: 'What if a buyer or seller is acting suspiciously?', a: 'Trust your instincts. Cancel the meeting. Report it to us on WhatsApp and we will investigate the account.' },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    faqs: [
      { q: 'What payment methods are supported?', a: 'M-Pesa (most common) and cash. Payment is between buyer and seller directly. We recommend M-Pesa because it leaves a transaction record.' },
      { q: 'Does MyTinyverse hold the payment?', a: 'No. We are a marketplace, not an escrow service. All transactions are between buyer and seller. Inspect before you pay.' },
      { q: 'Is there a buyer protection scheme?', a: 'Not at this stage. We are working on it. For now - inspect the item before paying, meet in public, and use M-Pesa so there is a record.' },
      { q: 'How do I pay MyTinyverse commission as a seller?', a: 'Via M-Pesa. Send to our Buy Goods Till: 5002337 (Business: Yumtyme Solutions). Commission is a small percentage of the sale price.' },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    faqs: [
      { q: 'Do I need an account to sell?', a: 'Yes - you create a simple seller profile when you post your first listing. It takes under 2 minutes.' },
      { q: 'How do I edit or remove a listing?', a: 'Sign in and go to your profile. You can edit or delete any active listing. Please remove listings once an item is sold.' },
      { q: 'How do I join the referral program?', a: 'Message us on WhatsApp. We will set up a personal referral link for you within 24 hours.' },
      { q: 'How do I become a partner?', a: 'If you are a nursery, resale shop, brand, or parent community, check our partner page and reach out on WhatsApp.' },
    ],
  },
];

function AccordionItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '18px 0', background: 'none', border: 'none',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          gap: 16, cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ font: `${isOpen ? '600' : '500'} 15px/1.4 Outfit,sans-serif`, color: 'var(--text-1)' }}>
          {faq.q}
        </span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isOpen ? 'var(--orange)' : 'var(--text-3)'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: 'transform 0.25s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div style={{
        maxHeight: isOpen ? 400 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <p style={{ font: '400 14px/1.7 Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 20px', paddingRight: 32 }}>
          {faq.a}
        </p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState('buying');
  const [openFAQs, setOpenFAQs] = useState<Record<string, boolean>>({});

  const currentCategory = CATEGORIES.find(c => c.id === activeTab)!;

  function toggleFAQ(key: string) {
    setOpenFAQs(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CATEGORIES.flatMap(cat =>
      cat.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Nav />
      <main>
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .faq-panel { animation: fadeUp 0.3s ease both; }
          .cat-tab {
            border: none; background: none; cursor: pointer;
            padding: 10px 20px; border-radius: var(--r-pill);
            font: 500 14px Outfit,sans-serif; transition: all 0.15s ease;
            white-space: nowrap;
          }
          .cat-tab:hover { background: #f1f5f1; }
          @media (max-width: 540px) {
            .faq-tabs { overflow-x: auto; flex-wrap: nowrap !important; }
          }
        `}</style>

        {/* ── HERO ──────────────────────────────────── */}
        <section style={{ background: 'linear-gradient(145deg, #FFF8F0, #F0F7E6)', padding: '64px 0 48px', textAlign: 'center' }}>
          <div className="container">
            <div style={{ font: '600 11px Outfit,sans-serif', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Help center
            </div>
            <h1 style={{ font: '800 clamp(28px,5vw,42px)/1.2 Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 16px' }}>
              Frequently asked questions
            </h1>
            <p style={{ font: '400 16px/1.7 Outfit,sans-serif', color: 'var(--text-2)', maxWidth: 420, margin: '0 auto' }}>
              Can not find your answer? Chat with us on WhatsApp and we will get back to you fast.
            </p>
          </div>
        </section>

        {/* ── FAQ BODY ──────────────────────────────── */}
        <section style={{ padding: '48px 0 64px' }}>
          <div className="container" style={{ maxWidth: 720 }}>

            {/* Category tabs */}
            <div className="faq-tabs" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className="cat-tab"
                  onClick={() => { setActiveTab(cat.id); setOpenFAQs({}); }}
                  style={{
                    color: activeTab === cat.id ? '#fff' : 'var(--text-2)',
                    background: activeTab === cat.id ? 'var(--orange)' : 'transparent',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* FAQ list */}
            <div key={activeTab} className="faq-panel">
              <div style={{ font: '700 18px Outfit,sans-serif', color: 'var(--text-1)', marginBottom: 4 }}>
                {currentCategory.label}
              </div>
              <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 24px' }}>
                {currentCategory.faqs.length} questions
              </p>
              {currentCategory.faqs.map((faq, i) => {
                const key = `${activeTab}-${i}`;
                return (
                  <AccordionItem
                    key={key}
                    faq={faq}
                    isOpen={!!openFAQs[key]}
                    onToggle={() => toggleFAQ(key)}
                  />
                );
              })}
            </div>

            {/* Still need help */}
            <div style={{ marginTop: 48, background: '#fafaf8', borderRadius: 16, padding: '28px 24px', textAlign: 'center', border: '1.5px solid var(--border)' }}>
              <div style={{ font: '700 16px Outfit,sans-serif', color: 'var(--text-1)', marginBottom: 8 }}>
                Still stuck?
              </div>
              <p style={{ font: '400 14px Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 16px' }}>
                Our support is on WhatsApp - real humans, fast replies.
              </p>
              <a
                href="https://wa.me/254790784084?text=Hello%20MyTinyverse%2C%20I%20have%20a%20question."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-green"
              >
                Chat with us on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}