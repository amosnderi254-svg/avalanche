import Nav from '@/components/Nav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How MyTinyverse collects and uses your personal data.',
};

export default function PrivacyPage() {
  return (
    <>
      <Nav/>
      <div className="container" style={{ padding: '40px 0 80px', maxWidth: 720 }}>
        <h1 style={{ font: '700 28px Outfit,sans-serif', margin: '0 0 6px' }}>Privacy Policy</h1>
        <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 36px' }}>
          Last updated: November 2024
        </p>

        <Section title="1. Information We Collect">
          When you list an item on MyTinyverse, we collect your name, phone number, optional WhatsApp
          number, optional email address, and information about the item you are listing (title, price,
          category, condition, description, location, and photographs). We also collect standard
          web analytics data such as page views, search queries, and device type.
        </Section>

        <Section title="2. How We Use Your Information">
          We use your information to publish your listing on MyTinyverse, allow buyers to contact you
          via WhatsApp, send you listing status notifications via ntfy.sh or WhatsApp, and improve the
          platform. We do not use your information for any other purpose without your consent.
        </Section>

        <Section title="3. Information Shared with Buyers">
          When your listing is live, buyers can see your name, your listing details, and your WhatsApp
          contact number (to initiate a chat about the item). Your email address is never displayed
          publicly.
        </Section>

        <Section title="4. M-Pesa Payments">
          Listing fee payments are processed via Safaricom M-Pesa. When you initiate a payment we
          collect your M-Pesa phone number to send a payment request. Payment confirmation codes are
          stored against your listing to verify payment. We do not store your M-Pesa PIN or full
          account details.
        </Section>

        <Section title="5. Data Storage and Security">
          Your data is stored securely in Supabase, a cloud database service, on servers located
          outside Kenya. We apply access controls to ensure only authorised staff can view seller
          contact details. Listing images are stored in Supabase Storage and are publicly accessible
          via their URL once a listing is live.
        </Section>

        <Section title="6. Data Retention">
          Listing data is retained for 90 days after a listing expires or is removed. You may request
          deletion of your data at any time by contacting us on WhatsApp.
        </Section>

        <Section title="7. Your Rights">
          You have the right to access the personal data we hold about you, correct inaccurate data,
          and request deletion of your data. To exercise these rights, contact us via WhatsApp.
        </Section>

        <Section title="8. Cookies and Analytics">
          MyTinyverse does not use third-party tracking cookies. We collect anonymised analytics
          data (page views, search terms, category popularity) to improve the platform. This data
          cannot be used to identify individual users.
        </Section>

        <Section title="9. Contact">
          For privacy questions or data requests, contact us on WhatsApp:{' '}
          <a href="https://wa.me/254790784084" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--green)' }}>
            +254 790 784 084
          </a>
        </Section>
      </div>
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
