# RunFit Advisor — Roadmap « SaaS » (100 % affiliation, sans abonnement)

Décisions : pas d'abonnement · réseau **Awin** (+ Amazon) · critères pondérés par profil
+ « pourquoi ce match » · travail par étapes, **aucun push GitHub**.

Objectif business : maximiser **revenu par visiteur** = complétion questionnaire × clic
affilié × taux de conversion marchand × commission.

## État des lieux (constaté dans le code)

| Brique | État |
|---|---|
| Questionnaire progressif, swipe, scoring (`data/products.ts`) | OK |
| Table `merchants` (réseau awin/amazon/manual), flux XML/CSV/JSON, `feedSync`, cron 03:00 | OK |
| `generateAffiliateLink` (Amazon/Awin/CJ) | OK, mais **non utilisé par le redirecteur** |
| `/api/affiliate/:merchant/:shoeId` | **Amazon uniquement** → les autres marchands renvoient une erreur |
| Tracking clic | OK, mais **sans identifiant propagé au réseau** → impossible de relier une vente à un clic |
| Offres | **Deux systèmes parallèles** : `affiliate_links` et `shoe_prices` |

### Points d'attention détectés

1. **Trois tags Amazon différents** : `runmatch-21` (`amazon.ts`, `data/merchants.ts`), `runfit-21`
   (seed `merchants`), `runfit-dev-21` (`.env.example`). Un seul tag réel doit servir en prod, sinon des
   commissions sont perdues ou mal attribuées. À unifier via `AMAZON_TRACKING_ID`.
2. **Slugs incohérents** : `amazon` / `irun` (liens, `AffiliateButton`) vs `amazon-fr` / `i-run` (`merchants`).
   L'étape 1 accepte les deux via une table d'alias ; à terme, normaliser en base.
3. Le clic était inséré sans `await` : sur Vercel, la fonction peut être coupée avant l'écriture
   (clics perdus). Corrigé avec `event.waitUntil`.
4. `IP_HASH_SALT` a une valeur par défaut codée en dur : définir une vraie valeur en prod.
5. `useMerchants` n'affiche plus de prix (considérés périmés) : le « meilleur prix » promis dans
   `claude.md` n'est donc pas encore visible côté utilisateur.
6. **Constats sur la base Supabase réelle (projet runfit-advisor)** : `shoes.id` est de type **TEXT** (la
   migration d'origine `20260504…affiliate_clicks` déclarait un UUID et ne pouvait pas s'appliquer) ;
   `affiliate_links` est **vide** alors que `shoe_prices` contient ~150 offres (Amazon avec ASIN, autres
   marchands en liens de recherche) ; `country` est stocké en minuscules (`fr`). Le redirecteur s'appuie donc
   sur `shoe_prices` en repli et compare les pays sans tenir compte de la casse. Les migrations ne sont pas
   enregistrées dans Supabase (appliquées à la main) : garder l'ordre manuel.

## Étapes

### Étape 1 — Redirecteur multi-réseaux + attribution des clics ✅ (livrée)
Awin deeplinks avec `clickref`, Amazon `ascsubtag`, `click_id` par clic, table `affiliate_conversions`,
vue `v_affiliate_performance`. Détails ci-dessous.

### Étape 2 — Import des ventes + tableau de bord revenus ✅ (livrée)
- **Awin** : import via l'API Publisher *Transactions* (tâche `syncConversions` chaque nuit à 04:00 + bouton manuel).
  Les 45 derniers jours sont re-synchronisés à chaque passage pour suivre `pending → approved/declined`.
  Chaque vente est rattachée à son clic grâce au `clickref`.
- **Amazon** : pas d'API de ventes → import du **rapport CSV** Associates depuis `/admin/revenus`
  (idempotent : ré-importer le même fichier ou un rapport qui chevauche ne crée pas de doublons).
  Rattachement à la chaussure via l'ASIN (`affiliate_links.asin`), pas via un clic précis.
- **Page `/admin/revenus`** : clics, ventes, commissions (en attente / validée), taux de conversion, EPC,
  par marchand et par chaussure ; période 7 j / 30 j / 90 j / 12 mois ; journal des imports.
