import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import NayaChat from '@/components/NayaChat';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { CONDITION_LABELS } from '@/lib/constants';
import ListingImages from '@/components/ListingImages';
export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient();
  const { data } = await supabase.from('listings').select('title,description,images').eq('id', params.id).single();
  if (!data) return { title: 'Listing | MyTinyverse' };
  return {
    title: `${data.title} | MyTinyverse`,
    description: data.description || `Buy ${data.title} on MyTinyverse`,
    openGraph: {
      images: data.images?.[0] ? [data.images[0]] : [],
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const supabase = createServerClient();

  // Increment view count (fire-and-forget)
  supabase.rpc('increment_views', { listing_id: params.id }).then(() => {});

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'live')
    .single();

  if (!listing) notFound();

  const whatsappNum = (listing.seller_whatsapp || `254${listing.seller_phone.replace(/^0/, '')}`).replace(/\D/g, '');
  const waMessage = encodeURIComponent(
    `Hello ${listing.seller_name}, I have seen your ${listing.title} on Tinyverse and I was wondering if it is still available.`
  );

  return (
    <>
      <Nav/>
      <div className="container" style={{ padding: '24px 0 80px', maxWidth: 800 }}>
        {/* Breadcrumb */}
        <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 20px' }}>
          <Link href="/" style={{ color: 'var(--text-3)' }}>Home</Link>
          {' / '}
          <Link href={`/?cat=${listing.category}`} style={{ color: 'var(--text-3)', textTransform: 'capitalize' }}>
            {listing.category}
          </Link>
          {' / '}
          <span style={{ color: 'var(--text-1)' }}>{listing.title}</span>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
          {/* Images */}
          {listing.images && listing.images.length > 0 ? (
            <ListingImages images={listing.images} title={listing.title} />
          ) : (
            <div style={{ borderRadius: 14, background: '#F5EFE6', paddingTop: '52%', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
                  <polyline points="21 8 21 21 3 21 3 8"/>
                  <rect x="1" y="3" width="22" height="5"/>
                  <line x1="10" y1="12" x2="14" y2="12"/>
                </svg>
              </div>
            </div>
          )}

          {/* Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ font: '700 26px/1.2 Outfit,sans-serif', margin: 0 }}>{listing.title}</h1>
              <span style={{ font: '700 28px Outfit,sans-serif', color: listing.price === 0 ? 'var(--green)' : 'var(--orange)', flexShrink: 0 }}>
                {listing.price === 0 ? 'FREE' : `KES ${listing.price.toLocaleString()}`}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              <span className="badge badge-orange" style={{ textTransform: 'capitalize' }}>{listing.category}</span>
              <span className="badge badge-gray">{CONDITION_LABELS[listing.condition] || listing.condition}</span>
              <span className="badge badge-gray">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {listing.location}
              </span>
            </div>

            {listing.description && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ font: '600 14px Outfit,sans-serif', color: 'var(--text-2)', margin: '0 0 8px' }}>Description</p>
                <p style={{ font: '400 15px/1.65 Outfit,sans-serif', color: 'var(--text-1)', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* Seller card */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
              <p style={{ font: '600 12px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Seller</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: '700 18px Outfit,sans-serif', flexShrink: 0 }}>
                  {listing.seller_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ font: '600 15px Outfit,sans-serif', margin: '0 0 2px', color: 'var(--text-1)' }}>{listing.seller_name}</p>
                  <p style={{ font: '400 13px Outfit,sans-serif', margin: 0, color: 'var(--text-3)' }}>{listing.location}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <a
              href={`https://wa.me/${whatsappNum}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-green btn-lg"
              style={{ width: '100%', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>

            <Link href="/" className="btn btn-secondary btn-sm" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
              Back to listings
            </Link>
          </div>
        </div>
      </div>
      <NayaChat/>
      <Footer/>
    </>
  );
}
