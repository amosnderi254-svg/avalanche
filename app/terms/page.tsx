import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'MyTinyverse terms of service for buyers and sellers in Kenya.',
};

export default function TermsPage() {
  return (
    <>
      <Nav/>
      <div className="container" style={{ padding: '40px 0 80px', maxWidth: 720 }}>
        <h1 style={{ font: '700 28px Outfit,sans-serif', margin: '0 0 6px' }}>Terms of Service</h1>
        <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 36px' }}>
          Last updated: November 2024
        </p>

        <Section title="1. About MyTinyverse">
          MyTinyverse is an online marketplace operated in Kenya that connects parents buying and selling
          gently used children's items including bikes, scooters, strollers, car seats, toys, books,
          shoes and clothing. The platform is operated by Yumtyme Solutions.
        </Section>

        <Section title="2. User Responsibilities">
          By listing items on MyTinyverse you confirm that you own the items you list and have the right
          to sell or donate them. You are responsible for the accuracy of your listings, including
          condition descriptions, pricing, and photographs. Listings must not include prohibited items
          (weapons, counterfeit goods, or items dangerous for children).
        </Section>

        <Section title="3. Listing Fees">
          Sellers pay a one-time listing fee based on item price: donations and free items (KES 0) -- no
          fee; items under KES 1,500 -- KES 99; items KES 1,500 to KES 8,000 -- KES 299; items above
          KES 8,000 -- KES 499. Fees are collected via M-Pesa and are non-refundable once a listing has
          been approved and published.
        </Section>

        <Section title="4. Payments and Transactions">
          MyTinyverse facilitates introductions between buyers and sellers. All final transactions,
          payments, and handovers happen directly between buyers and sellers. MyTinyverse does not hold
          funds, guarantee transactions, or act as an escrow service. Buyers and sellers agree to
          conduct transactions at their own risk.
        </Section>

        <Section title="5. Listing Moderation">
          All listings are reviewed by the MyTinyverse team before going live. We reserve the right to
          reject or remove listings at our sole discretion, including listings that are inaccurate,
          inappropriate, or duplicate. Rejected listings may apply again with updated information.
        </Section>

        <Section title="6. Listing Duration">
          Approved listings remain active for 60 days. After 60 days, listings are automatically
          removed. Sellers may re-list items by submitting a new listing and paying the applicable fee.
        </Section>

        <Section title="7. Prohibited Items">
          The following are not permitted on MyTinyverse: recalled safety items, car seats that have
          been involved in a collision, counterfeit or unlicensed goods, weapons or dangerous items,
          and any item prohibited by Kenyan law.
        </Section>

        <Section title="8. Limitation of Liability">
          MyTinyverse is a platform connecting buyers and sellers. We are not responsible for the
          quality, safety, legality, or accuracy of listings, or for any disputes arising from
          transactions conducted through the platform. Use the platform at your own risk.
        </Section>

        <Section title="9. Contact">
          For questions, disputes, or concerns, contact us on WhatsApp:{' '}
          <a href="https://wa.me/254790784084" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--green)' }}>
            +254 790 784 084
          </a>
        </Section>
      </div>
      <Footer/>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ font: '600 16px Outfit,sans-serif', color: 'var(--text-1)', margin: '0 0 8px' }}>
        {title}
      </h2>
      <p style={{ font: '400 14px/1.7 Outfit,sans-serif', color: 'var(--text-2)', margin: 0 }}>
        {children}
      </p>
    </div>
  );
}
