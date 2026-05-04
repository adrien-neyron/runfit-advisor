-- =============================================================================
-- ÉTAPE 6 — Disponibilité automatique des chaussures depuis affiliate_links
-- À appliquer via : Supabase Dashboard → SQL Editor
-- =============================================================================
-- Contexte :
--   offer_count_active était piloté par shoe_prices (stock_status + url_status).
--   shoe_prices = données de prix scrappées (peut être vide).
--   affiliate_links = liens affiliés actifs = seule vraie source de vérité business.
--
-- Changements :
--   1. sync_shoe_availability()      → ne met plus à jour offer_count_active
--                                       (garde uniquement price_min)
--   2. Nouveau trigger affiliate_links → maintient offer_count_active en temps réel
--   3. Backfill offer_count_active depuis affiliate_links.status = 'active'
--   4. is_available (colonne générée) = offer_count_active > 0 → aucun changement SQL
-- =============================================================================


-- =============================================================================
-- PARTIE 1 : Mettre à jour sync_shoe_availability — price_min uniquement
-- Supprime la logique offer_count_active et auto-désactivation de cette fonction
-- (elles passent désormais par le trigger affiliate_links ci-dessous)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_shoe_availability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  target_product_id TEXT;
  new_price_min     NUMERIC(10,2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  -- Recalcule uniquement price_min depuis shoe_prices
  SELECT MIN(price)
  INTO new_price_min
  FROM public.shoe_prices
  WHERE product_id   = target_product_id
    AND stock_status = 'in_stock'
    AND url_status   IN ('valid', 'unknown');

  UPDATE public.shoes
  SET
    price_min  = new_price_min,
    updated_at = NOW()
  WHERE id = target_product_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Le trigger shoe_prices_sync_availability reste en place,
-- il appelle désormais la version allégée de sync_shoe_availability().


-- =============================================================================
-- PARTIE 2 : Nouveau trigger sur affiliate_links — offer_count_active
-- Se déclenche à chaque INSERT / UPDATE de status / DELETE
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_offer_count_from_affiliate()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  target_shoe_id    TEXT;
  new_count         SMALLINT;
BEGIN
  -- Détermine la chaussure impactée
  IF TG_OP = 'DELETE' THEN
    target_shoe_id := OLD.shoe_id;
  ELSE
    target_shoe_id := NEW.shoe_id;
  END IF;

  -- Recompte les liens actifs pour cette chaussure
  SELECT COUNT(*)::SMALLINT
  INTO new_count
  FROM public.affiliate_links
  WHERE shoe_id = target_shoe_id
    AND status  = 'active';

  -- Met à jour offer_count_active
  -- is_available se recalcule automatiquement (colonne générée)
  UPDATE public.shoes
  SET
    offer_count_active = COALESCE(new_count, 0),
    updated_at         = NOW()
  WHERE id = target_shoe_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS affiliate_links_sync_offer_count ON public.affiliate_links;

CREATE TRIGGER affiliate_links_sync_offer_count
  AFTER INSERT OR UPDATE OF status OR DELETE
  ON public.affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_offer_count_from_affiliate();


-- =============================================================================
-- PARTIE 3 : Backfill offer_count_active depuis affiliate_links
-- Corrige les valeurs existantes (étaient calculées depuis shoe_prices)
-- =============================================================================

-- Étape 3a : Remettre à 0 toutes les chaussures
UPDATE public.shoes
SET offer_count_active = 0;

-- Étape 3b : Recalculer depuis affiliate_links WHERE status = 'active'
UPDATE public.shoes s
SET
  offer_count_active = sub.cnt,
  updated_at         = NOW()
FROM (
  SELECT
    shoe_id,
    COUNT(*)::SMALLINT AS cnt
  FROM public.affiliate_links
  WHERE status = 'active'
  GROUP BY shoe_id
) sub
WHERE s.id = sub.shoe_id;

-- Note : is_available (colonne générée) se recalcule automatiquement.


-- =============================================================================
-- PARTIE 4 : Index de lecture — catalogue affiché côté app
-- Couvre la requête principale : is_available = true AND is_active = true
-- =============================================================================

-- Index composite pour le catalogue app (évite un seq scan sur shoes)
CREATE INDEX IF NOT EXISTS shoes_catalog_idx
  ON public.shoes (is_available, is_active, brand, model)
  WHERE is_available = true AND is_active = true;

-- Index partial pour le backoffice (chaussures sans aucune offre)
CREATE INDEX IF NOT EXISTS shoes_no_offer_idx
  ON public.shoes (id, brand, model)
  WHERE offer_count_active = 0 AND is_active = true;


-- =============================================================================
-- VÉRIFICATIONS (à exécuter après application)
-- =============================================================================

-- 1. Répartition is_available
-- SELECT is_available, COUNT(*) FROM shoes GROUP BY is_available;

-- 2. Chaussures sans lien actif
-- SELECT id, brand, model, offer_count_active, is_available
-- FROM shoes WHERE offer_count_active = 0 AND is_active = true
-- ORDER BY brand;

-- 3. Cohérence trigger : forcer un UPDATE test
-- UPDATE affiliate_links SET status = status WHERE id = (SELECT id FROM affiliate_links LIMIT 1);
-- SELECT id, brand, model, offer_count_active FROM shoes LIMIT 5;
