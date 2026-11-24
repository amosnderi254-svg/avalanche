-- Migration: Add shop_pin column to seller_profiles
-- Run this once against your Supabase project.
-- shop_pin stores PBKDF2-SHA512 hashed PINs in "salt_hex:hash_hex" format.

ALTER TABLE seller_profiles
  ADD COLUMN IF NOT EXISTS shop_pin TEXT;

-- Optional: index for lookup by phone on login (already indexed if phone is PK/unique)
-- CREATE INDEX IF NOT EXISTS idx_seller_profiles_phone_shop ON seller_profiles(phone) WHERE is_shop = true;

-- RPC: increment_total_sold (called when a listing is marked sold via the shop dashboard)
-- Creates or replaces the function so it is idempotent.
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
