// ============================================================
// POST /api/admin/sync-feeds — déclenchement manuel de la sync
// ============================================================
// Body optionnel : { merchantSlug?: string, dryRun?: boolean }
//   merchantSlug : sync un seul marchand
//   dryRun       : simulation (rapprochements proposés, aucune écriture en base)
// Protégé par requireAdmin (vérifie ADMIN_EMAILS)

import { requireAdmin }    from '../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import { syncMerchant, syncAllFeeds } from '../../services/feedSync.service'
import type { MerchantConfig } from '../../types/feed'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<{ merchantSlug?: string; dryRun?: boolean }>(event).catch(() => ({ merchantSlug: undefined, dryRun: false }))

  // Sync d'un seul marchand
  if (body?.merchantSlug) {
    const supabase = getSupabaseAdmin()
    const { data: row, error } = await (supabase as any)
      .from('merchants')
      .select('*')
      .eq('slug', body.merchantSlug)
      .eq('is_active', true)
      .single()

    if (error || !row) {
      throw createError({ statusCode: 404, message: `Marchand introuvable : ${body.merchantSlug}` })
    }

    const merchant: MerchantConfig = {
      id:               row.id,
      name:             row.name,
      slug:             row.slug,
      feedUrl:          row.feed_url,
      feedFormat:       row.feed_format,
      affiliateNetwork: row.affiliate_network,
      affiliateTag:     row.affiliate_tag,
      country:          row.country,
      logoUrl:          row.logo_url,
      isActive:         row.is_active,
      lastSyncAt:       row.last_sync_at,
    }

    const result = await syncMerchant(merchant, { dryRun: !!body.dryRun })
    return { results: [result] }
  }

  // Sync de tous les marchands
  const results = await syncAllFeeds()
  return {
    results,
    summary: {
      total:         results.length,
      success:       results.filter((r) => r.status === 'success').length,
      error:         results.filter((r) => r.status === 'error').length,
      totalUpserted: results.reduce((sum, r) => sum + r.itemsUpserted, 0),
      totalRemoved:  results.reduce((sum, r) => sum + r.itemsRemoved, 0),
    },
  }
})
