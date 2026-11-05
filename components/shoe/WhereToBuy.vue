<script setup lang="ts">
import { ExternalLink, ShoppingCart, Loader2 } from 'lucide-vue-next'
import type { ShoeOffer } from '~/composables/useShoeOffers'

/**
 * Bloc « Où acheter » — n'affiche que des offres directes et monétisables
 * (vue SQL v_shoe_offers via /api/offers). Aucun lien de recherche, aucun prix périmé.
 */
const props = defineProps<{
  shoeId: string
  shoeLabel: string
}>()

const { fetchOffers, withSrc } = useShoeOffers()

const offers = ref<ShoeOffer[]>([])
const loading = ref(true)

watch(
  () => props.shoeId,
  async (id) => {
    loading.value = true
    const map = await fetchOffers([id])
    offers.value = map.get(id) ?? []
    loading.value = false
  },
  { immediate: true },
)

// Meilleur prix : seulement si au moins 2 prix récents sont comparables
const comparablePrices = computed(() => offers.value.filter(o => o.price !== null))
const bestPrice = computed(() =>
  comparablePrices.value.length >= 2 ? Math.min(...comparablePrices.value.map(o => o.price as number)) : null,
)

const formatPrice = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

const formatDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date(iso)) : ''
</script>

<template>
  <section aria-labelledby="where-to-buy-title" data-id="where-to-buy">
    <h2 id="where-to-buy-title" class="text-lg font-black mb-3">Où acheter</h2>

    <!-- Chargement -->
    <div
      v-if="loading"
      role="status"
      class="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm"
    >
      <Loader2 class="w-4 h-4 animate-spin" aria-hidden="true" />
      Recherche des offres…
    </div>

    <!-- Offres -->
    <template v-else-if="offers.length > 0">
      <ul class="flex flex-col gap-2" role="list">
        <li v-for="(offer, i) in offers" :key="offer.merchantSlug">
          <a
            :href="withSrc(offer.redirectUrl, 'fiche')"
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            :aria-label="`Voir ${shoeLabel} chez ${offer.merchantName} (s'ouvre dans un nouvel onglet)`"
            class="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5 hover:bg-secondary/50 hover:border-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all group"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-lg bg-white border border-border shrink-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
                <img
                  v-if="offer.imageUrl"
                  :src="offer.imageUrl"
                  alt=""
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  class="w-full h-full object-contain mix-blend-multiply [filter:brightness(1.04)_contrast(1.03)]"
                />
                <ShoppingCart v-else class="w-4 h-4 text-muted-foreground" />
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-sm truncate">{{ offer.merchantName }}</p>
                <p v-if="i === 0 && offers.length > 1 && bestPrice !== null && offer.price === bestPrice" class="text-xs font-bold text-brand">
                  Meilleur prix
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2.5 shrink-0 ml-3">
              <span v-if="offer.price !== null" class="text-base font-black">
                {{ formatPrice(offer.price) }}
              </span>
              <span v-else class="text-sm font-semibold text-brand">Voir l'offre</span>
              <ExternalLink class="w-4 h-4 text-muted-foreground group-hover:text-brand transition-colors shrink-0" aria-hidden="true" />
            </div>
          </a>
          <p v-if="offer.price !== null" class="text-xs text-muted-foreground px-1 pt-1">
            Prix relevé le {{ formatDate(offer.priceCheckedAt) }}, susceptible d'avoir changé.
          </p>
        </li>
      </ul>

      <p class="text-xs text-muted-foreground mt-3">
        Le prix et la disponibilité définitifs sont ceux affichés chez le marchand.
      </p>
      <AffiliateDisclosure compact :offers="offers" />
    </template>

    <!-- Aucun lien d'achat fiable : pas de bouton, pas de page de recherche -->
    <p v-else class="text-sm text-muted-foreground py-4 text-center">
      Pas encore de lien d'achat vérifié pour ce modèle.
    </p>
  </section>
</template>
