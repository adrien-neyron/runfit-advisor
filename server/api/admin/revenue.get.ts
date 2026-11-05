// GET /api/admin/revenue?days=30  (ou ?from=YYYY-MM-DD&to=YYYY-MM-DD)
// Rapport clics / ventes / commissions par marchand et par chaussure.

import { requireAdmin } from '../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import { isAwinApiConfigured } from '../../services/conversionSync.service'

const DAY = 86_400_000

function parseDay(v: unknown): Date | null {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null
  const d = new Date(`${v}T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const q = getQuery(event)
  let to = parseDay(q.to)
  let from = parseDay(q.from)
  if (to) to = new Date(to.getTime() + DAY) // « to » inclus
  if (!from || !to) {
    const days = Math.min(Math.max(Math.trunc(Number(q.days) || 30), 1), 365)
    to = new Date(Date.now() + 1000)
    from = new Date(to.getTime() - days * DAY)
  }
  if (from >= to) throw createError({ statusCode: 400, statusMessage: 'Période invalide' })

  const supabase = getSupabaseAdmin() as any
  const args = { p_from: from.toISOString(), p_to: to.toISOString() }

  const [byMerchantRes, byShoeRes, bySourceRes, runsRes] = await Promise.all([
    supabase.rpc('affiliate_report_by_merchant', args),
    supabase.rpc('affiliate_report_by_shoe', { ...args, p_limit: 25 }),
    supabase.rpc('affiliate_report_by_source', args),
    supabase
      .from('affiliate_import_runs')
      .select('id, network, source, status, items_fetched, items_upserted, items_matched, error_message, started_at')
      .order('started_at', { ascending: false })
      .limit(8),
  ])

  for (const r of [byMerchantRes, byShoeRes]) {
    if (r.error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Rapport indisponible (${r.error.message}). La migration 20261028000001 est-elle appliquée ?`,
      })
    }
  }

  const n = (v: unknown) => Number(v ?? 0)
  const byMerchant = (byMerchantRes.data ?? []).map((r: any) => ({
    merchant: r.merchant as string,
    clicks: n(r.clicks),
    conversions: n(r.conversions),
    orderAmount: n(r.order_amount),
    commissionPending: n(r.commission_pending),
    commissionApproved: n(r.commission_approved),
    epc: n(r.epc),
  }))

  // Libellés des chaussures
  const shoeRows = byShoeRes.data ?? []
  const labels = new Map<string, string>()
  const ids = shoeRows.map((r: any) => String(r.shoe_id))
  if (ids.length) {
    const { data: shoes } = await supabase.from('shoes').select('id, brand, model').in('id', ids)
    for (const s of shoes ?? []) labels.set(String(s.id), `${s.brand} ${s.model}`)
  }
  const byShoe = shoeRows.map((r: any) => ({
    shoeId: String(r.shoe_id),
    label: labels.get(String(r.shoe_id)) ?? String(r.shoe_id),
    clicks: n(r.clicks),
    conversions: n(r.conversions),
    commission: n(r.commission),
    epc: n(r.epc),
  }))

  // Page d'origine des clics (indisponible tant que la migration n'est pas appliquée : on n'échoue pas pour autant)
  const bySource = (bySourceRes.data ?? []).map((r: any) => ({
    src: String(r.src),
    clicks: n(r.clicks),
    conversions: n(r.conversions),
    commission: n(r.commission),
    epc: n(r.epc),
  }))

  const clicks = byMerchant.reduce((s: number, r: any) => s + r.clicks, 0)
  const conversions = byMerchant.reduce((s: number, r: any) => s + r.conversions, 0)
  const commission = byMerchant.reduce((s: number, r: any) => s + r.commissionPending + r.commissionApproved, 0)

  return {
    period: { from: from.toISOString(), to: to.toISOString() },
    totals: {
      clicks,
      conversions,
      commission: Math.round(commission * 100) / 100,
      epc: clicks > 0 ? Math.round((commission / clicks) * 10_000) / 10_000 : 0,
      conversionRate: clicks > 0 ? Math.round((conversions / clicks) * 10_000) / 10_000 : 0,
    },
    byMerchant,
    byShoe,
    bySource,
    runs: runsRes.data ?? [],
    awinConfigured: isAwinApiConfigured(),
  }
})
