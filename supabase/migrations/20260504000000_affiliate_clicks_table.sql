-- Migration : affiliate_clicks + asin sur affiliate_links
-- À appliquer via le SQL Editor du dashboard Supabase

-- 1. Colonne ASIN sur affiliate_links (identifier produit Amazon)
ALTER TABLE affiliate_links
  ADD COLUMN IF NOT EXISTS asin TEXT;

COMMENT ON COLUMN affiliate_links.asin IS 'Amazon ASIN (B0XXXXXXXXX). Permet de construire un lien produit clean côté serveur.';

-- 2. Table de tracking de clics affiliés (toutes sources, server-side)
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shoe_id     UUID        REFERENCES shoes(id) ON DELETE SET NULL,
  merchant    TEXT        NOT NULL,
  country     TEXT        NOT NULL DEFAULT 'FR',
  asin        TEXT,
  user_agent  TEXT,
  referer     TEXT,
  ip_hash     TEXT,       -- 16 hex chars SHA-256 préfixé+salé → conforme RGPD
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index analytiques
CREATE INDEX IF NOT EXISTS affiliate_clicks_shoe_idx          ON affiliate_clicks (shoe_id);
CREATE INDEX IF NOT EXISTS affiliate_clicks_merchant_idx      ON affiliate_clicks (merchant);
CREATE INDEX IF NOT EXISTS affiliate_clicks_date_idx          ON affiliate_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_clicks_merchant_date_idx ON affiliate_clicks (merchant, created_at DESC);

-- RLS : seul le service_role peut écrire (via l'endpoint API serveur)
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "affiliate_clicks_service_insert" ON affiliate_clicks;
CREATE POLICY "affiliate_clicks_service_insert" ON affiliate_clicks
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "affiliate_clicks_service_select" ON affiliate_clicks;
CREATE POLICY "affiliate_clicks_service_select" ON affiliate_clicks
  FOR SELECT TO service_role USING (true);

-- 3. Vue analytique : clics par chaussure / marchand / jour
CREATE OR REPLACE VIEW v_affiliate_click_stats AS
SELECT
  shoe_id,
  merchant,
  country,
  DATE_TRUNC('day', created_at) AS day,
  COUNT(*)                       AS clicks
FROM affiliate_clicks
GROUP BY shoe_id, merchant, country, DATE_TRUNC('day', created_at);
