<script setup lang="ts">
import { ArrowLeft, Heart, Trash2, Sparkles, UserPlus, LogIn } from 'lucide-vue-next'
import { shoes } from '~/data/shoes'

const router       = useRouter()
const matchesStore = useMatchesStore()
const shoesStore   = useShoesStore()

// Charge les données Supabase pour avoir les images à jour
onMounted(() => shoesStore.fetchShoes())

const matchedShoes = computed(() =>
  matchesStore.likedShoes
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((m) => {
      const shoe = shoes.find((s) => s.id === m.shoeId)
      if (!shoe) return null
      // Priorité à l'image Supabase (admin pipeline), fallback sur la donnée statique
      const dbImage = shoesStore.dbProducts.find((s) => s.id === m.shoeId)?.image
      return { ...shoe, image: dbImage || shoe.image }
    })
    .filter(Boolean),
)
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Nav -->
    <div class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="container flex items-center justify-between h-14 max-w-2xl">
        <UiButton variant="ghost" size="icon" aria-label="Retour" @click="router.push('/')">
          <ArrowLeft class="w-5 h-5" />
        </UiButton>

        <span class="font-black tracking-tighter text-sm">
          Mes <span class="text-gradient">Matchs</span>
        </span>

        <UiButton
          v-if="matchedShoes.length > 0"
          variant="ghost"
          size="icon"
          aria-label="Effacer tous les matchs"
          @click="matchesStore.clearMatches()"
        >
          <Trash2 class="w-4 h-4 text-muted-foreground" />
        </UiButton>
        <div v-else class="w-9" />
      </div>
    </div>

    <div class="container pt-20 pb-16 max-w-2xl px-4">

      <!-- Bannière invité -->
      <div
        v-if="matchesStore.isGuest && matchedShoes.length > 0"
        v-motion
        :initial="{ opacity: 0, y: -10 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
        class="mb-5 rounded-2xl border border-primary/30 bg-primary/5 p-4"
      >
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
            <UserPlus class="w-4.5 h-4.5 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-black leading-tight">
              Tes matchs ne sont pas sauvegardés
            </p>
            <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
              Ferme cet onglet et tu perds tout.
              Crée un compte gratuit pour les retrouver sur n'importe quel appareil.
            </p>
            <div class="flex gap-2 mt-3">
              <UiButton size="sm" variant="hero" class="gap-1.5" @click="router.push('/connexion?signup=1')">
                <UserPlus class="w-3.5 h-3.5" />
                Créer un compte
              </UiButton>
              <UiButton size="sm" variant="outline" class="gap-1.5" @click="router.push('/connexion')">
                <LogIn class="w-3.5 h-3.5" />
                Se connecter
              </UiButton>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div
        v-if="matchedShoes.length === 0"
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0 }"
        class="flex flex-col items-center justify-center min-h-[65vh] text-center gap-4"
      >
        <Heart class="w-16 h-16 text-muted-foreground/25" :stroke-width="1.5" />
        <h1 class="text-2xl font-black tracking-tight">Aucun match pour l'instant</h1>
        <p class="text-muted-foreground text-sm max-w-xs">
          Swipez des chaussures et retrouvez vos coups de cœur ici pour les comparer et acheter.
        </p>
        <UiButton variant="hero" class="gap-2 mt-2" @click="router.push('/swipe')">
          <Sparkles class="w-4 h-4" />
          Découvrir des chaussures
        </UiButton>
      </div>

      <template v-else>
        <!-- Header -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0 }"
          class="mb-6"
        >
          <h1 class="text-2xl font-black tracking-tight">
            {{ matchedShoes.length }} chaussure{{ matchedShoes.length !== 1 ? 's' : '' }}
            matchée{{ matchedShoes.length !== 1 ? 's' : '' }}
          </h1>
          <p class="text-muted-foreground text-sm mt-1">
            Appuyez sur une carte pour voir les détails et les acheter
          </p>
        </div>

        <!-- Grille -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <article
            v-for="(shoe, i) in matchedShoes"
            :key="shoe!.id"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: i * 60, duration: 350 } }"
            class="bg-card rounded-2xl border border-border overflow-hidden cursor-pointer group hover:shadow-xl hover:border-primary/30 transition-all duration-200"
            role="link"
            :aria-label="`${shoe!.brand} ${shoe!.model} — ${shoe!.prix} €`"
            @click="router.push(`/shoes/${shoe!.slug}`)"
          >
            <div class="aspect-square bg-gradient-to-br from-secondary/80 to-secondary/30 overflow-hidden relative">
              <ShoeImage
                :src="shoe!.image"
                :alt="`${shoe!.brand} ${shoe!.model}`"
                class="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply dark:mix-blend-normal"
                loading="lazy"
              />
            </div>
            <div class="p-3">
              <p class="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {{ shoe!.brand }}
              </p>
              <h3 class="text-sm font-black leading-tight line-clamp-2 mt-0.5">{{ shoe!.model }}</h3>
              <p class="text-primary font-bold text-sm mt-1.5">{{ shoe!.prix }} €</p>
              <div class="flex gap-1 mt-2 flex-wrap">
                <span
                  v-for="tag in shoe!.tags.slice(0, 2)"
                  :key="tag"
                  class="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize font-medium"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- Footer CTA -->
        <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <UiButton variant="hero" class="gap-2" @click="router.push('/swipe')">
            <Sparkles class="w-4 h-4" />
            Swiper plus de chaussures
          </UiButton>
          <UiButton variant="outline" @click="router.push('/resultats')">
            Voir les recommandations
          </UiButton>
        </div>
      </template>
    </div>
  </div>
</template>
