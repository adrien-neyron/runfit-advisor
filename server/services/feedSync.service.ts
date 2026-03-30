// ============================================================
// Feed Sync Service — synchronisation des flux marchands
// ============================================================
// Orchestration complète :
//   1. Téléchargement du flux (avec retry + timeout)
//   2. Parsing (XML / CSV / JSON)
//   3. Matching produit ↔ catalogue shoes
//   4. Upsert dans shoe_prices
//   5. Mise à jour historique des prix
//   6. Marquage des produits disparus comme out_of_stock
//   7. Log de la sync dans feed_sync_logs

import { getSupabaseAdmin } from '../utils/supabaseAdmin'
import { parseXmlFeed } from '../parsers/xmlFeed.parser'
import { parseCsvFeed } from '../parsers/csvFeed.parser'
import { parseJsonFeed } from '../parsers/jsonFeed.parser'
import { buildAffiliateUrl } from './affiliateLink.service'
import type {
  MerchantConfig,
  NormalizedProductFeedItem,
  FeedSyncResult,
  FeedFormat,
} from '../types/feed'

// ── Config ───────────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 30_000
const MAX_RETRIES      = 2
const RETRY_DELAY_MS   = 3_000

// ── Téléchargement du flux ───────────────────────────────────────────────────

async function downloadFeed(url: string, attempt = 1): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RunFitBot/1.0 (+https://runfit.app/bot)',
        'Accept': 'application/xml,text/xml,text/csv,application/json,*/*',
      },
    })
    clearTimeout(timer)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} pour ${url}`)
    }

    return await res.text()
  } catch (err) {
    clearTimeout(timer)
    if (attempt <= MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt))
      return downloadFeed(url, attempt + 1)
    }
    throw err
  }
}

// ── Parsing ──────────────────────────────────────────────────────────────────

function parseFeed(content: string, format: FeedFormat): NormalizedProductFeedItem[] {
  switch (format) {
    case 'xml':  return parseXmlFeed(content)
    case 'csv':  return parseCsvFeed(content)
    case 'json': return parseJsonFeed(content)
    default:     return []
  }
}

// ── Matching produit ↔ catalogue ─────────────────────────────────────────────

/**
 * Cherche l'ID de la chaussure dans le catalogue Supabase.
 * Stratégie : brand + model fuzzy match sur le champ brand+model de shoes.
 * Retourne null si aucun match fiable.
 */
async function matchShoeId(
  brand: string,
  model: string,
): Promise<string | null> {
  const supabase = getSupabaseAdmin()

  // Recherche insensible à la casse — mots-clés du modèle
  const modelWords = model
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)

  if (modelWords.length === 0) return null

  const { data } = await supabase
    .from('shoes')
    .select('id, brand, model')
    .ilike('brand', `%${brand.substring(0, 20)}%`)
    .eq('is_active', true)

  if (!data || data.length === 0) return null

  // Compte combien de mots du modèle se retrouvent dans le champ model Supabase
  let bestId: string | null = null
  let bestScore = 0

  for (const shoe of data) {
    const shoeModel = (shoe.model as string).toLowerCase()
    const matches = modelWords.filter((w) => shoeModel.includes(w)).length
    const ratio   = matches / modelWords.length
    if (ratio > bestScore && ratio >= 0.6) {
      bestScore = ratio
      bestId    = shoe.id as string
    }
  }

  return bestId
}

// ── Upsert shoe_price ────────────────────────────────────────────────────────

interface UpsertResult {
  upserted: boolean
  priceChanged: boolean
}

async function upsertShoePrice(
  merchant: MerchantConfig,
  item: NormalizedProductFeedItem,
  shoeId: string | null,
): Promise<UpsertResult> {
  const supabase = getSupabaseAdmin()

  // Génère l'URL affiliée
  const affiliateUrl = buildAffiliateUrl(
    item.productUrl,
    merchant.affiliateNetwork ?? 'manual',
    {
      tag:         merchant.affiliateTag ?? undefined,
      // advertiserId / publisherId stockés dans affiliate_tag pour format "awinmid:publisherid"
      advertiserId: merchant.affiliateTag?.split(':')[0],
      publisherId:  merchant.affiliateTag?.split(':')[1],
    },
  )

  // Récupère le prix actuel pour détecter les changements
  const { data: existing } = await (supabase as any)
    .from('shoe_prices')
    .select('id, price')
    .eq('product_id', shoeId ?? item.externalProductId)
    .eq('retailer_name', merchant.name)
    .maybeSingle()

  const priceChanged = existing && Number(existing.price) !== item.price

  const row = {
    product_id:          shoeId ?? item.externalProductId,
    retailer_name:       merchant.name,
    price:               item.price,
    currency:            item.currency,
    product_url:         item.productUrl,
    affiliate_url:       affiliateUrl,
    stock_status:        item.stockStatus,
    logo_url:            merchant.logoUrl,
    url_status:          'valid',
    merchant_id:         merchant.id,
    external_product_id: item.externalProductId,
    last_checked_at:     new Date().toISOString(),
    updated_at:          new Date().toISOString(),
  }

  const { error } = await (supabase as any)
    .from('shoe_prices')
    .upsert(row, {
      onConflict: 'product_id,retailer_name',
      ignoreDuplicates: false,
    })

  if (error) {
    console.error(`[feedSync] upsert shoe_prices failed: ${error.message}`, { merchant: merchant.slug, item: item.externalProductId })
    return { upserted: false, priceChanged: false }
  }

  // Enregistre l'historique si le prix a changé
  if (priceChanged && existing) {
    await (supabase as any).from('price_history').insert({
      shoe_price_id: existing.id,
      price:         item.price,
      currency:      item.currency,
    })
  }

  return { upserted: true, priceChanged: !!priceChanged }
}

// ── Marquage des produits disparus ───────────────────────────────────────────

async function markGoneProductsOutOfStock(
  merchant: MerchantConfig,
  seenExternalIds: Set<string>,
): Promise<number> {
  const supabase = getSupabaseAdmin()

  // Récupère tous les IDs encore actifs pour ce marchand
  const { data } = await (supabase as any)
    .from('shoe_prices')
    .select('id, external_product_id')
    .eq('merchant_id', merchant.id)
    .neq('stock_status', 'out_of_stock')

  if (!data || data.length === 0) return 0

  const goneIds = (data as { id: string; external_product_id: string | null }[])
    .filter((r) => r.external_product_id && !seenExternalIds.has(r.external_product_id))
    .map((r) => r.id)

  if (goneIds.length === 0) return 0

  await (supabase as any)
    .from('shoe_prices')
    .update({ stock_status: 'out_of_stock', updated_at: new Date().toISOString() })
    .in('id', goneIds)

  return goneIds.length
}

// ── Log de synchronisation ───────────────────────────────────────────────────

async function writeSyncLog(
  merchant: MerchantConfig,
  result: Omit<FeedSyncResult, 'merchantSlug' | 'durationMs'>,
  startedAt: Date,
) {
  const supabase = getSupabaseAdmin()
  await (supabase as any).from('feed_sync_logs').insert({
    merchant_id:    merchant.id,
    merchant_slug:  merchant.slug,
    status:         result.status,
    items_fetched:  result.itemsFetched,
    items_upserted: result.itemsUpserted,
    items_removed:  result.itemsRemoved,
    error_message:  result.errorMessage ?? null,
    started_at:     startedAt.toISOString(),
    ended_at:       new Date().toISOString(),
  })
}

// ── Sync d'un marchand ───────────────────────────────────────────────────────

/**
 * Synchronise les produits d'un marchand depuis son flux.
 */
export async function syncMerchant(merchant: MerchantConfig): Promise<FeedSyncResult> {
  const startedAt = new Date()
  const startMs   = Date.now()

  if (!merchant.feedUrl) {
    return {
      merchantSlug:  merchant.slug,
      status:        'error',
      itemsFetched:  0,
      itemsUpserted: 0,
      itemsRemoved:  0,
      errorMessage:  'feedUrl non configuré',
      durationMs:    0,
    }
  }

  let rawContent: string
  try {
    rawContent = await downloadFeed(merchant.feedUrl)
  } catch (err) {
    const result: FeedSyncResult = {
      merchantSlug:  merchant.slug,
      status:        'error',
      itemsFetched:  0,
      itemsUpserted: 0,
      itemsRemoved:  0,
      errorMessage:  `Téléchargement échoué : ${(err as Error).message}`,
      durationMs:    Date.now() - startMs,
    }
    await writeSyncLog(merchant, result, startedAt)
    return result
  }

  const items = parseFeed(rawContent, merchant.feedFormat)
  console.log(`[feedSync] ${merchant.slug}: ${items.length} produits parsés`)

  let itemsUpserted = 0
  const seenExternalIds = new Set<string>()

  // Upsert en parallèle par batch de 10 pour ne pas saturer Supabase
  const BATCH = 10
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH)
    await Promise.all(
      batch.map(async (item) => {
        seenExternalIds.add(item.externalProductId)
        const shoeId = await matchShoeId(item.brand, item.model)
        if (!shoeId) return // produit hors catalogue → ignoré
        const { upserted } = await upsertShoePrice(merchant, item, shoeId)
        if (upserted) itemsUpserted++
      }),
    )
  }

  const itemsRemoved = await markGoneProductsOutOfStock(merchant, seenExternalIds)

  // Met à jour last_sync_at du marchand
  await (getSupabaseAdmin() as any)
    .from('merchants')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', merchant.id)

  const result: FeedSyncResult = {
    merchantSlug:  merchant.slug,
    status:        'success',
    itemsFetched:  items.length,
    itemsUpserted,
    itemsRemoved,
    durationMs:    Date.now() - startMs,
  }

  await writeSyncLog(merchant, result, startedAt)
  console.log(`[feedSync] ${merchant.slug}: sync OK (${itemsUpserted} upserted, ${itemsRemoved} removed, ${result.durationMs}ms)`)
  return result
}

// ── Sync de tous les marchands actifs ────────────────────────────────────────

/**
 * Synchronise tous les marchands actifs avec un flux configuré.
 * Exécutés séquentiellement pour éviter de surcharger les APIs externes.
 */
export async function syncAllFeeds(): Promise<FeedSyncResult[]> {
  const supabase = getSupabaseAdmin()

  const { data: merchants, error } = await (supabase as any)
    .from('merchants')
    .select('*')
    .eq('is_active', true)
    .not('feed_url', 'is', null)

  if (error || !merchants) {
    console.error('[feedSync] Impossible de charger les marchands', error)
    return []
  }

  const results: FeedSyncResult[] = []

  for (const row of merchants) {
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

    try {
      const result = await syncMerchant(merchant)
      results.push(result)
    } catch (err) {
      console.error(`[feedSync] Erreur inattendue pour ${merchant.slug}:`, err)
      results.push({
        merchantSlug:  merchant.slug,
        status:        'error',
        itemsFetched:  0,
        itemsUpserted: 0,
        itemsRemoved:  0,
        errorMessage:  (err as Error).message,
        durationMs:    0,
      })
    }
  }

  return results
}
