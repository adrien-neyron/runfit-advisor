-- =============================================================================
-- Étape 3 — Offres « idéales » uniquement
-- Une offre est exposée si ET SEULEMENT SI :
--   1. le lien mène à une page produit précise (jamais une page de recherche)
--   2. le lien n'est pas cassé / le produit n'est pas en rupture
--   3. le marchand est actif ET monétisable (Amazon, ou Awin avec identifiant annonceur)
-- Le prix n'est exposé que s'il a été vérifié il y a moins de 7 jours.
-- Idempotent : peut être rejoué sans risque.
-- =============================================================================

-- Clé de comparaison tolérante entre merchants.slug et shoe_prices.retailer_name
-- (« Amazon » / « amazon-fr », « i-Run » / « i-run », « The Running Collective » / « trc »)
CREATE OR REPLACE FUNCTION public.norm_merchant_key(t text)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE k WHEN 'therunningcollective' THEN 'trc' ELSE k END
  FROM (
    SELECT regexp_replace(
             regexp_replace(lower(coalesce(t, '')), '[^a-z0-9]', '', 'g'),
             '(fr|com)$', ''
           ) AS k
  ) s
$$;

-- Vrai si l'URL est une page produit (et non une recherche).
-- La colonne shoe_prices.is_search_url n'est pas fiable (JD Sports, On : recherche marquée « directe »).
CREATE OR REPLACE FUNCTION public.is_direct_product_url(u text, retailer text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN u IS NULL OR u !~* '^https?://' THEN false
    WHEN public.norm_merchant_key(retailer) = 'amazon'
      THEN u ~ '/(dp|gp/product)/[A-Z0-9]{10}'
    ELSE u !~* '(/search|catalogsearch|/recherche|[?&](q|query|k|s|search|keyword|searchterm|text)=)'
  END
$$;

DROP VIEW IF EXISTS public.v_shoe_offers;
CREATE VIEW public.v_shoe_offers
WITH (security_invoker = true) AS
SELECT
  sp.product_id                                                   AS shoe_id,
  m.slug                                                          AS merchant_slug,
  m.name                                                          AS merchant_name,
  m.affiliate_network                                             AS network,
  substring(sp.product_url FROM '/(?:dp|gp/product)/([A-Z0-9]{10})') AS asin,
  sp.product_url,
  CASE WHEN sp.price > 0 AND sp.last_checked_at > now() - interval '7 days'
       THEN sp.price END                                          AS price,
  sp.last_checked_at                                              AS price_checked_at,
  sp.stock_status,
  COALESCE(sp.priority_rank, 50)                                  AS priority_rank
FROM public.shoe_prices sp
JOIN public.shoes s
  ON s.id = sp.product_id
JOIN public.merchants m
  ON m.is_active
 AND public.norm_merchant_key(m.slug) = public.norm_merchant_key(sp.retailer_name)
WHERE COALESCE(sp.url_status, 'unknown') <> 'broken'
  AND COALESCE(sp.stock_status, 'in_stock') <> 'out_of_stock'
  AND public.is_direct_product_url(sp.product_url, sp.retailer_name)
  AND (
        m.affiliate_network = 'amazon'
     OR (m.affiliate_network = 'awin' AND COALESCE(m.affiliate_tag, '') <> '')
  );

-- Lecture réservée au serveur (endpoint /api/offers, clé service_role)
REVOKE ALL ON public.v_shoe_offers FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.v_shoe_offers TO service_role;

-- Vérifications :
-- SELECT count(*), count(DISTINCT shoe_id) FROM v_shoe_offers;           -- attendu : une offre Amazon par chaussure ayant un ASIN
-- SELECT merchant_slug, count(*) FROM v_shoe_offers GROUP BY 1;
