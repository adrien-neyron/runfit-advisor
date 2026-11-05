// ============================================================
// GET /api/admin/feed-scan?merchant=deporvillage&top=60
// ============================================================
// Outil d'administration en LECTURE SEULE : cartographie le flux d'un marchand
// (catégories, produits en stock avec image) pour évaluer ce qui peut alimenter le catalogue.
// Ne renvoie jamais l'URL du flux (clé API). Protégé par requireAdmin.

import { requireAdmin } from '../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import { openFeedStream, iterateCsvItems, delimiterFromUrl } from '../../utils/feedStream'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { merchant = 'deporvillage', top: rawTop } = getQuery(event) as { merchant?: string; top?: string }
  const top = Math.min(Math.max(Math.trunc(Number(rawTop) || 60), 1), 200)

  const { data: row, error } = await (getSupabaseAdmin() as any)
    .from('merchants').select('feed_url, feed_format').eq('slug', merchant).eq('is_active', true).single()
  if (error || !row) throw createError({ statusCode: 404, statusMessage: `Marchand introuvable : ${merchant}` })
  if (row.feed_format !== 'csv') throw createError({ statusCode: 422, statusMessage: 'Seuls les flux CSV sont pris en charge ici' })

  let url: string = row.feed_url
  if (url.startsWith('env:')) {
    const value = process.env[url.slice(4).trim()]
    if (!value) throw createError({ statusCode: 500, statusMessage: "Variable d'environnement du flux absente" })
    url = value
  }

  const cats = new Map<string, { n: number; inStock: number; withImage: number; sample: string }>()
  let rows = 0
  const stream = await openFeedStream(url)
  for await (const { item, rows: n, row: raw } of iterateCsvItems(stream, delimiterFromUrl(url))) {
    rows = n
    if (!item) continue
    const cat = (raw.merchant_category || item.category || '(sans catégorie)').trim()
    const c = cats.get(cat) ?? { n: 0, inStock: 0, withImage: 0, sample: item.model }
    c.n++
    if (item.stockStatus === 'in_stock') c.inStock++
    if (item.imageUrl) c.withImage++
    cats.set(cat, c)
  }

  const list = [...cats.entries()].map(([category, v]) => ({ category, ...v })).sort((a, b) => b.n - a.n)
  return { merchant, rowsRead: rows, categoryCount: list.length, categories: list.slice(0, top) }
})
