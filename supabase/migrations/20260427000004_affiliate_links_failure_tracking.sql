-- =============================================================================
-- ÉTAPE 5 — Suivi des échecs consécutifs sur affiliate_links
-- À appliquer via : Supabase Dashboard → SQL Editor
-- =============================================================================
-- Contexte :
--   affiliate_links dispose déjà de :
--     status TEXT ('active'/'dead'/'unknown'), last_checked_at, http_status
--   Il manque le compteur d'échecs consécutifs pour appliquer la règle :
--     dead automatique après 5 échecs consécutifs (même logique que shoe_prices)
-- =============================================================================

ALTER TABLE public.affiliate_links
  -- Nombre d'échecs HTTP consécutifs (5xx, timeout, réseau)
  -- Remis à 0 dès qu'une vérification retourne 2xx
  ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER NOT NULL DEFAULT 0,

  -- Horodatage du premier échec de la série en cours
  -- NULL quand consecutive_failures = 0
  ADD COLUMN IF NOT EXISTS failure_since        TIMESTAMPTZ;

-- Index pour retrouver rapidement les liens proches du seuil dead
CREATE INDEX IF NOT EXISTS affiliate_links_failures_idx
  ON public.affiliate_links (consecutive_failures)
  WHERE consecutive_failures > 0;

-- =============================================================================
-- PLANIFICATION CRON : check-affiliate-links
-- Prérequis : pg_cron + pg_net activés (migration 20260427000003)
-- =============================================================================

-- Supprimer le job s'il existe déjà (idempotent)
SELECT cron.unschedule('check-affiliate-links')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'check-affiliate-links'
);

-- Planifier : tous les jours à 04h00 UTC (après check-shoe-images à 03h00)
SELECT cron.schedule(
  'check-affiliate-links',
  '0 4 * * *',
  $$
    SELECT net.http_post(
      url     := current_setting('app.supabase_url') || '/functions/v1/check-affiliate-links',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- =============================================================================
-- Vérifications
-- =============================================================================
-- SELECT jobname, schedule FROM cron.job ORDER BY jobname;
-- SELECT id, merchant, status, consecutive_failures, failure_since, last_checked_at
-- FROM affiliate_links ORDER BY consecutive_failures DESC LIMIT 20;
