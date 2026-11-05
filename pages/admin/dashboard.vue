<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <!-- Nav -->
    <nav class="border-b border-gray-800 bg-gray-900 px-6 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-sm font-bold">R</div>
        <span class="font-semibold text-gray-100">RunFit Admin</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-400">{{ user?.email }}</span>
        <button @click="handleLogout" class="text-sm text-gray-400 hover:text-white transition-colors">
          Déconnexion
        </button>
      </div>
    </nav>

    <div class="max-w-6xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold mb-2">Tableau de bord</h1>
      <p class="text-gray-400 mb-8">Vue d'ensemble du catalogue RunFit</p>

      <!-- Stats -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div v-for="i in 4" :key="i" class="bg-gray-900 rounded-xl p-5 border border-gray-800 animate-pulse h-24" />
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Chaussures actives" :value="stats.active" color="green" />
        <StatCard label="Drafts à valider" :value="stats.drafts" color="orange" />
        <StatCard label="Images manquantes" :value="stats.missingImages" color="red" />
        <StatCard label="Liens affiliés" :value="stats.affiliateLinks" color="blue" />
      </div>

      <!-- Raccourcis -->
      <div class="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        <NuxtLink
          to="/admin/shoes"
          class="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 transition-colors group"
        >
          <div class="text-2xl mb-2">👟</div>
          <h3 class="font-semibold group-hover:text-orange-400 transition-colors">Catalogue</h3>
          <p class="text-sm text-gray-400 mt-1">Gérer les chaussures, valider les drafts</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/shoes?filter=drafts"
          class="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 transition-colors group"
        >
          <div class="text-2xl mb-2">📋</div>
          <h3 class="font-semibold group-hover:text-orange-400 transition-colors">Drafts</h3>
          <p class="text-sm text-gray-400 mt-1">{{ stats.drafts }} chaussures en attente de validation</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/blog"
          class="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 transition-colors group"
        >
          <div class="text-2xl mb-2">✍️</div>
          <h3 class="font-semibold group-hover:text-orange-400 transition-colors">Blog</h3>
          <p class="text-sm text-gray-400 mt-1">Écrire et publier des articles</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/revenus"
          class="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 transition-colors group"
        >
          <div class="text-2xl mb-2">💶</div>
          <h3 class="font-semibold group-hover:text-orange-400 transition-colors">Revenus</h3>
          <p class="text-sm text-gray-400 mt-1">Clics, ventes et commissions d'affiliation</p>
        </NuxtLink>

        <button
          type="button"
          class="text-left bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 transition-colors group disabled:opacity-60 disabled:cursor-wait"
          :disabled="syncing"
          @click="syncOffers"
        >
          <div class="text-2xl mb-2">🔄</div>
          <h3 class="font-semibold group-hover:text-orange-400 transition-colors">
            {{ syncing ? 'Synchronisation en cours…' : 'Synchroniser les offres' }}
          </h3>
          <p class="text-sm text-gray-400 mt-1">Met à jour prix, stocks et photos depuis les flux marchands</p>
        </button>

        <label
          class="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 transition-colors group cursor-pointer"
          @click="triggerCsvImport"
        >
          <div class="text-2xl mb-2">📦</div>
          <h3 class="font-semibold group-hover:text-orange-400 transition-colors">Import CSV</h3>
          <p class="text-sm text-gray-400 mt-1">Importer un feed d'affiliation</p>
        </label>
      </div>

      <!-- Résultat de la synchro des offres -->
      <div v-if="syncError || syncResults" class="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 class="font-semibold mb-2">Synchronisation des offres</h3>
        <p v-if="syncError" class="text-sm text-red-400">{{ syncError }}</p>
        <ul v-else class="space-y-1 text-sm">
          <li v-for="r in syncResults" :key="r.merchantSlug" class="flex flex-wrap gap-x-6 gap-y-1">
            <span class="font-medium">{{ r.merchantSlug }}</span>
            <span :class="r.status === 'success' ? 'text-green-400' : 'text-red-400'">
              {{ r.status === 'success' ? '✓ terminée' : '✗ ' + (r.errorMessage || r.status) }}
            </span>
            <span class="text-gray-400">{{ r.itemsFetched }} lignes lues</span>
            <span class="text-gray-400">{{ r.itemsUpserted }} offres mises à jour</span>
            <span class="text-gray-400">{{ r.itemsRemoved }} retirées</span>
            <span class="text-gray-500">{{ Math.round(r.durationMs / 1000) }} s</span>
          </li>
        </ul>
      </div>

      <!-- Import CSV toast -->
      <div v-if="importResult" class="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 class="font-semibold mb-2">Résultat d'import</h3>
        <div class="flex gap-6 text-sm">
          <span class="text-green-400">✓ {{ importResult.imported }} importées</span>
          <span class="text-gray-400">⟳ {{ importResult.skipped }} ignorées</span>
          <span v-if="importResult.errors.length" class="text-red-400">✗ {{ importResult.errors.length }} erreurs</span>
        </div>
        <ul v-if="importResult.errors.length" class="mt-2 space-y-1">
          <li v-for="(err, i) in importResult.errors" :key="i" class="text-xs text-red-400">{{ err }}</li>
        </ul>
      </div>

      <!-- Input CSV caché -->
      <input
        ref="csvInput"
        type="file"
        accept=".csv"
        class="hidden"
        @change="handleCsvUpload"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()
const user     = useSupabaseUser()
const router   = useRouter()

const loading      = ref(true)
const csvInput     = ref<HTMLInputElement>()
const importResult = ref<any>(null)
const syncing      = ref(false)
const syncError    = ref('')
const syncResults  = ref<any[] | null>(null)

const stats = reactive({
  active:        0,
  drafts:        0,
  missingImages: 0,
  affiliateLinks: 0,
})

// Charger les stats au montage
onMounted(async () => {
  await loadStats()
  loading.value = false
})

async function loadStats() {
  const [{ count: active }, { count: drafts }, { count: missingImg }, { count: affiliates }] =
    await Promise.all([
      supabase.from('shoes').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('shoes').select('id', { count: 'exact', head: true }).eq('is_draft', true),
      supabase.from('shoes').select('id', { count: 'exact', head: true }).is('image_url', null),
      supabase.from('affiliate_links').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ])

  stats.active        = active ?? 0
  stats.drafts        = drafts ?? 0
  stats.missingImages = missingImg ?? 0
  stats.affiliateLinks = affiliates ?? 0
}

// Lance la synchro de tous les flux marchands (plusieurs dizaines de secondes)
async function syncOffers() {
  if (syncing.value) return
  syncing.value = true
  syncError.value = ''
  syncResults.value = null
  try {
    const r = await $fetch<{ results: any[] }>('/api/admin/sync-feeds', { method: 'POST', body: {} })
    syncResults.value = r.results
    await loadStats()
  } catch (err: any) {
    syncError.value = err.data?.message || err.data?.statusMessage || err.message || 'Erreur inconnue'
  } finally {
    syncing.value = false
  }
}

function triggerCsvImport() {
  csvInput.value?.click()
}

async function handleCsvUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const form = new FormData()
  form.append('file', file)

  try {
    const result = await $fetch('/api/admin/import-csv', { method: 'POST', body: form })
    importResult.value = result
    await loadStats()
  } catch (err: any) {
    alert(`Erreur import : ${err.data?.statusMessage || err.message}`)
  }

  // Reset input pour permettre re-import du même fichier
  if (csvInput.value) csvInput.value.value = ''
}

async function handleLogout() {
  await supabase.auth.signOut()
  await router.push('/admin/login')
}
</script>
