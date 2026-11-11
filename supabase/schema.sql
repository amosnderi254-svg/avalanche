-- ═══════════════════════════════════════════════════════
-- MyTinyverse V3 -- Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Listings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  category      TEXT NOT NULL,
  condition     TEXT NOT NULL CHECK (condition IN ('like_new','good','fair')),
  description   TEXT,
  location      TEXT DEFAULT 'Nairobi',
  seller_name   TEXT NOT NULL,
  seller_phone  TEXT NOT NULL,
  seller_whatsapp TEXT,
  images        TEXT[] DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','live','rejected')),
  fee_tier      TEXT,
  fee_amount    NUMERIC(10,2) DEFAULT 0,
  mpesa_code    TEXT,
  views         INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Public can read live listings only
CREATE POLICY "Public read live listings" ON listings
  FOR SELECT USING (status = 'live');

-- Anyone can submit a new listing (lands as pending)
CREATE POLICY "Anyone can submit listing" ON listings
  FOR INSERT WITH CHECK (status = 'pending');

-- Service role (admin API) can do everything
-- (No RLS restriction on service_role -- it bypasses RLS by default)

-- ── Storage: listing-images bucket ───────────────────────
INSERT INTO storage.buckets (id, name, public)
  VALUES ('listing-images', 'listing-images', true)
  ON CONFLICT DO NOTHING;

-- Allow public to read images
CREATE POLICY "Public read listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

-- Allow anyone to upload images (up to 5MB enforced in app)
CREATE POLICY "Anyone can upload listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listing-images');

-- ── RPC: increment view count ────────────────────────────
CREATE OR REPLACE FUNCTION increment_views(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE listings SET views = views + 1 WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_views(UUID) TO anon, authenticated;

-- Allow anonymous update for mpesa_code on pending listings
CREATE POLICY "Anyone can update pending listing"
  ON listings FOR UPDATE
  USING (status = 'pending')
  WITH CHECK (status = 'pending');

-- ── V3 Feature Migration (run if upgrading from initial schema) ──
-- Safe to run on a fresh DB too (IF NOT EXISTS / DO NOTHING)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_email TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS edit_token UUID DEFAULT uuid_generate_v4();
ALTER TABLE listings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- ── V3.1 Analytics Migration ─────────────────────────────
-- Track buyer WhatsApp CTA clicks per listing
ALTER TABLE listings ADD COLUMN IF NOT EXISTS whatsapp_clicks INTEGER DEFAULT 0;

-- RPC: increment whatsapp_clicks (mirrors increment_views pattern)
CREATE OR REPLACE FUNCTION increment_whatsapp_clicks(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE listings SET whatsapp_clicks = whatsapp_clicks + 1 WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_whatsapp_clicks(UUID) TO anon, authenticated;

-- Search events: log every search query with result count
CREATE TABLE IF NOT EXISTS search_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query       TEXT NOT NULL,
  category    TEXT,               -- category filter active at search time
  result_count INTEGER DEFAULT 0, -- 0 = zero-results search (demand gap)
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Service role writes search events; no public read (admin only)
ALTER TABLE search_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert so the API (anon key) can log searches
CREATE POLICY "Anyone can log search events" ON search_events
  FOR INSERT WITH CHECK (true);

-- Index for dashboard queries: top queries, zero-result queries, time range
CREATE INDEX IF NOT EXISTS search_events_query_idx ON search_events (query);
CREATE INDEX IF NOT EXISTS search_events_created_at_idx ON search_events (created_at DESC);
CREATE INDEX IF NOT EXISTS search_events_zero_results_idx ON search_events (result_count) WHERE result_count = 0;

-- ═══════════════════════════════════════════════════════
-- SEED DATA -- 8 sample listings (run after schema)
-- ═══════════════════════════════════════════════════════

INSERT INTO listings (title, price, category, condition, description, location, seller_name, seller_phone, seller_whatsapp, images, status, fee_tier, fee_amount) VALUES

('Cybex Balios S Lux Stroller', 28000, 'strollers', 'like_new',
 'Cybex Balios S Lux in Soho Black. Used for 6 months, excellent condition. Includes rain cover, cup holder and travel bag. One-hand fold mechanism.',
 'Karen, Nairobi', 'Wanjiku M', '0712345678', '254712345678', '{}', 'live', 'premium', 499),

('Trek 20" Kids Mountain Bike', 14500, 'bikes', 'good',
 'Red Trek Precaliber 20" with 7 speeds. My son outgrew it -- he is now 11. Brakes recently replaced, tyres good. Height 110-130cm recommended.',
 'Lavington, Nairobi', 'Peter O', '0723456789', '254723456789', '{}', 'live', 'premium', 499),

('Micro Mini Deluxe Scooter', 5500, 'scooters', 'like_new',
 'Iconic Micro Mini Deluxe in aqua. Perfect for ages 2-5. Light, smooth ride, adjustable height. Barely used -- gifted by grandparents.',
 'Westlands, Nairobi', 'Amina K', '0734567890', '254734567890', '{}', 'live', 'standard', 299),

('IKEA Antilop High Chair + Tray', 2800, 'baby-gear', 'good',
 'Classic IKEA Antilop with safety belt and detachable tray. Easy to wipe clean. No cracks. Suitable from 6 months.',
 'Kilimani, Nairobi', 'Grace N', '0745678901', '254745678901', '{}', 'live', 'standard', 299),

('Mamaroo 4 Baby Swing', 18000, 'baby-gear', 'like_new',
 '4moms MamaRoo 4 with Bluetooth. 5 unique motions, 5 speed settings, built-in nature sounds. Includes newborn insert. My twins loved this.',
 'Runda, Nairobi', 'Sandra W', '0756789012', '254756789012', '{}', 'live', 'premium', 499),

('Lego Technic 42143 Ferrari Daytona', 6500, 'toys', 'like_new',
 '1778-piece Lego Technic Ferrari SP3. Complete set, all pieces present, built once. Selling because we need shelf space!',
 'Muthaiga, Nairobi', 'James K', '0767890123', '254767890123', '{}', 'live', 'standard', 299),

('Britax Romer Dualfix Car Seat', 22000, 'car-seats', 'good',
 'Britax Romer Dualfix i-Size (2020). Rear and forward facing, ISOFIX. Group 0+/1. Comes with infant insert. No accident history.',
 'Gigiri, Nairobi', 'Fatuma A', '0778901234', '254778901234', '{}', 'live', 'premium', 499),

('Bundle: 12 Peppa Pig Books', 800, 'books', 'good',
 'Peppa Pig story books -- 12 titles. Ages 2-6. Some have a few scribbles inside (kids!). Great for early readers.',
 'South B, Nairobi', 'Mary J', '0789012345', '254789012345', '{}', 'live', 'starter', 99);
