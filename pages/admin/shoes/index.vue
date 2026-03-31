<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <!-- Nav -->
    <nav class="border-b border-gray-800 bg-gray-900 px-6 py-3 flex items-center gap-4">
      <NuxtLink to="/admin/dashboard" class="text-gray-400 hover:text-white transition-colors text-sm">
        ← Dashboard
      </NuxtLink>
      <span class="text-gray-600">/</span>
      <span class="text-sm font-medium">Catalogue</span>
    </nav>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- En-tête + filtres -->
      <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 class="text-2xl font-bold">Chaussures</h1>

        <div class="flex gap-2">
          <button
            v-for="f in filters"
            :key="f.value"
            @click="activeFilter = f.value"
            :class="[
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeFilter === f.value
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
            ]"
          >
            {{ f.label }}
            <span v-if="f.count !== undefined" class="ml-1.5 opacity-70">({{ f.count }})</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-2">
        <div v-for="i in 6" :key="i" class="bg-gray-900 rounded-xl h-16 animate-pulse" />
      </div>

      <!-- Tableau -->
      <div v-else-if="filteredShoes.length > 0" class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-800 text-gray-400">
              <th class="text-left px-4 py-3 font-medium">Chaussure</th>
              <th class="text-left px-4 py-3 font-medium hidden md:table-cell">Catégorie</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Drop / Poids</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Liens</th>
              <th class="text-left px-4 py-3 font-medium">Statut</th>
              <th class="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="shoe in filteredShoes"
              :key="shoe.id"
              class="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
            >
              <!-- Nom -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="shoe.image_url"
                    :src="shoe.image_url"
                    :alt="shoe.model"
                    class="w-10 h-10 rounded-lg object-cover bg-gray-800 flex-shrink-0"
                    loading="lazy"
                  />
                  <div v-else class="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-600 flex-shrink-0 text-xs">
                    —
                  </div>
                  <div>
                    <p class="font-medium">{{ shoe.brand }} {{ shoe.model }}</p>
                    <p class="text-xs text-gray-500">{{ shoe.id }}</p>
                  </div>
                </div>
              </td>

              <!-- Catégorie -->
              <td class="px-4 py-3 hidden md:table-cell">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
                  {{ shoe.category || '—' }}
                </span>
              </td>

              <!-- Specs -->
              <td class="px-4 py-3 hidden lg:table-cell text-gray-400">
                {{ shoe.drop_mm }}mm / {{ shoe.poids_g }}g
              </td>

              <!-- Liens affiliés -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <div class="flex gap-1">
                  <span
                    v-for="link in shoe.affiliate_links"
                    :key="link.id"
                    class="px-1.5 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400"
                  >
                    {{ link.merchant }}
                  </span>
                  <span v-if="!shoe.affiliate_links?.length" class="text-gray-600 text-xs">Aucun</span>
                </div>
              </td>

              <!-- Statut -->
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    shoe.is_draft
                      ? 'bg-orange-500/10 text-orange-400'
                      : shoe.is_active
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-gray-700 text-gray-400',
                  ]"
                >
                  {{ shoe.is_draft ? 'Draft' : shoe.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="shoe.is_draft"
                    @click="validateShoe(shoe.id)"
                    :disabled="validating === shoe.id"
                    class="px-3 py-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    {{ validating === shoe.id ? '...' : 'Valider' }}
                  </button>
                  <NuxtLink
                    :to="`/admin/shoes/${shoe.id}`"
                    class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Éditer
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vide -->
      <div v-else class="text-center py-16 text-gray-500">
        <p class="text-4xl mb-3">👟</p>
        <p>Aucune chaussure dans cette catégorie.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()

type ShoeRow = {
  id: string
  brand: string
  model: string
  category: string | null
  drop_mm: number
  poids_g: number
  image_url: string | null
  is_active: boolean
  is_draft: boolean
  affiliate_links: { id: string; merchant: string }[]
}

const shoes     = ref<ShoeRow[]>([])
const loading   = ref(true)
const validating = ref<string | null>(null)

// Filtre actif (depuis query param ou défaut "all")
const activeFilter = ref((route.query.filter as string) || 'all')

const filters = computed(() => [
  { value: 'all',    label: 'Tous',   count: shoes.value.length },
  { value: 'drafts', label: 'Drafts', count: shoes.value.filter((s) => s.is_draft).length },
  { value: 'active', label: 'Actifs', count: shoes.value.filter((s) => s.is_active).length },
])

const filteredShoes = computed(() => {
  if (activeFilter.value === 'drafts') return shoes.value.filter((s) => s.is_draft)
  if (activeFilter.value === 'active') return shoes.value.filter((s) => s.is_active && !s.is_draft)
  return shoes.value
})

const supabase = useSupabaseClient()

onMounted(async () => {
  await loadShoes()
  loading.value = false
})

async function loadShoes() {
  const { data } = await supabase
    .from('shoes')
    .select('id, brand, model, category, drop_mm, poids_g, image_url, is_active, is_draft, affiliate_links(id, merchant)')
    .order('created_at', { ascending: false })

  shoes.value = (data as ShoeRow[]) || []
}

async function validateShoe(id: string) {
  validating.value = id
  try {
    await $fetch(`/api/admin/shoes/${id}/validate`, { method: 'POST' })
    await loadShoes()
  } catch (err: any) {
    alert(`Erreur validation : ${err.data?.statusMessage || err.message}`)
  } finally {
    validating.value = null
  }
}
</script>
