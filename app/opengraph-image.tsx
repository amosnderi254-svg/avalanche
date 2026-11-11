import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';
export const alt = 'MyTinyverse -- Kids\' Marketplace Kenya';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #FFF8F3 0%, #FFF3E8 100%)',
          fontFamily: 'system-ui, sans-serif',
          padding: 80,
        }}
      >
        {/* Orange accent bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: '#F07828',
          display: 'flex',
        }}/>

        {/* Logo / wordmark */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 40,
        }}>
          {/* Simple box SVG icon */}
          <div style={{
            width: 80,
            height: 80,
            background: '#F07828',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 44,
              height: 44,
              border: '3px solid white',
              borderRadius: 8,
              display: 'flex',
            }}/>
          </div>
          <div style={{
            fontSize: 60,
            fontWeight: 800,
            color: '#1A1A1A',
            display: 'flex',
          }}>
            MyTinyverse
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 30,
          color: '#555',
          textAlign: 'center',
          maxWidth: 800,
          lineHeight: 1.4,
          display: 'flex',
        }}>
          Buy, sell or donate gently used kids&apos; gear in Nairobi
        </div>

        {/* Category tags */}
        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 48,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {['Bikes', 'Strollers', 'Car Seats', 'Toys', 'Books', 'Shoes'].map(cat => (
            <div key={cat} style={{
              background: 'white',
              border: '2px solid #FFD4B0',
              borderRadius: 24,
              padding: '10px 22px',
              fontSize: 22,
              color: '#F07828',
              fontWeight: 600,
              display: 'flex',
            }}>
              {cat}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          fontSize: 22,
          color: '#7DC243',
          fontWeight: 700,
          display: 'flex',
        }}>
          mytinyverse.co.ke
        </div>
      </div>
    ),
    { ...size }
  );
}
