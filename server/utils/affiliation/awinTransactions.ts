/**
 * awinTransactions.ts — mapping pur (sans I/O) des transactions de l'API Awin Publisher
 * vers nos lignes `affiliate_conversions`.
 *
 * API : GET https://api.awin.com/publishers/{publisherId}/transactions/
 *       ?startDate=YYYY-MM-DDThh:mm:ss&endDate=...&timezone=UTC   (fenêtre max. 31 jours)
 *       Authorization: Bearer <token API Awin>
 */

export interface AwinTransaction {
  id: number | string
  advertiserId: number | string
  commissionStatus?: string // pending | approved | declined | deleted
  commissionAmount?: { amount?: number | string; currency?: string }
  saleAmount?: { amount?: number | string; currency?: string }
  clickRefs?: { clickRef?: string | null } | null
  transactionDate?: string
  validationDate?: string | null
}

export type ConversionStatus = 'pending' | 'approved' | 'declined'

export interface ConversionRow {
  network: 'awin'
  network_transaction_id: string
  click_id: string | null
  merchant: string | null
  order_amount: number | null
  commission_amount: number | null
  currency: string
  status: ConversionStatus
  occurred_at: string | null
  validated_at: string | null
  source: 'api'
  raw: unknown
}

export function mapAwinStatus(status?: string): ConversionStatus {
  switch ((status ?? '').toLowerCase()) {
    case 'approved': return 'approved'
    case 'declined':
    case 'deleted':  return 'declined'
    default:         return 'pending'
  }
}

const HEX32 = /^[0-9a-f]{32}$/i

/** Reconstruit un UUID depuis notre clickref (UUID sans tirets). Null si le format ne correspond pas. */
export function clickRefToUuid(ref?: string | null): string | null {
  if (!ref || !HEX32.test(ref)) return null
  const h = ref.toLowerCase()
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

/** Awin renvoie des dates sans fuseau ; on demande timezone=UTC, donc on les lit en UTC. */
export function parseAwinDate(raw?: string | null): string | null {
  if (!raw) return null
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(raw)
  const d = new Date(hasZone ? raw : `${raw}Z`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * @param advertiserToSlug  advertiserId (awinmid) → merchants.slug
 */
export function mapAwinTransaction(
  t: AwinTransaction,
  advertiserToSlug: Map<string, string>,
): ConversionRow {
  return {
    network: 'awin',
    network_transaction_id: String(t.id),
    click_id: clickRefToUuid(t.clickRefs?.clickRef),
    merchant: advertiserToSlug.get(String(t.advertiserId)) ?? null,
    order_amount: num(t.saleAmount?.amount),
    commission_amount: num(t.commissionAmount?.amount),
    currency: t.commissionAmount?.currency ?? t.saleAmount?.currency ?? 'EUR',
    status: mapAwinStatus(t.commissionStatus),
    occurred_at: parseAwinDate(t.transactionDate),
    validated_at: parseAwinDate(t.validationDate),
    source: 'api',
    raw: t,
  }
}

/** Découpe [from, to] en fenêtres ≤ `maxDays` (Awin limite à 31 jours par appel). */
export function splitWindows(from: Date, to: Date, maxDays = 30): Array<{ start: Date; end: Date }> {
  const out: Array<{ start: Date; end: Date }> = []
  const step = maxDays * 86_400_000
  for (let t = from.getTime(); t < to.getTime(); t += step) {
    out.push({ start: new Date(t), end: new Date(Math.min(t + step, to.getTime())) })
  }
  return out
}

/** Format attendu par Awin : YYYY-MM-DDThh:mm:ss (UTC, sans millisecondes ni "Z"). */
export function toAwinDate(d: Date): string {
  return d.toISOString().slice(0, 19)
}
