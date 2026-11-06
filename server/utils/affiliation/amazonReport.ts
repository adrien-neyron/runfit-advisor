/**
 * amazonReport.ts — parseur (sans I/O) des rapports CSV Amazon Associates.
 *
 * Amazon n'expose pas les ventes par API : on importe le rapport « Commandes » / « Earnings »
 * téléchargé depuis Associates Central. Ces lignes sont par ASIN/jour, SANS lien avec un clic
 * précis → rattachement à la chaussure via l'ASIN (affiliate_links.asin), pas via click_id.
 *
 * Les en-têtes varient selon la langue/le type de rapport : on les reconnaît par alias
 * (insensibles à la casse, aux accents et à la ponctuation). Si une colonne obligatoire
 * manque, l'import échoue en listant les en-têtes trouvés (pour ajouter un alias).
 */
import { createHash } from 'node:crypto'
import { parse } from 'csv-parse/sync'
import type { ConversionStatus } from './awinTransactions'

export interface AmazonConversionRow {
  network: 'amazon'
  network_transaction_id: string
  click_id: null
  merchant: string
  asin: string
  items: number | null
  order_amount: number | null
  commission_amount: number | null
  currency: string
  status: ConversionStatus
  occurred_at: string | null
  validated_at: null
  source: 'csv'
  raw: Record<string, string>
}

export interface AmazonParseResult {
  rows: AmazonConversionRow[]
  skipped: number
  unrecognizedHeaders: string[]
}

const ALIASES = {
  asin:       ['asin'],
  date:       ['dateshipped', 'datedexpedition', 'dateexpedition', 'dateexpediee', 'date', 'orderdate', 'datedecommande'],
  items:      ['itemsshipped', 'articlesexpedies', 'articlesexpedie', 'quantite', 'items', 'quantity'],
  price:      ['price', 'prix'],
  revenue:    ['revenue', 'revenu', 'chiffredaffaires', 'ca'],
  commission: ['adfees', 'fraisdepublicite', 'fraispublicitaires', 'commission', 'earnings', 'gains', 'bounty'],
  tracking:   ['trackingid', 'idsuivi', 'iddesuivi', 'idedesuivi'],
} as const

/** minuscules, sans accents, sans ponctuation/espaces */
export function normalizeHeader(h: string): string {
  return h
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/** "12,34" · "12.34" · "1.234,56" · "1,234.56" · "€ 12,34" · "-3,10" */
export function parseAmount(raw: string | undefined): number | null {
  if (raw === undefined) return null
  let s = raw.replace(/[^\d.,-]/g, '')
  if (!s || s === '-') return null
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  if (lastComma > -1 && lastDot > -1) {
    // le dernier séparateur est le séparateur décimal
    s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else if (lastComma > -1) {
    s = s.replace(',', '.')
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/** Accepte YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, et "Month D, YYYY" (Date.parse). */
export function parseReportDate(raw: string | undefined): string | null {
  if (!raw) return null
  const s = raw.trim()
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toISOString()
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/)
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])).toISOString()
  // "September 3, 2026" : Date.parse lit en heure locale → on reprend jour/mois/an en UTC
  const t = Date.parse(s)
  if (Number.isNaN(t)) return null
  const d = new Date(t)
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString()
}

function findColumn(headers: string[], aliases: readonly string[]): number {
  const norm = headers.map(normalizeHeader)
  for (const a of aliases) {
    const i = norm.indexOf(a)
    if (i > -1) return i
  }
  return -1
}

export function parseAmazonReport(csvText: string, merchantSlug = 'amazon-fr'): AmazonParseResult {
  const text = csvText.replace(/^\uFEFF/, '')
  const firstLines = text.split(/\r?\n/).slice(0, 5).join('\n')
  const delimiter = (firstLines.match(/\t/g)?.length ?? 0) > (firstLines.match(/,/g)?.length ?? 0) ? '\t' : ','

  // Les rapports Amazon commencent souvent par une ligne de titre : on cherche la ligne d'en-têtes.
  const records: string[][] = parse(text, {
    delimiter,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
  })
  const headerIdx = records.findIndex(r => findColumn(r, ALIASES.asin) > -1)
  if (headerIdx === -1) {
    const sample = (records[0] ?? []).join(' | ')
    throw new Error(`Colonne ASIN introuvable. Première ligne du fichier : « ${sample} »`)
  }

  const headers = records[headerIdx]
  const col = {
    asin:       findColumn(headers, ALIASES.asin),
    date:       findColumn(headers, ALIASES.date),
    items:      findColumn(headers, ALIASES.items),
    price:      findColumn(headers, ALIASES.price),
    revenue:    findColumn(headers, ALIASES.revenue),
    commission: findColumn(headers, ALIASES.commission),
    tracking:   findColumn(headers, ALIASES.tracking),
  }

  const missing = (['date', 'commission'] as const).filter(k => col[k] === -1)
  if (missing.length) {
    throw new Error(
      `Colonnes obligatoires manquantes : ${missing.join(', ')}. En-têtes trouvés : ${headers.join(' | ')}`,
    )
  }

  const known = new Set(Object.values(col).filter(i => i > -1))
  const unrecognizedHeaders = headers.filter((_, i) => !known.has(i))

  const rows: AmazonConversionRow[] = []
  const seen = new Map<string, number>() // signature → occurrences (lignes identiques légitimes)
  let skipped = 0

  for (const rec of records.slice(headerIdx + 1)) {
    const asin = (rec[col.asin] ?? '').trim().toUpperCase()
    const commission = parseAmount(rec[col.commission])
    const occurredAt = parseReportDate(rec[col.date])
    // lignes de total / vides / non-ASIN
    if (!/^[A-Z0-9]{10}$/.test(asin) || commission === null || !occurredAt) {
      skipped++
      continue
    }

    const items = col.items > -1 ? parseAmount(rec[col.items]) : null
    const price = col.price > -1 ? parseAmount(rec[col.price]) : null
    const revenue = col.revenue > -1 ? parseAmount(rec[col.revenue]) : null
    const tracking = col.tracking > -1 ? rec[col.tracking] ?? '' : ''

    const signature = [occurredAt, asin, tracking, items, price, revenue, commission].join('|')
    const n = (seen.get(signature) ?? 0) + 1
    seen.set(signature, n)
    // id déterministe → ré-importer le même fichier (ou un rapport qui chevauche) ne duplique rien
    const id = createHash('sha256').update(`${signature}|${n}`).digest('hex').slice(0, 32)

    const raw: Record<string, string> = {}
    headers.forEach((h, i) => { raw[h] = rec[i] ?? '' })

    rows.push({
      network: 'amazon',
      network_transaction_id: `csv-${id}`,
      click_id: null,
      merchant: merchantSlug,
      asin,
      items: items === null ? null : Math.round(items),
      // montant de la vente : "Revenue" si présent, sinon prix × quantité
      order_amount: revenue ?? (price !== null && items !== null ? Math.round(price * items * 100) / 100 : price),
      commission_amount: commission,
      currency: 'EUR',
      status: 'approved',
      occurred_at: occurredAt,
      validated_at: null,
      source: 'csv',
      raw,
    })
  }

  return { rows, skipped, unrecognizedHeaders }
}
