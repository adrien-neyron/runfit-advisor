-- =============================================================================
-- Étape 2 SaaS — Import des ventes + reporting revenus
-- À appliquer APRÈS 20261028000000_affiliate_click_attribution.sql
-- Idempotent : peut être rejoué sans risque.
-- =============================================================================

-- ── 1. affiliate_conversions : champs pour les ventes sans click_id (Amazon CSV)
ALTER TABLE public.affiliate_conversions
  ADD COLUMN IF NOT EXISTS asin   TEXT,
  ADD COLUMN IF NOT EXISTS items  INTEGER,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'api'
                          CHECK (source IN ('api', 'csv', 'manual'));

CREATE INDEX IF NOT EXISTS affiliate_conversions_asin_idx
  ON public.affiliate_conversions (asin)
  WHERE asin IS NOT NULL;

CREATE INDEX IF NOT EXISTS affiliate_conversions_occurred_idx
  ON public.affiliate_conversions (occurred_at DESC);

-- ── 2. Journal des imports (visible dans /admin/revenus) ─────────────────────
CREATE TABLE IF NOT EXISTS public.affiliate_import_runs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  network       TEXT        NOT NULL,
  source        TEXT        NOT NULL CHECK (source IN ('api', 'csv')),
  status        TEXT        NOT NULL CHECK (status IN ('running', 'success', 'error')),
  items_fetched INTEGER     NOT NULL DEFAULT 0,
  items_upserted INTEGER    NOT NULL DEFAULT 0,
  items_matched INTEGER     NOT NULL DEFAULT 0,  -- ventes rattachées à un clic ou une chaussure
  error_message TEXT,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS affiliate_import_runs_started_idx
  ON public.affiliate_import_runs (started_at DESC);

ALTER TABLE public.affiliate_import_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "affiliate_import_runs_service_all" ON public.affiliate_import_runs;
CREATE POLICY "affiliate_import_runs_service_all" ON public.affiliate_import_runs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 3. Rapport par marchand ──────────────────────────────────────────────────
-- Les clics sont comptés sur leur date de clic, les ventes sur leur date de vente.
-- EPC = commission (en attente + validée) / clics. Les ventes refusées sont exclues.
CREATE OR REPLACE FUNCTION public.affiliate_report_by_merchant(
  p_from TIMESTAMPTZ,
  p_to   TIMESTAMPTZ
)
RETURNS TABLE (
  merchant            TEXT,
  clicks              BIGINT,
  conversions         BIGINT,
  order_amount        NUMERIC,
  commission_pending  NUMERIC,
  commission_approved NUMERIC,
  epc                 NUMERIC
)
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  WITH c AS (
    SELECT ac.merchant, COUNT(*) AS clicks
    FROM public.affiliate_clicks ac
    WHERE ac.created_at >= p_from AND ac.created_at < p_to
    GROUP BY ac.merchant
  ),
  v AS (
    SELECT
      COALESCE(cv.merchant, 'inconnu') AS merchant,
      COUNT(*) FILTER (WHERE cv.status <> 'declined')                              AS conversions,
      COALESCE(SUM(cv.order_amount) FILTER (WHERE cv.status <> 'declined'), 0)     AS order_amount,
      COALESCE(SUM(cv.commission_amount) FILTER (WHERE cv.status = 'pending'), 0)  AS commission_pending,
      COALESCE(SUM(cv.commission_amount) FILTER (WHERE cv.status = 'approved'), 0) AS commission_approved
    FROM public.affiliate_conversions cv
    WHERE cv.occurred_at >= p_from AND cv.occurred_at < p_to
    GROUP BY COALESCE(cv.merchant, 'inconnu')
  )
  SELECT
    COALESCE(c.merchant, v.merchant)                       AS merchant,
    COALESCE(c.clicks, 0)                                  AS clicks,
    COALESCE(v.conversions, 0)                             AS conversions,
    COALESCE(v.order_amount, 0)                            AS order_amount,
    COALESCE(v.commission_pending, 0)                      AS commission_pending,
    COALESCE(v.commission_approved, 0)                     AS commission_approved,
    CASE WHEN COALESCE(c.clicks, 0) > 0
         THEN ROUND((COALESCE(v.commission_pending, 0) + COALESCE(v.commission_approved, 0))
                    / c.clicks, 4)
         ELSE 0 END                                        AS epc
  FROM c
  FULL JOIN v ON v.merchant = c.merchant
  ORDER BY (COALESCE(v.commission_pending, 0) + COALESCE(v.commission_approved, 0)) DESC,
           COALESCE(c.clicks, 0) DESC;
