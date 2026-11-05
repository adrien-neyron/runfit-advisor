<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <nav class="border-b border-gray-800 bg-gray-900 px-6 py-3 flex items-center justify-between" aria-label="Navigation admin">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-sm font-bold" aria-hidden="true">R</div>
        <span class="font-semibold text-gray-100">RunFit Admin</span>
      </div>
      <NuxtLink to="/admin/dashboard" class="text-sm text-gray-300 hover:text-white underline-offset-4 hover:underline">
        ← Tableau de bord
      </NuxtLink>
    </nav>

    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold mb-1">Revenus d'affiliation</h1>
          <p class="text-gray-400">Clics, ventes et commissions par marchand et par chaussure.</p>
        </div>
        <div>
          <label for="period" class="block text-sm text-gray-300 mb-1">Période</label>
          <select
            id="period"
            v-model.number="days"
            class="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option :value="7">7 derniers jours</option>
            <option :value="30">30 derniers jours</option>
            <option :value="90">90 derniers jours</option>
            <option :value="365">12 derniers mois</option>
          </select>
        </div>
      </div>

      <p v-if="error" role="alert" class="mb-6 rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-300">
        {{ error }}
      </p>

      <!-- Indicateurs -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" aria-busy="true">
        <div v-for="i in 4" :key="i" class="bg-gray-900 rounded-xl p-5 border border-gray-800 animate-pulse h-24" />
      </div>
      <div v-else-if="report" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Clics affiliés" :value="fmtInt(report.totals.clicks)" color="blue" />
        <StatCard label="Ventes" :value="fmtInt(report.totals.conversions)" color="orange" />
        <StatCard label="Commissions" :value="fmtEur(report.totals.commission)" color="green" />
        <StatCard label="Revenu par clic (EPC)" :value="fmtEur(report.totals.epc, 3)" />
      </div>

      <div v-if="report" class="space-y-6">
        <!-- Par marchand -->
        <AdminSection title="Par marchand">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <caption class="sr-only">Clics, ventes et commissions par marchand sur la période sélectionnée</caption>
              <thead>
                <tr class="text-left text-gray-400 border-b border-gray-800">
                  <th scope="col" class="py-2 pr-4 font-medium">Marchand</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">Clics</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">Ventes</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">Conversion</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">CA généré</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">En attente</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">Validée</th>
                  <th scope="col" class="py-2 pl-3 font-medium text-right">EPC</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in report.byMerchant" :key="m.merchant" class="border-b border-gray-800/60">
                  <th scope="row" class="py-2 pr-4 text-left font-medium">{{ m.merchant }}</th>
                  <td class="py-2 px-3 text-right tabular-nums">{{ fmtInt(m.clicks) }}</td>
                  <td class="py-2 px-3 text-right tabular-nums">{{ fmtInt(m.conversions) }}</td>
                  <td class="py-2 px-3 text-right tabular-nums">{{ m.clicks ? fmtPct(m.conversions / m.clicks) : '—' }}</td>
                  <td class="py-2 px-3 text-right tabular-nums">{{ fmtEur(m.orderAmount) }}</td>
                  <td class="py-2 px-3 text-right tabular-nums text-orange-300">{{ fmtEur(m.commissionPending) }}</td>
                  <td class="py-2 px-3 text-right tabular-nums text-green-300">{{ fmtEur(m.commissionApproved) }}</td>
                  <td class="py-2 pl-3 text-right tabular-nums">{{ fmtEur(m.epc, 3) }}</td>
                </tr>
                <tr v-if="!report.byMerchant.length">
                  <td colspan="8" class="py-6 text-center text-gray-400">Aucune donnée sur cette période.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-3 text-xs text-gray-400">
            Les clics sont comptés à leur date de clic, les ventes à leur date de vente. Les ventes refusées sont exclues.
            Une vente sur « inconnu » n'a pas pu être rattachée à un marchand.
          </p>
        </AdminSection>

        <!-- Par chaussure -->
        <AdminSection title="Top chaussures">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <caption class="sr-only">Chaussures classées par commission sur la période sélectionnée</caption>
              <thead>
                <tr class="text-left text-gray-400 border-b border-gray-800">
                  <th scope="col" class="py-2 pr-4 font-medium">Chaussure</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">Clics</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">Ventes</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">Commission</th>
                  <th scope="col" class="py-2 pl-3 font-medium text-right">EPC</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in report.byShoe" :key="s.shoeId" class="border-b border-gray-800/60">
                  <th scope="row" class="py-2 pr-4 text-left font-medium">{{ s.label }}</th>
                  <td class="py-2 px-3 text-right tabular-nums">{{ fmtInt(s.clicks) }}</td>
                  <td class="py-2 px-3 text-right tabular-nums">{{ fmtInt(s.conversions) }}</td>
                  <td class="py-2 px-3 text-right tabular-nums">{{ fmtEur(s.commission) }}</td>
                  <td class="py-2 pl-3 text-right tabular-nums">{{ fmtEur(s.epc, 3) }}</td>
                </tr>
                <tr v-if="!report.byShoe.length">
                  <td colspan="5" class="py-6 text-center text-gray-400">Aucune donnée sur cette période.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AdminSection>

        <!-- Par page d'origine -->
        <AdminSection title="Clics par page d'origine">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <caption class="sr-only">Clics, ventes et commission selon la page d'où part le clic</caption>
              <thead>
                <tr class="text-left text-gray-400 border-b border-gray-800">
                  <th scope="col" class="py-2 pr-4 font-medium">Page</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">Clics</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">Ventes</th>
                  <th scope="col" class="py-2 px-3 font-medium text-right">Commission</th>
                  <th scope="col" class="py-2 pl-3 font-medium text-right">EPC</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in report.bySource" :key="s.src" class="border-b border-gray-800/60">
                  <th scope="row" class="py-2 pr-4 text-left font-medium">{{ sourceLabels[s.src] ?? s.src }}</th>
                  <td class="py-2 px-3 text-right tabular-nums">{{ fmtInt(s.clicks) }}</td>
                  <td class="py-2 px-3 text-right tabular-nums">{{ fmtInt(s.conversions) }}</td>
                  <td class="py-2 px-3 text-right tabular-nums">{{ fmtEur(s.commission) }}</td>
                  <td class="py-2 pl-3 text-right tabular-nums">{{ fmtEur(s.epc, 3) }}</td>
                </tr>
                <tr v-if="!report.bySource.length">
                  <td colspan="5" class="py-6 text-center text-gray-400">Aucune donnée sur cette période.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-3 text-xs text-gray-400">
            « Avant suivi » regroupe les clics enregistrés avant l'ajout de la page d'origine. Les ventes sont rattachées à la page via l'identifiant de clic.
          </p>
        </AdminSection>

        <!-- Imports -->
        <AdminSection title="Importer les ventes">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold mb-1">Awin (automatique)</h3>
              <p class="text-sm text-gray-400 mb-3">
                Importé chaque nuit à 04:00. Les ventes sont rattachées à leur clic grâce au <code>clickref</code>.
              </p>
              <button
                type="button"
                class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
                :disabled="!report.awinConfigured || syncing"
                @click="syncAwin"
              >
                {{ syncing ? 'Synchronisation…' : 'Synchroniser maintenant' }}
              </button>
              <p v-if="!report.awinConfigured" class="mt-2 text-xs text-orange-300">
                Non configuré : définir <code>AWIN_PUBLISHER_ID</code> et <code>AWIN_API_TOKEN</code>.
              </p>
            </div>

            <div>
              <h3 class="font-semibold mb-1">Amazon (rapport CSV)</h3>
              <p class="text-sm text-gray-400 mb-3">
                Amazon n'a pas d'API de ventes : télécharge le rapport « Commandes » dans Associates Central.
                Rattachement à la chaussure via l'ASIN.
              </p>
              <label for="amazon-csv" class="block text-sm text-gray-300 mb-1">Fichier CSV Amazon Associates</label>
              <input
                id="amazon-csv"
                ref="csvInput"
                type="file"
                accept=".csv,.tsv,text/csv"
                :disabled="importing"
                class="block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-800 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-gray-700"
                @change="uploadAmazon"
              />
            </div>
          </div>

          <div aria-live="polite" class="mt-4 text-sm">
            <p v-if="importMessage" class="rounded-lg border border-green-500/40 bg-green-950/30 px-4 py-3 text-green-300">
              {{ importMessage }}
            </p>
            <p v-if="importError" role="alert" class="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-red-300">
              {{ importError }}
            </p>
          </div>

          <h3 class="font-semibold mt-6 mb-2">Derniers imports</h3>
          <ul v-if="report.runs.length" class="space-y-1 text-sm">
            <li v-for="r in report.runs" :key="r.id" class="flex flex-wrap gap-x-3 text-gray-300">
              <span class="tabular-nums text-gray-400">{{ fmtDate(r.started_at) }}</span>
              <span class="font-medium">{{ r.network }} ({{ r.source }})</span>
              <span :class="r.status === 'success' ? 'text-green-300' : r.status === 'error' ? 'text-red-300' : 'text-orange-300'">
                {{ statusLabel(r.status) }}
              </span>
              <span v-if="r.status === 'success'" class="text-gray-400">
                {{ r.items_upserted }} ventes, {{ r.items_matched }} rattachées
              </span>
              <span v-if="r.error_message" class="text-red-300">{{ r.error_message }}</span>
            </li>
          </ul>
          <p v-else class="text-sm text-gray-400">Aucun import pour l'instant.</p>
        </AdminSection>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

