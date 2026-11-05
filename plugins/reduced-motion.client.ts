/**
 * Respect de `prefers-reduced-motion` pour les animations pilotées en JavaScript (v-motion).
 *
 * Les animations CSS sont neutralisées dans assets/css/main.css ; ici on remplace la directive
 * `v-motion` par une directive vide quand l'utilisateur a demandé moins de mouvement :
 * les éléments s'affichent directement à leur place, sans glissement ni fondu.
 * (WCAG 2.3.3 / RGAA 13.8 — le réglage est lu au chargement de la page.)
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  nuxtApp.hook('app:created', (vueApp) => {
    // Remplace la directive enregistrée par @vueuse/motion (un avertissement dev « déjà enregistrée » est attendu)
    vueApp.directive('motion', {})
  })
})
