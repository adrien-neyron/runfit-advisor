<script setup lang="ts">
import { ArrowLeft, ShoppingBag, Share2, RotateCcw, Sparkles } from 'lucide-vue-next'
import { getRecommendations, type Recommendation } from '~/data/products'

const router = useRouter()
const user = useSupabaseUser()
const profileStore = useUserProfileStore()
const shoesStore = useShoesStore()
const { fetchMerchantOffers, trackOfferClick } = useMerchants()
const { toast } = useToast()

const recommendations = ref<Recommendation[]>([])
const bestOffers = ref<Record<string, any>>({})
const redirect = ref<{ merchant: string; url: string; productId: string; model: string } | null>(null)

onMounted(() => shoesStore.fetchShoes())

// Calcule les recommandations quand le profil est disponible
watch(
  () => profileStore.profile,
  async (profile) => {
    if (!profile) return
    const source = shoesStore.dbProducts.length > 0 ? shoesStore.dbProducts : undefined
    const recs = getRecommendations(profile, 3, source)
    recommendations.value = recs

    // Charge les meilleures offres marchands en parallèle
    recs.forEach((rec) => {
      fetchMerchantOffers(rec.product.id, {
        brand: rec.product.brand,
        model: rec.product.model,
        basePrice: rec.product.prix,
      }).then((offers) => {
        const best = offers.find((o) => o.available) ?? null
        bestOffers.value[rec.product.id] = best
      })
    })
  },
  { immediate: true },
)

// Redirige si pas de profil
watch(
  () => profileStore.loading,
  (loading) => {
    if (!loading && !profileStore.profile) router.push('/')
  },
  { immediate: true },
)

const handleBuy = (productId: string, model: string) => {
  if (!user.value) {
    toast({ title: 'Connexion requise', description: 'Connectez-vous pour accéder aux offres d\'achat.' })
    router.push('/connexion')
    return
  }

  const offer = bestOffers.value[productId]
  if (!offer || !offer.available || !offer.affiliateUrl) {
    toast({ title: 'Offre indisponible', description: 'Cette chaussure n\'est plus disponible chez ce marchand.' })
    return
  }

  if (offer.urlStatus === 'fallback') {
    toast({
      title: 'Lien produit mis à jour',
      description: 'Redirection vers une recherche du modèle chez ce marchand.',
    })
  }

  redirect.value = { merchant: offer.merchant, url: offer.affiliateUrl, productId, model }
}

const confirmRedirect = () => {
  if (!redirect.value) return
  trackOfferClick({
    productId: redirect.value.productId,
    retailerName: redirect.value.merchant,
    shoeModel: redirect.value.model,
  })
  window.open(redirect.value.url, '_blank', 'noopener,noreferrer')
  redirect.value = null
}

// Score ring helper
const scorePercent = (score: number) => Math.min(100, Math.round((score / 90) * 100))
</script>

