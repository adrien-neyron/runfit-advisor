<script setup lang="ts">
import { ArrowLeft, Pencil, LogOut, Heart, Sparkles, CircleDashed } from 'lucide-vue-next'
import { shoes } from '~/data/shoes'
import { getRecommendations } from '~/data/products'

const router       = useRouter()
const user         = useSupabaseUser()
const authStore    = useAuthStore()
const profileStore = useUserProfileStore()
const matchesStore = useMatchesStore()
const shoesStore   = useShoesStore()

const modalOpen           = ref(false)
const enrichmentModalOpen = ref(false)

onMounted(() => shoesStore.fetchShoes())

watchEffect(() => {
  if (user.value === null && !profileStore.loading) {
    router.push('/connexion')
  }
})

// ─── Labels questionnaire ─────────────────────────────────────────────────────

const LABELS: Record<string, Record<string, string>> = {
  sexe:            { homme: 'Homme', femme: 'Femme' },
  foulee:          { pronateur: 'Pronateur', neutre: 'Neutre', supinateur: 'Supinateur' },
  niveau:          { débutant: 'Débutant', intermédiaire: 'Intermédiaire', avancé: 'Avancé' },
  distance:        { '5km': '5 km', '10km': '10 km', semi: 'Semi-marathon', marathon: 'Marathon', ultra: 'Ultra' },
  terrain:         { route: 'Route', trail: 'Trail', mixte: 'Mixte' },
  objectif:        { performance: 'Performance', confort: 'Confort', prévention: 'Prévention blessures' },
  largeurPied:     { étroit: 'Étroit', standard: 'Standard', large: 'Large' },
  blessures:       { oui: 'Oui', non: 'Non' },
  dropPreference:  { faible: 'Drop faible (0-6mm)', moyen: 'Drop moyen (7-9mm)', élevé: 'Drop élevé (10-12mm)' },
  amortPreference: { faible: 'Faible', moyen: 'Moyen', élevé: 'Élevé' },
  volume:          { '0-10': '0–10 km/sem', '10-25': '10–25 km/sem', '25-50': '25–50 km/sem', '50+': '50+ km/sem' },
  voutePlantaire:  { plat: 'Pied plat', normale: 'Normale', creux: 'Pied creux', inconnu: 'Je ne sais pas' },
  budget:          { '<100': '< 100 €', '100-140': '100–140 €', '140-180': '140–180 €', '180+': '180 € et +' },
}

const SECTIONS = [
  { key: 'sexe',            label: 'Profil',                optional: false },
  { key: 'foulee',          label: 'Foulée',                optional: false },
  { key: 'niveau',          label: 'Niveau',                optional: false },
  { key: 'distance',        label: 'Distance habituelle',   optional: false },
  { key: 'terrain',         label: 'Terrain',               optional: false },
  { key: 'objectif',        label: 'Objectif',              optional: false },
  { key: 'largeurPied',     label: 'Largeur du pied',       optional: false },
  { key: 'blessures',       label: 'Historique blessures',  optional: false },
  { key: 'dropPreference',  label: 'Drop préféré',          optional: false },
  { key: 'amortPreference', label: 'Amorti préféré',        optional: false },
  { key: 'volume',          label: 'Volume hebdomadaire',   optional: true },
  { key: 'voutePlantaire',  label: 'Voûte plantaire',       optional: true },
  { key: 'budget',          label: 'Budget',                optional: true },
]

const OPTIONAL_LABELS: Record<string, string> = {
  volume:         "Volume d'entraînement",
  voutePlantaire: 'Voûte plantaire',
  budget:         'Budget',
}

const missingFieldsDisplay = computed(() =>
  profileStore.missingOptionalFields.map(f => ({
    key: f as string,
    label: OPTIONAL_LABELS[f as string] ?? String(f),
  })),
)

// ─── Matchs ───────────────────────────────────────────────────────────────────

const matchedShoes = computed(() =>
  matchesStore.likedShoes
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((m) => {
      const shoe = shoes.find((s) => s.id === m.shoeId)
      if (!shoe) return null
      const dbImage = shoesStore.dbProducts.find((s) => s.id === m.shoeId)?.image
      return { ...shoe, image: dbImage || shoe.image }
    })
    .filter(Boolean),
)

