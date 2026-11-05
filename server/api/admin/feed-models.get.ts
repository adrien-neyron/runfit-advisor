// ============================================================
// GET /api/admin/feed-models?merchant=deporvillage&brand=hoka&q=trail|running&limit=300
// ============================================================
// Outil d'administration en LECTURE SEULE : liste les produits distincts d'une marque dans le flux
// (une entrée par titre sans pointure = un modèle dans un coloris), avec prix mini, stock et image.
//   brand : marque (obligatoire, comparaison sans casse sur la colonne marque)
//   q     : mots-clés optionnels (tous requis) appliqués au titre
// Ne renvoie jamais l'URL du flux (clé API). Protégé par requireAdmin.

import { requireAdmin } from '../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import { openFeedStream, iterateCsvItems, delimiterFromUrl } from '../../utils/feedStream'
import { stripTrailingSize } from '../../utils/feedMatching'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { merchant = 'deporvillage', brand = '', q = '', limit: rawLimit } =
    getQuery(event) as { merchant?: string; brand?: string; q?: string; limit?: string }
  const wanted = String(brand).trim().toLowerCase()
  if (!wanted) throw createError({ statusCode: 400, statusMessage: 'Paramètre brand requis' })
  const words = String(q).toLowerCase().split(/\s+/).filter(Boolean)
  const limit = Math.min(Math.max(Math.trunc(Number(rawLimit) || 300), 1), 1000)

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

  const groups = new Map<string, { title: string; category: string; price: number; sizes: number; inStock: boolean; image: string }>()
  let rows = 0
  const stream = await openFeedStream(url)
  for await (const { item, rows: n, row: raw } of iterateCsvItems(stream, delimiterFromUrl(url))) {
    rows = n
    if (!item || item.brand.trim().toLowerCase() !== wanted) continue
    const category = (raw.merchant_category || '').trim()
    if (!/shoes/i.test(category)) continue                       // chaussures uniquement
    const title = stripTrailingSize(item.model)
    const lower = title.toLowerCase()
    if (words.length && !words.every((w) => lower.includes(w))) continue
    const g = groups.get(title)
    if (g) { g.sizes++; g.price = Math.min(g.price, item.price); g.inStock = g.inStock || item.stockStatus === 'in_stock' }
    else if (groups.size < limit) groups.set(title, { title, category, price: item.price, sizes: 1, inStock: item.stockStatus === 'in_stock', image: item.imageUrl ?? '' })
  }

  return { merchant, brand, rowsRead: rows, count: groups.size, items: [...groups.values()].sort((a, b) => a.title.localeCompare(b.title)) }
})