<template>
  <div class="min-h-screen bg-background" role="main">
    <ToastContainer />

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
      <div class="container flex items-center justify-between h-16">
        <UiButton variant="ghost" size="icon" aria-label="Retour au questionnaire" @click="router.push('/questionnaire')">
          <ArrowLeft class="w-5 h-5" />
        </UiButton>
        <span class="font-black tracking-tighter">RUN<span class="text-gradient">MATCH</span></span>
        <UiButton variant="ghost" size="icon" aria-label="Partager les résultats">
          <Share2 class="w-5 h-5" />
        </UiButton>
      </div>
    </div>

    <div class="pt-24 pb-16 container max-w-4xl">
      <!-- Chargement -->
      <div v-if="profileStore.loading" class="flex items-center justify-center py-24">
        <div class="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>

      <template v-else-if="profileStore.profile">
        <!-- Header -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0 }"
          class="text-center mb-12"
        >
          <h1 class="text-3xl md:text-5xl font-black tracking-tight mb-3">
            Vos <span class="text-gradient">recommandations</span>
          </h1>
          <div class="flex flex-wrap justify-center gap-2 mt-4">
            <span
              v-for="tag in [
                { label: 'Foulée', value: profileStore.profile.foulee },
                { label: 'Terrain', value: profileStore.profile.terrain },
                { label: 'Niveau', value: profileStore.profile.niveau },
                { label: 'Objectif', value: profileStore.profile.objectif },
                { label: 'Drop', value: profileStore.profile.dropPreference },
                { label: 'Amorti', value: profileStore.profile.amortPreference },
              ]"
              :key="tag.label"
              class="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
            >
              {{ tag.label }}: {{ tag.value }}
            </span>
          </div>
        </div>

        <!-- Résultats vides -->
        <div v-if="recommendations.length === 0 && !profileStore.loading" class="text-center py-12">
          <p class="text-muted-foreground text-lg mb-4">Aucune chaussure ne correspond parfaitement à votre profil.</p>
          <UiButton variant="hero" @click="router.push('/questionnaire')">
            <RotateCcw class="w-4 h-4" />
            Recommencer
          </UiButton>
        </div>

        <!-- Cards de recommandations -->
        <div class="space-y-6">
          <article
            v-for="(rec, i) in recommendations"
            :key="rec.product.id"
            v-motion
            :initial="{ opacity: 0, y: 40 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: i * 200, duration: 500 } }"
            class="bg-card rounded-2xl card-shadow overflow-hidden border border-border"
          >
            <div class="flex flex-col md:flex-row">
              <!-- Image -->
              <div class="md:w-2/5 relative overflow-hidden bg-secondary">
                <ShoeImage
                  :src="rec.product.image"
                  :alt="`${rec.product.brand} ${rec.product.model}`"
                  class="w-full h-56 md:h-full object-contain p-4 hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div
                  v-if="i === 0"
                  class="absolute top-4 left-4 px-3 py-1 rounded-full accent-gradient text-white text-xs font-bold"
                >
                  MEILLEUR MATCH
                </div>
              </div>

              <!-- Infos -->
              <div class="flex-1 p-6 md:p-8 flex flex-col">
                <div class="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p class="text-sm text-muted-foreground font-medium">{{ rec.product.brand }}</p>
                    <h3 class="text-2xl font-black tracking-tight">{{ rec.product.model }}</h3>
                  </div>
                  <!-- Score ring -->
                  <div class="shrink-0 flex flex-col items-center gap-1">
                    <div class="relative w-12 h-12">
                      <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--secondary))" stroke-width="2.8" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke="hsl(var(--primary))" stroke-width="2.8"
                          stroke-dasharray="100" :stroke-dashoffset="100 - scorePercent(rec.score)"
                          stroke-linecap="round"
                          style="transition: stroke-dashoffset 0.5s ease"
                        />
                      </svg>
                      <span class="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                        {{ scorePercent(rec.score) }}%
                      </span>
                    </div>
                    <span class="text-[9px] font-medium text-muted-foreground uppercase tracking-wide leading-none">
                      Compatibilité
                    </span>
                  </div>
                </div>

                <p class="text-muted-foreground mb-4 leading-relaxed">{{ rec.product.description }}</p>

                <!-- Specs -->
                <div class="grid grid-cols-3 gap-2 mb-4">
                  <div
                    v-for="spec in [
                      { label: 'Drop', value: `${rec.product.drop}mm` },
                      { label: 'Poids', value: `${rec.product.poids}g` },
                      { label: 'Amorti', value: rec.product.amorti },
                    ]"
                    :key="spec.label"
                    class="text-center p-2 rounded-lg bg-secondary"
                  >
                    <p class="text-xs text-muted-foreground">{{ spec.label }}</p>
                    <p class="text-sm font-bold capitalize">{{ spec.value }}</p>
                  </div>
                </div>

                <!-- Raisons -->
                <div class="space-y-2 mb-6">
                  <div v-for="reason in rec.reasons" :key="reason" class="flex items-center gap-2 text-sm">
                    <span class="w-1.5 h-1.5 rounded-full accent-gradient flex-shrink-0" aria-hidden="true" />
                    <span>{{ reason }}</span>
                  </div>
                </div>

                <!-- Prix + Actions -->
                <div class="mt-auto flex items-center justify-between">
                  <div>
                    <span class="text-2xl font-black">{{ rec.product.prix }} €</span>
                    <span
                      v-if="bestOffers[rec.product.id] && bestOffers[rec.product.id].price < rec.product.prix"
                      class="ml-2 text-sm font-semibold text-primary"
                    >
                      dès {{ bestOffers[rec.product.id].price.toFixed(2) }} €
                    </span>
                  </div>
                  <div class="flex gap-3">
                    <UiButton variant="outline" @click="router.push(`/shoes/${rec.product.id}`)">
                      Détails
                    </UiButton>
                    <UiButton
                      variant="hero"
                      @click="handleBuy(rec.product.id, `${rec.product.brand} ${rec.product.model}`)"
                    >
                      <ShoppingBag class="w-4 h-4" />
                      {{ user ? "Voir l'offre" : 'Se connecter' }}
                    </UiButton>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- CTA mode Swipe -->
        <div class="text-center mt-10 space-y-3">
          <div>
            <UiButton variant="hero" class="gap-2" @click="router.push('/swipe')">
              <Sparkles class="w-4 h-4" />
              Mode Swipe — Découvrir 15 chaussures
            </UiButton>
            <p class="text-xs text-muted-foreground mt-2">Swipez pour trouver votre paire idéale</p>
          </div>
          <UiButton variant="ghost" @click="router.push('/questionnaire')">
            <RotateCcw class="w-4 h-4" />
            Refaire le questionnaire
          </UiButton>
        </div>
      </template>
    </div>
  </div>
</template>
