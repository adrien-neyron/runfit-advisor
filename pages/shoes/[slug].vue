<script setup lang="ts">
import { ArrowLeft, Heart, HeartOff, ShoppingCart, Footprints } from 'lucide-vue-next'
import { buildTags } from '~/data/shoes'
import { getRecommendations } from '~/data/products'
import WhereToBuy from '~/components/shoe/WhereToBuy.vue'
import type { ShoeOffer } from '~/composables/useShoeOffers'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const matchesStore   = useMatchesStore()
const shoesStore     = useShoesStore()
const profileStore   = useUserProfileStore()

const scorePercent = (percent: number) => Math.max(0, Math.min(100, Math.round(percent)))

const matchRec = computed(() => {
  if (!profileStore.profile || !shoe.value) return null
  return getRecommendations(profileStore.profile, 1, [shoe.value] as any)[0] ?? null
})
const compatScore = computed<number | null>(() => matchRec.value?.percent ?? null)


// Charge les chaussures au montage
onMounted(() => shoesStore.fetchShoes())

// Récupère la chaussure depuis le store (avec fallback statique intégré)
const shoe     = computed(() => shoesStore.getShoeById(slug.value))

// Photo de l'offre : la même variante (coloris) que celle vendue via le lien d'achat
const { fetchOffers, bestOf } = useShoeOffers()
const heroOffer = ref<ShoeOffer | null>(null)
watch(() => shoe.value?.id, async (id) => {
  heroOffer.value = null
  if (!id) return
  heroOffer.value = bestOf((await fetchOffers([id])).get(id))
}, { immediate: true })
const shoeTags = computed(() => shoe.value ? buildTags(shoe.value) : [])

// SEO dynamique : titre, description, canonical, partage social et données structurées Product
const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/+$/, '')
const canonical = computed(() => (shoe.value ? `${siteUrl}/shoes/${shoe.value.id}` : undefined))
const seoImage = computed(() => {
  const img = heroOffer.value?.imageUrl || shoe.value?.image || ''
  return /^https?:\/\//.test(img) ? img : undefined
})

useSeoMeta({
  title: () => (shoe.value ? `${shoe.value.brand} ${shoe.value.model} : caractéristiques, prix et où l'acheter | RunMatch` : 'RunMatch'),
  description: () => (shoe.value
    ? `${shoe.value.brand} ${shoe.value.model} : ${shoe.value.description.slice(0, 140)}… Caractéristiques détaillées et où l'acheter.`
    : 'RunMatch — Trouve ta chaussure de running idéale'),
  ogTitle: () => (shoe.value ? `${shoe.value.brand} ${shoe.value.model} | RunMatch` : 'RunMatch'),
  ogDescription: () => (shoe.value ? shoe.value.description.slice(0, 160) : undefined),
  ogImage: () => seoImage.value,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  link: canonical.value ? [{ rel: 'canonical', href: canonical.value }] : [],
  script: shoe.value
    ? [{
        type: 'application/ld+json',
        // Le prix n'est déclaré que s'il est vérifié récemment (offre affichée sur la page, en stock)
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: `${shoe.value.brand} ${shoe.value.model}`,
          brand: { '@type': 'Brand', name: shoe.value.brand },
          description: shoe.value.description,
          sku: shoe.value.id,
          ...(seoImage.value ? { image: [seoImage.value] } : {}),
          ...(heroOffer.value?.price != null
            ? {
                offers: {
                  '@type': 'Offer',
                  url: canonical.value,
                  priceCurrency: 'EUR',
                  price: heroOffer.value.price,
                  availability: 'https://schema.org/InStock',
                  seller: { '@type': 'Organization', name: heroOffer.value.merchantName },
                },
              }
            : {}),
        }),
      }]
    : [],
}))

const liked = computed(() => matchesStore.isLiked(slug.value))

