-- ============================================================
-- Seller Profiles schema migration
-- Paste this into the Supabase SQL Editor and run it.
-- ============================================================

-- 1. Create the seller_profiles table
CREATE TABLE IF NOT EXISTS seller_profiles (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  phone         TEXT        UNIQUE NOT NULL,          -- normalized: 254XXXXXXXXX
  display_name  TEXT        NOT NULL,
  bio           TEXT        CHECK (char_length(bio) <= 160),
  neighbourhood TEXT,
  avatar_url    TEXT,
  profile_slug  TEXT        UNIQUE NOT NULL,
  total_sold    INTEGER     DEFAULT 0 NOT NULL,
  edit_token    TEXT        NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Auto-update updated_at on any change
CREATE OR REPLACE FUNCTION set_seller_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_seller_profiles_updated_at ON seller_profiles;
CREATE TRIGGER trg_seller_profiles_updated_at
  BEFORE UPDATE ON seller_profiles
  FOR EACH ROW EXECUTE FUNCTION set_seller_profile_updated_at();

-- 3. Enable Row-Level Security (read-only for anonymous; writes via service role)
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;

-- Public can read any profile
CREATE POLICY "profiles_public_read"
  ON seller_profiles FOR SELECT
  USING (true);

-- Only the service role (server-side API) can insert / update / delete
-- (No anon write policy -- all writes go through /api/sellers which uses service-role key)

-- 4. Index for fast slug + phone lookups
CREATE INDEX IF NOT EXISTS idx_seller_profiles_slug  ON seller_profiles (profile_slug);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_phone ON seller_profiles (phone);

-- 5. Storage bucket for seller avatars (run this only if the bucket doesn't exist yet)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('seller-avatars', 'seller-avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- 6. Grant anon read on the bucket (uncomment if using Storage avatars)
-- CREATE POLICY "avatars_public_read"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'seller-avatars');
