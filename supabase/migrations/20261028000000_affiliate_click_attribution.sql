-- =============================================================================
-- Étape 1 SaaS — Attribution clic → vente (multi-réseaux)
-- À appliquer via : Supabase Dashboard → SQL Editor (ou `supabase db push`)
-- Idempotent : peut être rejoué sans risque.
-- =============================================================================
-- Principe : chaque clic reçoit un click_id, envoyé au réseau (Amazon : ascsubtag,
-- Awin : clickref). Les ventes importées (étape 2) sont rattachées à ce click_id.
-- =============================================================================

-- ── 0. Prérequis (autonome) ──────────────────────────────────────────────────
-- Si la migration 20260504000000_affiliate_clicks_table.sql n'a pas été appliquée, on crée
-- ici la table et la colonne ASIN. NB : shoes.id est de type TEXT (pas UUID), donc
-- affiliate_clicks.shoe_id est aussi TEXT.
ALTER TABLE public.affiliate_links
  ADD COLUMN IF NOT EXISTS asin TEXT;

CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shoe_id     TEXT        REFERENCES public.shoes(id) ON DELETE SET NULL,
  merchant    TEXT        NOT NULL,
  country     TEXT        NOT NULL DEFAULT 'FR',
  asin        TEXT,
  user_agent  TEXT,
  referer     TEXT,
  ip_hash     TEXT,       -- 16 hex chars SHA-256 salé → conforme RGPD
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_clicks_shoe_idx          ON public.affiliate_clicks (shoe_id);
CREATE INDEX IF NOT EXISTS affiliate_clicks_merchant_idx      ON public.affiliate_clicks (merchant);
CREATE INDEX IF NOT EXISTS affiliate_clicks_date_idx          ON public.affiliate_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_clicks_merchant_date_idx ON public.affiliate_clicks (merchant, created_at DESC);

-- RLS : seul le service_role lit/écrit (via l'API serveur)
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'affiliate_clicks'
      AND policyname = 'affiliate_clicks_service_all'
  ) THEN
    CREATE POLICY "affiliate_clicks_service_all" ON public.affiliate_clicks
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 1. affiliate_clicks : identifiant de clic + contexte ─────────────────────
ALTER TABLE public.affiliate_clicks
  ADD COLUMN IF NOT EXISTS click_id   UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS network    TEXT,
  ADD COLUMN IF NOT EXISTS user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS target_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_clicks_click_id_key
  ON public.affiliate_clicks (click_id);

CREATE INDEX IF NOT EXISTS affiliate_clicks_user_idx
  ON public.affiliate_clicks (user_id)
  WHERE user_id IS NOT NULL;

COMMENT ON COLUMN public.affiliate_clicks.click_id IS
  'Identifiant propagé au réseau : Amazon ascsubtag / Awin clickref (UUID sans tirets).';

-- ── 2. affiliate_conversions : ventes remontées par les réseaux ──────────────
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  network                TEXT          NOT NULL CHECK (network IN ('amazon', 'awin', 'cj', 'manual')),
  network_transaction_id TEXT          NOT NULL,
  click_id               UUID          REFERENCES public.affiliate_clicks(click_id) ON DELETE SET NULL,
  merchant               TEXT,
  order_amount           NUMERIC(10,2),
  commission_amount      NUMERIC(10,2),
  currency               TEXT          NOT NULL DEFAULT 'EUR',
  status                 TEXT          NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'approved', 'declined')),
  occurred_at            TIMESTAMPTZ,
  validated_at           TIMESTAMPTZ,
  raw                    JSONB,
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (network, network_transaction_id)
);

CREATE INDEX IF NOT EXISTS affiliate_conversions_click_idx
  ON public.affiliate_conversions (click_id);
CREATE INDEX IF NOT EXISTS affiliate_conversions_status_idx
  ON public.affiliate_conversions (status, occurred_at DESC);

DROP TRIGGER IF EXISTS affiliate_conversions_set_updated_at ON public.affiliate_conversions;
CREATE TRIGGER affiliate_conversions_set_updated_at
  BEFORE UPDATE ON public.affiliate_conversions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "affiliate_conversions_service_all" ON public.affiliate_conversions;
CREATE POLICY "affiliate_conversions_service_all" ON public.affiliate_conversions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 3. Vue de performance : clics, ventes, commissions par marchand/jour ─────
-- security_invoker : la vue respecte la RLS des tables (service_role uniquement).
CREATE OR REPLACE VIEW public.v_affiliate_performance
WITH (security_invoker = true) AS
SELECT
  c.merchant,
  DATE_TRUNC('day', c.created_at)                                   AS day,
  COUNT(DISTINCT c.id)                                              AS clicks,
  COUNT(DISTINCT v.id) FILTER (WHERE v.status <> 'declined')        AS conversions,
  COALESCE(SUM(v.commission_amount)
           FILTER (WHERE v.status <> 'declined'), 0)                AS commission
FROM public.affiliate_clicks c
LEFT JOIN public.affiliate_conversions v ON v.click_id = c.click_id
GROUP BY c.merchant, DATE_TRUNC('day', c.created_at);
