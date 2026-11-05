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
import { matchShoe, type CatalogShoe } from '../utils/feedMatching'
import { openFeedStream, iterateCsvItems, delimiterFromUrl } from '../utils/feedStream'
import type {
  MerchantConfig,
  NormalizedProductFeedItem,
  FeedSyncResult,
  FeedFormat,
  FeedMatchPreview,
  FeedDiagnostics,
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
// Le rapprochement est strict (voir utils/feedMatching.ts) : on préfère ignorer un produit
// douteux plutôt que de lier la mauvaise version d'une chaussure.

async function loadCatalog(): Promise<CatalogShoe[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('shoes')
    .select('id, brand, model')
    .eq('is_active', true)
  if (error) throw new Error(`Catalogue illisible : ${error.message}`)
  return (data ?? []) as CatalogShoe[]
}

/**
 * L'URL d'un flux Awin contient la clé API du compte : on ne la stocke pas en base
 * (la table merchants est lisible publiquement). On y met `env:NOM_VARIABLE`.
 */
function resolveFeedUrl(feedUrl: string): string {
  if (!feedUrl.startsWith('env:')) return feedUrl
  const name = feedUrl.slice(4).trim()
  const value = process.env[name]
  if (!value) throw new Error(`Variable d'environnement ${name} absente (URL du flux)`)
  return value
}

type FeedGender = 'homme' | 'femme' | 'enfant'

interface Chosen {
  item: NormalizedProductFeedItem
  shoeId: string
  extraTokens: number
  gender: FeedGender
  /** Même lien produit (donc même coloris) que celui déjà enregistré : on le conserve d'une synchro à l'autre */
  sticky: boolean
}

/**
 * Variante visée par une ligne du flux, d'après son titre et son URL.
 * Sans mention explicite = version homme (convention Deporvillage). « enfant » est écarté : hors cible.
 */
function genderOf(item: NormalizedProductFeedItem): FeedGender {
  const text = `${item.model} ${item.productUrl}`
  if (/\b(enfant|enfants|junior|kid|kids|nino|niño)\b|-(enfant|junior)\b/i.test(text)) return 'enfant'
  if (/\b(femme|femmes|woman|women|womens|mujer)\b|-(femme|women|womens)\b/i.test(text)) return 'femme'
  return 'homme'
}

// Un même modèle apparaît plusieurs fois dans un flux (homme/femme, coloris) :
// pour chaque variante (homme / femme), on garde la ligne en stock, au titre le plus proche du modèle, puis la moins chère.
function isBetter(a: Chosen, b: Chosen): boolean {
  const stock = (c: Chosen) => (c.item.stockStatus === 'in_stock' ? 0 : 1)
  if (stock(a) !== stock(b)) return stock(a) < stock(b)
  // Variante déjà proposée aux utilisateurs (coloris inclus) : on ne la change pas pour quelques centimes
  if (a.sticky !== b.sticky) return a.sticky
  if (a.extraTokens !== b.extraTokens) return a.extraTokens < b.extraTokens
  return a.item.price < b.item.price
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
  gender: 'homme' | 'femme' | 'unisexe' = 'unisexe',
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
    .eq('gender', gender)
    .maybeSingle()

  const priceChanged = existing && Number(existing.price) !== item.price

  const row = {
    product_id:          shoeId ?? item.externalProductId,
    retailer_name:       merchant.name,
    gender,
    price:               item.price,
    currency:            item.currency,
    product_url:         item.productUrl,
    affiliate_url:       affiliateUrl,
    stock_status:        item.stockStatus,
    logo_url:            merchant.logoUrl,
    url_status:          'valid',
    is_search_url:       false, // les flux fournissent des pages produit directes
    merchant_id:         merchant.id,
    external_product_id: item.externalProductId,
    last_checked_at:     new Date().toISOString(),
    updated_at:          new Date().toISOString(),
    // Photo du marchand : correspond exactement à la variante (couleur / genre) du lien
    merchant_image_url:  item.imageUrl ?? null,
  }

  const upsertOptions = { onConflict: 'product_id,retailer_name,gender', ignoreDuplicates: false }
  let { error } = await (supabase as any).from('shoe_prices').upsert(row, upsertOptions)

  // Migration « merchant_image_url » pas encore appliquée : on enregistre l'offre sans l'image
  if (error && /merchant_image_url/.test(error.message)) {
    const { merchant_image_url: _unused, ...rowWithoutImage } = row
    ;({ error } = await (supabase as any).from('shoe_prices').upsert(rowWithoutImage, upsertOptions))
  }

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
export async function syncMerchant(
  merchant: MerchantConfig,
  opts: { dryRun?: boolean } = {},
): Promise<FeedSyncResult> {
  const dryRun = !!opts.dryRun
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

  // 1. Lecture du flux + rapprochement strict, ligne par ligne (un flux Awin peut dépasser 200 000 lignes).
  //    On ne garde en mémoire que la meilleure ligne par chaussure.
  const chosenByShoe = new Map<string, Chosen>() // clé : « chaussure|variante »
  // Liens produit déjà enregistrés : sert à garder le même coloris d'une synchro à l'autre
  const currentUrls = new Map<string, string>()
  {
    const { data: current } = await (getSupabaseAdmin() as any)
      .from('shoe_prices')
      .select('product_id, gender, product_url')
      .eq('retailer_name', merchant.name)
    for (const r of (current ?? []) as any[]) {
      if (r.product_url) currentUrls.set(`${r.product_id}|${r.gender}`, r.product_url)
    }
  }
  const unmatchedSample: string[] = []
  let itemsFetched = 0
  let catalog: CatalogShoe[]
  // Diagnostics (simulation uniquement)
  let columns: string[] = []
  let usableRows = 0
  const brandCounts = new Map<string, number>()
  const sampleTitles: string[] = []
  try {
    catalog = await loadCatalog()
    const brandKeys = new Set(catalog.map((s) => s.brand.toLowerCase().replace(/[^a-z0-9]/g, '')))
    const brandNames = new Set(catalog.map((s) => s.brand.toLowerCase()))

    const consume = (item: NormalizedProductFeedItem) => {
      if (dryRun) {
        usableRows++
        brandCounts.set(item.brand, (brandCounts.get(item.brand) ?? 0) + 1)
        if (sampleTitles.length < 15) {
          const lower = item.model.toLowerCase()
          if ([...brandNames].some((b) => lower.includes(b))) sampleTitles.push(item.model)
        }
      }
      const m = matchShoe({ brand: item.brand, title: item.model }, catalog)
      if (!m) {
        if (dryRun && unmatchedSample.length < 30 && brandKeys.has(item.brand.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
          unmatchedSample.push(`${item.brand} — ${item.model}`)
        }
        return
      }
      const gender = genderOf(item)
      if (gender === 'enfant') return
      const key = `${m.shoeId}|${gender}`
      const candidate: Chosen = { item, shoeId: m.shoeId, extraTokens: m.extraTokens, gender, sticky: currentUrls.get(key) === item.productUrl }
      const current = chosenByShoe.get(key)
      if (!current || isBetter(candidate, current)) chosenByShoe.set(key, candidate)
    }

    const url = resolveFeedUrl(merchant.feedUrl)
    if (merchant.feedFormat === 'csv') {
      const stream = await openFeedStream(url)
      for await (const { item, rows, row } of iterateCsvItems(stream, delimiterFromUrl(url))) {
        itemsFetched = rows
        if (rows === 1) columns = Object.keys(row)
        if (item) consume(item)
      }
    } else {
      const items = parseFeed(await downloadFeed(url), merchant.feedFormat)
      itemsFetched = items.length
      items.forEach(consume)
    }
  } catch (err) {
    const result: FeedSyncResult = {
      merchantSlug:  merchant.slug,
      status:        'error',
      itemsFetched,
      itemsUpserted: 0,
      itemsRemoved:  0,
      errorMessage:  `Lecture du flux échouée : ${(err as Error).message}`,
      durationMs:    Date.now() - startMs,
    }
    if (!dryRun) await writeSyncLog(merchant, result, startedAt)
    return result
  }
  console.log(`[feedSync] ${merchant.slug}: ${itemsFetched} lignes lues, ${chosenByShoe.size} chaussures rapprochées`)
  const chosen = Array.from(chosenByShoe.values())

  // 2. Simulation : on montre ce qui serait écrit, sans rien modifier
  if (dryRun) {
    const preview: FeedMatchPreview[] = chosen.map((c) => ({
      shoeId: c.shoeId,
      gender: c.gender,
      title: c.item.model,
      price: c.item.price,
      stockStatus: c.item.stockStatus,
      productUrl: c.item.productUrl,
      imageUrl: c.item.imageUrl,
    }))
    return {
      merchantSlug: merchant.slug,
      status: 'success',
      itemsFetched,
      itemsUpserted: 0,
      itemsRemoved: 0,
      durationMs: Date.now() - startMs,
      preview,
      unmatchedSample,
      diagnostics: {
        columns,
        usableRows,
        topBrands: [...brandCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([b, n]) => `${b} (${n})`),
        sampleTitles,
      } satisfies FeedDiagnostics,
    }
  }

  // 3. Écriture par lots de 10 pour ne pas saturer Supabase
  let itemsUpserted = 0
  const seenExternalIds = new Set<string>(chosen.map((c) => c.item.externalProductId))
  const BATCH = 10
  for (let i = 0; i < chosen.length; i += BATCH) {
    await Promise.all(
      chosen.slice(i, i + BATCH).map(async ({ item, shoeId, gender }) => {
        const { upserted } = await upsertShoePrice(merchant, item, shoeId, gender)
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
    itemsFetched,
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
