-- =============================================================================
-- ÉTAPE 2 — Évolution schéma : shoes + affiliate_links
-- À appliquer via : Supabase Dashboard → SQL Editor
-- =============================================================================
-- Contexte :
--   shoes       : a déjà image_url / image_storage_path / image_original_url
--                 created_at / updated_at + trigger set_updated_at
--                 offer_count_active / price_min / auto_deactivated_at (migration 20260427000001)
--   affiliate_links : existe (admin_backoffice) — merchant CHECK restrictif,
--                     url TEXT, is_active BOOLEAN, pas d'updated_at
-- =============================================================================


-- =============================================================================
-- PARTIE 1 : Table shoes — champs image + disponibilité calculée
-- =============================================================================

ALTER TABLE public.shoes
  -- URL CDN Supabase Storage (public, stable, sous notre contrôle)
  -- Exemple : https://pdpmmahwzxkytstoaxjb.supabase.co/storage/v1/object/public/shoe-images/nike-pegasus-41.webp
  -- Distinct de image_url qui peut pointer un CDN marque externe
  ADD COLUMN IF NOT EXISTS image_url_cdn        TEXT,

  -- URL d'origine utilisée pour (re)télécharger l'image
  -- Alias sémantique de image_original_url — on les maintient en sync
  ADD COLUMN IF NOT EXISTS image_source_url     TEXT,

  -- Dernière vérification de disponibilité de l'image (HEAD request sur image_url_cdn)
  ADD COLUMN IF NOT EXISTS last_image_check     TIMESTAMPTZ,

  -- Disponibilité calculée : true si au moins une offre active valide
  -- Colonne générée — toujours cohérente avec offer_count_active (migration 20260427000001)
  ADD COLUMN IF NOT EXISTS is_available
    BOOLEAN GENERATED ALWAYS AS (offer_count_active > 0) STORED;

-- Index sur is_available pour filtrer rapidement le catalogue affiché
CREATE INDEX IF NOT EXISTS shoes_is_available_idx
  ON public.shoes (is_available)
  WHERE is_available = true;

-- Index pour la vérification périodique des images (les plus vieilles en premier)
CREATE INDEX IF NOT EXISTS shoes_last_image_check_idx
  ON public.shoes (last_image_check NULLS FIRST)
  WHERE image_url_cdn IS NOT NULL;

-- Backfill : image_source_url ← image_original_url (si définie)
UPDATE public.shoes
SET image_source_url = image_original_url
WHERE image_original_url IS NOT NULL
  AND image_source_url IS NULL;

-- Backfill : image_url_cdn ← construction depuis image_storage_path
-- Format : https://<project>.supabase.co/storage/v1/object/public/shoe-images/<path>
UPDATE public.shoes
SET image_url_cdn = 'https://pdpmmahwzxkytstoaxjb.supabase.co/storage/v1/object/public/shoe-images/' || image_storage_path
WHERE image_storage_path IS NOT NULL
  AND image_url_cdn IS NULL;


-- =============================================================================
-- PARTIE 2 : Table affiliate_links — restructuration complète
-- =============================================================================
-- Problèmes de l'existant :
--   1. merchant CHECK IN ('amazon','irun',...) bloque l'ajout de nouveaux marchands
--   2. url TEXT (ambigu : affiliate ? produit ? recherche ?)
--   3. is_active BOOLEAN au lieu d'un statut sémantique (active/dead/unknown)
--   4. Pas de updated_at, pas de final_url, pas de http_status
-- =============================================================================

-- ── 2.1 Supprimer la contrainte CHECK restrictive sur merchant ────────────────
-- Le nom exact de la contrainte varie selon la version Postgres.
-- On tente les deux noms possibles de façon sécurisée.
DO $$
BEGIN
  ALTER TABLE public.affiliate_links
    DROP CONSTRAINT IF EXISTS affiliate_links_merchant_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
DECLARE
  cname TEXT;
BEGIN
  -- Recherche du nom réel de la contrainte CHECK sur merchant
  SELECT conname INTO cname
  FROM   pg_constraint
  WHERE  conrelid = 'public.affiliate_links'::regclass
    AND  contype  = 'c'
    AND  pg_get_constraintdef(oid) ILIKE '%merchant%';

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.affiliate_links DROP CONSTRAINT %I', cname);
  END IF;
END $$;

-- ── 2.2 Nouveaux champs ───────────────────────────────────────────────────────

