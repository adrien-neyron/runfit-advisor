<script setup lang="ts">
// RunMatch n'utilise que des cookies et du stockage local strictement nécessaires
// (session de connexion, profil et matchs sur l'appareil) : ni publicité, ni mesure d'audience, ni traceur tiers.
// Ces traceurs sont exemptés de consentement : ce bandeau est donc une simple information,
// sans faux choix « accepter / refuser ». Il ne volera pas le focus et se ferme d'un clic.
const STORAGE_KEY = 'runmatch-cookie-consent'

const visible = ref(false)

onMounted(() => {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Petit délai pour ne pas parasiter le chargement initial
      setTimeout(() => (visible.value = true), 800)
    }
  } catch {
    // stockage indisponible : on n'affiche pas le bandeau en boucle
  }
})

function dismiss() {
  try { localStorage.setItem(STORAGE_KEY, 'acknowledged') } catch { /* ignore */ }
  visible.value = false
}
</script>

<template>
  <Transition name="cookie-slide">
    <section
      v-if="visible"
      aria-label="Information sur les cookies"
      class="fixed bottom-0 left-0 right-0 z-[60] bg-card border-t border-border shadow-2xl"
      data-id="cookie-notice"
    >
      <div class="container max-w-3xl py-4 px-5">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold leading-snug">Cookies : uniquement le nécessaire</p>
            <p class="text-sm text-muted-foreground mt-1 leading-relaxed">
              RunMatch utilise seulement des cookies et un stockage local indispensables au fonctionnement
              (connexion, sauvegarde de ton profil et de tes matchs sur cet appareil). Aucune publicité,
              aucune mesure d'audience, aucun traceur tiers.
              <NuxtLink to="/confidentialite" class="underline hover:text-brand transition-colors">
                En savoir plus
              </NuxtLink>
            </p>
          </div>

          <button
            type="button"
            class="w-full sm:w-auto shrink-0 min-h-11 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="dismiss"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
.cookie-slide-enter-active,
.cookie-slide-leave-active {
  transition: transform 0.35s ease, opacity 0.35s ease;
}
.cookie-slide-enter-from,
.cookie-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
