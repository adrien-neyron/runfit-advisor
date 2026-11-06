<script setup lang="ts">
import { ArrowLeft, Share2, RotateCcw, Sparkles, ExternalLink } from 'lucide-vue-next'
import { getRecommendations, type Recommendation } from '~/data/products'
import type { ShoeOffer } from '~/composables/useShoeOffers'

const router = useRouter()
const profileStore = useUserProfileStore()
const shoesStore = useShoesStore()
const { fetchAvailableShoeIds, fetchOffers, fetchLivePrices, bestOf, withSrc } = useShoeOffers()
const { toast } = useToast()

const recommendations = ref<Recommendation[]>([])
const bestOffers = ref<Map<string, ShoeOffer>>(new Map())
// Toutes les offres (une par marchand) : un modèle vendu chez deux marchands affiche les deux
const allOffers = ref<Map<string, ShoeOffer[]>>(new Map())

onMounted(() => shoesStore.fetchShoes())

// Calcule les recommandations quand le profil est disponible.
// On ne recommande que des chaussures pour lesquelles un lien d'achat direct existe :
// chaque suggestion peut ainsi mener à un achat.
watch(
  () => profileStore.profile,
  async (profile) => {
    if (!profile) return
    const base = shoesStore.dbProducts
    const available = await fetchAvailableShoeIds() // null si indisponible → pas de filtre
    const withOffers = available ? base.filter((p) => available.has(p.id)) : base
    const source = withOffers.length > 0 ? withOffers : base
    // Budget évalué sur les prix réels quand ils existent
    const livePrices = profile.budget ? await fetchLivePrices(source.map((p) => p.id)) : {}
    const recs = getRecommendations(profile, 3, source, livePrices)
    recommendations.value = recs

    // Offres de ces chaussures en une seule requête (la première est la meilleure)
    const ids = recs.map((r) => r.product.id)
    const offers = await fetchOffers(ids)
    allOffers.value = new Map(ids.flatMap((id) => (offers.get(id)?.length ? [[id, offers.get(id)!] as [string, ShoeOffer[]]] : [])))
    bestOffers.value = new Map(
      ids.flatMap((id) => {
        const best = bestOf(offers.get(id))
        return best ? [[id, best] as [string, ShoeOffer]] : []
      }),
    )
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


// Partage : on partage le lien de l'application, jamais le profil (données personnelles / de santé)
const shareResults = async () => {
  const shareData = {
    title: 'RunMatch — Trouve ta chaussure de running idéale',
    text: "J'ai trouvé mes chaussures de running avec RunMatch. Essaie, ça prend 2 minutes.",
    url: window.location.origin,
  }
  try {
    if (navigator.share) {
      await navigator.share(shareData)
      return
    }
    await navigator.clipboard.writeText(shareData.url)
    toast({ title: 'Lien copié', description: 'Colle-le où tu veux pour partager RunMatch.', type: 'success' })
  } catch (err) {
    // Fermeture de la feuille de partage par l'utilisateur : rien à signaler
    if ((err as DOMException)?.name === 'AbortError') return
    toast({ title: 'Partage impossible', description: `Copie ce lien à la main : ${shareData.url}`, type: 'error', duration: 10000 })
  }
}

// Score ring helper
const scorePercent = (percent: number) => Math.max(0, Math.min(100, Math.round(percent)))

useSeoMeta({
  title: 'Mes recommandations — RunMatch',
  description: 'Les chaussures de running recommandées pour ton profil de coureur.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <ToastContainer />

    <!-- Nav -->
    <div class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="container flex items-center justify-between h-16">
        <UiButton variant="ghost" size="icon" aria-label="Retour au questionnaire" to="/questionnaire">
          <ArrowLeft class="w-5 h-5" />
        </UiButton>
        <span class="font-black tracking-tighter">RUN<span class="text-gradient">MATCH</span></span>
        <UiButton variant="ghost" size="icon" aria-label="Partager RunMatch" @click="shareResults">
          <Share2 class="w-5 h-5" aria-hidden="true" />
        </UiButton>
      </div>
    </div>

    <div class="pt-24 pb-16 container max-w-4xl">
      <!-- Chargement -->
      <div v-if="profileStore.loading" class="flex items-center justify-center py-24" role="status">
        <span class="sr-only">Chargement de tes recommandations…</span>
        <div class="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-hidden="true" />
      </div>

      <template v-else-if="profileStore.profile">
        <RetryNotice
          v-if="shoesStore.fetchError"
          class="mb-6"
          message="Le catalogue en ligne est injoignable : ces recommandations viennent d'une sélection enregistrée."
          :busy="shoesStore.loading"
          @retry="shoesStore.retryFetch()"
        />

        <!-- Header -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0 }"
          class="text-center mb-12"
        >
          <h1 class="text-3xl md:text-5xl font-black tracking-tight mb-3">
            Tes <span class="text-gradient">recommandations</span>
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
          <p class="text-muted-foreground text-lg mb-2">Aucune chaussure ne correspond parfaitement à ton profil.</p>
          <p class="text-sm text-muted-foreground mb-6">Élargis un seul critère, tes autres réponses sont conservées.</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <UiButton variant="hero" to="/questionnaire?q=budget">Changer mon budget</UiButton>
            <UiButton variant="outline" to="/questionnaire?q=amortPreference">Changer l'amorti souhaité</UiButton>
            <UiButton variant="ghost" to="/questionnaire">
              <RotateCcw class="w-4 h-4" aria-hidden="true" />
              Tout recommencer
            </UiButton>
          </div>
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
              <div class="md:w-2/5 relative overflow-hidden bg-white">
                <ShoeImage
                  :src="bestOffers.get(rec.product.id)?.imageUrl || rec.product.image"
                  :alt="`${rec.product.brand} ${rec.product.model}`"
                  class="w-full h-56 md:h-full object-contain p-4 hover:scale-105 transition-transform duration-500 mix-blend-multiply [filter:brightness(1.04)_contrast(1.03)]"
                  loading="lazy"
                />
                <div
                  v-if="i === 0"
                  class="absolute top-4 left-4 px-3 py-1 rounded-full accent-gradient text-primary-foreground text-xs font-bold"
                >
                  MEILLEUR MATCH
                </div>
              </div>

              <!-- Infos -->
              <div class="flex-1 p-6 md:p-8 flex flex-col">
                <div class="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p class="text-sm text-muted-foreground font-medium">{{ rec.product.brand }}</p>
                    <h2 class="text-2xl font-black tracking-tight">{{ rec.product.model }}</h2>
                  </div>
                  <!-- Score ring -->
                  <div class="shrink-0 flex flex-col items-center gap-1">
                    <div class="relative w-12 h-12">
                      <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--secondary))" stroke-width="2.8" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke="hsl(var(--primary))" stroke-width="2.8"
                          stroke-dasharray="100" :stroke-dashoffset="100 - scorePercent(rec.percent)"
                          stroke-linecap="round"
                          style="transition: stroke-dashoffset 0.5s ease"
                        />
                      </svg>
                      <span class="absolute inset-0 flex items-center justify-center text-xs font-black">
                        {{ scorePercent(rec.percent) }}%
                      </span>
                    </div>
                    <span class="text-sm font-medium text-muted-foreground uppercase tracking-wide leading-none">
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
                    <p class="text-sm text-muted-foreground">{{ spec.label }}</p>
                    <p class="text-sm font-bold capitalize">{{ spec.value }}</p>
                  </div>
                </div>

                <!-- Pourquoi ce match -->
                <WhyMatch class="mb-6" :reasons="rec.reasons" :cautions="rec.cautions" />

                <!-- Actions -->
                <div class="mt-auto flex flex-wrap gap-3">
                  <a
                    v-for="(offer, k) in allOffers.get(rec.product.id) ?? []"
                    :key="offer.merchantSlug"
                    :href="withSrc(offer.redirectUrl, 'resultats')"
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    class="flex-1 min-w-[10rem] inline-flex items-center justify-center gap-2 truncate h-11 px-6 rounded-xl text-base font-bold hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-opacity"
                    :class="k === 0 ? 'accent-gradient text-primary-foreground shadow-md' : 'border-2 border-border hover:bg-secondary'"
                    :aria-label="`Voir l'offre chez ${offer.merchantName} pour ${rec.product.model} (s'ouvre dans un nouvel onglet)`"
                  >
                    <ExternalLink class="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span class="truncate">Voir l'offre chez {{ offer.merchantName }}</span>
                  </a>
                  <NuxtLink
                    :to="`/shoes/${rec.product.id}`"
                    class="inline-flex items-center justify-center h-11 px-6 rounded-xl text-base font-bold border-2 border-border hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                    :class="allOffers.get(rec.product.id)?.length ? '' : 'flex-1'"
                    :aria-label="`Voir la fiche de ${rec.product.brand} ${rec.product.model}`"
                  >
                    Voir la fiche
                  </NuxtLink>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Mention légale affiliés (obligatoire Amazon Associates) -->
        <AffiliateDisclosure class="text-center" :offers="[...allOffers.values()].flat()" />

        <!-- CTA mode Swipe -->
        <div class="text-center mt-10 space-y-3">
          <div>
            <UiButton variant="hero" class="gap-2" to="/swipe">
              <Sparkles class="w-4 h-4" />
              Mode Swipe — Découvrir 15 chaussures
            </UiButton>
            <p class="text-sm text-muted-foreground mt-2">Swipe pour trouver ta paire idéale</p>
          </div>
          <UiButton variant="ghost" to="/questionnaire">
            <RotateCcw class="w-4 h-4" />
            Refaire le questionnaire
          </UiButton>
        </div>
      </template>
    </div>
  </div>
</template>
