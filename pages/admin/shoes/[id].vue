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
    <div v-if="loading" class="max-w-5xl mx-auto px-6 py-8">
      <div class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div v-for="i in 3" :key="i" class="bg-gray-900 rounded-xl h-32 animate-pulse" />
        </div>
        <div class="bg-gray-900 rounded-xl h-64 animate-pulse" />
      </div>
    </div>

    <div v-else-if="shoe" class="max-w-5xl mx-auto px-6 py-8">
      <!-- En-tête -->
      <div class="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-bold">{{ shoe.brand }} {{ shoe.model }}</h1>
          <p class="text-gray-400 text-sm mt-1">ID : {{ shoe.id }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              shoe.is_draft
                ? 'bg-orange-500/10 text-orange-400'
                : shoe.is_active
                ? 'bg-green-500/10 text-green-400'
                : 'bg-gray-700 text-gray-400',
            ]"
          >
            {{ shoe.is_draft ? 'Draft' : shoe.is_active ? 'Actif' : 'Inactif' }}
          </span>
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
        <div class="lg:col-span-2 space-y-4">

          <!-- Informations générales -->
          <Section title="Informations">
            <div class="grid grid-cols-2 gap-3">
              <InfoRow label="Marque" :value="shoe.brand" />
              <InfoRow label="Modèle" :value="shoe.model" />
              <InfoRow label="Catégorie" :value="shoe.category || '—'" />
              <InfoRow label="Genre" :value="shoe.gender || '—'" />
              <InfoRow label="Année" :value="shoe.release_year?.toString() || '—'" />
              <InfoRow label="Prix" :value="`${shoe.prix} €`" />
            </div>
          </Section>

          <!-- Specs techniques -->
          <Section title="Spécifications techniques">
            <div class="grid grid-cols-3 gap-3">
              <InfoRow label="Drop" :value="`${shoe.drop_mm} mm`" />
              <InfoRow label="Poids" :value="`${shoe.poids_g} g`" />
              <InfoRow label="Pronation" :value="shoe.pronation || '—'" />
              <InfoRow label="Terrain" :value="shoe.terrain_type || '—'" />
              <InfoRow label="Amorti" :value="shoe.amorti" />
              <InfoRow label="Stabilité" :value="shoe.stabilite" />
            </div>
          </Section>

          <!-- Liens affiliés -->
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
        </div>

        <!-- Colonne images -->
        <div class="space-y-4">
          <!-- Image principale -->
          <Section title="Images">
            <!-- Preview image actuelle -->
            <div class="mb-4">
              <img
                v-if="shoe.image_url"
                :src="shoe.image_url"
                :alt="shoe.model"
                class="w-full aspect-square object-cover rounded-xl bg-gray-800"
              />
              <div
                v-else
                class="w-full aspect-square rounded-xl bg-gray-800 flex flex-col items-center justify-center text-gray-600 gap-2"
              >
                <span class="text-4xl">📷</span>
                <span class="text-sm">Aucune image</span>
              </div>
            </div>

            <!-- Toutes les images -->
            <div v-if="shoeImages.length > 1" class="grid grid-cols-3 gap-2 mb-4">
              <img
                v-for="img in shoeImages"
                :key="img.id"
                :src="img.url_optimized || img.url_original"
                class="w-full aspect-square object-cover rounded-lg bg-gray-800 cursor-pointer ring-1 ring-gray-700 hover:ring-orange-500 transition-all"
                :class="{ 'ring-orange-500': img.is_primary }"
                loading="lazy"
              />
            </div>

            <!-- Upload image -->
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

            <!-- URL source — éditable -->
            <div class="mt-3">
              <p class="text-xs text-gray-500 mb-1">URL source originale :</p>
              <div class="flex gap-2 items-start">
                <input
                  v-model="sourceUrlInput"
                  type="url"
                  placeholder="https://cdn.exemple.com/image.jpg"
                  class="flex-1 min-w-0 bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button
                  @click="saveSourceUrl"
                  :disabled="savingUrl"
                  class="flex-shrink-0 px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {{ savingUrl ? '...' : 'Sauver' }}
                </button>
              </div>
              <a
                v-if="shoe.image_original_url"
                :href="shoe.image_original_url"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-1 inline-block text-xs text-blue-400 hover:underline break-all"
              >
                Voir l'image source ↗
              </a>
            </div>
          </Section>
        </div>
      </div>

      <!-- Toast -->
      <div
        v-if="toast"
        class="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all"
        :class="toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
      >
        {{ toast.message }}
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const route    = useRoute()
const supabase = useSupabaseClient()
const shoeId   = route.params.id as string

