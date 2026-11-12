'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

/* ── Approximate centres for each supported neighbourhood ──── */
const COORDS: Record<string, [number, number]> = {
  'Westlands':  [-1.2648, 36.8120],
  'Karen':      [-1.3326, 36.7132],
  'Kilimani':   [-1.2900, 36.7800],
  'Runda':      [-1.2219, 36.8138],
  'Gigiri':     [-1.2355, 36.8063],
  'Lavington':  [-1.2769, 36.7703],
  'Kasarani':   [-1.2225, 36.8926],
  'Thika Road': [-1.2000, 36.8900],
  'Muthaiga':   [-1.2461, 36.8362],
  'Ruaka':      [-1.2049, 36.7707],
  'Langata':    [-1.3326, 36.7497],
  'Parklands':  [-1.2593, 36.8181],
  'Eastlands':  [-1.2800, 36.8700],
  'South B':    [-1.3100, 36.8300],
  'South C':    [-1.3200, 36.8200],
  'Embakasi':   [-1.3200, 36.9000],
  'Donholm':    [-1.3000, 36.9000],
  'Buruburu':   [-1.2900, 36.8700],
  'Other':      [-1.2921, 36.8219], // Nairobi centre
};

interface Props {
  neighbourhood: string;
}

export default function NeighbourhoodMap({ neighbourhood }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const coords = COORDS[neighbourhood] ?? COORDS['Other'];

    // Dynamically import Leaflet to avoid SSR errors (Leaflet uses window/document)
    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return;

      const map = L.map(el, {
        center: coords,
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
        // Disable attribution control - we'll add a minimal custom one
        attributionControl: false,
      });

      // OSM tiles - free, no API key needed
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        opacity: 0.65,
        // Required OSM attribution
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Minimal attribution in bottom-right
      L.control
        .attribution({ prefix: false, position: 'bottomright' })
        .addTo(map);

      // Orange approximate zone - 700m radius, no pin
      L.circle(coords, {
        radius: 700,
        color: '#F07828',
        fillColor: '#F07828',
        fillOpacity: 0.14,
        weight: 2,
        opacity: 0.5,
        interactive: false,
      }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [neighbourhood]);

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        ref={containerRef}
        style={{
          height: 220,
          borderRadius: 10,
          overflow: 'hidden',
          border: '1.5px solid var(--border)',
          background: '#e8f0e8', // visible while tiles load
        }}
      />
      <p
        style={{
          font: '400 11px Outfit,sans-serif',
          color: 'var(--text-3)',
          margin: '6px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Approximate location - {neighbourhood}. Exact address shared via WhatsApp.
      </p>
    </div>
  );
}