// ─── Recommandations ─────────────────────────────────────────────────────────

const recommendations = computed(() => {
  if (!profileStore.profile) return []
  const source = shoesStore.dbProducts.length > 0 ? shoesStore.dbProducts : undefined
  return getRecommendations(profileStore.profile, 3, source)
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Nav -->
    <nav class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="container flex items-center justify-between h-16">
        <button
          class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          @click="router.push('/')"
        >
          <ArrowLeft class="w-4 h-4" />
          Accueil
        </button>
        <span class="text-xl font-black tracking-tighter">
          RUN<span class="text-gradient">MATCH</span>
        </span>
        <UiButton variant="ghost" size="sm" @click="authStore.signOut()">
          <LogOut class="w-4 h-4" />
        </UiButton>
      </div>
    </nav>

    <div class="container pt-24 pb-16 max-w-lg px-4 space-y-8">
      <!-- Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
        class="flex items-start justify-between"
      >
        <div>
          <h1 class="text-2xl font-black tracking-tight">Mon profil</h1>
          <p class="text-sm text-muted-foreground mt-1">{{ user?.email }}</p>
        </div>
        <UiButton size="sm" @click="modalOpen = true">
          <Pencil class="w-3.5 h-3.5 mr-1.5" />
          Modifier
        </UiButton>
      </div>

      <!-- ── QUESTIONNAIRE ─────────────────────────────────────────────────── -->
      <section
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350, delay: 60 } }"
      >
        <h2 class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Questionnaire
        </h2>

        <div v-if="profileStore.loading" class="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground text-sm">
          Chargement…
        </div>

        <div v-else-if="!profileStore.profile" class="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
          <p class="text-muted-foreground text-sm">Vous n'avez pas encore rempli le questionnaire.</p>
          <UiButton @click="modalOpen = true">Remplir le questionnaire</UiButton>
        </div>

        <div v-else class="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          <div
            v-for="section in SECTIONS.filter(s => !s.optional || profileStore.profile?.[s.key as keyof typeof profileStore.profile])"
            :key="section.key"
            class="flex items-center justify-between px-5 py-3"
          >
            <span class="text-sm text-muted-foreground">{{ section.label }}</span>
            <span class="text-sm font-semibold">
              {{ LABELS[section.key]?.[String(profileStore.profile[section.key as keyof typeof profileStore.profile])] ?? String(profileStore.profile[section.key as keyof typeof profileStore.profile]) }}
            </span>
          </div>
        </div>

        <!-- ── BANNIÈRE ENRICHISSEMENT ──────────────────────────────────────── -->
        <div
          v-if="profileStore.profile && !profileStore.enrichmentComplete"
          class="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-5"
        >
          <div class="flex items-start gap-3 mb-3">
            <div class="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
              <CircleDashed class="w-4 h-4 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm">Affiner tes recommandations</p>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ missingFieldsDisplay.length }} question{{ missingFieldsDisplay.length > 1 ? 's' : '' }} pour de meilleurs résultats
              </p>
            </div>
            <span class="text-xs font-bold text-primary">
              {{ profileStore.enrichmentProgress }}%
            </span>
          </div>

          <!-- Barre de progression -->
          <div class="h-1.5 bg-primary/20 rounded-full overflow-hidden mb-3">
            <div
              class="h-full rounded-full bg-primary transition-all"
              :style="{ width: `${profileStore.enrichmentProgress}%` }"
            />
          </div>

          <!-- Champs manquants -->
          <div class="space-y-1 mb-4">
            <div
              v-for="field in missingFieldsDisplay"
              :key="field.key"
              class="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
              {{ field.label }}
            </div>
          </div>

          <UiButton size="sm" class="w-full" @click="enrichmentModalOpen = true">
            <Sparkles class="w-3.5 h-3.5 mr-1.5" />
            Compléter mon profil
          </UiButton>
        </div>
      </section>

      <!-- ── MES MATCHS ──────────────────────────────────────────────────────── -->
      <section
        v-if="matchedShoes.length > 0"
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350, delay: 120 } }"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Heart class="w-3.5 h-3.5 text-primary" />
            Mes matchs
          </h2>
          <button
            class="text-xs text-primary font-medium hover:underline"
            @click="router.push('/matches')"
          >
            Voir tout →
          </button>
        </div>

        <!-- Scroll horizontal -->
        <div class="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <article
            v-for="shoe in matchedShoes"
            :key="shoe!.id"
            class="flex-shrink-0 w-32 bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
            @click="router.push(`/shoes/${shoe!.slug}`)"
          >
            <div class="aspect-square bg-gradient-to-br from-secondary/80 to-secondary/30 overflow-hidden">
              <ShoeImage
                :src="shoe!.image"
                :alt="`${shoe!.brand} ${shoe!.model}`"
                class="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply dark:mix-blend-normal"
                loading="lazy"
              />
            </div>
            <div class="p-2">
              <p class="text-[9px] text-muted-foreground uppercase tracking-wide truncate">{{ shoe!.brand }}</p>
              <p class="text-xs font-bold leading-tight line-clamp-2 mt-0.5">{{ shoe!.model }}</p>
              <p class="text-primary font-bold text-xs mt-1">{{ shoe!.prix }} €</p>
            </div>
          </article>
        </div>
      </section>

      <!-- ── RECOMMANDATIONS ─────────────────────────────────────────────────── -->
      <section
        v-if="recommendations.length > 0"
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350, delay: 180 } }"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-primary" />
            Recommandations
          </h2>
          <button
            class="text-xs text-primary font-medium hover:underline"
            @click="router.push('/resultats')"
          >
            Voir tout →
          </button>
        </div>

        <div class="space-y-3">
          <article
            v-for="(rec, i) in recommendations"
            :key="rec.product.id"
            v-motion
            :initial="{ opacity: 0, x: -12 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 180 + i * 60, duration: 300 } }"
            class="bg-card border border-border rounded-2xl overflow-hidden flex gap-0 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
            @click="router.push(`/shoes/${rec.product.id}`)"
          >
            <!-- Image -->
            <div class="w-24 flex-shrink-0 bg-gradient-to-br from-secondary/80 to-secondary/30">
              <ShoeImage
                :src="rec.product.image"
                :alt="`${rec.product.brand} ${rec.product.model}`"
                class="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply dark:mix-blend-normal"
                loading="lazy"
              />
            </div>

            <!-- Infos -->
            <div class="flex-1 p-3 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-[10px] text-muted-foreground uppercase tracking-wide">{{ rec.product.brand }}</p>
                  <h3 class="text-sm font-black leading-tight truncate">{{ rec.product.model }}</h3>
                </div>
                <!-- Score -->
                <div class="flex-shrink-0 flex flex-col items-center bg-primary/10 rounded-xl px-2 py-1">
                  <span class="text-base font-black text-primary leading-none">{{ rec.score }}</span>
                  <span class="text-[8px] text-muted-foreground leading-none mt-0.5">pts</span>
                </div>
              </div>

              <p class="text-primary font-bold text-xs mt-1.5">{{ rec.product.prix }} €</p>

              <!-- Raisons -->
              <ul class="mt-2 space-y-0.5">
                <li
                  v-for="reason in rec.reasons.slice(0, 2)"
                  :key="reason"
                  class="text-[10px] text-muted-foreground leading-tight flex items-start gap-1"
                >
                  <span class="text-primary mt-0.5 flex-shrink-0">✓</span>
                  {{ reason }}
                </li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <!-- CTA si pas de profil -->
      <div
        v-if="!profileStore.profile && !profileStore.loading"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 200 } }"
        class="text-center"
      >
        <p class="text-sm text-muted-foreground mb-3">
          Remplissez le questionnaire pour obtenir vos recommandations personnalisées.
        </p>
        <UiButton variant="hero" @click="modalOpen = true">
          <Sparkles class="w-4 h-4 mr-2" />
          Commencer
        </UiButton>
      </div>
    </div>

    <!-- Modal modification complète -->
    <QuestionnaireModal
      :open="modalOpen"
      :initial-answers="profileStore.profile ?? undefined"
      :on-complete="() => (modalOpen = false)"
      @close="modalOpen = false"
    />

    <!-- Modal enrichissement (nouvelles questions uniquement) -->
    <QuestionnaireModal
      :open="enrichmentModalOpen"
      :initial-answers="profileStore.profile ?? undefined"
      :enrichment-only="true"
      :on-complete="() => (enrichmentModalOpen = false)"
      @close="enrichmentModalOpen = false"
    />
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