- *Impact* : on sait quels marchands et quelles chaussures rapportent réellement → base de l'étape 3
  (ordre d'affichage des marchands) et de l'étape 4.

| Fichier | Action |
|---|---|
| `supabase/migrations/20261028000001_affiliate_conversions_import.sql` | `asin`/`items`/`source`, `affiliate_import_runs`, fonctions `affiliate_report_by_merchant` / `_by_shoe` |
| `server/utils/affiliation/awinTransactions.ts` | mapping des transactions Awin, fenêtres de 30 jours |
| `server/utils/affiliation/amazonReport.ts` | parseur CSV Amazon (en-têtes FR/EN par alias) |
| `server/services/conversionSync.service.ts` | import Awin + Amazon, journal |
| `server/tasks/syncConversions.ts` | tâche planifiée 04:00 |
| `server/api/admin/revenue.get.ts`, `conversions/sync.post.ts`, `conversions/import-amazon.post.ts` | API admin |
| `pages/admin/revenus.vue` (+ raccourci dans `dashboard.vue`, `StatCard` accepte du texte) | UI |
| `nuxt.config.ts`, `.env.example` | tâche planifiée, `AWIN_API_TOKEN` |

**À savoir / limites**
- Le format du CSV Amazon n'a pas pu être testé sur un vrai fichier : les en-têtes sont reconnus par alias
  (FR/EN). Si ton export n'est pas reconnu, l'erreur affiche les en-têtes trouvés → ajouter l'alias dans `amazonReport.ts`.
- Les ventes Amazon ne sont **pas** reliées à un clic : l'EPC par chaussure Amazon reste une approximation
  (clics de la chaussure vs ventes de son ASIN).
- Les ventes Awin restent « en attente » jusqu'à validation par l'annonceur (souvent 30 à 60 jours) :
  distinguer « en attente » de « validée » avant de juger un marchand.
- La tâche planifiée utilise le même mécanisme Nitro que `syncFeeds` ; son exécution sur Vercel n'a pas pu être
  vérifiée ici — le bouton « Synchroniser maintenant » sert de repli.

### Mise en route de l'étape 2 (à faire par toi)
1. Appliquer `20261028000001_affiliate_conversions_import.sql` (après la migration de l'étape 1).
2. Awin → *API Credentials* : copier le token dans `AWIN_API_TOKEN` (`.env` + Vercel).
3. Ouvrir `/admin/revenus` → « Synchroniser maintenant », puis importer un rapport CSV Amazon.

### Étape 3 — Offres unifiées + comparateur multi-marchands
- Une seule vue `v_shoe_offers` (fusion `affiliate_links` + `shoe_prices`), prix avec date de fraîcheur.
- Bloc « Où l'acheter » : 2-4 marchands, meilleur prix mis en avant, boutons `AffiliateButton`.
- *Impact* : plus de choix = plus de clics ; prix daté = confiance.

### Étape 4 — Critères pondérés par profil (« ce que les utilisateurs attendent »)
- Nouvelle question progressive « Qu'est-ce qui compte le plus ? » (amorti, légèreté, stabilité,
  durabilité, prix, grip) → `user_profiles.criteria_weights jsonb`.
- Les swipes ajustent les poids (swipe droite sur une chaussure légère → poids légèreté ↑).
- Le scoring (`getRecommendations`) utilise ces poids.
- *Impact* : recommandations plus pertinentes → clics plus qualifiés.

### Étape 5 — « Pourquoi ce match »
- Le scoring renvoie aussi les 2-3 critères qui matchent le plus (« Amorti élevé : tu as des douleurs aux genoux »).
- Affiché sur la carte swipe, résultats et fiche chaussure.
- *Impact* : confiance → taux de clic.

### Étape 6 — Conformité & SEO
- Bannière cookies : les cookies Awin/Amazon sont posés **après** le clic chez le marchand, mais
  mentionner l'affiliation dans la politique de confidentialité (user_id stocké avec le clic).
- Pages fiches chaussures indexables (SEO long terme), mention d'affiliation visible (`AffiliateDisclosure`).

## Étape 1 — ce qui a été modifié

| Fichier | Action |
|---|---|
| `server/utils/affiliation/awin.ts` | nouveau : deeplink Awin, `clickref`, lecture de `merchants.affiliate_tag` |
| `server/utils/affiliation/providers.ts` | `resolveRedirectUrl` multi-réseaux (existant conservé) |
| `server/utils/affiliation/types.ts` | `AffiliateClickPayload` enrichi |
| `server/api/affiliate/[merchant]/[shoeId].get.ts` | marchand via `merchants`, repli `shoe_prices`, `click_id`, `waitUntil` |
| `supabase/migrations/20261028000000_affiliate_click_attribution.sql` | `click_id`, `affiliate_conversions`, `v_affiliate_performance` |
| `nuxt.config.ts`, `.env.example` | `AWIN_PUBLISHER_ID`, `IP_HASH_SALT` |

### Mise en route (à faire par toi)
1. Appliquer la migration SQL (SQL Editor Supabase, projet dev d'abord).
2. Renseigner `AWIN_PUBLISHER_ID` (+ `IP_HASH_SALT`) dans `.env` et Vercel.
3. Pour chaque marchand Awin, mettre l'ID annonceur : `UPDATE merchants SET affiliate_tag = '<awinmid>' WHERE slug = 'i-run';`
   (les IDs sont dans Awin → Annonceurs, une fois acceptée dans leur programme).
4. Tester : `/api/affiliate/i-run/<shoeId>` doit rediriger (302) vers `awin1.com/cread.php?...&clickref=...`
   et créer une ligne dans `affiliate_clicks` avec `click_id`.
