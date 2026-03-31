<script setup lang="ts">
import { ArrowLeft, Heart, HeartOff, ExternalLink, ShoppingCart, Loader2 } from 'lucide-vue-next'
import { buildTags } from '~/data/shoes'
import { getRecommendations } from '~/data/products'
import type { MerchantOffer } from '~/composables/useMerchants'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const matchesStore   = useMatchesStore()
const shoesStore     = useShoesStore()
const profileStore   = useUserProfileStore()
const { fetchMerchantOffers, trackOfferClick } = useMerchants()

const scorePercent = (score: number) => Math.min(100, Math.round((score / 90) * 100))

const compatScore = computed<number | null>(() => {
  if (!profileStore.profile || !shoe.value) return null
  const results = getRecommendations(profileStore.profile, 1, [shoe.value] as any)
  return results[0]?.score ?? null
})

type LinkStatus = 'checking' | 'ok' | 'unavailable' | 'unknown' | 'search'

const offers        = ref<MerchantOffer[]>([])
const offersLoading = ref(false)
const linkStatuses  = ref<Record<string, LinkStatus>>({})

// Charge les chaussures au montage
onMounted(() => shoesStore.fetchShoes())

// Récupère la chaussure depuis le store (avec fallback statique intégré)
const shoe     = computed(() => shoesStore.getShoeById(slug.value))
const shoeTags = computed(() => shoe.value ? buildTags(shoe.value) : [])

// SEO dynamique
useHead(() => ({
  title: shoe.value
    ? `${shoe.value.brand} ${shoe.value.model} — Avis, Caractéristiques & Prix | RunMatch`
    : 'RunMatch',
  meta: shoe.value
    ? [
        {
          name: 'description',
          content: `${shoe.value.brand} ${shoe.value.model} : ${shoe.value.description.slice(0, 140)}… Comparez les prix dès ${shoe.value.prix} €.`,
        },
      ]
    : [],
}))

// Détecte si une URL est une page de recherche (pas un lien produit direct)
function isSearchUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return (
      /\/(search|catalogsearch|result|find|recherche)/i.test(u.pathname) ||
      ['q', 'query', 'k', 'Ntt', 'search'].some((p) => u.searchParams.has(p))
    )
  } catch {
    return false
  }
}

// Vérifie chaque lien en analysant le contenu de la page (via le serveur, sans CORS)
async function verifyLinks(newOffers: MerchantOffer[]) {
  if (!shoe.value) return

  // Toutes les offres passent en "checking" immédiatement
  const initial: Record<string, LinkStatus> = {}
  for (const offer of newOffers) initial[offer.id] = 'checking'
  linkStatuses.value = initial

  const links = newOffers.map((o) => ({
    url: o.affiliateUrl,
    brand: shoe.value!.brand,
    model: shoe.value!.model,
    id: o.id,
  }))

  try {
    const results = await $fetch<Record<string, 'ok' | 'unavailable' | 'unknown'>>('/api/check-links', {
      method: 'POST',
      body: { links: links.map(({ url, brand, model }) => ({ url, brand, model })) },
    })

    const updated: Record<string, LinkStatus> = {}
    for (const link of links) {
      const raw = results[link.url] ?? 'unknown'
      // Pour les URLs de recherche, "unknown" reste acceptable (page SSR non dispo)
      updated[link.id] = raw === 'unknown' && isSearchUrl(link.url) ? 'search' : raw
    }
    linkStatuses.value = updated
  } catch {
    const fallback: Record<string, LinkStatus> = {}
    for (const offer of newOffers) {
      fallback[offer.id] = isSearchUrl(offer.affiliateUrl) ? 'search' : 'unknown'
    }
    linkStatuses.value = fallback
  }
}

// Charge les offres marchands avec prix quand la chaussure est disponible
watch(
  shoe,
  async (s) => {
    if (!s) return
    offersLoading.value = true
    linkStatuses.value  = {}
    try {
      const fetched = await fetchMerchantOffers(s.id, { brand: s.brand, model: s.model, basePrice: s.prix })
      offers.value = fetched
      verifyLinks(fetched) // vérification en parallèle, non bloquante
    } catch {
      offers.value = []
    } finally {
      offersLoading.value = false
    }
  },
  { immediate: true },
)

// Offres visibles : on masque celles confirmées indisponibles
const visibleOffers = computed(() =>
  offers.value.filter((o) => linkStatuses.value[o.id] !== 'unavailable'),
)

