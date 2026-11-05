# Environments — FitRun Advisor

> Documentation officielle de l'architecture multi-environnements (dev / staging / prod).
> Toute modification de l'infra doit être reportée ici.

## Table des matières
1. [Architecture globale](#1-architecture-globale)
2. [Branches Git](#2-branches-git)
3. [Workflow dev → prod](#3-workflow-dev--prod)
4. [Vercel — environnements](#4-vercel--environnements)
5. [Variables d'environnement](#5-variables-denvironnement)
6. [Supabase multi-projets](#6-supabase-multi-projets)
7. [Comment créer une feature](#7-comment-créer-une-feature)
8. [Comment déployer](#8-comment-déployer)
9. [Comment rollback](#9-comment-rollback)
10. [Sécurité](#10-sécurité)

---

## 1. Architecture globale

```
┌──────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│      DEVELOPMENT         │      │   STAGING / PREVIEW    │      │      PRODUCTION        │
│      (local)             │      │   (PR + dev branch)    │      │      (main branch)     │
├──────────────────────────┤      ├────────────────────────┤      ├────────────────────────┤
│ npm run dev              │      │ Auto deploy Vercel     │      │ Auto deploy Vercel     │
│ localhost:3000           │      │ *.vercel.app preview   │      │ runfit-advisor.vercel  │
│                          │      │                        │      │                        │
│ Supabase: runfit-dev     │      │ Supabase: runfit-stag  │      │ Supabase: runfit-prod  │
│ Données fake / seed      │      │ Données seed réalistes │      │ Données réelles users  │
└──────────────────────────┘      └────────────────────────┘      └────────────────────────┘
        ↑                                  ↑                                ↑
        │                                  │                                │
   feature/*  ──── PR ────►  dev  ──── PR + CI ────►  main
```

**Règles d'or :**
- Jamais de push direct sur `main`.
- Jamais de connexion à `runfit-prod` depuis ton local.
- Les secrets ne sont jamais committés (utiliser Vercel env + GitHub Secrets).

---

## 2. Branches Git

| Branche | Rôle | Protection | Déploiement |
|---|---|---|---|
| `main` | Production | Protégée — PR + CI obligatoires | → Vercel **Production** |
| `dev` | Intégration continue | CI obligatoire | → Vercel **Preview** (URL stable) |
| `feature/<nom>` | Développement de feature | Aucune | → Vercel **Preview** (URL éphémère par PR) |
| `hotfix/<nom>` | Correctif urgent prod | PR obligatoire vers `main` | → Vercel **Preview** puis Production |

Convention de nommage : `feature/swipe-onboarding`, `fix/affiliate-link-tracking`, `hotfix/login-broken`.

---

## 3. Workflow dev → prod

```
1. git checkout dev && git pull
2. git checkout -b feature/ma-feature
3. # … code …
4. git add . && git commit -m "feat: description claire"
5. git push origin feature/ma-feature
6. Ouvrir une PR feature/ma-feature → dev
7. Attendre CI verte + relecture
8. Merge → déploiement Preview automatique sur dev
9. QA sur l'URL Preview de dev
10. Quand prêt à release : PR dev → main
11. CI verte → merge → déploiement Production automatique
```

---

## 4. Vercel — environnements

### Mapping
| Vercel Environment | Branche / Trigger | URL |
|---|---|---|
| **Production** | `main` | `runfit-advisor.vercel.app` (+ domaine custom) |
| **Preview** | toute PR + `dev` | `runfit-advisor-git-<branch>-<team>.vercel.app` |
| **Development** | aucun (local uniquement) | `http://localhost:3000` |

### Configuration Vercel Dashboard

**Settings → Git :**
- Production Branch : `main`
- Cocher : « Only deploy Production from default branch »
- Cocher : « Automatically expose System Environment Variables »

**Settings → Deployment Protection :**
- Activer **Vercel Authentication** sur Preview Deployments (interdit l'accès public aux URL preview)
- Production : pas de protection (site public)

**Settings → Git → Ignored Build Step (optionnel) :**
```bash
git diff HEAD^ HEAD --quiet -- ':(exclude)docs' ':(exclude)README.md'
```
→ évite de redéployer pour des changements purement docs.

### Vérifier qu'une Preview fonctionne
1. Créer une branche `feature/test`, push.
2. Ouvrir une PR.
3. Le bot Vercel commente la PR avec l'URL preview.
4. Tester l'URL.

### Empêcher tout déploiement manuel en prod
- **Settings → Deployment Protection → Production Deployments** : activer « Require approval for production deployments » (plan Pro/Enterprise).
- À défaut : restreindre les rôles dans **Team → Members** (seul le owner peut promouvoir un deploy).

---

## 5. Variables d'environnement

### Stratégie par scope

| Variable | Dev (local `.env`) | Preview (Vercel) | Production (Vercel) | Secret ? |
|---|---|---|---|---|
| `SUPABASE_URL` | URL **runfit-dev** | URL **runfit-staging** | URL **runfit-prod** | non |
| `SUPABASE_KEY` (anon) | anon **runfit-dev** | anon **runfit-staging** | anon **runfit-prod** | non |
| `SUPABASE_SERVICE_ROLE_KEY` | service **runfit-dev** | service **runfit-staging** | service **runfit-prod** | **OUI** — server-only |
| `ADMIN_EMAILS` | `dev@example.com` | `staging@runfit.app` | `adrien.neyron@gmail.com` | non |
| `AMAZON_PA_ACCESS_KEY` | sandbox / vide | sandbox | clé live | **OUI** |
| `AMAZON_PA_SECRET_KEY` | sandbox / vide | sandbox | clé live | **OUI** |
| `AMAZON_TRACKING_ID` | `runfit-dev-21` | `runfit-stg-21` | `runfit-21` | non |
| `NUXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://staging.runfit.app` | `https://runfit-advisor.vercel.app` | non |

### Règles
1. **Toutes les valeurs `service_role` et `*_SECRET_KEY` doivent être différentes par env.** Une fuite en dev ne doit jamais compromettre la prod.
2. **Les variables exposées au client doivent être préfixées `NUXT_PUBLIC_*`.** Tout le reste reste server-side.
3. **`SUPABASE_SERVICE_ROLE_KEY` n'est JAMAIS préfixée `NUXT_PUBLIC_`.**
4. **Tracking IDs distincts** par environnement — sinon la prod compte les clics de staging.

### Configurer dans Vercel
**Settings → Environment Variables → Add new** :
- Name : `SUPABASE_URL`
- Value : `https://xxx.supabase.co`
- Environments : cocher **Production** OU **Preview** OU **Development** (ne JAMAIS cocher les 3 pour les secrets de prod)

> 💡 Pour les variables Preview, il est possible de scoper par branche : « Only available on branches matching `dev` ».

---

## 6. Supabase multi-projets

### 6.1 Créer les 3 projets
Dans le dashboard Supabase :
- `runfit-dev` (région : eu-west-3)
- `runfit-staging` (région : eu-west-3)
- `runfit-prod` (région : eu-west-3, **plan Pro recommandé** : daily backups + PITR)

### 6.2 Initialiser la CLI

```bash
# Installation
npm install -g supabase

# Login (une seule fois)
supabase login

# Lier le projet local au projet distant (à exécuter à chaque switch d'env)
supabase link --project-ref <PROJECT_REF_DEV>
```

### 6.3 Workflow migrations

**Toutes les migrations sont versionnées dans `supabase/migrations/`** (déjà le cas dans ce repo).

```bash
# 1. Créer une migration en local
supabase migration new add_user_preferences

# 2. Éditer le fichier SQL généré dans supabase/migrations/

# 3. Tester en local (Docker requis)
supabase start
supabase db reset   # rejoue toutes les migrations + seed

# 4. Pousser vers DEV
supabase link --project-ref <REF_DEV>
supabase db push

# 5. Vérifier en staging
supabase link --project-ref <REF_STAGING>
supabase db push

# 6. Déployer en prod (UNIQUEMENT depuis main, après QA staging)
supabase link --project-ref <REF_PROD>
supabase db push
```

### 6.4 Cloner la structure prod → staging (initialisation)

```bash
# Dump du schéma prod (jamais des données)
supabase db dump --project-ref <REF_PROD> --schema-only > schema-prod.sql

# Appliquer sur staging
psql "postgres://..." < schema-prod.sql
```

### 6.5 Seed data pour staging

Créer `supabase/seed.sql` :
```sql
-- Données réalistes mais NON RÉELLES
INSERT INTO shoes (brand, model, drop_mm, weight_g)
VALUES
  ('Nike', 'Pegasus 41', 10, 285),
  ('Hoka', 'Clifton 9', 5, 248),
  -- …
;
```

Lancer : `supabase db reset` (en local) ou via SQL Editor sur staging.

### 6.6 Éviter les fuites de données prod
- **Aucun dump de données prod** ne doit transiter vers staging ou dev.
- Si besoin de tester avec un volume réaliste : générer des fixtures via script dédié.
- **RLS (Row Level Security) activée sur toutes les tables sensibles.**

### 6.7 Structure dossier
```
supabase/
├── config.toml              # Config CLI (committée)
├── migrations/              # Migrations SQL versionnées
│   └── 2026xxxx_*.sql
├── seed.sql                 # Données de seed (staging/dev uniquement)
└── functions/               # Edge functions (si utilisées)
```

---

## 7. Comment créer une feature

```bash
# 1. Partir de dev à jour
git checkout dev
git pull origin dev

# 2. Créer la branche
git checkout -b feature/swipe-animation

# 3. Coder + commits atomiques
git add .
git commit -m "feat(swipe): add tinder-like animation on card swipe"

# 4. Pousser
git push -u origin feature/swipe-animation

# 5. Ouvrir une PR sur GitHub : feature/swipe-animation → dev
# 6. La CI tourne automatiquement (lint + typecheck + build)
# 7. Vercel génère une URL Preview, postée en commentaire de la PR
# 8. QA sur la Preview → si OK : merge
```

---

## 8. Comment déployer

### En staging (auto)
Tout merge sur `dev` déclenche un déploiement Preview Vercel sur l'URL stable de la branche `dev`.

### En production
1. Ouvrir une PR `dev` → `main`.
2. Vérifier la Preview Vercel de la PR.
3. Vérifier que la CI est verte.
4. Demander une review (au minimum self-review pour un solo dev).
5. Merge → Vercel déploie automatiquement sur `main`.

> 💡 **Migrations DB** : si la PR contient des migrations Supabase, **les pousser sur runfit-prod AVANT de merger la PR** (sinon la prod se retrouve avec du code attendant un schéma absent).

---

## 9. Comment rollback

### Rollback du code (Vercel)
1. **Vercel Dashboard → Deployments**
2. Trouver le dernier deploy stable.
3. Cliquer **« … » → Promote to Production**.
4. Le rollback est instantané (pas de rebuild).

### Rollback du code (Git)
```bash
git checkout main
git revert <commit-sha>
git push origin main
# → déclenche un nouveau deploy avec le revert
```

### Rollback DB (Supabase)
1. **Plan Pro requis** pour PITR (Point-in-Time Recovery).
2. Dashboard Supabase → Database → Backups → restaurer un point dans le temps.
3. À défaut : créer une migration inverse.

> ⚠️ **Une migration destructive (DROP COLUMN, DROP TABLE) ne peut PAS être rollback-ée par un revert Git.** Toujours penser le rollback avant la migration.

---

## 10. Sécurité

### Checklist secrets
- [ ] `SUPABASE_SERVICE_ROLE_KEY` jamais préfixée `NUXT_PUBLIC_*`
- [ ] `service_role` utilisée uniquement dans `server/` (routes API Nitro), jamais dans `pages/` ou `components/`
- [ ] `.env` listé dans `.gitignore`
- [ ] Aucun secret hardcodé dans le code (vérification : `grep -r "supabase.co" --include="*.vue" --include="*.ts"`)
- [ ] GitHub Secret Scanning activé (Settings → Code security)
- [ ] Vercel : variables sensibles marquées **Sensitive**

### Headers de sécurité (à ajouter dans `nuxt.config.ts`)
```ts
nitro: {
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      },
    },
  },
},
```

### Supabase RLS
- Toutes les tables `users`, `user_profiles`, `swipes`, `affiliate_clicks` doivent avoir RLS activée.
- Politique par défaut : `USING (auth.uid() = user_id)`.
- Vérification : `select tablename, rowsecurity from pg_tables where schemaname='public';`

### Logs sensibles
- En prod, désactiver les logs verbeux : `console.log` interdit en routes serveur sur des objets contenant tokens / emails.
- Utiliser un wrapper `logger.info()` qui scrub automatiquement.

---

## Annexe — Création initiale (one-shot)

Voir `docs/SETUP.md` (à créer si besoin) pour la procédure de bootstrap from scratch.

**Dernière mise à jour : 2026-05-04**
