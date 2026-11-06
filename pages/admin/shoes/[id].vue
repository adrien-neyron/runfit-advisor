<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <!-- Nav -->
    <nav class="border-b border-gray-800 bg-gray-900 px-6 py-3 flex items-center gap-4">
      <NuxtLink to="/admin/shoes" class="text-gray-400 hover:text-white transition-colors text-sm">
        ← Catalogue
      </NuxtLink>
      <span class="text-gray-600">/</span>
      <span class="text-sm font-medium truncate">{{ shoe?.brand }} {{ shoe?.model }}</span>
    </nav>

    <!-- Loading -->
    <div v-if="loading" class="max-w-5xl mx-auto px-6 py-8 space-y-4">
      <div v-for="i in 4" :key="i" class="bg-gray-900 rounded-xl h-32 animate-pulse" />
    </div>

    <div v-else-if="shoe" class="max-w-5xl mx-auto px-6 py-8">

      <!-- En-tête -->
      <div class="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-bold">{{ shoe.brand }} {{ shoe.model }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <span :class="statusClass">{{ statusLabel }}</span>
          <button
            v-if="shoe.is_draft"
            @click="validateShoe"
            :disabled="validating"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {{ validating ? 'Validation...' : '✓ Valider' }}
          </button>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">

        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-5">

          <!-- Identité -->
          <Section title="Identité">
            <div class="grid grid-cols-2 gap-3">
              <Field label="Marque">
                <input v-model="form.brand" type="text" class="form-input" />
              </Field>
              <Field label="Modèle">
                <input v-model="form.model" type="text" class="form-input" />
              </Field>
            </div>
          </Section>

          <!-- Classification -->
          <Section title="Classification">
            <div class="grid grid-cols-2 gap-3">
              <Field label="Catégorie">
                <select v-model="form.category" class="form-input">
                  <option value="">— Non défini —</option>
                  <option value="road">Route</option>
                  <option value="trail">Trail</option>
                  <option value="daily">Quotidien / Mixte</option>
                  <option value="race">Compétition</option>
                </select>
              </Field>
              <Field label="Genre">
                <select v-model="form.gender" class="form-input">
                  <option value="unisex">Unisexe</option>
                  <option value="men">Homme</option>
                  <option value="women">Femme</option>
                </select>
              </Field>
              <Field label="Année de sortie">
                <input v-model.number="form.release_year" type="number" min="2020" max="2030" class="form-input" />
              </Field>
              <Field label="Prix catalogue (€)">
                <input v-model.number="form.prix" type="number" step="0.01" min="0" class="form-input" />
              </Field>
            </div>
          </Section>

          <!-- Specs techniques -->
          <Section title="Spécifications techniques">
            <div class="grid grid-cols-3 gap-3">
              <Field label="Drop (mm)">
                <input v-model.number="form.drop_mm" type="number" min="0" max="20" class="form-input" />
              </Field>
              <Field label="Poids (g)">
                <input v-model.number="form.poids_g" type="number" min="100" max="600" class="form-input" />
              </Field>
              <Field label="Pronation">
                <select v-model="form.pronation" class="form-input">
                  <option value="">— Non défini —</option>
                  <option value="neutral">Neutre</option>
                  <option value="stability">Stabilité (pronateur)</option>
                  <option value="motion_control">Contrôle de mouvement</option>
                </select>
              </Field>
              <Field label="Amorti">
                <select v-model="form.amorti" class="form-input">
                  <option value="faible">Faible</option>
                  <option value="moyen">Moyen</option>
                  <option value="élevé">Élevé</option>
                  <option value="maximal">Maximal</option>
                </select>
              </Field>
              <Field label="Stabilité">
                <select v-model="form.stabilite" class="form-input">
                  <option value="faible">Faible</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="élevée">Élevée</option>
                </select>
              </Field>
              <Field label="Dynamisme">
                <select v-model="form.dynamisme" class="form-input">
                  <option value="faible">Faible</option>
                  <option value="moyen">Moyen</option>
                  <option value="élevé">Élevé</option>
                </select>
              </Field>
            </div>
          </Section>

          <!-- Profil -->
          <Section title="Profil coureur">
            <div class="grid grid-cols-2 gap-4">
              <Field label="Foulée">
                <CheckGroup v-model="form.foulee" :options="['neutre','pronateur','supinateur']" />
              </Field>
              <Field label="Terrain">
                <CheckGroup v-model="form.terrain" :options="['route','trail','mixte']" />
              </Field>
              <Field label="Niveau">
                <CheckGroup v-model="form.niveau" :options="['débutant','intermédiaire','avancé']" />
              </Field>
              <Field label="Largeur disponible">
                <CheckGroup v-model="form.largeur_disponible" :options="['standard','large','étroit']" />
              </Field>
              <Field label="Objectif" class-name="col-span-2">
                <CheckGroup v-model="form.objectif" :options="['confort','performance','prévention','compétition','trail']" />
              </Field>
            </div>
          </Section>

          <!-- Description -->
          <Section title="Description">
            <Field label="Description courte">
              <textarea v-model="form.description" rows="3" class="form-input resize-none" />
            </Field>
            <Field label="Bénéfices clés (1 par ligne)" class="mt-3">
              <textarea v-model="benefitsRaw" rows="4" class="form-input resize-none font-mono text-xs" />
            </Field>
          </Section>

          <!-- Liens affiliés (lecture seule) -->
          <Section title="Liens affiliés">
            <div v-if="affiliateLinks.length > 0" class="space-y-2">
              <div
                v-for="link in affiliateLinks"
                :key="link.id"
                class="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xs font-medium uppercase text-blue-400 w-20">{{ link.merchant }}</span>
                  <a
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-xs text-gray-400 hover:text-white transition-colors truncate max-w-xs"
                  >
                    {{ link.url }}
                  </a>
                </div>
                <span v-if="link.price_last_seen" class="text-sm font-medium text-green-400 flex-shrink-0 ml-3">
                  {{ link.price_last_seen }} €
                </span>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">Aucun lien affilié.</p>
          </Section>

          <!-- Bouton sauvegarder -->
          <div class="flex justify-end pt-2">
            <button
              @click="saveShoe"
              :disabled="saving"
              class="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors"
            >
              {{ saving ? 'Sauvegarde...' : 'Sauvegarder les modifications' }}
            </button>
          </div>

          <!-- Zone danger -->
          <Section title="Zone danger">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-red-400">Désactiver la chaussure</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  La chaussure ne sera plus visible dans l'app mais reste en base.
                </p>
              </div>
              <button
                @click="confirmDeactivate"
                :disabled="deactivating"
                class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
              >
                {{ deactivating ? '...' : shoe.is_active ? 'Désactiver' : 'Déjà inactif' }}
              </button>
            </div>
          </Section>

        </div>

        <!-- Colonne images -->
        <div class="space-y-4">
          <Section title="Image">

            <!-- Preview -->
            <div class="mb-4">
              <img
                :src="displayImageUrl || '/shoe-placeholder.webp'"
                :alt="shoe.model"
                class="w-full aspect-square object-contain rounded-xl bg-gray-800 p-4"
                @error="onImgError"
              />
            </div>

            <!-- Upload fichier -->
            <div
              class="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-orange-500/50 transition-colors cursor-pointer"
              @click="triggerUpload"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop.prevent="handleDrop"
              :class="{ 'border-orange-500 bg-orange-500/5': dragOver }"
            >
              <p class="text-2xl mb-1">{{ uploading ? '⏳' : '📁' }}</p>
              <p class="text-sm text-gray-400">
                {{ uploading ? 'Upload en cours...' : 'Glisser-déposer ou cliquer' }}
              </p>
              <p class="text-xs text-gray-600 mt-1">JPG, PNG, WebP — max 10 MB</p>
            </div>

            <input
              ref="imageInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="handleFileSelect"
            />

            <!-- Importer depuis URL -->
            <div class="mt-3 space-y-2">
              <p class="text-xs text-gray-500">URL de l'image :</p>
              <input
                v-model="sourceUrlInput"
                type="url"
                placeholder="https://cdn.nike.com/image.jpg"
                class="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 transition-colors"
              />

              <!-- Détecteur de blocage CDN (invisible) -->
              <img
                v-if="sourceUrlInput"
                :src="sourceUrlInput"
                class="hidden"
                @load="urlPreviewOk = true"
                @error="urlPreviewOk = false"
              />
              <!-- Badge statut -->
              <p v-if="urlPreviewOk === false" class="text-xs text-red-400">
                🚫 Image bloquée par le CDN — utilise "Stocker dans Storage"
              </p>

              <!-- Stocker dans Supabase Storage (recommandé, contourne hotlink) -->
              <button
                @click="fetchImageFromUrl"
                :disabled="fetchingImage || !sourceUrlInput"
                class="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
              >
                {{ fetchingImage ? '⏳ Téléchargement...' : '☁️ Stocker dans Supabase Storage' }}
              </button>
              <!-- Utiliser l'URL directement (seulement si l'aperçu est vert) -->
              <button
                @click="saveSourceUrl"
                :disabled="savingUrl || !sourceUrlInput || urlPreviewOk === false"
                class="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
              >
                {{ savingUrl ? '...' : '🔗 Utiliser l\'URL directement' }}
              </button>
              <p class="text-xs text-gray-600">
                Si l'aperçu est bloqué (🚫), utilise Storage — le serveur télécharge l'image sans restriction.
              </p>
            </div>

          </Section>
        </div>
      </div>
    </div>

    <!-- 404 -->
    <div v-else class="text-center py-20 text-gray-500">
      <p class="text-4xl mb-3">🔍</p>
      <p>Chaussure introuvable.</p>
      <NuxtLink to="/admin/shoes" class="text-orange-400 hover:underline text-sm mt-2 inline-block">
        ← Retour au catalogue
      </NuxtLink>
    </div>

    <!-- Toast -->
    <div
      v-if="toast"
      class="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
      :class="toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route    = useRoute()
