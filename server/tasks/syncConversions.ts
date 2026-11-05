// ============================================================
// Nitro Scheduled Task — import quotidien des ventes Awin
// ============================================================
// Exécution : tous les jours à 04:00 (après syncFeeds à 03:00)
// Déclenchement manuel : POST /api/admin/conversions/sync
// Amazon : pas d'API de ventes → import CSV depuis /admin/revenus

import { isAwinApiConfigured, syncAwinConversions } from '../services/conversionSync.service'

export default defineTask({
  meta: {
    name: 'syncConversions',
    description: 'Importe les transactions Awin (ventes) des 45 derniers jours',
  },

  async run() {
    if (!isAwinApiConfigured()) {
      console.log('[task:syncConversions] Awin non configuré (AWIN_PUBLISHER_ID / AWIN_API_TOKEN) — ignoré')
      return { result: { skipped: true } }
    }

    try {
      const summary = await syncAwinConversions(45)
      console.log('[task:syncConversions] Terminé :', summary)
      return { result: summary }
    } catch (err) {
      console.error('[task:syncConversions] Erreur :', err)
      throw err
    }
  },
})
