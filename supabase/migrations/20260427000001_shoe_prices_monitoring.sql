-- =============================================================================
-- PRIORITÉ 1 — Monitoring des liens + disponibilité automatique
-- Tables impactées : shoe_prices, shoes
-- À appliquer via : Supabase Dashboard → SQL Editor
-- =============================================================================

-- =============================================================================
-- PARTIE 1 : Nouveaux champs sur shoe_prices
-- =============================================================================

ALTER TABLE public.shoe_prices
  -- Ordre d'affichage des marchands côté app (Amazon toujours en premier)
  ADD COLUMN IF NOT EXISTS priority_rank          SMALLINT      NOT NULL DEFAULT 50,

  -- Flag explicite : URL de recherche (toujours valide) vs URL produit direct (peut 404)
  ADD COLUMN IF NOT EXISTS is_search_url          BOOLEAN       NOT NULL DEFAULT false,

  -- Suivi des échecs consécutifs pour distinguer erreur transitoire / URL morte
  ADD COLUMN IF NOT EXISTS consecutive_failures   INTEGER       NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failure_since          TIMESTAMPTZ,

  -- Timestamp du dernier changement de stock_status (pour alertes "rupture depuis X jours")
  ADD COLUMN IF NOT EXISTS availability_changed_at TIMESTAMPTZ;

-- Index pour la file de validation (vérifier en priorité les URLs à haut rank)
CREATE INDEX IF NOT EXISTS shoe_prices_check_queue_idx
  ON public.shoe_prices (priority_rank, last_checked_at NULLS FIRST)
  WHERE url_status != 'dead';

-- Index pour le monitoring des échecs
CREATE INDEX IF NOT EXISTS shoe_prices_failures_idx
  ON public.shoe_prices (consecutive_failures DESC, failure_since)
  WHERE consecutive_failures > 0;

-- =============================================================================
-- PARTIE 2 : Nouveaux champs sur shoes (dénormalisés pour éviter des JOINs)
-- =============================================================================

ALTER TABLE public.shoes
  -- Prix plancher actuel parmi toutes les offres actives
  ADD COLUMN IF NOT EXISTS price_min          NUMERIC(10,2),

  -- Nombre d'offres in_stock + url valide (évite COUNT(*) à chaque rendu)
  ADD COLUMN IF NOT EXISTS offer_count_active SMALLINT NOT NULL DEFAULT 0,

  -- Timestamp de désactivation automatique (≠ is_active mis à false manuellement)
  ADD COLUMN IF NOT EXISTS auto_deactivated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS shoes_price_min_idx        ON public.shoes (price_min) WHERE price_min IS NOT NULL;
CREATE INDEX IF NOT EXISTS shoes_offer_count_idx       ON public.shoes (offer_count_active);
CREATE INDEX IF NOT EXISTS shoes_auto_deactivated_idx  ON public.shoes (auto_deactivated_at) WHERE auto_deactivated_at IS NOT NULL;

-- =============================================================================
-- PARTIE 3 : Backfill is_search_url (détection sur les données existantes)
-- Reprend la même logique que la fonction validate-offer-links
-- =============================================================================

UPDATE public.shoe_prices
SET is_search_url = true
WHERE
  product_url LIKE '%/s?%'
  OR product_url LIKE '%?q=%'
  OR product_url LIKE '%?k=%'
  OR product_url LIKE '%?search=%'
  OR product_url LIKE '%?Ntt=%'
  OR product_url LIKE '%?query=%'
  OR product_url LIKE '%/search?%'
  OR product_url LIKE '%/recherche?%'
  OR product_url LIKE '%catalogsearch/result%'
  OR product_url LIKE '%google.com/search%';

-- =============================================================================
-- PARTIE 4 : Backfill priority_rank selon le marchand
-- =============================================================================

-- Spécialistes running (meilleure conversion, audience qualifiée)
UPDATE public.shoe_prices SET priority_rank = 10
WHERE retailer_name ILIKE '%amazon%';

UPDATE public.shoe_prices SET priority_rank = 20
WHERE retailer_name ILIKE ANY(ARRAY['%i-run%', '%irun%', '%running collective%', '%alltricks%', '%runningaddict%', '%running addict%']);

-- Grandes surfaces sport (fort trafic, moins qualifié)
UPDATE public.shoe_prices SET priority_rank = 30
WHERE retailer_name ILIKE ANY(ARRAY['%intersport%', '%decathlon%', '%sport 2000%', '%sport2000%', '%ekosport%']);

-- Distribution street / généraliste
UPDATE public.shoe_prices SET priority_rank = 40
WHERE retailer_name ILIKE ANY(ARRAY['%courir%', '%foot locker%', '%footlocker%', '%jd sports%', '%jdsports%']);

-- Marques en direct (marge nulle mais crédibilité)
UPDATE public.shoe_prices SET priority_rank = 50
WHERE retailer_name ILIKE ANY(ARRAY['%nike%', '%adidas%', '%asics%', '%brooks%', '%hoka%', '%salomon%', '%new balance%', '%newbalance%', '%saucony%', '%mizuno%', '%on running%', '%on-running%']);

