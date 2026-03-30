<script setup lang="ts">
import { Heart, ArrowLeft, RotateCcw, UserPlus } from 'lucide-vue-next'
import { buildSwipeDeck, type SwipeDeckItem } from '~/data/shoes'

const router = useRouter()
const profileStore = useUserProfileStore()
const matchesStore = useMatchesStore()
const shoesStore = useShoesStore()

const done = ref(false)

// Charge les chaussures depuis Supabase au montage
onMounted(() => shoesStore.fetchShoes())

// Redirige vers l'accueil si pas de profil après chargement
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

    <!-- Bannière invité — apparaît dès le 1er match -->
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

    <!-- Contenu principal -->
    <div class="flex-1 flex flex-col items-center justify-center pt-20 pb-8"
      :class="{ 'pb-24': matchesStore.isGuest && matchesStore.guestLikedCount > 0 }"
    >
      <!-- Chargement -->
      <div v-if="profileStore.loading" class="flex items-center justify-center">
        <div class="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>

      <!-- Deck de swipe -->
      <Transition name="fade" mode="out-in">
        <div v-if="!done && !profileStore.loading" key="deck" class="w-full">
          <SwipeDeck
            :deck="deck"
            :on-swipe="handleSwipe"
            :on-empty="() => (done = true)"
          />
        </div>

        <!-- Écran de fin -->
        <div
          v-else-if="done"
          key="done"
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
          class="text-center px-6 max-w-xs"
        >
          <div class="text-7xl mb-5">🎉</div>
          <h2 class="text-3xl font-black mb-2 tracking-tight">Swipe terminé !</h2>
          <p class="text-muted-foreground mb-1">
            Vous avez matché
            <span class="text-primary font-bold">
              {{ matchesStore.likedShoes.length }} chaussure{{ matchesStore.likedShoes.length !== 1 ? 's' : '' }}
            </span>
          </p>
          <p class="text-xs text-muted-foreground mb-7">
            Retrouvez-les sur votre page Matchs pour comparer et acheter.
          </p>

          <div class="flex flex-col gap-3">
            <UiButton variant="hero" size="lg" class="gap-2" @click="router.push('/matches')">
              <Heart class="w-4 h-4" />
              Voir mes matchs ({{ matchesStore.likedShoes.length }})
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
