import type { Metadata } from 'next';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';

export const metadata: Metadata = {
  title: {
    default: 'MyTinyverse -- Kids\' Marketplace Kenya',
    template: '%s | MyTinyverse',
  },
  description: 'Buy, sell or donate gently used kids\' items in Nairobi. Bikes, strollers, car seats, toys, books and more.',
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: 'MyTinyverse -- Kids\' Marketplace Kenya',
    description: 'Nairobi\'s parent-to-parent marketplace for gently used kids\' gear.',
    type: 'website',
    url: APP_URL,
    siteName: 'MyTinyverse',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'MyTinyverse -- Buy, sell or donate kids\' gear in Nairobi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyTinyverse -- Kids\' Marketplace Kenya',
    description: 'Buy, sell or donate gently used kids\' gear in Nairobi.',
    images: ['/og.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
