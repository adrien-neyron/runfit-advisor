// ============================================================
// GET /api/admin/feed-search?merchant=deporvillage&q=hoka bondi|brooks ghost&limit=12
// ============================================================
// Outil d'administration en LECTURE SEULE : cherche des produits dans le flux d'un marchand
// (titres, prix, stock) pour vérifier quelles versions d'un modèle sont réellement vendues.
//   q     : une ou plusieurs recherches séparées par « | » ; tous les mots d'une recherche doivent figurer
//   limit : nombre maximal de titres distincts par recherche (12 par défaut, 40 max)
// Ne renvoie jamais l'URL du flux (elle contient la clé API). Protégé par requireAdmin.

import { requireAdmin } from '../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import { openFeedStream, iterateCsvItems, delimiterFromUrl } from '../../utils/feedStream'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { merchant = 'deporvillage', q = '', limit: rawLimit } = getQuery(event) as { merchant?: string; q?: string; limit?: string }
  const limit = Math.min(Math.max(Math.trunc(Number(rawLimit) || 12), 1), 40)
  const groups = String(q).split('|').map((g) => g.trim().toLowerCase()).filter(Boolean).slice(0, 20)
  if (!groups.length) throw createError({ statusCode: 400, statusMessage: 'Paramètre q requis' })

  const { data: row, error } = await (getSupabaseAdmin() as any)
    .from('merchants')
    .select('feed_url, feed_format')
    .eq('slug', merchant)
    .eq('is_active', true)
    .single()
  if (error || !row) throw createError({ statusCode: 404, statusMessage: `Marchand introuvable : ${merchant}` })
  if (row.feed_format !== 'csv') throw createError({ statusCode: 422, statusMessage: 'Seuls les flux CSV sont pris en charge ici' })

  let url: string = row.feed_url
  if (url.startsWith('env:')) {
    const value = process.env[url.slice(4).trim()]
    if (!value) throw createError({ statusCode: 500, statusMessage: "Variable d'environnement du flux absente" })
    url = value
  }

  const found = new Map<string, Map<string, { title: string; brand: string; price: number; stock: string }>>()
  groups.forEach((g) => found.set(g, new Map()))
  let rows = 0

  const stream = await openFeedStream(url)
  for await (const { item, rows: n } of iterateCsvItems(stream, delimiterFromUrl(url))) {
    rows = n
    if (!item) continue
    const text = `${item.brand} ${item.model}`.toLowerCase()
    for (const g of groups) {
      const bucket = found.get(g)!
      if (bucket.size >= limit || bucket.has(item.model)) continue
      if (g.split(/\s+/).every((w) => text.includes(w))) {
        bucket.set(item.model, { title: item.model, brand: item.brand, price: item.price, stock: item.stockStatus })
      }
    }
    if ([...found.values()].every((b) => b.size >= limit)) break
  }

  return {
    merchant,
    rowsRead: rows,
    results: Object.fromEntries(groups.map((g) => [g, [...found.get(g)!.values()]])),
  }
})