const supabase = useSupabaseClient()
const shoeId   = route.params.id as string

// ─── Types ────────────────────────────────────────────────────────────────────

type Shoe = {
  id: string
  brand: string
  model: string
  slug: string | null
  category: string | null
  gender: string | null
  release_year: number | null
  prix: number
  drop_mm: number
  poids_g: number
  amorti: string
  stabilite: string
  dynamisme: string
  pronation: string | null
  foulee: string[]
  terrain: string[]
  niveau: string[]
  objectif: string[]
  largeur_disponible: string[]
  description: string
  benefits: string[]
  image_url: string | null
  image_url_cdn: string | null
  image_source_url: string | null
  image_original_url: string | null
  is_active: boolean
  is_draft: boolean
}

type AffiliateLink = {
  id: string
  merchant: string
  url: string
  price_last_seen: number | null
  is_active: boolean
}

// ─── State ────────────────────────────────────────────────────────────────────

const shoe           = ref<Shoe | null>(null)
const affiliateLinks = ref<AffiliateLink[]>([])
const loading        = ref(true)
const validating     = ref(false)
const saving         = ref(false)
const deactivating   = ref(false)
const uploading      = ref(false)
const fetchingImage  = ref(false)
const savingUrl      = ref(false)
const dragOver       = ref(false)
const imageInput     = ref<HTMLInputElement>()
const sourceUrlInput = ref('')
const urlPreviewOk   = ref<boolean | null>(null)
const imageCacheBust = ref('')
const toast          = ref<{ type: 'success' | 'error'; message: string } | null>(null)

