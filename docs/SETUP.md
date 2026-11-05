# Bootstrap from scratch — FitRun Advisor

> Procédure complète à suivre **une seule fois** pour mettre en place l'architecture multi-environnements.
> Une fois fait, se référer à `docs/ENVIRONMENTS.md` pour le quotidien.

---

## Pré-requis
- Compte GitHub (admin du repo)
- Compte Vercel (admin du projet)
- Compte Supabase (admin)
- Node.js 20+
- Supabase CLI installée : `npm install -g supabase`
- Docker (pour `supabase start` en local — optionnel)

---

## Étape 1 — Branche `dev` distante

```bash
cd /chemin/vers/runfit-advisor
git checkout main
git pull origin main
git checkout -b dev
git push -u origin dev
```

---

## Étape 2 — Protection de la branche `main` (GitHub UI)

1. **Repo → Settings → Branches → Add branch protection rule**
2. Branch name pattern : `main`
3. Cocher :
   - Require a pull request before merging (1 approval)
   - Require status checks to pass → sélectionner `Lint • Typecheck • Build` (apparaîtra après le 1er run de la CI)
   - Require branches to be up to date before merging
   - Require conversation resolution before merging
   - Do not allow bypassing the above settings
4. Refaire pour `dev` (sans approval requirement).

5. **Settings → Code security and analysis** → activer :
   - Secret scanning
   - Push protection
   - Dependabot alerts

---

## Étape 3 — 3 projets Supabase

Dans le dashboard Supabase :

1. **runfit-prod** — projet existant (renommer si besoin) — passer en plan **Pro**
2. **runfit-staging** — créer (region eu-west-3, plan Free OK)
3. **runfit-dev** — créer (region eu-west-3, plan Free OK)

Pour chaque projet, récupérer dans **Settings → API** :
- Project Reference (ex: `abcdefghij`)
- URL (ex: `https://abcdefghij.supabase.co`)
- `anon` key
- `service_role` key

### Configurer le helper de switch
Éditer `scripts/supabase-switch.sh` et renseigner les 3 refs :
```bash
REF_DEV="abcdefghij"
REF_STAGING="klmnopqrst"
REF_PROD="uvwxyz1234"
```

Puis :
```bash
chmod +x scripts/supabase-switch.sh
```

### Appliquer les migrations existantes sur dev et staging
```bash
# Dev
./scripts/supabase-switch.sh dev
supabase db push

# Staging
./scripts/supabase-switch.sh staging
supabase db push

# Seed staging avec données factices
psql "$(supabase db remote -p)" -f supabase/seed.sql
# OU via Dashboard Supabase → SQL Editor → coller le contenu de supabase/seed.sql
```

---

## Étape 4 — Variables d'environnement Vercel

**Project Settings → Environment Variables**

Pour chaque variable du tableau (voir `docs/ENVIRONMENTS.md` §5), créer **3 entrées distinctes** (ou cocher plusieurs envs si la valeur est identique) :

| Variable | Production (main → prod) | Preview (PR/dev → staging) | Development (vercel dev → dev) |
|---|---|---|---|
| `SUPABASE_URL` | URL runfit-prod | URL runfit-staging | URL runfit-dev |
| `SUPABASE_KEY` | anon prod | anon staging | anon dev |
| `SUPABASE_SERVICE_ROLE_KEY` 🔒 | service prod | service staging | service dev |
| `ADMIN_EMAILS` | `adrien.neyron@gmail.com` | mail staging | mail dev |
| `AMAZON_PA_ACCESS_KEY` 🔒 | clé live | sandbox | (vide) |
| `AMAZON_PA_SECRET_KEY` 🔒 | clé live | sandbox | (vide) |
| `AMAZON_TRACKING_ID` | `runfit-21` | `runfit-stg-21` | `runfit-dev-21` |
| `NUXT_PUBLIC_SITE_URL` | `https://runfit-advisor.vercel.app` | `https://runfit-advisor-git-dev-<team>.vercel.app` | `http://localhost:3000` |

🔒 = cocher **Sensitive** dans Vercel.

---

## Étape 5 — Configuration Vercel

**Project Settings → Git**
- Production Branch : `main`

**Project Settings → Deployment Protection**
- Vercel Authentication → activer sur **Preview Deployments Only**

**Plan Pro uniquement :**
**Settings → Deployment Protection → Production Deployments**
- Require approval for production deployments → ON

---

## Étape 6 — Premier run de la CI

```bash
git checkout dev
git checkout -b chore/setup-ci
git add .github docs supabase/seed.sql scripts/supabase-switch.sh server/utils/logger.ts package.json nuxt.config.ts .env.example
git commit -m "chore: setup CI + multi-env infrastructure"
git push -u origin chore/setup-ci
```

Ouvrir une PR sur GitHub : `chore/setup-ci → dev`.

La CI (`.github/workflows/ci.yml`) doit tourner. Une fois verte :
1. Retourner dans **Settings → Branches → Edit rule on `main`**
2. Dans « Require status checks to pass », ajouter `Lint • Typecheck • Build` à la liste
3. Sauvegarder

---

## Étape 7 — Local dev

```bash
# Installer / mettre à jour deps
npm install

# Créer .env local (à partir de .env.example)
cp .env.example .env
# Remplir avec les credentials runfit-dev

# Lancer
npm run dev
```

---

## Étape 8 — Validation finale

Checklist :
- [ ] `git push` sur `main` direct est refusé (testé : doit retourner une erreur de protection)
- [ ] PR sur `dev` génère une URL Preview Vercel
- [ ] L'URL Preview se connecte bien à **runfit-staging** (pas à prod)
- [ ] L'admin staging affiche les emails configurés en variable Preview
- [ ] La CI échoue si on commit du code avec une erreur TypeScript volontaire (test à faire)
- [ ] La CI échoue si on commit du code avec une erreur ESLint volontaire (test à faire)

Une fois tous ces points validés : **l'infrastructure est production-ready.** 🎉

---

**Dernière mise à jour : 2026-05-04**
