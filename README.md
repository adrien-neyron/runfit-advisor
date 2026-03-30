# 🏃‍♂️ RunFit Advisor

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.21.2-blue)](https://nuxt.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-blue)](https://tailwindcss.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5.30-brightgreen)](https://vuejs.org/)

**RunFit Advisor** est une application web qui recommande les chaussures de running et trail adaptées à chaque coureur en fonction de sa morphologie, son profil sportif et ses habitudes.  

> Trouvez la chaussure parfaite, rapidement et de manière personnalisée !

---

## 🌐 Démo

![RunFit Advisor Demo](https://user-images.githubusercontent.com/tonimage/demo.gif)  
> Si disponible, mettre un GIF ou screenshot de l’application en action

---

## 🚀 Fonctionnalités clés

- Questionnaire morphologique et sportif intelligent  
- Recommandation personnalisée de chaussures  
- Intégration multi-réseaux d’affiliation (Awin, CJ, Amazon)  
- Filtrage et tri par sport, marque, prix et disponibilité  
- Liens affiliés prêts à l’achat  

---

## 🛠 Stack technique

- **Frontend :** Nuxt 3 + Vue 3 + TailwindCSS  
- **Backend :** Nitro (Nuxt server engine)  
- **Base de données :** PostgreSQL avec Prisma ORM  
- **Automatisation :** Cron jobs pour synchronisation des flux produits  
- **Affiliation :** Multi-réseaux, flux CSV/XML/JSON, deep links  

---

## 📂 Structure du projet

runfit-advisor/
├─ server/ # Services métier et cron jobs
│ ├─ services/
│ ├─ parsers/
│ └─ tasks/
├─ components/ # Composants Vue réutilisables
├─ pages/ # Pages Nuxt
├─ assets/css/ # Styles TailwindCSS
├─ prisma/ # Schéma et migrations Prisma
└─ README.md