watch(sourceUrlInput, () => { urlPreviewOk.value = null })

// Formulaire d'édition
const form = reactive({
  brand:             '',
  model:             '',
  slug:              '',
  category:          '' as string | null,
  gender:            'unisexe' as string | null,
  release_year:      null as number | null,
  prix:              0,
  drop_mm:           0,
  poids_g:           0,
  amorti:            'moyen',
  stabilite:         'moyenne',
  dynamisme:         'moyen',
  pronation:         '' as string | null,
  foulee:            [] as string[],
  terrain:           [] as string[],
  niveau:            [] as string[],
  objectif:          [] as string[],
  largeur_disponible: [] as string[],
  description:       '',
})
const benefitsRaw = ref('')

// ─── Computed ─────────────────────────────────────────────────────────────────

const displayImageUrl = computed(() => {
  const url = shoe.value?.image_url || null
  if (!url) return null
  return imageCacheBust.value ? `${url}?t=${imageCacheBust.value}` : url
})

const statusLabel = computed(() =>
  shoe.value?.is_draft ? 'Draft' : shoe.value?.is_active ? 'Actif' : 'Inactif'
)
const statusClass = computed(() => [
  'px-3 py-1 rounded-full text-sm font-medium',
  shoe.value?.is_draft
    ? 'bg-orange-500/10 text-orange-400'
    : shoe.value?.is_active
    ? 'bg-green-500/10 text-green-400'
    : 'bg-gray-700 text-gray-400',
])

