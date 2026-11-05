# Pull Request

## Objectif
<!-- Décris en 1-2 phrases ce que fait cette PR (impact produit / business) -->

## Type de changement
- [ ] feat — nouvelle fonctionnalité
- [ ] fix — correction de bug
- [ ] refactor — refonte sans changement fonctionnel
- [ ] docs — documentation uniquement
- [ ] chore — maintenance / config

## Branche source
- [ ] `feature/*` → merge dans `dev`
- [ ] `dev` → merge dans `main` (release)
- [ ] `hotfix/*` → merge direct dans `main` (urgence)

## Checklist avant merge
- [ ] Le build passe en local (`npm run build`)
- [ ] Le typecheck passe (`npm run typecheck`)
- [ ] Le lint passe (`npm run lint`)
- [ ] Les nouvelles variables d'env sont ajoutées dans `.env.example`
- [ ] Les nouvelles variables d'env sont configurées dans Vercel (Preview + Production si nécessaire)
- [ ] Les migrations Supabase sont versionnées dans `supabase/migrations/`
- [ ] Pas de clé `service_role` exposée côté client
- [ ] La doc `docs/ENVIRONMENTS.md` est à jour si l'archi change

## Tests / vérification manuelle
<!-- Décris comment tu as testé : URL Preview Vercel, scénarios couverts, etc. -->

## Capture d'écran (si UI)
<!-- Avant / Après -->

## Impact conversion / business
<!-- Cette PR améliore quoi ? Conversion questionnaire ? Taux de clic affilié ? Autre ? -->
