-- ═══════════════════════════════════════════════════════
-- MyTinyverse Blog Articles Schema
-- Run in Supabase Dashboard -> SQL Editor -> New Query
-- Run AFTER the main schema.sql
-- ═══════════════════════════════════════════════════════

-- ── Articles table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  slug                TEXT UNIQUE NOT NULL,
  excerpt             TEXT,
  content             TEXT,                        -- full HTML content
  cover_image_url     TEXT,
  meta_title          TEXT,
  meta_description    TEXT,
  tags                TEXT[] DEFAULT '{}',
  status              TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','pending','published')),
  views               INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 5,
  author              TEXT DEFAULT 'MyTinyverse Team',
  published_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at trigger
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles only
CREATE POLICY "Public read published articles" ON articles
  FOR SELECT USING (status = 'published');

-- Service role (admin API) can do everything (bypasses RLS by default)

-- ── Indexes for performance ───────────────────────────────
CREATE INDEX IF NOT EXISTS articles_slug_idx        ON articles (slug);
CREATE INDEX IF NOT EXISTS articles_status_idx      ON articles (status);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles (published_at DESC);
CREATE INDEX IF NOT EXISTS articles_tags_idx        ON articles USING GIN (tags);

-- ── RPC: increment article view count ────────────────────
CREATE OR REPLACE FUNCTION increment_article_views(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE articles SET views = views + 1 WHERE slug = article_slug AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_article_views(TEXT) TO anon, authenticated;
