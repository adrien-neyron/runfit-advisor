-- ============================================================
-- Seed data — FitRun Advisor (DEV / STAGING UNIQUEMENT)
-- ============================================================
-- ⚠️ NE JAMAIS exécuter ce fichier sur runfit-prod.
--
-- Important :
--   Le catalogue principal de 27 chaussures est déjà fourni par
--   la migration `20260317000001_shoes_seed.sql`. Elle est rejouée
--   automatiquement par `supabase db push` ou `supabase db reset`.
--
--   Ce fichier `seed.sql` est l'endroit conventionnel Supabase pour
--   ajouter des données SUPPLÉMENTAIRES (fixtures de test) qui n'ont
--   pas vocation à exister en production.
--
-- Convention :
--   Tous les ids ajoutés ici sont suffixés "-stagingtest" pour pouvoir
--   les filtrer / supprimer facilement.
--
-- Exécution :
--   - Local      : `supabase db reset` (rejoue migrations + seed.sql)
--   - Staging    : copier-coller dans Supabase Dashboard → SQL Editor
--                  (après avoir linké le projet runfit-staging)
--   - Production : ❌ INTERDIT
-- ============================================================

-- Vérification de garde-fou : refuser l'exécution sur le projet prod
-- (à customiser avec le ref du projet prod après création)
-- DO $$
-- BEGIN
--   IF current_setting('app.settings.environment', true) = 'production' THEN
--     RAISE EXCEPTION 'seed.sql ne doit pas être exécuté en production';
--   END IF;
-- END $$;

-- ─── Chaussures de test ─────────────────────────────────────
-- Schéma : voir migrations 20260317000000_shoes_table.sql
-- + 20260329000001_admin_backoffice.sql (slug, category, weight_g, etc.)
-- Idempotent grâce à ON CONFLICT
INSERT INTO public.shoes (
  id, brand, model, description, prix,
  foulee, terrain, amorti, drop_mm, poids_g,
  stabilite, dynamisme, largeur_disponible,
  niveau, objectif, benefits, is_active
) VALUES
  (
    'test-shoe-route-stagingtest', 'TestBrand', 'Route Tester X1',
    '[FIXTURE STAGING] Chaussure factice route pour tester le flow swipe + recommandation.',
    99.99,
    ARRAY['neutre'], ARRAY['route'],
    'moyen', 8, 275, 'moyenne', 'moyen',
    ARRAY['standard'],
    ARRAY['débutant', 'intermédiaire'],
    ARRAY['confort'],
    ARRAY['Test fixture', 'Données factices'],
    true
  ),
  (
    'test-shoe-trail-stagingtest', 'TestBrand', 'Trail Tester X2',
    '[FIXTURE STAGING] Chaussure factice trail pour tester filtre terrain trail.',
    119.99,
    ARRAY['neutre'], ARRAY['trail'],
    'moyen', 6, 290, 'moyenne', 'élevé',
    ARRAY['standard'],
    ARRAY['intermédiaire', 'avancé'],
    ARRAY['performance'],
    ARRAY['Test fixture', 'Trail technique'],
    true
  ),
  (
    'test-shoe-pronation-stagingtest', 'TestBrand', 'Stab Tester X3',
    '[FIXTURE STAGING] Chaussure factice pronateur pour tester recommandation stabilité.',
    129.99,
    ARRAY['pronateur'], ARRAY['route'],
    'élevé', 10, 305, 'élevée', 'faible',
    ARRAY['standard', 'large'],
    ARRAY['débutant'],
    ARRAY['prévention', 'confort'],
    ARRAY['Test fixture', 'Support pronation'],
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ─── Cleanup helper (à exécuter pour purger les fixtures) ────
-- DELETE FROM public.shoes WHERE id LIKE '%-stagingtest';

-- ─── Vérification ───────────────────────────────────────────
-- SELECT id, brand, model FROM public.shoes WHERE id LIKE '%-stagingtest';
