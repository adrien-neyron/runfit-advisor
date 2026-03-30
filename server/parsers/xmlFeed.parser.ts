// ============================================================
// Parser — flux XML (format Kelkoo / Google Shopping / Générique)
// ============================================================
// Gère les formats XML courants des réseaux d'affiliation :
//   - Google Product Feed  (channel > item > g:* namespace)
//   - Kelkoo              (products > product)
//   - AWIN generic        (Feed > Products > Product)

import { XMLParser } from 'fast-xml-parser'
import type { NormalizedProductFeedItem, StockStatus } from '../types/feed'

// ── Options du parseur ───────────────────────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  // Les valeurs numériques peuvent être des prix — on garde tout en string
  parseTagValue: false,
  parseAttributeValue: false,
  // Namespaces Google Shopping (g:price, g:brand, etc.)
  removeNSPrefix: true,
})

// ── Normalisation stock ──────────────────────────────────────────────────────

function parseStockStatus(raw?: string): StockStatus {
  if (!raw) return 'unknown'
  const v = raw.toLowerCase()
  if (v.includes('in stock') || v === 'instock' || v === '1' || v === 'true') return 'in_stock'
  if (v.includes('out') || v === 'outofstock' || v === '0' || v === 'false') return 'out_of_stock'
  if (v.includes('preorder') || v.includes('pre-order')) return 'preorder'
  return 'unknown'
}

// ── Extraction d'un item XML vers NormalizedProductFeedItem ──────────────────

function extractItem(item: Record<string, unknown>): NormalizedProductFeedItem | null {
  // Google Shopping namespace (g:id, g:brand, g:price…)
  const id =
    str(item.id) ||
    str(item['g:id']) ||
    str((item as any).id?.['#text'])

  const brand =
    str(item.brand) ||
    str(item['g:brand']) ||
    str(item.manufacturer) ||
    ''

  const model =
    str(item.model) ||
    str(item['g:title']) ||
    str(item.title) ||
    str(item.name) ||
    ''

  const priceRaw =
    str(item.price) ||
    str(item['g:price']) ||
    str(item.sale_price) ||
    str(item['g:sale_price']) ||
    '0'

  const price = parseFloat(priceRaw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0

  const productUrl =
    str(item.link) ||
    str(item['g:link']) ||
    str(item.url) ||
    ''

  const imageUrl =
    str(item.image_link) ||
    str(item['g:image_link']) ||
    str(item.image) ||
    undefined

  const stockRaw =
    str(item.availability) ||
    str(item['g:availability']) ||
    str(item.stock_status) ||
    str(item.instock) ||
    undefined

  if (!id || !productUrl || price === 0) return null

  const fullName = `${brand} ${model}`.trim()
  const [parsedBrand, ...modelParts] = fullName.split(' ')

  return {
    externalProductId: id,
    brand: brand || parsedBrand || 'Unknown',
    model: model || modelParts.join(' ') || fullName,
    price,
    currency: 'EUR',
    productUrl,
    imageUrl,
    stockStatus: parseStockStatus(stockRaw),
    description: str(item.description) || str(item['g:description']) || undefined,
    raw: item as Record<string, unknown>,
  }
}

// ── Point d'entrée principal ─────────────────────────────────────────────────

/**
 * Parse un flux XML et retourne les produits normalisés.
 * Tente de détecter le format automatiquement (Google Shopping, Kelkoo, AWIN).
 */
export function parseXmlFeed(xml: string): NormalizedProductFeedItem[] {
  const doc = xmlParser.parse(xml)

  // Chemin Google Shopping / RSS : rss.channel.item[]
  const rssItems = doc?.rss?.channel?.item
  if (rssItems) return toArray(rssItems).flatMap(extract)

  // Chemin AWIN générique : Feed.Products.Product[]
  const awinItems = doc?.Feed?.Products?.Product ?? doc?.feed?.products?.product
  if (awinItems) return toArray(awinItems).flatMap(extract)

  // Chemin Kelkoo : products.product[]
  const kelkooItems = doc?.products?.product
  if (kelkooItems) return toArray(kelkooItems).flatMap(extract)

  // Chemin générique : racine > items[]
  for (const rootKey of Object.keys(doc ?? {})) {
    const root = doc[rootKey]
    if (typeof root === 'object' && root !== null) {
      for (const listKey of Object.keys(root)) {
        const list = (root as Record<string, unknown>)[listKey]
        if (Array.isArray(list) && list.length > 0) {
          return list.flatMap(extract)
        }
      }
    }
  }

  return []
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function str(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function toArray<T>(v: T | T[]): T[] {
  return Array.isArray(v) ? v : [v]
}

function extract(item: unknown): NormalizedProductFeedItem[] {
  if (!item || typeof item !== 'object') return []
  const result = extractItem(item as Record<string, unknown>)
  return result ? [result] : []
}