// Imports explicites : indépendants du préfixe d'auto-import des composants (admin/…)
import AdminSection from '~/components/admin/Section.vue'
import StatCard from '~/components/admin/StatCard.vue'

interface Report {
  period: { from: string; to: string }
  totals: { clicks: number; conversions: number; commission: number; epc: number; conversionRate: number }
  byMerchant: Array<{
    merchant: string; clicks: number; conversions: number; orderAmount: number
    commissionPending: number; commissionApproved: number; epc: number
  }>
  byShoe: Array<{ shoeId: string; label: string; clicks: number; conversions: number; commission: number; epc: number }>
  bySource: Array<{ src: string; clicks: number; conversions: number; commission: number; epc: number }>
  runs: Array<{
    id: string; network: string; source: string; status: string
    items_upserted: number; items_matched: number; error_message: string | null; started_at: string
  }>
  awinConfigured: boolean
}

const sourceLabels: Record<string, string> = {
  swipe: 'Swipe',
  matches: 'Mes matchs',
  resultats: 'Résultats',
  fiche: 'Fiche chaussure',
  profil: 'Profil',
  equipement: 'Mon équipement',
  autre: 'Autre',
}
const days = ref(30)
const loading = ref(true)
const error = ref('')
const report = ref<Report | null>(null)

