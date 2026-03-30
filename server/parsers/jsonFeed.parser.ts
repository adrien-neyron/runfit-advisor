// ============================================================
// Parser — flux JSON (format libre / API REST)
// ============================================================
// Compatible avec les exports JSON de la plupart des marchands
// et APIs de type Amazon Product Advertising.
//
// Tente de détecter automatiquement la structure du JSON.

import type { NormalizedProductFeedItem, StockStatus } from '../types/feed'

// ── Normalisation ────────────────────────────────────────────────────────────

function str(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function parseStockStatus(raw: string): StockStatus {
  const v = raw.toLowerCase()
  if (['in_stock', 'instock', '1', 'true', 'yes', 'available'].includes(v)) return 'in_stock'
  if (['out_of_stock', 'outofstock', '0', 'false', 'no', 'unavailable'].includes(v)) return 'out_of_stock'
  if (v.includes('preorder') || v.includes('pre-order')) return 'preorder'
  return 'unknown'
}

function get(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = obj[key]
    if (v !== undefined && v !== null && v !== '') return str(v)
  }
  return ''
}

// ── Extraction d'un item ─────────────────────────────────────────────────────

function extractItem(item: unknown): NormalizedProductFeedItem | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>

  const id = get(o, 'id', 'product_id', 'sku', 'ean', 'asin', 'reference', 'externalId', 'external_product_id')
  const brand = get(o, 'brand', 'manufacturer', 'marque')
  const model = get(o, 'title', 'name', 'model', 'nom', 'libelle', 'productName', 'product_name')
  const priceRaw = get(o, 'price', 'sale_price', 'prix', 'current_price', 'offer_price')
  const price = parseFloat(priceRaw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
  const productUrl = get(o, 'url', 'product_url', 'link', 'href', 'productUrl')
  const imageUrl = get(o, 'image_url', 'image', 'image_link', 'thumbnail', 'imageUrl') || undefined
  const stockRaw = get(o, 'stock_status', 'availability', 'instock', 'in_stock', 'available', 'stockStatus')

  if (!id || !productUrl || price === 0) return null

  return {
    externalProductId: id,
    brand: brand || 'Unknown',
    model: model || id,
    price,
    currency: get(o, 'currency', 'devise') || 'EUR',
    productUrl,
    imageUrl,
    stockStatus: parseStockStatus(stockRaw),
    description: get(o, 'description', 'short_description', 'excerpt') || undefined,
    raw: o,
  }
}

// ── Détection de la liste de produits dans le JSON ───────────────────────────

function findProductList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>

    // Cherche une clé contenant un tableau (products, items, data, results, feed…)
    const listKeys = ['products', 'items', 'data', 'results', 'feed', 'offers', 'articles']
    for (const key of listKeys) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[]
    }

    // Fallback : premier tableau trouvé
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key]) && (obj[key] as unknown[]).length > 0) {
        return obj[key] as unknown[]
      }
    }
  }

  return []
}

// ── Point d'entrée principal ─────────────────────────────────────────────────

/**
 * Parse un flux JSON et retourne les produits normalisés.
 */
export function parseJsonFeed(jsonContent: string): NormalizedProductFeedItem[] {
  let data: unknown
  try {
    data = JSON.parse(jsonContent)
  } catch {
    return []
  }

  const list = findProductList(data)
  return list.flatMap((item) => {
    const result = extractItem(item)
    return result ? [result] : []
  })
}