const specs = computed(() => {
  if (!shoe.value) return []
  return [
    { label: 'Drop', value: `${shoe.value.drop} mm` },
    { label: 'Poids', value: `${shoe.value.poids} g` },
    { label: 'Amorti', value: shoe.value.amorti },
    { label: 'Stabilité', value: shoe.value.stabilite },
    { label: 'Dynamisme', value: shoe.value.dynamisme },
    { label: 'Terrain', value: shoe.value.terrain.join(', ') },
    { label: 'Foulée', value: shoe.value.foulee.join(', ') },
    { label: 'Largeurs', value: shoe.value.largeurDisponible.join(', ') },
    { label: 'Niveau', value: shoe.value.niveau.join(', ') },
    { label: 'Objectif', value: shoe.value.objectif.join(', ') },
  ]
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Nav -->
    <div class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="container flex items-center justify-between h-14 max-w-2xl">
        <UiButton variant="ghost" size="icon" aria-label="Retour" @click="router.back()">
          <ArrowLeft class="w-5 h-5" />
        </UiButton>
        <span v-if="shoe" class="text-sm font-bold truncate max-w-[180px]">{{ shoe.model }}</span>
        <UiButton
          v-if="shoe"
          variant="ghost"
          size="icon"
          :aria-label="liked ? 'Retirer des matchs' : 'Ajouter aux matchs'"
          @click="matchesStore.swipe(shoe.id, !liked)"
        >
          <Heart
            class="w-5 h-5"
            :class="liked ? 'fill-primary text-brand' : ''"
          />
        </UiButton>
        <div v-else class="w-9" />
      </div>
    </div>

    <!-- Chaussure introuvable -->
    <div v-if="!shoe && !shoesStore.loading" class="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <Footprints class="w-12 h-12 text-brand" aria-hidden="true" />
      <h1 class="text-2xl font-black">Chaussure introuvable</h1>
      <p class="text-muted-foreground text-sm text-center">Ce modèle n'existe pas dans notre catalogue.</p>
      <UiButton @click="router.back()">← Retour</UiButton>
    </div>

    <!-- Chargement -->
    <div v-else-if="!shoe" class="min-h-screen flex items-center justify-center">
      <div class="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>

    <!-- Contenu -->
    <div v-else class="pt-14">
      <!-- Hero image -->
      <div class="bg-white h-64 md:h-80 relative overflow-hidden">
        <ShoeImage
          :src="heroOffer?.imageUrl || shoe.image"
          :alt="`${shoe.brand} ${shoe.model}`"
          class="w-full h-full object-contain p-8 mix-blend-multiply [filter:brightness(1.04)_contrast(1.03)]"
          loading="eager"
        />
      </div>

      <div class="container max-w-2xl pb-20 px-4 space-y-8">
        <!-- Header -->
        <header
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }"
          class="pt-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs text-muted-foreground font-medium uppercase tracking-widest">{{ shoe.brand }}</p>
              <h1 class="text-3xl font-black tracking-tight leading-tight mt-0.5">{{ shoe.model }}</h1>
            </div>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1.5 mt-3">
            <span
              v-for="tag in shoeTags"
              :key="tag"
              class="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium capitalize"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Compatibilité profil -->
          <div
            v-if="compatScore !== null"
            class="flex items-center gap-4 mt-4 px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20"
          >
            <div class="relative w-12 h-12 shrink-0">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--secondary))" stroke-width="2.8" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="hsl(var(--primary))" stroke-width="2.8"
                  stroke-dasharray="100"
                  :stroke-dashoffset="100 - scorePercent(compatScore)"
                  stroke-linecap="round"
                  style="transition: stroke-dashoffset 0.6s ease"
                />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-xs font-black">
                {{ scorePercent(compatScore) }}%
              </span>
            </div>
            <div>
              <p class="text-sm font-black leading-tight">
                {{ scorePercent(compatScore) }}% de compatibilité avec ton profil
              </p>
              <p class="text-xs text-muted-foreground mt-0.5">Basé sur ta foulée, ton terrain et tes objectifs</p>
            </div>
          </div>

          <WhyMatch v-if="matchRec" class="mt-4" :reasons="matchRec.reasons" :cautions="matchRec.cautions" />
        </header>

        <!-- Description -->
        <section>
          <p class="text-muted-foreground leading-relaxed text-[15px]">{{ shoe.description }}</p>
        </section>

        <!-- Points forts -->
        <section>
          <h2 class="text-lg font-black mb-3">Points forts</h2>
          <ul class="space-y-2.5">
            <li v-for="b in shoe.benefits" :key="b" class="flex items-start gap-2.5 text-sm">
              <span class="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" aria-hidden="true" />
              {{ b }}
            </li>
          </ul>
        </section>

        <!-- Caractéristiques techniques -->
        <section>
          <h2 class="text-lg font-black mb-3">Caractéristiques techniques</h2>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="spec in specs"
              :key="spec.label"
              class="flex items-center justify-between bg-secondary/60 rounded-xl px-3 py-2.5"
            >
              <span class="text-xs text-muted-foreground">{{ spec.label }}</span>
              <span class="text-xs font-bold capitalize text-right max-w-[60%]">{{ spec.value }}</span>
            </div>
          </div>
        </section>

        <!-- Où acheter : offres directes et monétisables uniquement -->
        <WhereToBuy :shoe-id="shoe.id" :shoe-label="`${shoe.brand} ${shoe.model}`" />

        <!-- CTA -->
        <div class="flex flex-col gap-3 pt-2">
          <UiButton
            :variant="liked ? 'outline' : 'hero'"
            size="lg"
            class="gap-2"
            @click="matchesStore.swipe(shoe.id, !liked)"
          >
            <template v-if="liked">
              <HeartOff class="w-4 h-4" />
              Retirer des matchs
            </template>
            <template v-else>
              <Heart class="w-4 h-4" />
              Ajouter à mes matchs
            </template>
          </UiButton>
          <UiButton variant="outline" size="lg" class="gap-2" @click="router.push('/matches')">
            <ShoppingCart class="w-4 h-4" />
            Voir tous mes matchs
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
