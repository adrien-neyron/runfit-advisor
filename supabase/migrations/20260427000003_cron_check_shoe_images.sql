-- =============================================================================
-- ÉTAPE 4 — Planification du cron : check-shoe-images
-- À appliquer via : Supabase Dashboard → SQL Editor
-- =============================================================================
-- Prérequis : pg_cron activé (Dashboard → Extensions → pg_cron)
-- La fonction invoque la Edge Function check-shoe-images via HTTP
-- afin de vérifier et re-télécharger les images dégradées.
-- =============================================================================

-- ── Activer l'extension pg_cron (idempotent) ──────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;  -- requis pour les requêtes HTTP depuis pg_cron

-- ── Supprimer le job s'il existe déjà (idempotent) ───────────────────────────
SELECT cron.unschedule('check-shoe-images')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'check-shoe-images'
);

-- ── Planifier : tous les jours à 03h00 UTC ───────────────────────────────────
-- Batch de 20 chaussures par invocation → cycle complet sur ~2 jours (27 chaussures)
-- Heure choisie hors des pics de trafic (Europe : 05h00 CEST)
SELECT cron.schedule(
  'check-shoe-images',
  '0 3 * * *',   -- tous les jours à 03:00 UTC
  $$
    SELECT net.http_post(
      url     := current_setting('app.supabase_url') || '/functions/v1/check-shoe-images',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- =============================================================================
-- Alternative : si current_setting ne fonctionne pas dans votre config,
-- remplacez par les valeurs littérales (à ne JAMAIS committer dans git) :
--
-- SELECT cron.schedule(
--   'check-shoe-images',
--   '0 3 * * *',
--   $$
--     SELECT net.http_post(
--       url     := 'https://pdpmmahwzxkytstoaxjb.supabase.co/functions/v1/check-shoe-images',
--       headers := jsonb_build_object(
--         'Content-Type',  'application/json',
--         'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
--       ),
--       body    := '{}'::jsonb
--     );
--   $$
-- );
-- =============================================================================

-- ── Vérification ─────────────────────────────────────────────────────────────
-- SELECT jobname, schedule, command FROM cron.job WHERE jobname = 'check-shoe-images';
