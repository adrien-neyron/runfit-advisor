// ============================================================
// GET /api/products — catalogue avec offres marchands
// ============================================================
// Remplace la lecture directe Supabase depuis le front.
// Compatible avec l'existant : retourne le même format que useMerchants.
//
// Query params :
//   brand?        — filtre marque (ex: "Nike")
//   maxPrice?     — prix max en €
//   inStockOnly?  — "true" pour n'afficher que les in_stock (défaut: true)
//   q?            — recherche textuelle (brand + model)
//   limit?        — nombre de résultats (défaut: 50, max: 200)
//   offset?       — pagination (défaut: 0)

import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import { z } from 'zod'

const QuerySchema = z.object({
  brand:       z.string().optional(),
  maxPrice:    z.coerce.number().positive().optional(),
  inStockOnly: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),
  q:           z.string().max(80).optional(),
  limit:       z.coerce.number().int().min(1).max(200).default(50),
  offset:      z.coerce.number().int().min(0).default(0),
})

export default defineEventHandler(async (event) => {
  const rawQuery = getQuery(event)
  const parsed   = QuerySchema.safeParse(rawQuery)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Paramètres invalides', data: parsed.error.flatten() })
  }

  const { brand, maxPrice, inStockOnly, q, limit, offset } = parsed.data
  const supabase = getSupabaseAdmin()

  // ── Requête shoes ──────────────────────────────────────────────────────────
  let shoesQuery = (supabase as any)
    .from('shoes')
    .select([
      'id', 'brand', 'model', 'description', 'prix',
      'amorti', 'drop_mm', 'poids_g', 'stabilite', 'dynamisme',
      'foulee', 'terrain', 'niveau', 'objectif', 'benefits',
      'largeur_disponible', 'slug',
      'image_url', 'image_storage_path',
    ].join(', '))
    .eq('is_active', true)
    .eq('is_draft', false)
    .range(offset, offset + limit - 1)
    .order('brand', { ascending: true })

  if (brand) {
    shoesQuery = shoesQuery.ilike('brand', `%${brand}%`)
  }

  if (q) {
    // Recherche textuelle sur brand + model (simple ilike OR)
    const term = q.replace(/[%_]/g, '\\$&')
    shoesQuery = shoesQuery.or(`brand.ilike.%${term}%,model.ilike.%${term}%`)
  }

  const { data: shoes, error: shoesError } = await shoesQuery

  if (shoesError) {
    throw createError({ statusCode: 500, message: shoesError.message })
  }

  if (!shoes || shoes.length === 0) return { products: [], total: 0 }

  // ── Offres marchands pour les chaussures retournées ────────────────────────
  const shoeIds: string[] = shoes.map((s: any) => s.id)

  let pricesQuery = (supabase as any)
    .from('shoe_prices')
    .select('product_id, retailer_name, price, affiliate_url, product_url, stock_status, logo_url, url_status, merchant_id')
    .in('product_id', shoeIds)
    .neq('url_status', 'broken')
    .order('price', { ascending: true })

  if (inStockOnly) {
    pricesQuery = pricesQuery.eq('stock_status', 'in_stock')
  }

  if (maxPrice) {
    pricesQuery = pricesQuery.lte('price', maxPrice)
  }

  const { data: prices } = await pricesQuery

  // ── Agrégation ─────────────────────────────────────────────────────────────
  const pricesByShoe: Record<string, any[]> = {}
  for (const p of (prices ?? [])) {
    if (!pricesByShoe[p.product_id]) pricesByShoe[p.product_id] = []
    pricesByShoe[p.product_id].push(p)
  }

  const products = shoes.map((shoe: any) => {
    const offers = pricesByShoe[shoe.id] ?? []
    const bestOffer = offers[0] ?? null

    return {
      id:          shoe.id,
      brand:       shoe.brand,
      model:       shoe.model,
      description: shoe.description,
      slug:        shoe.slug,
      prix:        Number(shoe.prix),
      image:       shoe.image_url ?? shoe.image_storage_path ?? null,

      // Specs
      amorti:             shoe.amorti,
      drop:               shoe.drop_mm,
      poids:              shoe.poids_g,
      stabilite:          shoe.stabilite,
      dynamisme:          shoe.dynamisme,
      foulee:             shoe.foulee,
      terrain:            shoe.terrain,
      niveau:             shoe.niveau,
      objectif:           shoe.objectif,
      benefits:           shoe.benefits,
      largeurDisponible:  shoe.largeur_disponible,

      // Prix marchand
      bestPrice:          bestOffer ? Number(bestOffer.price) : null,
      affiliateUrl:       bestOffer?.affiliate_url ?? bestOffer?.product_url ?? null,
      offers:             offers.map((o: any) => ({
        merchant:     o.retailer_name,
        price:        Number(o.price),
        affiliateUrl: o.affiliate_url ?? o.product_url,
        logo:         o.logo_url ?? null,
        inStock:      o.stock_status === 'in_stock',
      })),
    }
  })

  return { products, total: products.length }
})