const syncing = ref(false)
const importing = ref(false)
const importMessage = ref('')
const importError = ref('')
const csvInput = ref<HTMLInputElement>()

const eur = (digits: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: digits })
const fmtEur = (v: number, digits = 2) => eur(digits).format(v)
const fmtInt = (v: number) => new Intl.NumberFormat('fr-FR').format(v)
const fmtPct = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(v)
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
const statusLabel = (s: string) => ({ success: 'réussi', error: 'échec', running: 'en cours' } as Record<string, string>)[s] ?? s

function errMessage(e: any): string {
  return e?.data?.statusMessage || e?.statusMessage || e?.message || 'Erreur inconnue'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    report.value = await $fetch<Report>('/api/admin/revenue', { query: { days: days.value } })
  } catch (e: any) {
    error.value = errMessage(e)
  } finally {
    loading.value = false
  }
}

async function syncAwin() {
  syncing.value = true
  importMessage.value = ''
  importError.value = ''
  try {
    const r = await $fetch<{ upserted: number; matched: number }>('/api/admin/conversions/sync', { method: 'POST', body: {} })
    importMessage.value = `Awin : ${r.upserted} ventes importées, ${r.matched} rattachées à un clic.`
    await load()
  } catch (e: any) {
    importError.value = `Synchronisation Awin impossible : ${errMessage(e)}`
  } finally {
    syncing.value = false
  }
}

async function uploadAmazon(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  importing.value = true
  importMessage.value = ''
  importError.value = ''
  try {
    const form = new FormData()
    form.append('file', file)
    const r = await $fetch<{ upserted: number; matched: number; skipped?: number; unrecognizedHeaders?: string[] }>(
      '/api/admin/conversions/import-amazon',
      { method: 'POST', body: form },
    )
    importMessage.value =
      `Amazon : ${r.upserted} lignes importées, ${r.matched} rattachées à une chaussure` +
      (r.skipped ? `, ${r.skipped} lignes ignorées (totaux ou lignes vides)` : '') + '.'
    await load()
  } catch (err: any) {
    importError.value = `Import Amazon impossible : ${errMessage(err)}`
  } finally {
    importing.value = false
    if (csvInput.value) csvInput.value.value = '' // permet de ré-importer le même fichier
  }
}

watch(days, load)
onMounted(load)
</script>
