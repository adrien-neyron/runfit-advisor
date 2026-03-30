// ============================================================
// Parser — flux CSV (csv-parse)
// ============================================================
// Compatible avec les exports CSV de la plupart des réseaux
// d'affiliation (AWIN, CJ, flux maison).
//
// Colonnes attendues (insensible à la casse) :
//   id / product_id / ean
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
    const id = col(row, 'id', 'product_id', 'ean', 'sku', 'reference')
    const brand = col(row, 'brand', 'manufacturer', 'marque')
    const model = col(row, 'title', 'name', 'model', 'nom', 'libelle')
    const priceRaw = col(row, 'price', 'sale_price', 'prix', 'tarif')
    const price = parseFloat(priceRaw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
    const productUrl = col(row, 'product_url', 'url', 'link', 'lien')
    const imageUrl = col(row, 'image_url', 'image', 'image_link', 'photo') || undefined
    const stockRaw = col(row, 'stock_status', 'availability', 'instock', 'disponible', 'stock')

    if (!id || !productUrl || price === 0) continue

    results.push({
      externalProductId: id,
      brand: brand || 'Unknown',
      model: model || id,
      price,
      currency: col(row, 'currency', 'devise') || 'EUR',
      productUrl,
      imageUrl,
      stockStatus: parseStockStatus(stockRaw),
      description: col(row, 'description', 'short_description') || undefined,
      raw: row,
    })
  }

  return results
}