// ─── Composables locaux ───────────────────────────────────────────────────────

const Section = defineComponent({
  props: { title: String },
  setup(props, { slots }) {
    return () => h('div', { class: 'bg-gray-900 rounded-xl border border-gray-800 p-5' }, [
      h('h2', { class: 'text-sm font-semibold text-gray-300 mb-4' }, props.title),
      slots.default?.(),
    ])
  },
})

const Field = defineComponent({
  props: { label: String },
  setup(props, { slots }) {
    return () => h('div', {}, [
      h('label', { class: 'block text-xs text-gray-500 mb-1' }, props.label),
      slots.default?.(),
    ])
  },
})

const CheckGroup = defineComponent({
  props: { modelValue: Array, options: Array },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const toggle = (val: string) => {
      const current = (props.modelValue as string[]) || []
      emit('update:modelValue', current.includes(val) ? current.filter((v) => v !== val) : [...current, val])
    }
    return () => h('div', { class: 'flex flex-wrap gap-2' },
      (props.options as string[]).map((opt) =>
        h('button', {
          type: 'button',
          onClick: () => toggle(opt),
          class: [
            'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors capitalize',
            ((props.modelValue as string[]) || []).includes(opt)
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500',
          ].join(' '),
        }, opt)
      )
    )
  },
})

// ─── Chargement ───────────────────────────────────────────────────────────────

onMounted(async () => {
  await loadShoe()
  loading.value = false
})

async function loadShoe() {
  const { data } = await supabase
    .from('shoes')
    .select(`
      id, brand, model, slug, category, gender, release_year, prix,
      drop_mm, poids_g, amorti, stabilite, dynamisme, pronation,
      foulee, terrain, niveau, objectif, largeur_disponible,
      description, benefits, image_url, image_url_cdn, image_source_url, image_original_url,
      is_active, is_draft,
      affiliate_links ( id, merchant, url, price_last_seen, is_active )
    `)
    .eq('id', shoeId)
    .single()

  if (data) {
    shoe.value           = data as any
    affiliateLinks.value = (data as any).affiliate_links || []

    // Remplir le formulaire
    const s = data as any
    Object.assign(form, {
      brand:              s.brand || '',
      model:              s.model || '',
      slug:               s.slug  || s.id,
      category:           s.category    || '',
      gender:             s.gender      || 'unisexe',
      release_year:       s.release_year ?? null,
      prix:               s.prix        ?? 0,
      drop_mm:            s.drop_mm     ?? 0,
      poids_g:            s.poids_g     ?? 0,
      amorti:             s.amorti      || 'moyen',
      stabilite:          s.stabilite   || 'moyenne',
      dynamisme:          s.dynamisme   || 'moyen',
      pronation:          s.pronation   || '',
      foulee:             s.foulee             || [],
      terrain:            s.terrain            || [],
      niveau:             s.niveau             || [],
      objectif:           s.objectif           || [],
      largeur_disponible: s.largeur_disponible || [],
      description:        s.description        || '',
    })
    benefitsRaw.value = (s.benefits || []).join('\n')
    sourceUrlInput.value = s.image_source_url || s.image_original_url || ''
  }
}

// ─── Sauvegarder ──────────────────────────────────────────────────────────────

