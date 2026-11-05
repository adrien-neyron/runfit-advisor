// ============================================================
// Parser — flux CSV (csv-parse)
// ============================================================
// Compatible avec les exports CSV de la plupart des réseaux
// d'affiliation (AWIN, CJ, flux maison).
//
// Colonnes attendues (insensible à la casse) :
//   id / product_id / ean   (Awin : merchant_product_id, aw_product_id)
//   brand / manufacturer
//   title / name / model
//   price / sale_price
//   product_url / url / link
//   image_url / image
//   stock_status / availability / instock

import { parse as csvParse } from 'csv-parse/sync'
import type { NormalizedProductFeedItem, StockStatus } from '../types/feed'

// ── Normalisation ────────────────────────────────────────────────────────────

function col(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const lk = key.toLowerCase()
    for (const rk of Object.keys(row)) {
      if (rk.toLowerCase() === lk && row[rk]) return row[rk].trim()
    }
  }
  return ''
}

function parseStockStatus(raw: string): StockStatus {
  const v = raw.toLowerCase()
  if (v === 'in_stock' || v === 'instock' || v === '1' || v === 'true' || v === 'yes') return 'in_stock'
  if (v === 'out_of_stock' || v === 'outofstock' || v === '0' || v === 'false' || v === 'no') return 'out_of_stock'
  if (v.includes('preorder') || v.includes('pre-order')) return 'preorder'
  return 'unknown'
}

/** Convertit une ligne CSV en produit normalisé (null si la ligne est inexploitable). */
export function normalizeCsvRow(row: Record<string, string>): NormalizedProductFeedItem | null {
  const id = col(row, 'merchant_product_id', 'aw_product_id', 'id', 'product_id', 'ean', 'sku', 'reference')
  const brand = col(row, 'brand_name', 'brand', 'manufacturer', 'marque')
  const model = col(row, 'product_name', 'title', 'name', 'model', 'nom', 'libelle')
  const priceRaw = col(row, 'search_price', 'price', 'sale_price', 'store_price', 'prix', 'tarif')
  const price = parseFloat(priceRaw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
  // Awin : merchant_deep_link = URL propre du marchand (le redirecteur ajoute lui-même le suivi Awin)
  const productUrl = col(row, 'merchant_deep_link', 'aw_deep_link', 'product_url', 'url', 'link', 'lien')
  const imageUrl = col(row, 'aw_image_url', 'merchant_image_url', 'image_url', 'image', 'image_link', 'photo') || undefined
  const stockRaw = col(row, 'in_stock', 'stock_status', 'availability', 'instock', 'disponible', 'stock')

  if (!id || !productUrl || price === 0) return null


  return {
    externalProductId: id,
    brand: brand || 'Unknown',
    model: model || id,
    price,
    currency: col(row, 'currency', 'devise') || 'EUR',
    productUrl,
    imageUrl,
    stockStatus: parseStockStatus(stockRaw),
    category: col(row, 'merchant_category', 'category_name', 'product_type', 'category') || undefined,
    description: col(row, 'description', 'short_description') || undefined,
    raw: row,
  }
}

// ── Parser principal ─────────────────────────────────────────────────────────

/**
 * Parse un flux CSV et retourne les produits normalisés.
 * Détecte automatiquement le délimiteur (virgule ou point-virgule).
 */
export function parseCsvFeed(csvContent: string): NormalizedProductFeedItem[] {
  // Détection auto du délimiteur
  const firstLine = csvContent.split('\n')[0] ?? ''
  const delimiter = firstLine.includes(';') ? ';' : ','

  let rows: Record<string, string>[]
  try {
    rows = csvParse(csvContent, {
      delimiter,
      columns: true,         // première ligne = headers
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as Record<string, string>[]
  } catch {
    return []
  }

  const results: NormalizedProductFeedItem[] = []
  for (const row of rows) {
    const item = normalizeCsvRow(row)
    if (item) results.push(item)
  }

  return results
}
