// ============================================================
// Import des ventes affiliées (conversions)
// ============================================================
//  • Awin   : API Publisher « Transactions » → rattachement par clickref = click_id
//  • Amazon : rapport CSV Associates          → rattachement par ASIN (pas de click_id)
//
// Idempotent : upsert sur (network, network_transaction_id). On re-synchronise toujours les
// ~45 derniers jours pour répercuter les changements de statut (pending → approved/declined).

import { getSupabaseAdmin } from '../utils/supabaseAdmin'
import { parseAwinTag } from '../utils/affiliation/awin'
import {
  mapAwinTransaction,
  splitWindows,
  toAwinDate,
  type AwinTransaction,
  type ConversionRow,
} from '../utils/affiliation/awinTransactions'
import { parseAmazonReport, type AmazonConversionRow } from '../utils/affiliation/amazonReport'

export interface ImportSummary {
  network: 'awin' | 'amazon'
  source: 'api' | 'csv'
  fetched: number
  upserted: number
  matched: number
  skipped?: number
  unrecognizedHeaders?: string[]
}

const AWIN_API = 'https://api.awin.com/publishers'
const CHUNK = 500

export function isAwinApiConfigured(): boolean {
  return !!process.env.AWIN_PUBLISHER_ID && !!process.env.AWIN_API_TOKEN
}

// ── Journal d'import ─────────────────────────────────────────────────────────

async function startRun(network: string, source: 'api' | 'csv'): Promise<string | null> {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from('affiliate_import_runs')
    .insert({ network, source, status: 'running' })
    .select('id')
    .single()
  if (error) console.error('[conversionSync] run log start failed:', error.message)
  return data?.id ?? null
}

async function finishRun(
  id: string | null,
  patch: { status: 'success' | 'error'; items_fetched?: number; items_upserted?: number; items_matched?: number; error_message?: string },
) {
  if (!id) return
  const { error } = await (getSupabaseAdmin() as any)
    .from('affiliate_import_runs')
    .update({ ...patch, ended_at: new Date().toISOString() })
    .eq('id', id)
  if (error) console.error('[conversionSync] run log end failed:', error.message)
}

async function upsertConversions(rows: Array<ConversionRow | AmazonConversionRow>): Promise<void> {
  const supabase = getSupabaseAdmin() as any
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase
      .from('affiliate_conversions')
      .upsert(rows.slice(i, i + CHUNK), { onConflict: 'network,network_transaction_id' })
    if (error) throw new Error(`Upsert conversions : ${error.message}`)
  }
}

// ── Awin ─────────────────────────────────────────────────────────────────────

async function fetchAwinWindow(publisherId: string, token: string, start: Date, end: Date): Promise<AwinTransaction[]> {
  const url = new URL(`${AWIN_API}/${encodeURIComponent(publisherId)}/transactions/`)
  url.searchParams.set('startDate', toAwinDate(start))
  url.searchParams.set('endDate', toAwinDate(end))
  url.searchParams.set('timezone', 'UTC')

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
  if (!res.ok) {
    const body = (await res.text().catch(() => '')).slice(0, 200)
    throw new Error(`Awin API ${res.status} ${res.statusText} ${body}`.trim())
  }
  const json = await res.json()
  if (!Array.isArray(json)) throw new Error('Awin API : réponse inattendue (tableau attendu)')
  return json as AwinTransaction[]
}

export async function syncAwinConversions(days = 45): Promise<ImportSummary> {
  const publisherId = process.env.AWIN_PUBLISHER_ID
  const token = process.env.AWIN_API_TOKEN
  if (!publisherId || !token) {
    throw new Error('Awin non configuré : AWIN_PUBLISHER_ID et AWIN_API_TOKEN sont requis')
  }

  const supabase = getSupabaseAdmin() as any
  const runId = await startRun('awin', 'api')

  try {
    // advertiserId (awinmid) → slug marchand
    const { data: merchants, error: mErr } = await supabase
      .from('merchants')
      .select('slug, affiliate_tag')
      .eq('affiliate_network', 'awin')
    if (mErr) throw new Error(`Lecture merchants : ${mErr.message}`)

    const advertiserToSlug = new Map<string, string>()
    for (const m of merchants ?? []) {
      const cfg = parseAwinTag(m.affiliate_tag, publisherId)
      if (cfg) advertiserToSlug.set(cfg.advertiserId, m.slug)
    }

    // Transactions, fenêtres de 30 jours (limite Awin : 31)
    const to = new Date()
    const from = new Date(to.getTime() - days * 86_400_000)
    const byId = new Map<string, AwinTransaction>()
    for (const w of splitWindows(from, to, 30)) {
      for (const t of await fetchAwinWindow(publisherId, token, w.start, w.end)) byId.set(String(t.id), t)
    }

    const rows = [...byId.values()].map(t => mapAwinTransaction(t, advertiserToSlug))

    // Ne garde click_id que s'il existe dans affiliate_clicks (clé étrangère) ;
    // le marchand du clic fait foi s'il est connu.
    const clickIds = [...new Set(rows.map(r => r.click_id).filter((x): x is string => !!x))]
    const clickMerchant = new Map<string, string>()
    for (let i = 0; i < clickIds.length; i += 200) {
      const { data, error } = await supabase
        .from('affiliate_clicks')
        .select('click_id, merchant')
        .in('click_id', clickIds.slice(i, i + 200))
      if (error) throw new Error(`Lecture affiliate_clicks : ${error.message}`)
      for (const c of data ?? []) clickMerchant.set(c.click_id, c.merchant)
    }
    let matched = 0
    for (const r of rows) {
      if (r.click_id && clickMerchant.has(r.click_id)) {
        matched++
        r.merchant = clickMerchant.get(r.click_id) ?? r.merchant
      } else {
        r.click_id = null
      }
    }

    await upsertConversions(rows)
    await finishRun(runId, { status: 'success', items_fetched: rows.length, items_upserted: rows.length, items_matched: matched })
    return { network: 'awin', source: 'api', fetched: rows.length, upserted: rows.length, matched }
  } catch (err: any) {
    await finishRun(runId, { status: 'error', error_message: String(err?.message ?? err).slice(0, 500) })
    throw err
  }
}

// ── Amazon (CSV) ─────────────────────────────────────────────────────────────

export async function importAmazonCsv(csvText: string): Promise<ImportSummary> {
  const supabase = getSupabaseAdmin() as any
  const runId = await startRun('amazon', 'csv')

  try {
    const { rows, skipped, unrecognizedHeaders } = parseAmazonReport(csvText)

    // Combien d'ASIN du rapport sont connus dans affiliate_links (→ rattachables à une chaussure) ?
    const asins = [...new Set(rows.map(r => r.asin))]
    const known = new Set<string>()
    for (let i = 0; i < asins.length; i += 200) {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('asin')
        .in('asin', asins.slice(i, i + 200))
      if (error) throw new Error(`Lecture affiliate_links : ${error.message}`)
      for (const l of data ?? []) known.add(l.asin)
    }
    const matched = rows.filter(r => known.has(r.asin)).length

    await upsertConversions(rows)
    await finishRun(runId, { status: 'success', items_fetched: rows.length + skipped, items_upserted: rows.length, items_matched: matched })
    return { network: 'amazon', source: 'csv', fetched: rows.length + skipped, upserted: rows.length, matched, skipped, unrecognizedHeaders }
  } catch (err: any) {
    await finishRun(runId, { status: 'error', error_message: String(err?.message ?? err).slice(0, 500) })
    throw err
  }
}
