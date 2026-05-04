FitRun Advisor — Instructions pour Claude Code
Règle critique

Ne pousse jamais de code directement sur GitHub.
Toutes les modifications doivent être proposées sous forme de code prêt à intégrer, mais jamais publiées automatiquement.

Vision produit

FitRun Advisor est une application qui aide les coureurs à choisir des chaussures de running et de trail parfaitement adaptées à leur profil.

L’application doit devenir un advisor intelligent + moteur d’affiliation rentable.

Le produit repose sur 4 piliers :

Questionnaire utilisateur progressif (élément clé de conversion et de différenciation)
Recommandations de chaussures via une interface swipe
Affichage de prix fiables et compétitifs
Monétisation via affiliation marchands
Stack technique
Frontend : Vue.js
Framework : Nuxt
Backend / DB / Auth : Supabase

Toutes les propositions techniques doivent respecter cette stack.

Objectifs business

L’application doit :

Maximiser le taux de complétion du questionnaire
Maximiser le taux de clic vers les liens affiliés
Construire progressivement un profil utilisateur riche
Améliorer la pertinence des recommandations dans le temps
Générer des revenus via l’affiliation chaussures
Principes produit essentiels
1) Questionnaire progressif (core feature)

Le questionnaire ne doit jamais être long ou bloquant.

Le profil utilisateur doit :

se compléter en plusieurs sessions
sauvegarder chaque réponse automatiquement
pouvoir être partiellement rempli
s’enrichir au fil du temps

Objectif : réduire la friction et améliorer la conversion.

2) Recommandation par swipe

Les chaussures doivent être présentées comme une expérience type dating app :

Swipe right → chaussure pertinente
Swipe left → chaussure non pertinente

Chaque interaction doit enrichir le profil utilisateur.

3) Base de données chaussures

Créer et maintenir une base structurée contenant :

caractéristiques techniques
catégories d’usage
scores (amorti, stabilité, dynamisme, grip, etc.)
liens affiliés multi-marchands
fourchettes de prix réalistes

Cette base est essentielle au moteur de recommandation.

4) Système d’affiliation

Chaque recommandation doit pouvoir mener vers :

plusieurs marchands
liens trackés
clics enregistrés

Le système doit permettre :

le tracking des clics
l’optimisation du taux de conversion
l’affichage du “meilleur prix disponible”
Méthode de travail attendue

Toujours travailler étape par étape.

Pour chaque évolution proposée :

Expliquer l’objectif produit
Proposer l’architecture technique
Fournir le code prêt à intégrer (Nuxt / Vue / Supabase)
Expliquer l’impact conversion / business

Ne jamais faire de changements massifs sans découpage en étapes.

Priorité absolue

Tout développement doit servir en priorité :

la conversion
la qualité des recommandations
la rentabilité via affiliation