const handleOfferClick = (offer: MerchantOffer) => {
  if (!shoe.value) return
  trackOfferClick({
    productId: shoe.value.id,
    retailerName: offer.merchant,
    shoeModel: `${shoe.value.brand} ${shoe.value.model}`,
  })
}

// Prix le plus bas parmi les offres vérifiées et visibles
const bestPrice = computed(() => {
  if (!visibleOffers.value.length) return null
  return Math.min(...visibleOffers.value.map((o) => o.price))
})

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
            :class="liked ? 'fill-primary text-primary' : ''"
          />
        </UiButton>
        <div v-else class="w-9" />
      </div>
    </div>

    <!-- Chaussure introuvable -->
    <div v-if="!shoe && !shoesStore.loading" class="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <p class="text-5xl">👟</p>
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
      <div class="bg-gradient-to-br from-secondary/80 to-secondary/20 h-64 md:h-80 relative overflow-hidden">
        <ShoeImage
          :src="shoe.image"
          :alt="`${shoe.brand} ${shoe.model}`"
          class="w-full h-full object-contain p-8"
          loading="eager"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
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
            <div v-if="bestPrice !== null" class="text-right shrink-0">
              <p class="text-3xl font-black text-primary">
                {{ bestPrice.toFixed(2) }} €
              </p>
              <p class="text-[11px] text-muted-foreground">meilleur prix</p>
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
              <span class="absolute inset-0 flex items-center justify-center text-[10px] font-black">
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

        <!-- Où acheter -->
        <section>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-black">Où acheter</h2>
            <span v-if="bestPrice !== null" class="text-xs text-muted-foreground">
              à partir de <span class="text-primary font-bold">{{ bestPrice.toFixed(2) }} €</span>
            </span>
          </div>

          <!-- Chargement -->
          <div v-if="offersLoading" class="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
            <Loader2 class="w-4 h-4 animate-spin" />
            Recherche des offres…
          </div>

          <!-- Liste des offres vérifiées -->
          <div v-else-if="visibleOffers.length > 0 || offers.length > 0" class="flex flex-col gap-2">
            <a
              v-for="offer in visibleOffers"
              :key="offer.id"
              :href="offer.affiliateUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5 hover:bg-secondary/50 hover:border-primary/30 transition-all group"
              @click="handleOfferClick(offer)"
            >
              <!-- Logo + nom + statut -->
              <div class="flex items-center gap-3 min-w-0">
                <img
                  v-if="offer.logo"
                  :src="offer.logo"
                  alt=""
                  class="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shrink-0"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
                <div v-else class="w-8 h-8 rounded-lg bg-secondary shrink-0 flex items-center justify-center">
                  <ShoppingCart class="w-4 h-4 text-muted-foreground" />
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-sm truncate">{{ offer.merchant }}</p>
                  <!-- Statut de vérification -->
                  <div class="flex items-center gap-1 mt-0.5">
                    <template v-if="linkStatuses[offer.id] === 'checking'">
                      <Loader2 class="w-2.5 h-2.5 animate-spin text-muted-foreground" />
                      <span class="text-[10px] text-muted-foreground">Vérification…</span>
                    </template>
                    <template v-else-if="linkStatuses[offer.id] === 'ok'">
                      <span class="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      <span class="text-[10px] text-green-600 dark:text-green-400 font-medium">Disponible</span>
                    </template>
                    <template v-else-if="linkStatuses[offer.id] === 'search'">
                      <span class="text-[10px] text-muted-foreground">Rechercher ce modèle</span>
                    </template>
                    <template v-else>
                      <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                      <span class="text-[10px] text-muted-foreground">Voir l'offre</span>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Prix + icône -->
              <div class="flex items-center gap-2.5 shrink-0 ml-3">
                <span
                  class="text-base font-black"
                  :class="offer.price === bestPrice ? 'text-primary' : 'text-foreground'"
                >
                  {{ offer.price.toFixed(2) }} €
                </span>
                <ExternalLink class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </a>

            <!-- Offres masquées -->
            <p
              v-if="visibleOffers.length < offers.length"
              class="text-[11px] text-muted-foreground text-center pt-1"
            >
              {{ offers.length - visibleOffers.length }} offre{{ offers.length - visibleOffers.length > 1 ? 's' : '' }}
              indisponible{{ offers.length - visibleOffers.length > 1 ? 's' : '' }} masquée{{ offers.length - visibleOffers.length > 1 ? 's' : '' }}
            </p>
          </div>

          <p v-else class="text-sm text-muted-foreground py-4 text-center">
            Aucune offre disponible pour le moment.
          </p>
        </section>

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
