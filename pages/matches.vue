<script setup lang="ts">
import { ArrowLeft, Heart, Trash2, Sparkles, UserPlus, LogIn, ExternalLink } from 'lucide-vue-next'
import { shoes } from '~/data/shoes'
import type { ShoeOffer } from '~/composables/useShoeOffers'

const matchesStore = useMatchesStore()
const shoesStore   = useShoesStore()
const { fetchOffers, bestOf, withSrc } = useShoeOffers()

const bestOffers = ref<Map<string, ShoeOffer>>(new Map())
// Une offre par marchand : un modèle vendu chez deux marchands affiche les deux
const allOffers = ref<Map<string, ShoeOffer[]>>(new Map())

onMounted(async () => {
  await shoesStore.fetchShoes()

  // Offres directes pour toutes les chaussures matchées, en une requête
  const ids = matchesStore.likedShoes.map((m) => m.shoeId)
  if (ids.length) {
    const offers = await fetchOffers(ids)
    allOffers.value = new Map(ids.flatMap((id) => (offers.get(id)?.length ? [[id, offers.get(id)!] as [string, ShoeOffer[]]] : [])))
    bestOffers.value = new Map(
      ids.flatMap((id) => {
        const best = bestOf(offers.get(id))
        return best ? [[id, best] as [string, ShoeOffer]] : []
      }),
    )
  }
})

const matchedShoes = computed(() =>
  [...matchesStore.likedShoes]
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((m) => {
      const shoe = shoes.find((s) => s.id === m.shoeId)
      if (!shoe) return null
      // Priorité à l'image CDN Storage, fallback sur la donnée statique
      const dbProduct = shoesStore.dbProducts.find((s) => s.id === m.shoeId)
      return {
        ...shoe,
        // Photo du marchand (variante exacte du lien) en priorité, puis catalogue
        image: bestOffers.value.get(m.shoeId)?.imageUrl || (dbProduct ? dbProduct.image : shoe.image),
        prix: dbProduct?.prix ?? shoe.prix,  // prix temps réel si dispo
      }
    })
    .filter(Boolean),
)


useSeoMeta({
  title: 'Mes matchs — RunMatch',
  description: 'Les chaussures de running que tu as aimées, avec un lien direct vers le marchand.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="min-h-screen bg-background">

    <!-- Nav -->
    <div class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="container flex items-center justify-between h-14 max-w-2xl">
        <UiButton variant="ghost" size="icon" aria-label="Retour" to="/">
          <ArrowLeft class="w-5 h-5" />
        </UiButton>

        <span class="font-black tracking-tighter text-sm">
          Mes <span class="text-gradient">matchs</span>
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
            <UserPlus class="w-4.5 h-4.5 text-brand" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-black leading-tight">
              Tes matchs sont stockés sur cet appareil
            </p>
            <p class="text-sm text-muted-foreground mt-1 leading-relaxed">
              Ils restent ici tant que tu ne vides pas les données du navigateur.
              Crée un compte gratuit pour les retrouver sur n'importe quel appareil.
            </p>
            <div class="flex gap-2 mt-3">
              <UiButton size="sm" variant="hero" class="gap-1.5" to="/connexion?signup=1">
                <UserPlus class="w-3.5 h-3.5" />
                Créer un compte
              </UiButton>
              <UiButton size="sm" variant="outline" class="gap-1.5" to="/connexion">
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
          Swipe des chaussures et retrouve tes coups de cœur ici pour les comparer et acheter.
        </p>
        <UiButton variant="hero" class="gap-2 mt-2" to="/swipe">
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
            Ouvre la fiche pour comparer les offres, ou va directement chez le marchand
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
            <div class="aspect-square bg-white overflow-hidden relative">
              <ShoeImage
                :src="shoe!.image"
                :alt="`${shoe!.brand} ${shoe!.model}`"
                class="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply [filter:brightness(1.04)_contrast(1.03)]"
                loading="lazy"
              />
            </div>
            <div class="p-3 flex flex-col gap-2">
              <div>
                <p class="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {{ shoe!.brand }}
                </p>
                <h2 class="text-sm font-black leading-tight line-clamp-2 mt-0.5">{{ shoe!.model }}</h2>
              </div>

              <!-- Marchand disponible -->
              <p v-if="allOffers.get(shoe!.id)?.length" class="text-sm text-muted-foreground">
                Disponible chez {{ allOffers.get(shoe!.id)!.map((o) => o.merchantName).join(' et ') }}
              </p>

              <!-- Tags -->
              <div class="flex gap-1 flex-wrap">
                <span
                  v-for="tag in shoe!.tags.slice(0, 2)"
                  :key="tag"
                  class="text-sm px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize font-medium"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- Lien d'achat direct (tracking + attribution côté serveur) -->
              <a
                v-for="(offer, k) in allOffers.get(shoe!.id) ?? []"
                :key="offer.merchantSlug"
                :href="withSrc(offer.redirectUrl, 'matches')"
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                class="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                :class="k === 0 ? 'mt-1 bg-primary text-primary-foreground hover:bg-primary/90' : 'border-2 border-border hover:bg-secondary'"
                :aria-label="`Voir l'offre chez ${offer.merchantName} pour ${shoe!.brand} ${shoe!.model} (s'ouvre dans un nouvel onglet)`"
              >
                <ExternalLink class="w-3 h-3 shrink-0" aria-hidden="true" />
                <span class="truncate">Voir chez {{ offer.merchantName }}</span>
              </a>
              <!-- Fiche détaillée : toujours accessible, avec ou sans offre -->
              <NuxtLink
                :to="`/shoes/${shoe!.slug ?? shoe!.id}`"
                class="w-full flex items-center justify-center rounded-xl py-2.5 text-sm font-black border-2 border-border hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                :class="allOffers.get(shoe!.id)?.length ? '' : 'mt-1'"
                :aria-label="`Voir la fiche de ${shoe!.brand} ${shoe!.model}`"
              >
                Voir la fiche
              </NuxtLink>
            </div>
          </article>
        </div>

        <!-- Mention légale affiliés (obligatoire Amazon Associates) -->
        <AffiliateDisclosure class="mt-6" :offers="[...allOffers.values()].flat()" />

        <!-- Footer CTA -->
        <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <UiButton variant="hero" class="gap-2" to="/swipe">
            <Sparkles class="w-4 h-4" />
            Swiper plus de chaussures
          </UiButton>
          <UiButton variant="outline" to="/resultats">
            Voir les recommandations
          </UiButton>
        </div>
      </template>
    </div>
  </div>
</template>