-- =============================================================================
-- PARTIE 5 : Backfill offer_count_active et price_min sur shoes
-- =============================================================================

UPDATE public.shoes s
SET
  offer_count_active = sub.cnt,
  price_min          = sub.min_price
FROM (
  SELECT
    product_id,
    COUNT(*)::SMALLINT                        AS cnt,
    MIN(price)                                AS min_price
  FROM public.shoe_prices
  WHERE stock_status = 'in_stock'
    AND url_status   IN ('valid', 'unknown')  -- 'unknown' = jamais vérifié = présumé valide
  GROUP BY product_id
) sub
WHERE s.id = sub.product_id;

-- =============================================================================
-- PARTIE 6 : Trigger — maintenir offer_count_active et price_min en temps réel
-- Se déclenche à chaque INSERT / UPDATE / DELETE sur shoe_prices
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_shoe_availability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  target_product_id TEXT;
  new_count         SMALLINT;
  new_price_min     NUMERIC(10,2);
BEGIN
  -- Détermine la chaussure impactée selon l'opération
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  -- Recalcule les agrégats en une seule requête
  SELECT
    COUNT(*)::SMALLINT,
    MIN(price)
  INTO new_count, new_price_min
  FROM public.shoe_prices
  WHERE product_id  = target_product_id
    AND stock_status = 'in_stock'
    AND url_status   IN ('valid', 'unknown');

  -- Met à jour la chaussure parente
  UPDATE public.shoes
  SET
    offer_count_active  = COALESCE(new_count, 0),
    price_min           = new_price_min,
    -- Désactivation automatique si plus aucune offre valide
    is_active           = CASE
                            WHEN COALESCE(new_count, 0) = 0 THEN false
                            ELSE is_active
                          END,
    auto_deactivated_at = CASE
                            WHEN COALESCE(new_count, 0) = 0 AND is_active = true
                              THEN NOW()
                            ELSE auto_deactivated_at
                          END,
    updated_at          = NOW()
  WHERE id = target_product_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS shoe_prices_sync_availability ON public.shoe_prices;

CREATE TRIGGER shoe_prices_sync_availability
  AFTER INSERT OR UPDATE OF stock_status, url_status, price OR DELETE
  ON public.shoe_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_shoe_availability();

-- =============================================================================
-- PARTIE 7 : Trigger — suivi des échecs consécutifs sur shoe_prices
-- Met à jour consecutive_failures et failure_since à chaque validation
-- =============================================================================

CREATE OR REPLACE FUNCTION public.track_url_failures()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- L'URL vient de passer en statut d'erreur
  IF NEW.url_status IN ('broken', 'dead', 'fallback')
     AND (OLD.url_status IS NULL OR OLD.url_status NOT IN ('broken', 'dead', 'fallback'))
  THEN
    NEW.consecutive_failures := 1;
    NEW.failure_since        := NOW();

  -- L'URL continue d'échouer — on incrémente
  ELSIF NEW.url_status IN ('broken', 'dead', 'fallback')
        AND OLD.url_status IN ('broken', 'dead', 'fallback')
  THEN
    NEW.consecutive_failures := COALESCE(OLD.consecutive_failures, 0) + 1;
    -- failure_since inchangé (conserve la date du premier échec)

    -- Passe automatiquement en 'dead' après 5 échecs consécutifs
    IF NEW.consecutive_failures >= 5 THEN
      NEW.url_status := 'dead';
      NEW.stock_status := 'out_of_stock';
    END IF;

  -- L'URL est revenue à la normale — reset du compteur
  ELSIF NEW.url_status = 'valid'
        AND OLD.url_status IN ('broken', 'dead', 'fallback')
  THEN
    NEW.consecutive_failures := 0;
    NEW.failure_since        := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS shoe_prices_track_failures ON public.shoe_prices;

CREATE TRIGGER shoe_prices_track_failures
  BEFORE UPDATE OF url_status
  ON public.shoe_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.track_url_failures();

-- =============================================================================
-- PARTIE 8 : Trigger — horodatage des changements de disponibilité
-- =============================================================================

CREATE OR REPLACE FUNCTION public.track_stock_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.stock_status IS DISTINCT FROM OLD.stock_status THEN
    NEW.availability_changed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS shoe_prices_track_stock ON public.shoe_prices;

CREATE TRIGGER shoe_prices_track_stock
  BEFORE UPDATE OF stock_status
  ON public.shoe_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.track_stock_change();

-- =============================================================================
-- VÉRIFICATION (à exécuter après application pour contrôle)
-- =============================================================================
-- SELECT id, brand, model, offer_count_active, price_min, is_active
-- FROM shoes ORDER BY offer_count_active DESC LIMIT 20;
--
-- SELECT product_id, retailer_name, priority_rank, is_search_url, url_status
-- FROM shoe_prices ORDER BY priority_rank, product_id LIMIT 30;