async function saveShoe() {
  if (!shoe.value) return
  saving.value = true
  try {
    const benefits = benefitsRaw.value.split('\n').map((l) => l.trim()).filter(Boolean)
    await $fetch(`/api/admin/shoes/${shoeId}`, {
      method: 'PATCH',
      body: {
        ...form,
        benefits,
        category:  form.category  || null,
        pronation: form.pronation || null,
      },
    })
    await loadShoe()
    showToast('success', 'Modifications sauvegardées !')
  } catch (err: any) {
    showToast('error', err.data?.statusMessage || err.message)
  } finally {
    saving.value = false
  }
}

// ─── Valider ──────────────────────────────────────────────────────────────────

async function validateShoe() {
  validating.value = true
  try {
    await $fetch(`/api/admin/shoes/${shoeId}/validate`, { method: 'POST' })
    showToast('success', 'Chaussure validée !')
    await loadShoe()
  } catch (err: any) {
    showToast('error', err.data?.statusMessage || err.message)
  } finally {
    validating.value = false
  }
}

// ─── Désactiver ───────────────────────────────────────────────────────────────

async function confirmDeactivate() {
  if (!shoe.value?.is_active) return
  if (!confirm(`Désactiver "${shoe.value.brand} ${shoe.value.model}" ? Elle ne sera plus visible dans l'app.`)) return
  deactivating.value = true
  try {
    await $fetch(`/api/admin/shoes/${shoeId}`, { method: 'DELETE' })
    showToast('success', 'Chaussure désactivée.')
    await loadShoe()
  } catch (err: any) {
    showToast('error', err.data?.statusMessage || err.message)
  } finally {
    deactivating.value = false
  }
}

// ─── Images ───────────────────────────────────────────────────────────────────

function triggerUpload() {
  if (!uploading.value) imageInput.value?.click()
}

async function handleDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) await uploadImage(file)
}

async function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) await uploadImage(file)
  if (imageInput.value) imageInput.value.value = ''
}

async function uploadImage(file: File) {
  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    form.append('shoe_id', shoeId)
    form.append('angle', 'side')
    form.append('is_primary', 'true')
    await $fetch('/api/admin/upload-image', { method: 'POST', body: form })
    showToast('success', 'Image uploadée dans Storage !')
    await loadShoe()
  } catch (err: any) {
    showToast('error', err.data?.statusMessage || err.message)
  } finally {
    uploading.value = false
  }
}

async function saveSourceUrl() {
  if (!shoe.value || !sourceUrlInput.value) return
  savingUrl.value = true
  try {
    const updated = await $fetch<any>(`/api/admin/shoes/${shoeId}`, {
      method: 'PATCH',
      body: { image_original_url: sourceUrlInput.value.trim() || null },
    })
    if (shoe.value) shoe.value.image_url = updated.image_url
    showToast('success', 'URL sauvegardée !')
    await loadShoe()
  } catch (err: any) {
    showToast('error', err.data?.statusMessage || err.message)
  } finally {
    savingUrl.value = false
  }
}

async function fetchImageFromUrl() {
  if (!shoe.value || !sourceUrlInput.value) return
  fetchingImage.value = true
  try {
    const result = await $fetch<{ cdnUrl: string }>(`/api/admin/shoes/${shoeId}/fetch-image`, {
      method: 'POST',
      body: { url: sourceUrlInput.value.trim() },
    })
    sourceUrlInput.value = ''
    urlPreviewOk.value = null
    imageCacheBust.value = Date.now().toString()
    if (shoe.value) shoe.value.image_url = result.cdnUrl
    showToast('success', '✅ Image téléchargée et stockée dans Supabase Storage !')
  } catch (err: any) {
    showToast('error', err.data?.statusMessage || err.message)
  } finally {
    fetchingImage.value = false
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function onImgError(e: Event) {
  (e.target as HTMLImageElement).src = '/shoe-placeholder.webp'
}

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { type, message }
  setTimeout(() => { toast.value = null }, 3500)
}
</script>

<style>
.form-input {
  @apply w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 transition-colors;
}
</style>