type Shoe = {
  id: string
  brand: string
  model: string
  category: string | null
  drop_mm: number
  poids_g: number
  weight_g: number | null
  amorti: string
  stabilite: string
  pronation: string | null
  terrain_type: string | null
  gender: string
  release_year: number | null
  prix: number
  image_url: string | null
  image_original_url: string | null
  is_active: boolean
  is_draft: boolean
}

type ShoeImage = {
  id: string
  url_original: string
  url_optimized: string | null
  is_primary: boolean
  angle: string | null
}

type AffiliateLink = {
  id: string
  merchant: string
  url: string
  price_last_seen: number | null
  is_active: boolean
}

const shoe           = ref<Shoe | null>(null)
const shoeImages     = ref<ShoeImage[]>([])
const affiliateLinks = ref<AffiliateLink[]>([])
const loading        = ref(true)
const validating     = ref(false)
const uploading      = ref(false)
const savingUrl      = ref(false)
const dragOver       = ref(false)
const imageInput     = ref<HTMLInputElement>()
const toast          = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const sourceUrlInput = ref('')

onMounted(async () => {
  await loadShoe()
  loading.value = false
})

async function loadShoe() {
  const { data } = await supabase
    .from('shoes')
    .select(`
      id, brand, model, category, drop_mm, poids_g, weight_g,
      amorti, stabilite, pronation, terrain_type, gender,
      release_year, prix, image_url, image_original_url,
      is_active, is_draft,
      shoe_images ( id, url_original, url_optimized, is_primary, angle ),
      affiliate_links ( id, merchant, url, price_last_seen, is_active )
    `)
    .eq('id', shoeId)
    .single()

  if (data) {
    shoe.value           = data as any
    shoeImages.value     = (data as any).shoe_images || []
    affiliateLinks.value = (data as any).affiliate_links || []
    // Pré-remplir le champ URL source avec la valeur actuelle
    sourceUrlInput.value = (data as any).image_original_url || ''
  }
}

async function saveSourceUrl() {
  if (!shoe.value) return
  savingUrl.value = true
  try {
    // Passe par le serveur (service_role) pour contourner le RLS
    // La route synchronise aussi image_url ← image_original_url
    // pour que l'image soit visible immédiatement dans le catalogue et l'app.
    const updated = await $fetch<typeof shoe.value>(`/api/admin/shoes/${shoeId}`, {
      method: 'PATCH',
      body: { image_original_url: sourceUrlInput.value.trim() || null },
    })

    shoe.value.image_original_url = updated.image_original_url
    shoe.value.image_url          = updated.image_url
    showToast('success', 'URL source sauvegardée — image mise à jour !')
  } catch (err: any) {
    showToast('error', err.data?.statusMessage || err.message)
  } finally {
    savingUrl.value = false
  }
}

async function validateShoe() {
  validating.value = true
  try {
    await $fetch(`/api/admin/shoes/${shoeId}/validate`, { method: 'POST' })
    showToast('success', 'Chaussure validée avec succès !')
    await loadShoe()
  } catch (err: any) {
    showToast('error', err.data?.statusMessage || err.message)
  } finally {
    validating.value = false
  }
}

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
    form.append('is_primary', shoeImages.value.length === 0 ? 'true' : 'false')

    await $fetch('/api/admin/upload-image', { method: 'POST', body: form })
    showToast('success', 'Image uploadée et optimisée !')
    await loadShoe()
  } catch (err: any) {
    showToast('error', err.data?.statusMessage || err.message)
  } finally {
    uploading.value = false
  }
}

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { type, message }
  setTimeout(() => { toast.value = null }, 3500)
}
</script>
