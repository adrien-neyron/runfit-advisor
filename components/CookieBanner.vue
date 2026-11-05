<script setup lang="ts">
const STORAGE_KEY = 'runmatch-cookie-consent'

const visible = ref(false)

onMounted(() => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    // Petit délai pour ne pas parasiter le chargement initial
    setTimeout(() => (visible.value = true), 800)
  }
})

function accept() {
  localStorage.setItem(STORAGE_KEY, 'accepted')
  visible.value = false
}

function refuse() {
  localStorage.setItem(STORAGE_KEY, 'refused')
  visible.value = false
}
</script>

<template>
  <Transition name="cookie-slide">
    <div
      v-if="visible"
      role="dialog"
      aria-label="Gestion des cookies"
      aria-live="polite"
      class="fixed bottom-0 left-0 right-0 z-[60] bg-card border-t border-border shadow-2xl"
    >
      <div class="container max-w-3xl py-4 px-5">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <!-- Texte -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold leading-snug">
              Ce site utilise des cookies
            </p>
            <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
              Nous utilisons des cookies fonctionnels pour l'authentification et la sauvegarde de vos préférences.
              Aucun cookie publicitaire ou de pistage tiers.
              <NuxtLink
                to="/confidentialite"
                class="underline hover:text-brand transition-colors"
              >
                En savoir plus
              </NuxtLink>
            </p>
          </div>

          <!-- Actions — refus aussi visible que l'acceptation (CNIL) -->
          <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              class="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
              @click="refuse"
            >
              Tout refuser
            </button>
            <button
              class="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              @click="accept"
            >
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
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