$$;

-- ── 4. Rapport par chaussure ─────────────────────────────────────────────────
-- Ventes rattachées à une chaussure :
--   • Awin   : via click_id → affiliate_clicks.shoe_id
--   • Amazon : via asin     → affiliate_links.asin → shoe_id (ventes sans click_id)
-- shoe_id est comparé en texte pour rester compatible quel que soit son type.
CREATE OR REPLACE FUNCTION public.affiliate_report_by_shoe(
  p_from  TIMESTAMPTZ,
  p_to    TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 25
)
RETURNS TABLE (
  shoe_id     TEXT,
  clicks      BIGINT,
  conversions BIGINT,
  commission  NUMERIC,
  epc         NUMERIC
)
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  WITH ck AS (
    SELECT ac.shoe_id::TEXT AS sid, COUNT(*) AS clicks
    FROM public.affiliate_clicks ac
    WHERE ac.created_at >= p_from AND ac.created_at < p_to
      AND ac.shoe_id IS NOT NULL
    GROUP BY ac.shoe_id::TEXT
  ),
  by_click AS (
    SELECT ac.shoe_id::TEXT AS sid, cv.id, cv.commission_amount
    FROM public.affiliate_conversions cv
    JOIN public.affiliate_clicks ac ON ac.click_id = cv.click_id
    WHERE cv.status <> 'declined'
      AND cv.occurred_at >= p_from AND cv.occurred_at < p_to
      AND ac.shoe_id IS NOT NULL
  ),
  asin_map AS (
    SELECT DISTINCT ON (al.asin) al.asin, al.shoe_id::TEXT AS sid
    FROM public.affiliate_links al
    WHERE al.asin IS NOT NULL AND al.shoe_id IS NOT NULL
    ORDER BY al.asin, al.updated_at DESC
  ),
  by_asin AS (
    SELECT am.sid, cv.id, cv.commission_amount
    FROM public.affiliate_conversions cv
    JOIN asin_map am ON am.asin = cv.asin
    WHERE cv.click_id IS NULL
      AND cv.status <> 'declined'
      AND cv.occurred_at >= p_from AND cv.occurred_at < p_to
  ),
  cvs AS (
    SELECT sid, COUNT(*) AS conversions, COALESCE(SUM(commission_amount), 0) AS commission
    FROM (SELECT * FROM by_click UNION ALL SELECT * FROM by_asin) u
    GROUP BY sid
  )
  SELECT
    COALESCE(ck.sid, cvs.sid)                  AS shoe_id,
    COALESCE(ck.clicks, 0)                     AS clicks,
    COALESCE(cvs.conversions, 0)               AS conversions,
    COALESCE(cvs.commission, 0)                AS commission,
    CASE WHEN COALESCE(ck.clicks, 0) > 0
         THEN ROUND(COALESCE(cvs.commission, 0) / ck.clicks, 4)
         ELSE 0 END                            AS epc
  FROM ck
  FULL JOIN cvs ON cvs.sid = ck.sid
  ORDER BY COALESCE(cvs.commission, 0) DESC, COALESCE(ck.clicks, 0) DESC
  LIMIT p_limit;
$$;

-- Accès réservé au service_role (l'API admin appelle ces fonctions côté serveur)
REVOKE ALL ON FUNCTION public.affiliate_report_by_merchant(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.affiliate_report_by_shoe(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.affiliate_report_by_merchant(TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.affiliate_report_by_shoe(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) TO service_role;
