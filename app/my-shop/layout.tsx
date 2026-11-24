import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Dashboard | MyTinyverse',
  description: 'Manage your MyTinyverse shop listings, profile, and performance.',
  robots: 'noindex',
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
