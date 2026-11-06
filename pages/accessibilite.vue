<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

useHead({
  title: 'Déclaration d\'accessibilité — RunMatch',
  meta: [
    {
      name: 'description',
      content: 'Déclaration d\'accessibilité de RunMatch : état de conformité au RGAA, mesures mises en œuvre, limites connues et voies de recours.',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="container flex items-center h-16">
        <UiButton variant="ghost" size="icon" aria-label="Retour à l'accueil" to="/">
          <ArrowLeft class="w-5 h-5" aria-hidden="true" />
        </UiButton>
        <span class="ml-4 font-black tracking-tighter" aria-hidden="true">
          RUN<span class="text-gradient">MATCH</span>
        </span>
      </div>
    </div>

    <div class="container max-w-2xl pt-24 pb-16 px-4 prose prose-sm dark:prose-invert" data-id="accessibility-statement">
      <h1 class="text-3xl font-black">Déclaration d'accessibilité</h1>
      <p class="text-muted-foreground">Établie en novembre 2026, à partir de l'auto-évaluation de l'éditeur.</p>

      <p>
        RunMatch s'engage à rendre son site accessible, conformément au Référentiel Général d'Amélioration de
        l'Accessibilité (RGAA 4.1) et aux Règles pour l'accessibilité des contenus Web (WCAG 2.1, niveau AA).
        Cette page indique où en est le site.
      </p>

      <h2 class="text-xl font-black mt-8">État de conformité</h2>
      <p>
        <strong>Le niveau de conformité de RunMatch n'a pas encore été évalué.</strong> Le site n'a pas fait l'objet
        d'un audit RGAA complet : nous ne pouvons donc pas annoncer de taux de conformité. Cette déclaration sera mise
        à jour avec le résultat dès qu'un audit aura été réalisé.
      </p>

      <h2 class="text-xl font-black mt-6">Mesures mises en œuvre</h2>
      <ul>
        <li>Lien d'évitement « Aller au contenu » et langue de la page déclarée.</li>
        <li>Questionnaire présenté comme une boîte de dialogue : focus gardé à l'intérieur, fermeture avec la touche Échap, retour du focus à la fermeture.</li>
        <li>Réponses du questionnaire en vrais boutons radio, utilisables au clavier.</li>
        <li>Swipe utilisable sans geste : boutons « Passer » et « Matcher », flèches gauche et droite du clavier, annonce de chaque modèle aux lecteurs d'écran.</li>
        <li>Changements de page annoncés aux technologies d'assistance.</li>
        <li>Animations réduites ou supprimées quand le système demande un mouvement réduit.</li>
        <li>Formulaires avec étiquettes, erreurs décrites champ par champ et résumé d'erreurs.</li>
        <li>Notifications et confirmations lisibles par les lecteurs d'écran, sans disparition trop rapide.</li>
        <li>Liens et boutons distingués : la navigation utilise de vrais liens.</li>
        <li>Polices hébergées par RunMatch, sans appel à un service tiers.</li>
      </ul>

      <h2 class="text-xl font-black mt-6">Limites connues</h2>
      <ul>
        <li>Les tests avec lecteurs d'écran et les audits automatisés (par exemple axe) restent à réaliser sur l'ensemble des parcours.</li>
        <li>Les fiches chaussures, le blog et l'espace d'administration n'ont pas encore été revus.</li>
        <li>Le site ne propose pas de thème sombre.</li>
        <li>Certaines informations secondaires sont affichées en petits caractères et seront agrandies progressivement.</li>
      </ul>

      <h2 class="text-xl font-black mt-6">Technologies utilisées</h2>
      <p>HTML, CSS, JavaScript (Vue 3 et Nuxt) et WAI-ARIA lorsque le HTML natif ne suffit pas.</p>

      <h2 class="text-xl font-black mt-6">Retour d'information et contact</h2>
      <p>
        Si vous ne parvenez pas à accéder à un contenu ou à une fonctionnalité, ou pour signaler un défaut
        d'accessibilité, écrivez-nous via le
        <NuxtLink to="/contact" class="text-brand hover:underline">formulaire de contact</NuxtLink>
        (sujet « Signaler un bug ») ou à
        <a href="mailto:adrien.neyron@gmail.com" class="text-brand hover:underline">adrien.neyron@gmail.com</a>.
        Indiquez la page concernée et la difficulté rencontrée. Nous répondons dans les meilleurs délais.
      </p>

      <h2 class="text-xl font-black mt-6">Voies de recours</h2>
      <p>
        Si vous constatez un défaut d'accessibilité qui vous empêche d'accéder à un contenu ou à un service et que
        votre demande reste sans réponse satisfaisante, vous pouvez saisir le Défenseur des droits :
      </p>
      <ul>
        <li>
          par le
          <a href="https://formulaire.defenseurdesdroits.fr" target="_blank" rel="noopener noreferrer" class="text-brand hover:underline">formulaire en ligne<span class="sr-only"> (s'ouvre dans un nouvel onglet)</span></a>,
        </li>
        <li>par courrier gratuit, sans affranchissement : Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07.</li>
      </ul>
    </div>
  </div>
</template>
