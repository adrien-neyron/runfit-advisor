-- ============================================================
-- BACKOFFICE ADMIN — Tables supplémentaires + extension shoes
-- À appliquer dans : Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- PARTIE 1 : Table brands
-- ============================================================

CREATE TABLE IF NOT EXISTS public.brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS brands_slug_idx ON public.brands (slug);
CREATE INDEX IF NOT EXISTS brands_name_idx ON public.brands (name);

-- RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_public_read"
  ON public.brands FOR SELECT
  USING (true);

CREATE POLICY "brands_service_write"
  ON public.brands FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTIE 2 : Extension de la table shoes (colonnes backoffice)
-- ============================================================
-- La table shoes existante conserve ses colonnes app (brand text, terrain text[], etc.)
-- On ajoute les colonnes admin pour le backoffice sans briser l'app.

ALTER TABLE public.shoes
  ADD COLUMN IF NOT EXISTS brand_id       UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slug           TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS category       TEXT CHECK (category IN ('road', 'trail', 'daily', 'race')),
  ADD COLUMN IF NOT EXISTS pronation      TEXT CHECK (pronation IN ('neutral', 'stability', 'motion_control')),
  ADD COLUMN IF NOT EXISTS terrain_type   TEXT CHECK (terrain_type IN ('road', 'trail', 'mixed')),
  ADD COLUMN IF NOT EXISTS gender         TEXT DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex')),
  ADD COLUMN IF NOT EXISTS release_year   INTEGER CHECK (release_year BETWEEN 2000 AND 2030),
  ADD COLUMN IF NOT EXISTS weight_g       INTEGER CHECK (weight_g > 0),
  ADD COLUMN IF NOT EXISTS is_draft       BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS shoes_brand_id_idx  ON public.shoes (brand_id);
CREATE INDEX IF NOT EXISTS shoes_slug_idx      ON public.shoes (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS shoes_category_idx  ON public.shoes (category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS shoes_is_draft_idx  ON public.shoes (is_draft);

-- ============================================================
-- PARTIE 3 : Table shoe_images
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shoe_images (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shoe_id          TEXT NOT NULL REFERENCES public.shoes(id) ON DELETE CASCADE,
  url_original     TEXT NOT NULL,
  url_optimized    TEXT,                  -- URL dans Supabase Storage après pipeline
  is_primary       BOOLEAN NOT NULL DEFAULT false,
  angle            TEXT CHECK (angle IN ('side', 'top', 'outsole', 'lifestyle')),
  source           TEXT NOT NULL DEFAULT 'manual'
                   CHECK (source IN ('affiliate', 'brand', 'manual')),
  last_verified_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contrainte : une seule image primaire par chaussure
CREATE UNIQUE INDEX IF NOT EXISTS shoe_images_one_primary_per_shoe
  ON public.shoe_images (shoe_id)
  WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS shoe_images_shoe_id_idx ON public.shoe_images (shoe_id);

-- RLS
ALTER TABLE public.shoe_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shoe_images_public_read"
  ON public.shoe_images FOR SELECT
  USING (true);

CREATE POLICY "shoe_images_service_write"
  ON public.shoe_images FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTIE 4 : Table affiliate_links
-- ============================================================

CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shoe_id          TEXT NOT NULL REFERENCES public.shoes(id) ON DELETE CASCADE,
  merchant         TEXT NOT NULL
                   CHECK (merchant IN ('amazon', 'irun', 'alltricks', 'nike', 'asics', 'decathlon', 'other')),
  country          TEXT NOT NULL DEFAULT 'fr',
  url              TEXT NOT NULL,
  price_last_seen  NUMERIC(10,2),
  last_checked_at  TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unicité : un seul lien par merchant/pays pour une chaussure
CREATE UNIQUE INDEX IF NOT EXISTS affiliate_links_uniq
  ON public.affiliate_links (shoe_id, merchant, country);

CREATE INDEX IF NOT EXISTS affiliate_links_shoe_id_idx  ON public.affiliate_links (shoe_id);
CREATE INDEX IF NOT EXISTS affiliate_links_merchant_idx ON public.affiliate_links (merchant);
CREATE INDEX IF NOT EXISTS affiliate_links_active_idx   ON public.affiliate_links (is_active);

-- RLS
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_links_public_read"
  ON public.affiliate_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "affiliate_links_service_write"
  ON public.affiliate_links FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
