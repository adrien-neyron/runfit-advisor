-- ============================================================
-- Table shoes — source de vérité du catalogue RunFit
-- ============================================================
-- À appliquer dans : Supabase Dashboard → SQL Editor
-- ============================================================

-- Table principale
CREATE TABLE IF NOT EXISTS public.shoes (
  id                  TEXT PRIMARY KEY,
  brand               TEXT NOT NULL,
  model               TEXT NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  prix                DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Biomécanique (arrays de valeurs)
  foulee              TEXT[] NOT NULL DEFAULT '{}',
  terrain             TEXT[] NOT NULL DEFAULT '{}',

  -- Spécifications techniques
  amorti              TEXT NOT NULL CHECK (amorti IN ('faible', 'moyen', 'élevé')),
  drop_mm             INTEGER NOT NULL DEFAULT 8 CHECK (drop_mm >= 0 AND drop_mm <= 30),
  poids_g             INTEGER NOT NULL DEFAULT 280 CHECK (poids_g > 0),
  stabilite           TEXT NOT NULL CHECK (stabilite IN ('faible', 'moyenne', 'élevée')),
  dynamisme           TEXT NOT NULL CHECK (dynamisme IN ('faible', 'moyen', 'élevé')),
  largeur_disponible  TEXT[] NOT NULL DEFAULT '{standard}',

  -- Segmentation
  niveau              TEXT[] NOT NULL DEFAULT '{}',
  objectif            TEXT[] NOT NULL DEFAULT '{}',
  benefits            TEXT[] NOT NULL DEFAULT '{}',

  -- Images
  -- image_url       : URL actuellement servie (Supabase Storage si uploadée, sinon externe)
  -- image_storage_path : chemin dans le bucket shoe-images (ex: 'nike-pegasus-41.webp')
  -- image_original_url : URL d'origine sur le CDN de la marque (pour re-téléchargement)
  image_url           TEXT,
  image_storage_path  TEXT,
  image_original_url  TEXT,

  -- Statut
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index utiles pour les requêtes de filtrage
CREATE INDEX IF NOT EXISTS shoes_brand_idx ON public.shoes (brand);
CREATE INDEX IF NOT EXISTS shoes_amorti_idx ON public.shoes (amorti);
CREATE INDEX IF NOT EXISTS shoes_is_active_idx ON public.shoes (is_active);
CREATE INDEX IF NOT EXISTS shoes_foulee_idx ON public.shoes USING GIN (foulee);
CREATE INDEX IF NOT EXISTS shoes_terrain_idx ON public.shoes USING GIN (terrain);
CREATE INDEX IF NOT EXISTS shoes_niveau_idx ON public.shoes USING GIN (niveau);

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER shoes_set_updated_at
  BEFORE UPDATE ON public.shoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- RLS — Row Level Security
-- ============================================================
ALTER TABLE public.shoes ENABLE ROW LEVEL SECURITY;

-- Lecture publique (tout le monde peut voir les chaussures actives)
CREATE POLICY "shoes_public_read"
  ON public.shoes
  FOR SELECT
  USING (is_active = true);

-- Écriture réservée au service role (scripts admin)
CREATE POLICY "shoes_service_write"
  ON public.shoes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- Supabase Storage — bucket shoe-images
-- ============================================================
-- Bucket public pour héberger les images des chaussures
-- Les images sont téléchargées depuis les CDN officiels des marques
-- et re-hébergées ici pour fiabilité et performances.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shoe-images',
  'shoe-images',
  true,
  5242880, -- 5 MB max par image
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- Lecture publique du bucket (images visibles par tous)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'shoe_images_public_read'
  ) THEN
    CREATE POLICY "shoe_images_public_read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'shoe-images');
  END IF;
END $$;

-- Upload autorisé uniquement via service role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'shoe_images_service_insert'
  ) THEN
    CREATE POLICY "shoe_images_service_insert"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'shoe-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'shoe_images_service_update'
  ) THEN
    CREATE POLICY "shoe_images_service_update"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'shoe-images');
  END IF;
END $$;
