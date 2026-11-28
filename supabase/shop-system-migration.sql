-- ============================================================
-- MyTinyverse Shop System Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- SAFE TO RE-RUN: all statements use IF NOT EXISTS / OR REPLACE.
-- ============================================================

-- ── 1. Add shop-specific columns to seller_profiles ─────────
-- These columns power the shop auth system and dashboard.
-- They are added with safe defaults so existing rows are unaffected.

ALTER TABLE seller_profiles
  ADD COLUMN IF NOT EXISTS is_shop               BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shop_name             TEXT,
  ADD COLUMN IF NOT EXISTS shop_bio              TEXT,
  ADD COLUMN IF NOT EXISTS shop_banner_url       TEXT,
  ADD COLUMN IF NOT EXISTS shop_areas            TEXT[]      DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS verified_shop         BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS subscription_tier     TEXT        DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- shop_pin was added by an earlier migration; keep it idempotent
ALTER TABLE seller_profiles
  ADD COLUMN IF NOT EXISTS shop_pin TEXT;

-- ── 2. Fast index for shop lookups ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_seller_profiles_is_shop
  ON seller_profiles (is_shop)
  WHERE is_shop = TRUE;

-- ── 3. Fix profile_slug so it allows existing rows without it
-- Only run if the column was originally created NOT NULL without a default.
-- The DO block skips silently if the column is already nullable.
DO $$
BEGIN
  -- Make profile_slug nullable so rows without it don't break inserts
  -- (The app generates one for every new shop; this is just a safety guard)
  BEGIN
    ALTER TABLE seller_profiles ALTER COLUMN profile_slug DROP NOT NULL;
  EXCEPTION WHEN others THEN
    NULL; -- column is already nullable or doesn't have NOT NULL
  END;
END $$;

-- ── 4. Update listings table ─────────────────────────────────
-- Add view_count (the shop dashboard uses this column name)
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Migrate existing views → view_count so no data is lost
-- (Only runs once; subsequent runs are no-ops since view_count will already have data)
UPDATE listings
   SET view_count = COALESCE(views, 0)
 WHERE view_count = 0 AND COALESCE(views, 0) > 0;

-- ── 5. Expand listings status to include 'sold' and 'archived'
-- The original constraint only allowed 'pending','live','rejected'.
-- Shop owners need to mark items as sold or archive them.
DO $$
BEGIN
  -- Try to drop the old constraint (name may vary by setup)
  BEGIN
    ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  BEGIN
    ALTER TABLE listings DROP CONSTRAINT IF EXISTS "listings_status_check";
  EXCEPTION WHEN others THEN
    NULL;
  END;
  -- Recreate with the full set of valid statuses
  BEGIN
    ALTER TABLE listings
      ADD CONSTRAINT listings_status_check
        CHECK (status IN ('pending','live','rejected','sold','archived'));
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- constraint already exists with this name
  END;
END $$;

-- ── 6. RPC: increment_total_sold ─────────────────────────────
-- Called when a shop owner marks a listing as sold.
CREATE OR REPLACE FUNCTION increment_total_sold(seller_phone_input TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE seller_profiles
     SET total_sold = COALESCE(total_sold, 0) + 1
   WHERE phone = seller_phone_input;
END;
$$;

-- ── 7. Fast index for shop listing queries ───────────────────
CREATE INDEX IF NOT EXISTS idx_listings_view_count
  ON listings (view_count DESC);

CREATE INDEX IF NOT EXISTS idx_listings_seller_phone_status
  ON listings (seller_phone, status);

-- ── Done ─────────────────────────────────────────────────────
-- After running this migration, the following should work:
--   • Admin can onboard a shop (all shop columns exist)
--   • Shop owner can log in at /my-shop
--   • Shop dashboard loads correctly (view_count column exists)
--   • Shop owner can mark listings as sold/archived
