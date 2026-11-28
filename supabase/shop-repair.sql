-- ============================================================
-- MyTinyverse Shop Repair Script
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- PURPOSE: Diagnose and fix broken shop records created before
--          the shop system was fully deployed.
-- SAFE TO RUN: read-only queries first; updates are clearly marked.
-- ============================================================

-- ── 1. DIAGNOSE: Show all shop records and their state ──────
SELECT
  id,
  phone,
  display_name,
  shop_name,
  is_shop,
  CASE WHEN shop_pin IS NULL THEN '❌ MISSING' ELSE '✅ set' END AS pin_status,
  CASE WHEN profile_slug IS NULL THEN '❌ MISSING' ELSE '✅ ' || profile_slug END AS slug_status,
  created_at
FROM seller_profiles
WHERE is_shop = TRUE
ORDER BY created_at DESC;

-- ── 2. DIAGNOSE: Count broken records ─────────────────────
SELECT
  COUNT(*) FILTER (WHERE is_shop = TRUE AND shop_pin IS NULL) AS shops_missing_pin,
  COUNT(*) FILTER (WHERE is_shop = TRUE AND profile_slug IS NULL) AS shops_missing_slug,
  COUNT(*) FILTER (WHERE is_shop = TRUE) AS total_shops
FROM seller_profiles;


-- ════════════════════════════════════════════════════════════
-- FIX SECTION — uncomment and run what you need
-- ════════════════════════════════════════════════════════════

-- ── FIX A: Delete broken test shops so you can re-create them
-- (Replace '254XXXXXXXXX' with the actual phone number)
-- !! DESTRUCTIVE - only use on test shops !!
--
-- DELETE FROM seller_profiles
-- WHERE phone = '254XXXXXXXXX' AND is_shop = TRUE;


-- ── FIX B: Generate a profile_slug for shops that are missing one
-- (Safe to run - only affects rows where profile_slug IS NULL)
--
-- UPDATE seller_profiles
-- SET profile_slug = LOWER(REGEXP_REPLACE(shop_name, '[^a-zA-Z0-9]+', '-', 'g'))
--                   || '-' || SUBSTR(MD5(phone), 1, 4)
-- WHERE is_shop = TRUE AND profile_slug IS NULL;


-- ── FIX C: Mark shops that have all required fields as verified
-- (Just a sanity check query - run as-is to see which shops are ready)
--
-- SELECT phone, shop_name, profile_slug, 'ready to login' AS status
-- FROM seller_profiles
-- WHERE is_shop = TRUE
--   AND shop_pin IS NOT NULL
--   AND profile_slug IS NOT NULL;
