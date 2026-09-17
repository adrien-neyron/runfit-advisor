// ============================================================
// Nitro Scheduled Task — synchronisation quotidienne des flux
// ============================================================
// Exécution : tous les jours à 03:00 (heure serveur)
// Déclenchement manuel : POST /api/admin/sync-feeds
//
// Enregistrement dans nuxt.config.ts :
//   nitro: { scheduledTasks: { '0 3 * * *': 'syncFeeds' } }

import { syncAllFeeds } from '../services/feedSync.service'

export default defineTask({
  meta: {
    name: 'syncFeeds',
    description: 'Synchronise les flux produits de tous les marchands actifs',
  },

  async run({ payload, context }) {
    console.log('[task:syncFeeds] Démarrage de la synchronisation des flux…')
    const startMs = Date.now()

    try {
      const results = await syncAllFeeds()

      const summary = {
        total:       results.length,
        success:     results.filter((r) => r.status === 'success').length,
        error:       results.filter((r) => r.status === 'error').length,
        partial:     results.filter((r) => r.status === 'partial').length,
        totalUpserted: results.reduce((sum, r) => sum + r.itemsUpserted, 0),
        totalRemoved:  results.reduce((sum, r) => sum + r.itemsRemoved, 0),
        durationMs:  Date.now() - startMs,
      }

      console.log('[task:syncFeeds] Terminé :', summary)
      return { result: summary }
    } catch (err) {
      console.error('[task:syncFeeds] Erreur fatale :', err)
      throw err
    }
  },
})
