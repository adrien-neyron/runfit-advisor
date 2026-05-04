<script setup lang="ts">
import { ArrowLeft, Heart, Trash2, Sparkles, UserPlus, LogIn, ExternalLink } from 'lucide-vue-next'
import { shoes } from '~/data/shoes'
import type { BestOffer } from '~/composables/useMerchants'

const router       = useRouter()
const matchesStore = useMatchesStore()
const shoesStore   = useShoesStore()
const { fetchBestOffers, buildAffiliateRedirectUrl } = useMerchants()

const bestOffers = ref<Map<string, BestOffer>>(new Map())
const redirect   = ref<{ merchant: string; url: string; shoeId: string; model: string } | null>(null)

onMounted(async () => {
  await shoesStore.fetchShoes()

  // Charge les meilleures offres pour toutes les chaussures matchées en une requête
  const ids = matchesStore.likedShoes.map((m) => m.shoeId)
  if (ids.length) {
    const labels = new Map(
      matchedShoes.value
        .filter(Boolean)
        .map((s) => [s!.id, `${s!.brand} ${s!.model}`])
    )
    bestOffers.value = await fetchBestOffers(ids, labels)
  }
})

const matchedShoes = computed(() =>
  matchesStore.likedShoes
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((m) => {
      const shoe = shoes.find((s) => s.id === m.shoeId)
      if (!shoe) return null
      // Priorité à l'image CDN Storage, fallback sur la donnée statique
      const dbProduct = shoesStore.dbProducts.find((s) => s.id === m.shoeId)
      return {
        ...shoe,
        image: dbProduct?.image || shoe.image,
        prix: dbProduct?.prix ?? shoe.prix,  // prix temps réel si dispo
      }
    })
    .filter(Boolean),
)

const handleBuy = (shoeId: string, model: string) => {
  const offer = bestOffers.value.get(shoeId)
  if (!offer) {
    const shoe = matchedShoes.value.find((s) => s!.id === shoeId)
    router.push(`/shoes/${shoe?.slug ?? shoeId}`)
    return
  }
  // URL de l'endpoint serveur : tracking + tag affilié garantis
  const url = buildAffiliateRedirectUrl(shoeId, offer.merchant)
  redirect.value = { merchant: offer.merchant, url, shoeId, model }
}

const confirmRedirect = () => {
  if (!redirect.value) return
  // Tracking géré côté serveur dans /api/affiliate/:merchant/:shoeId
  window.open(redirect.value.url, '_blank', 'noopener,noreferrer')
  redirect.value = null
}
</script>

<template>
  <div class="min-h-screen bg-background">

    <!-- Dialog de redirection -->
    <Teleport v-if="redirect" to="body">
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="redirect = null" />
        <div class="relative bg-card rounded-2xl shadow-2xl p-6 max-w-sm w-full z-10">
          <h3 class="font-black text-lg mb-2">Redirection vers {{ redirect.merchant }}</h3>
          <p class="text-sm text-muted-foreground mb-5">
            Vous allez être redirigé vers le site partenaire pour finaliser votre achat.
          </p>
          <div class="flex gap-3">
            <UiButton variant="outline" class="flex-1" @click="redirect = null">Annuler</UiButton>
            <UiButton variant="hero" class="flex-1" @click="confirmRedirect">Continuer</UiButton>
          </div>
        </div>
      </div>
    </Teleport>
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
            class="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-xl hover:border-primary/30 transition-all duration-200"
            :aria-label="`${shoe!.brand} ${shoe!.model}`"
          >
            <div class="aspect-square bg-gradient-to-br from-secondary/80 to-secondary/30 overflow-hidden relative">
              <ShoeImage
                :src="shoe!.image"
                :alt="`${shoe!.brand} ${shoe!.model}`"
                class="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply dark:mix-blend-normal"
                loading="lazy"
              />
            </div>
            <div class="p-3 flex flex-col gap-2">
              <div>
                <p class="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {{ shoe!.brand }}
                </p>
                <h3 class="text-sm font-black leading-tight line-clamp-2 mt-0.5">{{ shoe!.model }}</h3>
              </div>

              <!-- Marchand disponible -->
              <p v-if="bestOffers.get(shoe!.id)" class="text-xs text-muted-foreground">
                Disponible chez {{ bestOffers.get(shoe!.id)!.merchant }}
              </p>

              <!-- Tags -->
              <div class="flex gap-1 flex-wrap">
                <span
                  v-for="tag in shoe!.tags.slice(0, 2)"
                  :key="tag"
                  class="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize font-medium"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- Bouton achat -->
              <button
                class="w-full mt-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                @click.stop="handleBuy(shoe!.id, shoe!.model)"
              >
                <ExternalLink class="w-3 h-3" />
                Voir le meilleur prix
              </button>
            </div>
          </article>
        </div>

        <!-- Mention légale affiliés (obligatoire Amazon Associates) -->
        <AffiliateDisclosure class="mt-6" />

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