ALTER TABLE public.affiliate_links
  -- URL affiliée avec tag de tracking (remplace l'ambiguë colonne "url")
  -- "url" est conservée pour compatibilité, affiliate_url en est l'alias propre
  ADD COLUMN IF NOT EXISTS affiliate_url   TEXT,

  -- URL finale après résolution des redirections (ce que voit l'utilisateur)
  -- Peut différer de affiliate_url si le marchand redirige vers une page produit
  ADD COLUMN IF NOT EXISTS final_url       TEXT,

  -- Dernier code HTTP reçu lors de la vérification de l'URL
  ADD COLUMN IF NOT EXISTS http_status     SMALLINT,

  -- Statut sémantique remplaçant is_active BOOLEAN :
  --   active  → URL vérifiée OK, lien opérationnel
  --   dead    → URL 404/410 ou 5 échecs consécutifs
  --   unknown → jamais vérifié ou vérification trop ancienne (> 7 jours)
  ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'unknown'
                             CHECK (status IN ('active', 'dead', 'unknown')),

  -- Horodatage de dernière modification (absent de la v1)
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── 2.3 Index ─────────────────────────────────────────────────────────────────

-- Requête principale app : offres actives pour une chaussure, triées par merchant
CREATE INDEX IF NOT EXISTS affiliate_links_active_shoe_idx
  ON public.affiliate_links (shoe_id, status)
  WHERE status = 'active';

-- File de validation : liens à re-vérifier (les plus anciens en premier)
CREATE INDEX IF NOT EXISTS affiliate_links_check_queue_idx
  ON public.affiliate_links (last_checked_at NULLS FIRST)
  WHERE status != 'dead';

-- Recherche par marchand (backoffice, reporting)
CREATE INDEX IF NOT EXISTS affiliate_links_merchant_status_idx
  ON public.affiliate_links (merchant, status);

-- ── 2.4 Backfill ─────────────────────────────────────────────────────────────

-- affiliate_url ← url existante
UPDATE public.affiliate_links
SET affiliate_url = url
WHERE affiliate_url IS NULL
  AND url IS NOT NULL;

-- status ← is_active booléen
UPDATE public.affiliate_links
SET status = CASE
               WHEN is_active = true  THEN 'active'
               WHEN is_active = false THEN 'dead'
               ELSE 'unknown'
             END
WHERE status = 'unknown';

-- ── 2.5 Trigger updated_at ───────────────────────────────────────────────────

-- Réutilise la fonction set_updated_at() déjà créée par shoes_table migration
DROP TRIGGER IF EXISTS affiliate_links_set_updated_at ON public.affiliate_links;

CREATE TRIGGER affiliate_links_set_updated_at
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2.6 RLS : étendre la policy de lecture publique au nouveau champ status ──

DROP POLICY IF EXISTS "affiliate_links_public_read" ON public.affiliate_links;

CREATE POLICY "affiliate_links_public_read"
  ON public.affiliate_links
  FOR SELECT
  USING (status = 'active');       -- remplace l'ancien USING (is_active = true)


-- =============================================================================
-- PARTIE 3 : Vue utilitaire (optionnelle mais recommandée)
-- Consolide les meilleures offres par chaussure pour l'app et le backoffice
-- =============================================================================

CREATE OR REPLACE VIEW public.v_shoe_best_offers AS
SELECT
  al.shoe_id,
  al.merchant,
  al.country,
  al.affiliate_url,
  al.final_url,
  al.http_status,
  al.status,
  al.last_checked_at,
  -- Prix depuis shoe_prices si disponible, sinon price_last_seen
  COALESCE(sp.price, al.price_last_seen)    AS price,
  sp.stock_status,
  sp.priority_rank,
  sp.is_search_url
FROM public.affiliate_links al
LEFT JOIN public.shoe_prices sp
  ON  sp.product_id    = al.shoe_id
  AND sp.retailer_name ILIKE '%' || al.merchant || '%'
WHERE al.status = 'active'
ORDER BY al.shoe_id, COALESCE(sp.priority_rank, 50);

-- RLS sur la vue (hérite des tables sources, mais on l'explicite)
-- Note : les vues Supabase nécessitent SECURITY INVOKER (défaut) pour que
-- les RLS des tables sources s'appliquent correctement.


-- =============================================================================
-- VÉRIFICATIONS (à exécuter après application)
-- =============================================================================

-- 1. Champs shoes ajoutés
-- SELECT id, brand, model, image_url_cdn, image_source_url, last_image_check, is_available
-- FROM shoes LIMIT 10;

-- 2. affiliate_links restructurée
-- SELECT shoe_id, merchant, affiliate_url, final_url, http_status, status, updated_at
-- FROM affiliate_links LIMIT 20;

-- 3. Vérifier que is_available = true pour les chaussures avec offres
-- SELECT id, brand, model, offer_count_active, is_available
-- FROM shoes WHERE offer_count_active > 0 LIMIT 10;

-- 4. Vue consolidée
-- SELECT * FROM v_shoe_best_offers WHERE shoe_id = 'nike-pegasus-41';
