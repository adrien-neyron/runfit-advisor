<script setup lang="ts">
import { Heart, ArrowLeft, RotateCcw, UserPlus, ChevronRight, ListFilter } from 'lucide-vue-next'
import { buildSwipeDeck, type SwipeDeckItem } from '~/data/shoes'

const router = useRouter()
const profileStore = useUserProfileStore()
const matchesStore = useMatchesStore()
const shoesStore = useShoesStore()

type Phase = 'intro' | 'swipe' | 'done'
const phase = ref<Phase>('intro')

onMounted(() => shoesStore.fetchShoes())

watch(
  () => profileStore.loading,
  (loading) => {
    if (!loading && !profileStore.profile) router.push('/')
  },
  { immediate: true },
)

const deck = computed<SwipeDeckItem[]>(() => {
  const profile = profileStore.profile
  const dbProducts = shoesStore.dbProducts
  if (!profile || dbProducts.length === 0) return []
  return buildSwipeDeck(profile, dbProducts, 15)
})

const handleSwipe = (shoeId: string, liked: boolean) => {
  matchesStore.swipe(shoeId, liked)
}

// ─── Résumé profil pour l'écran d'intro ──────────────────────────────────────
const profilePills = computed(() => {
  const p = profileStore.profile
  if (!p) return []
  const terrainMap:  Record<string, string> = { route: 'Route', trail: 'Trail', mixte: 'Mixte' }
  const fouleeMap:   Record<string, string> = { neutre: 'Neutre', pronateur: 'Pronateur', supinateur: 'Supinateur' }
  const distanceMap: Record<string, string> = { '5km': '5 km', '10km': '10 km', semi: 'Semi-marathon', marathon: 'Marathon', ultra: 'Ultra' }
  const objectifMap: Record<string, string> = { confort: 'Confort', performance: 'Performance', trail: 'Trail', prévention: 'Prévention' }
  return [
    terrainMap[p.terrain]   ?? p.terrain,
    fouleeMap[p.foulee]     ?? p.foulee,
    distanceMap[p.distance] ?? p.distance,
    objectifMap[p.objectif] ?? p.objectif,
  ]
})

