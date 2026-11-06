<script setup lang="ts">
import { Plus, Footprints, Check, ExternalLink } from 'lucide-vue-next'
import type { UserShoe } from '~/stores/userShoes'
import type { ShoeOffer } from '~/composables/useShoeOffers'
import { getRecommendations } from '~/data/products'

const gearStore = useUserShoesStore()
const shoesStore = useShoesStore()
const profileStore = useUserProfileStore()

const poids = computed(() => profileStore.profile?.poids ?? null)
const { fetchOffers, bestOf, withSrc } = useShoeOffers()

// Liste de référence pour l'équipement : tous les modèles connus, y compris les anciennes versions
// retirées des recommandations (on peut encore les porter). Repli sur le catalogue actif si la base ne répond pas.
interface GearModel { id: string; brand: string; model: string; terrain: string[] }
const supabase = useSupabaseClient()
const refModels = ref<GearModel[]>([])

const catalogue = computed<GearModel[]>(() => {
  const list: GearModel[] = refModels.value.length ? refModels.value : shoesStore.dbProducts
  return [...list].sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, 'fr'))
})

// Seules les fiches actives existent côté site (lien vers la fiche, offres de rachat)
const isListed = (id: string | null | undefined) => !!id && shoesStore.dbProducts.some((x) => x.id === id)

const nameOf = (s: UserShoe) => {
  if (s.shoeId) {
    const p = catalogue.value.find((x) => x.id === s.shoeId)
    if (p) return `${p.brand} ${p.model}`
  }
  return s.customName ?? 'Chaussure'
}

const levelLabel: Record<string, string> = {
  ok: 'En bon état',
  soon: 'Bientôt à remplacer',
  worn: 'Usée, à remplacer',
}
const levelBar: Record<string, string> = {
  ok: 'bg-primary',
  soon: 'bg-amber-500',
  worn: 'bg-destructive',
}

// ─── Ajout ───
const adding = ref(false)
const form = reactive({ query: '', terrain: 'route' as 'route' | 'trail', km: 0 })
const saving = ref(false)

const label = (p: { brand: string; model: string }) => `${p.brand} ${p.model}`
const norm = (t: string) => t.trim().toLowerCase().replace(/\s+/g, ' ')

// Saisie libre avec suggestions : si le texte correspond exactement à un modèle du catalogue, on le relie à sa fiche ;
// sinon la chaussure est enregistrée sous le nom saisi (n'importe quel modèle est accepté).
const matched = computed(() => catalogue.value.find((p) => norm(label(p)) === norm(form.query)) ?? null)

const canSave = computed(() => form.query.trim().length >= 2)

const resetForm = () => { form.query = ''; form.terrain = 'route'; form.km = 0 }

// Pré-remplit l'usage avec celui du modèle reconnu
watch(matched, (p) => {
  if (p) form.terrain = p.terrain.includes('trail') && !p.terrain.includes('route') ? 'trail' : 'route'
})

const submit = async () => {
  if (!canSave.value || saving.value) return
  saving.value = true
  const ok = await gearStore.add({
    shoeId: matched.value?.id ?? null,
    customName: matched.value ? null : form.query.trim(),
    terrain: form.terrain,
    km: Number(form.km) || 0,
  })
  saving.value = false
  if (ok) { resetForm(); adding.value = false }
}

// ─── Mise à jour des km ───
const kmDrafts = reactive<Record<string, number | undefined>>({})
const saveKm = async (s: UserShoe) => {
  const v = kmDrafts[s.id] as number | string | undefined | null
  if (v === undefined || v === null || v === '' || Number.isNaN(Number(v))) return
  if (await gearStore.setKm(s.id, Number(v))) kmDrafts[s.id] = undefined
}

// ─── Remplacement : même modèle + une alternative adaptée au profil ───
const toReplace = computed(() =>
  gearStore.active.filter((s) => wearInfo(s.km, s.terrain, poids.value).level !== 'ok'),
)

const alternatives = computed(() => {
  const out: Record<string, ReturnType<typeof getRecommendations>[number] | undefined> = {}
  const profile = profileStore.profile
  if (!profile || !shoesStore.dbProducts.length) return out
  for (const s of toReplace.value) {
    // Alternative sur le même usage (route/trail) que la paire à remplacer
    const source = shoesStore.dbProducts.filter((p) => p.id !== s.shoeId)
    out[s.id] = getRecommendations({ ...profile, terrain: s.terrain }, 1, source)[0]
  }
  return out
})

