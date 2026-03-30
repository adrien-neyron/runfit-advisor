-- ============================================================
-- AFFILIATE FEED SYSTEM — tables + extensions
-- À appliquer dans : Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- PARTIE 1 : Table merchants (sources de flux affiliés)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.merchants (
  id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT    NOT NULL,
  slug              TEXT    NOT NULL UNIQUE,
  feed_url          TEXT,                          -- URL du flux produit
  feed_format       TEXT    NOT NULL DEFAULT 'json'
                    CHECK (feed_format IN ('xml', 'csv', 'json')),
  affiliate_network TEXT
                    CHECK (affiliate_network IN ('amazon', 'awin', 'cj', 'manual')),
  affiliate_tag     TEXT,                          -- tag/ID partenaire
  country           TEXT    NOT NULL DEFAULT 'fr',
  logo_url          TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  last_sync_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS merchants_slug_idx      ON public.merchants (slug);
CREATE INDEX IF NOT EXISTS merchants_is_active_idx ON public.merchants (is_active);

CREATE OR REPLACE FUNCTION public.merchants_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER merchants_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION public.merchants_set_updated_at();

-- RLS
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "merchants_public_read"
  ON public.merchants FOR SELECT USING (is_active = true);

CREATE POLICY "merchants_service_write"
  ON public.merchants FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTIE 2 : Extension shoe_prices — merchant_id + external_id
-- ============================================================

ALTER TABLE public.shoe_prices
  ADD COLUMN IF NOT EXISTS merchant_id          UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS external_product_id  TEXT;   -- ID produit chez le marchand

CREATE INDEX IF NOT EXISTS shoe_prices_merchant_id_idx        ON public.shoe_prices (merchant_id);
CREATE INDEX IF NOT EXISTS shoe_prices_external_product_id_idx ON public.shoe_prices (external_product_id);
CREATE INDEX IF NOT EXISTS shoe_prices_stock_status_idx        ON public.shoe_prices (stock_status);

-- ============================================================
-- PARTIE 3 : Table price_history (historique des prix)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.price_history (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  shoe_price_id UUID    NOT NULL REFERENCES public.shoe_prices(id) ON DELETE CASCADE,
  price         NUMERIC(10,2) NOT NULL,
  currency      TEXT    NOT NULL DEFAULT 'EUR',
  recorded_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS price_history_shoe_price_id_idx ON public.price_history (shoe_price_id);
CREATE INDEX IF NOT EXISTS price_history_recorded_at_idx   ON public.price_history (recorded_at DESC);

-- RLS — accès en lecture (analyse trends), écriture service_role
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "price_history_public_read"
  ON public.price_history FOR SELECT USING (true);

CREATE POLICY "price_history_service_write"
  ON public.price_history FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTIE 4 : Table feed_sync_logs (traçabilité des syncs)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.feed_sync_logs (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID    REFERENCES public.merchants(id) ON DELETE SET NULL,
  merchant_slug   TEXT    NOT NULL,
  status          TEXT    NOT NULL
                  CHECK (status IN ('running', 'success', 'error', 'partial')),
  items_fetched   INTEGER NOT NULL DEFAULT 0,
  items_upserted  INTEGER NOT NULL DEFAULT 0,
  items_removed   INTEGER NOT NULL DEFAULT 0,
  error_message   TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS feed_sync_logs_merchant_id_idx ON public.feed_sync_logs (merchant_id);
CREATE INDEX IF NOT EXISTS feed_sync_logs_started_at_idx  ON public.feed_sync_logs (started_at DESC);

-- RLS — lecture admin/service uniquement
ALTER TABLE public.feed_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed_sync_logs_service_only"
  ON public.feed_sync_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTIE 5 : Seed marchands de référence
-- ============================================================

INSERT INTO public.merchants (name, slug, affiliate_network, affiliate_tag, country, logo_url, is_active, feed_format)
VALUES
  ('Amazon.fr',              'amazon-fr',    'amazon',  'runfit-21',  'fr', 'https://logo.clearbit.com/amazon.fr',               true,  'json'),
  ('i-Run',                  'i-run',        'awin',    NULL,         'fr', 'https://logo.clearbit.com/i-run.fr',                 true,  'xml'),
  ('The Running Collective', 'trc',          'awin',    NULL,         'fr', 'https://logo.clearbit.com/therunningcollective.fr',  true,  'xml'),
  ('Courir',                 'courir',       'awin',    NULL,         'fr', 'https://logo.clearbit.com/courir.com',               true,  'xml'),
  ('Intersport',             'intersport',   'awin',    NULL,         'fr', 'https://logo.clearbit.com/intersport.fr',            true,  'xml'),
  ('Decathlon',              'decathlon',    'manual',  NULL,         'fr', 'https://logo.clearbit.com/decathlon.fr',             true,  'json')
ON CONFLICT (slug) DO NOTHING;