const deckReady = computed(() => !profileStore.loading && !shoesStore.loading && deck.value.length > 0)
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <ToastContainer />

    <!-- Nav -->
    <div class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="container flex items-center justify-between h-14 max-w-lg">
        <UiButton variant="ghost" size="icon" aria-label="Retour à l'accueil" @click="router.push('/')">
          <ArrowLeft class="w-5 h-5" />
        </UiButton>

        <span class="font-black tracking-tighter text-sm">
          RUN<span class="text-gradient">MATCH</span>
        </span>

        <UiButton
          variant="ghost"
          size="icon"
          :aria-label="`Mes matchs (${matchesStore.likedShoes.length})`"
          class="relative"
          @click="router.push('/matches')"
        >
          <Heart class="w-5 h-5" />
          <span
            v-if="matchesStore.likedShoes.length > 0"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center"
          >
            {{ matchesStore.likedShoes.length }}
          </span>
        </UiButton>
      </div>
    </div>

    <!-- Bannière invité -->
    <Transition name="slide-banner">
      <div
        v-if="matchesStore.isGuest && matchesStore.guestLikedCount > 0"
        class="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-xl px-4 py-3"
      >
        <div class="container max-w-lg flex items-center gap-3">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold leading-tight">
              {{ matchesStore.guestLikedCount }} match{{ matchesStore.guestLikedCount > 1 ? 's' : '' }} non sauvegardé{{ matchesStore.guestLikedCount > 1 ? 's' : '' }}
            </p>
            <p class="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Ferme l'onglet et tu les perds. Crée un compte, c'est gratuit.
            </p>
          </div>
          <UiButton size="sm" variant="hero" class="shrink-0 gap-1.5 text-xs" @click="router.push('/connexion')">
            <UserPlus class="w-3.5 h-3.5" />
            Sauvegarder
          </UiButton>
        </div>
      </div>
    </Transition>

    <!-- Contenu -->
    <div
      class="flex-1 flex flex-col items-center justify-center pt-20 pb-10 px-6"
      :class="{ 'pb-24': matchesStore.isGuest && matchesStore.guestLikedCount > 0 }"
    >
      <Transition name="phase" mode="out-in">

        <!-- ═══ CHARGEMENT ════════════════════════════════════════════════════ -->
        <div v-if="profileStore.loading" key="loading" class="flex items-center justify-center">
          <div class="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>

        <!-- ═══ INTRO ══════════════════════════════════════════════════════════ -->
        <div
          v-else-if="phase === 'intro'"
          key="intro"
          class="w-full max-w-sm flex flex-col items-center text-center gap-7"
        >
          <!-- Icône + compteur -->
          <div>
            <div class="w-16 h-16 rounded-full accent-gradient flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
              <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div v-if="deckReady">
              <p class="text-4xl font-black tracking-tight">
                <span class="text-primary">{{ deck.length }}</span> paires
              </p>
              <p class="text-xl font-black tracking-tight">sélectionnées pour toi</p>
            </div>
            <div v-else class="space-y-2">
              <p class="text-2xl font-black tracking-tight">Sélection en cours…</p>
              <div class="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            </div>
          </div>

          <!-- Pills profil -->
          <div class="flex flex-wrap gap-2 justify-center">
            <span
              v-for="pill in profilePills"
              :key="pill"
              class="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold"
            >
              {{ pill }}
            </span>
          </div>

          <!-- Tutorial swipe -->
          <div class="w-full bg-secondary/50 rounded-2xl p-5">
            <p class="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-5">
              Comment ça marche
            </p>
            <div class="flex items-center justify-between gap-3">
              <!-- Passe -->
              <div class="flex flex-col items-center gap-2 flex-1">
                <div class="w-12 h-12 rounded-full bg-background border-2 border-red-400/40 flex items-center justify-center text-xl">
                  ✕
                </div>
                <p class="text-xs font-bold text-red-400">Passe</p>
                <p class="text-[10px] text-muted-foreground leading-tight">Glisse à gauche</p>
              </div>

              <!-- Chaussure centrale -->
              <div class="flex flex-col items-center gap-1">
                <div class="text-3xl">👟</div>
                <div class="flex items-center gap-1 text-muted-foreground/40 text-xs mt-1">
                  <span>←</span>
                  <span class="w-10 h-px bg-muted-foreground/20" />
                  <span>→</span>
                </div>
              </div>

              <!-- Match -->
              <div class="flex flex-col items-center gap-2 flex-1">
                <div class="w-12 h-12 rounded-full bg-background border-2 border-green-400/40 flex items-center justify-center text-xl">
                  ❤️
                </div>
                <p class="text-xs font-bold text-green-400">Match</p>
                <p class="text-[10px] text-muted-foreground leading-tight">Glisse à droite</p>
              </div>
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex flex-col gap-3 w-full">
            <UiButton
              variant="hero"
              size="lg"
              class="gap-2 w-full"
              :disabled="!deckReady"
              @click="phase = 'swipe'"
            >
              Découvrir mes paires
              <ChevronRight class="w-4 h-4" />
            </UiButton>
            <button
              class="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
              @click="router.push('/resultats')"
            >
              <ListFilter class="w-3.5 h-3.5" />
              Voir la liste complète à la place
            </button>
          </div>
        </div>

        <!-- ═══ SWIPE ════════════════════════════════════════════════════════ -->
        <div v-else-if="phase === 'swipe'" key="swipe" class="w-full">
          <SwipeDeck
            :deck="deck"
            :on-swipe="handleSwipe"
            :on-empty="() => (phase = 'done')"
          />
        </div>

        <!-- ═══ FIN ═══════════════════════════════════════════════════════════ -->
        <div
          v-else-if="phase === 'done'"
          key="done"
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
          class="text-center max-w-xs"
        >
          <div class="text-6xl mb-5">🎉</div>
          <h2 class="text-3xl font-black mb-2 tracking-tight">C'est terminé !</h2>

          <div v-if="matchesStore.likedShoes.length > 0">
            <p class="text-muted-foreground mb-1">
              Tu as matché
              <span class="text-primary font-bold">
                {{ matchesStore.likedShoes.length }} paire{{ matchesStore.likedShoes.length !== 1 ? 's' : '' }}
              </span>
            </p>
            <p class="text-xs text-muted-foreground mb-8">
              Compare les prix et commande directement depuis ta page Matchs.
            </p>
          </div>
          <div v-else>
            <p class="text-muted-foreground mb-1">Aucun match cette fois.</p>
            <p class="text-xs text-muted-foreground mb-8">
              Refais le questionnaire pour affiner ta sélection.
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <UiButton
              v-if="matchesStore.likedShoes.length > 0"
              variant="hero"
              size="lg"
              class="gap-2"
              @click="router.push('/matches')"
            >
              <Heart class="w-4 h-4" />
              Voir mes {{ matchesStore.likedShoes.length }} match{{ matchesStore.likedShoes.length !== 1 ? 's' : '' }}
            </UiButton>
            <UiButton variant="outline" size="lg" class="gap-2" @click="router.push('/questionnaire')">
              <RotateCcw class="w-4 h-4" />
              Refaire le questionnaire
            </UiButton>
          </div>
        </div>

      </Transition>
    </div>
  </div>
</template>

<style scoped>
.phase-enter-active,
.phase-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.phase-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.phase-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.slide-banner-enter-active,
.slide-banner-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-banner-enter-from,
.slide-banner-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