const replaceOffers = ref<Map<string, ShoeOffer[]>>(new Map())
const idsToFetch = computed(() => {
  const ids = new Set<string>()
  for (const s of toReplace.value) {
    if (isListed(s.shoeId)) ids.add(s.shoeId!)
    const alt = alternatives.value[s.id]
    if (alt) ids.add(alt.product.id)
  }
  return [...ids].sort().join(',')
})
watch(idsToFetch, async (key) => {
  replaceOffers.value = key ? await fetchOffers(key.split(',')) : new Map()
}, { immediate: true })

const offerFor = (shoeId: string | null | undefined) => (isListed(shoeId) ? bestOf(replaceOffers.value.get(shoeId!)) : null)
const euro = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`
const anyReplaceOffer = computed(() =>
  toReplace.value.flatMap((s) => [offerFor(s.shoeId), offerFor(alternatives.value[s.id]?.product.id)]).filter((o): o is ShoeOffer => !!o),
)

onMounted(async () => {
  shoesStore.fetchShoes()
  const { data } = await (supabase as any).rpc('gear_models')
  if (Array.isArray(data) && data.length) refModels.value = data as GearModel[]
})
</script>

<template>
  <section aria-labelledby="gear-title">
    <div class="flex items-center justify-between mb-3">
      <h2 id="gear-title" class="text-lg font-black flex items-center gap-2">
        <Footprints class="w-5 h-5 text-brand" aria-hidden="true" />
        Mon équipement
      </h2>
      <UiButton v-if="!adding" variant="outline" size="sm" @click="adding = true">
        <Plus class="w-4 h-4" aria-hidden="true" /> Ajouter
      </UiButton>
    </div>

    <p v-if="gearStore.error" role="alert" class="text-sm text-destructive mb-3">{{ gearStore.error }}</p>

    <!-- Formulaire d'ajout -->
    <form v-if="adding" class="bg-card border border-border rounded-2xl p-4 space-y-3 mb-4" @submit.prevent="submit">
      <div>
        <label for="gear-model" class="text-sm font-semibold block mb-1">Modèle</label>
        <input id="gear-model" v-model="form.query" type="text" list="gear-models" maxlength="80" autocomplete="off"
          aria-describedby="gear-model-hint"
          class="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Ex. Salomon Speedcross 6" />
        <datalist id="gear-models">
          <option v-for="p in catalogue" :key="p.id" :value="label(p)" />
        </datalist>
        <p id="gear-model-hint" class="text-xs text-muted-foreground mt-1">
          <template v-if="matched">Modèle reconnu : sa fiche sera liée à ta paire.</template>
          <template v-else>Tape le nom de ta chaussure. S'il n'est pas dans les suggestions, il sera enregistré tel quel.</template>
        </p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="gear-terrain" class="text-sm font-semibold block mb-1">Usage</label>
          <select id="gear-terrain" v-model="form.terrain" class="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
            <option value="route">Route</option>
            <option value="trail">Trail</option>
          </select>
        </div>
        <div>
          <label for="gear-km" class="text-sm font-semibold block mb-1">Km déjà parcourus</label>
          <input id="gear-km" v-model.number="form.km" type="number" inputmode="decimal" min="0" max="5000" step="1"
            class="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
        </div>
      </div>
      <div class="flex gap-2">
        <UiButton type="submit" size="sm" :disabled="!canSave || saving">
          <Check class="w-4 h-4" aria-hidden="true" /> Enregistrer
        </UiButton>
        <UiButton variant="ghost" size="sm" @click="adding = false; resetForm()">Annuler</UiButton>
      </div>
    </form>

    <p v-if="!gearStore.active.length && !adding && !gearStore.loading" class="text-sm text-muted-foreground">
      Ajoute la paire que tu portes en ce moment : on suit son usure et on te prévient quand il faut la remplacer.
    </p>

    <ul class="space-y-3">
      <li v-for="s in gearStore.active" :key="s.id" class="bg-card border border-border rounded-2xl p-4">
        <template v-for="(w, i) in [wearInfo(s.km, s.terrain, poids)]" :key="i">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-bold text-sm truncate">
                <NuxtLink v-if="isListed(s.shoeId)" :to="`/shoes/${s.shoeId}`" class="hover:underline">{{ nameOf(s) }}</NuxtLink>
                <span v-else>{{ nameOf(s) }}</span>
              </p>
              <p class="text-xs text-muted-foreground">
                {{ Math.round(s.km) }} km sur environ {{ w.lifespan }} km · {{ s.terrain === 'trail' ? 'Trail' : 'Route' }}
              </p>
            </div>
            <span class="text-xs font-bold whitespace-nowrap" :class="w.level === 'ok' ? 'text-brand' : w.level === 'soon' ? 'text-amber-600' : 'text-destructive'">
              {{ levelLabel[w.level] }}
            </span>
          </div>

          <div class="mt-3 h-2 rounded-full bg-secondary overflow-hidden" role="progressbar" :aria-valuenow="w.percent" aria-valuemin="0"
            aria-valuemax="100" :aria-label="`Usure de ${nameOf(s)} : ${w.percent} %`">
            <div class="h-full rounded-full transition-all" :class="levelBar[w.level]" :style="{ width: w.percent + '%' }" />
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ w.remaining > 0 ? `Il reste environ ${w.remaining} km avant remplacement.` : 'Durée de vie estimée atteinte.' }}
            Estimation indicative.
          </p>

          <div class="mt-3 flex flex-wrap items-end gap-2">
            <div>
              <label :for="`km-${s.id}`" class="text-xs font-semibold block mb-1">Mettre à jour les km</label>
              <input :id="`km-${s.id}`" v-model.number="kmDrafts[s.id]" type="number" inputmode="decimal" min="0" max="5000" step="1"
                :placeholder="String(Math.round(s.km))" class="w-28 rounded-xl border border-border bg-background px-3 py-1.5 text-sm" />
            </div>
            <UiButton size="sm" variant="outline" :disabled="kmDrafts[s.id] === undefined || kmDrafts[s.id] === null || (kmDrafts[s.id] as any) === ''" @click="saveKm(s)">Valider</UiButton>
            <UiButton size="sm" variant="ghost" @click="gearStore.retire(s.id)">Retirer</UiButton>
          </div>

          <!-- Remplacement -->
          <div v-if="w.level !== 'ok'" class="mt-4 rounded-xl bg-secondary/60 p-3 space-y-2">
            <p class="text-xs font-black">Prépare le remplacement</p>

            <template v-if="s.shoeId && offerFor(s.shoeId)">
              <a
                :href="withSrc(offerFor(s.shoeId)!.redirectUrl, 'equipement')"
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                class="flex items-center justify-between gap-2 rounded-xl py-2 px-3 text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                :aria-label="`Racheter ${nameOf(s)} chez ${offerFor(s.shoeId)!.merchantName} (s'ouvre dans un nouvel onglet)`"
              >
                <span class="truncate">Racheter le même modèle · {{ offerFor(s.shoeId)!.merchantName }}</span>
                <span class="flex items-center gap-1 shrink-0">
                  <template v-if="offerFor(s.shoeId)!.price != null">dès {{ euro(offerFor(s.shoeId)!.price!) }}</template>
                  <ExternalLink class="w-3 h-3" aria-hidden="true" />
                </span>
              </a>
            </template>

            <template v-if="alternatives[s.id]">
              <p class="text-xs text-muted-foreground">
                Ou change de modèle :
                <NuxtLink :to="`/shoes/${alternatives[s.id]!.product.id}`" class="font-bold text-foreground underline underline-offset-2">
                  {{ alternatives[s.id]!.product.brand }} {{ alternatives[s.id]!.product.model }}
                </NuxtLink>
                ({{ alternatives[s.id]!.percent }}&nbsp;% de compatibilité avec ton profil)
              </p>
              <a
                v-if="offerFor(alternatives[s.id]!.product.id)"
                :href="withSrc(offerFor(alternatives[s.id]!.product.id)!.redirectUrl, 'equipement')"
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                class="flex items-center justify-between gap-2 rounded-xl py-2 px-3 text-xs font-black border-2 border-border hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                :aria-label="`Voir ${alternatives[s.id]!.product.brand} ${alternatives[s.id]!.product.model} chez ${offerFor(alternatives[s.id]!.product.id)!.merchantName} (s'ouvre dans un nouvel onglet)`"
              >
                <span class="truncate">Voir chez {{ offerFor(alternatives[s.id]!.product.id)!.merchantName }}</span>
                <span class="flex items-center gap-1 shrink-0">
                  <template v-if="offerFor(alternatives[s.id]!.product.id)!.price != null">dès {{ euro(offerFor(alternatives[s.id]!.product.id)!.price!) }}</template>
                  <ExternalLink class="w-3 h-3" aria-hidden="true" />
                </span>
              </a>
            </template>
          </div>
        </template>
      </li>
    </ul>

    <AffiliateDisclosure v-if="anyReplaceOffer.length" class="mt-4" :offers="anyReplaceOffer" />
  </section>
</template>
