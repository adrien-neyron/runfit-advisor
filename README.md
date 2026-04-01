# RunFit Advisor

> Application de recommandation de chaussures running & trail — swipe, scoring métier et affiliation.

**[→ Demo live](https://runfit-advisor.vercel.app/)**

![Nuxt](https://img.shields.io/badge/Nuxt_3-00DC82?style=flat&logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue_3-4FC08D?style=flat&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

## À propos

RunFit Advisor aide les coureurs à trouver la chaussure qui correspond à leur profil — sans se noyer dans les fiches techniques.

L'utilisateur répond à un questionnaire (morphologie, terrain, niveau, historique de blessures), puis swipe des modèles proposés par l'algorithme. Le système affine les recommandations en temps réel et oriente vers des liens d'achat affiliés.

**Cas d'usage typique** : un coureur trail débutant qui cherche sa première chaussure technique sans savoir ce que signifie "drop 4mm" ou "stack 30mm".

---

## Fonctionnalités

- **Questionnaire de profil** — morphologie, type de foulée, terrain, objectifs, historique de blessures
- **Mécanique de swipe** — interface Tinder-like pour affiner les préférences en temps réel
- **Algorithme de scoring métier** — pondération multicritères basée sur les règles expertes running/trail
- **Base de 50+ modèles** — route & trail, avec données techniques (drop, stack, poids, amorti)
- **Système d'affiliation** — liens d'achat intégrés sur chaque recommandation
- **Auth utilisateur** — sauvegarde du profil et historique des recommandations

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Nuxt 3 · Vue 3 · TypeScript |
| UI | TailwindCSS |
| Backend / BDD | Supabase · PostgreSQL |
| Auth | Supabase Auth |
| Déploiement | Vercel |

---

## Architecture

```
runfit-advisor/
├── pages/              # Routes Nuxt (questionnaire, swipe, résultats)
├── components/         # SwipeCard, QuestionStep, ShoeCard...
├── composables/        # useRecommendation, useProfile, useSwipe
├── server/api/         # Endpoints Nitro (scoring, shoes, affiliate)
├── stores/             # Pinia — profil utilisateur, session swipe
└── supabase/
    └── migrations/     # Schéma PostgreSQL (shoes, profiles, sessions)
```

---

## Lancer en local

### Prérequis

- Node.js 18+
- Un projet Supabase (gratuit)

### Installation

```bash
git clone https://github.com/adrien-neyron/runfit-advisor.git
cd runfit-advisor
npm install
```

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### Migrations DB

```bash
npx supabase db push
```

### Démarrer

```bash
npm run dev
# → http://localhost:3000
```

---

## Roadmap

- [ ] Recommandations IA via Claude API (affinement du scoring)
- [ ] Comparateur de modèles côte à côte
- [ ] Mode "renouvellement" — recommande en fonction de la chaussure actuelle
- [ ] Dashboard partenaires affiliés

---

## Auteur

**Adrien Neyron** — Développeur Fullstack JS · Vue.js / Node.js · AI & Automation  
[linkedin.com/in/adrienneyron](https://www.linkedin.com/in/adrienneyron/) · adrien.neyron@gmail.com
