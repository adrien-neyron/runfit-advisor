import { getSupabaseAdmin } from '~/server/utils/supabaseAdmin'

/**
 * GET /api/offers?ids=a,b,c      → offres idéales de ces chaussures
 * GET /api/offers?available=1    → identifiants des chaussures qui ont au moins une offre idéale
 *
 * Source unique : la vue v_shoe_offers (liens produit directs, marchands monétisables,
 * jamais de page de recherche). Le prix n'est renseigné que s'il a moins de 7 jours.
 */

export interface ShoeOfferDto {
  merchantSlug: string
  merchantName: string
  network: string | null
  /** null si le prix n'est pas assez récent pour être affiché */
  price: number | null
  priceCheckedAt: string | null
  /** Endpoint de redirection (tracking + attribution) : seul lien à utiliser côté client */
  redirectUrl: string
  /** Photo fournie par le marchand : c'est exactement la variante vers laquelle mène le lien */
  imageUrl: string | null
}

const ID_RE = /^[a-z0-9][a-z0-9-]{0,80}$/
const MAX_IDS = 200

export default defineEventHandler(async (event) => {
  const { ids, available, country: rawCountry, sexe: rawSexe } = getQuery(event) as {
    ids?: string
    available?: string
    country?: string
    sexe?: string
  }
  // Variante homme/femme : une offre n'est montrée que si elle correspond au profil (ou est mixte)
  const sexe = rawSexe === 'femme' ? 'femme' : 'homme'
  const genders = [sexe, 'unisexe']
  const country = String(rawCountry ?? 'FR').toUpperCase().slice(0, 2)

  // Les offres changent peu : 5 min de cache CDN suffisent, sans servir d'offre périmée longtemps
  setResponseHeader(event, 'Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

  const supabase = getSupabaseAdmin()

  if (available) {
    const { data, error } = await supabase.from('v_shoe_offers').select('shoe_id, merchant_image_url').in('gender', genders)
    if (error) {
      console.error('[offers] available lookup failed:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Offers unavailable' })
    }
    const rows = (data ?? []) as any[]
    const all = new Set<string>(rows.map(r => r.shoe_id as string))
    // Une chaussure sans aucune photo (ni marchand, ni catalogue) n'est jamais proposée
    const withOfferImage = new Set<string>(
      rows.filter(r => typeof r.merchant_image_url === 'string' && r.merchant_image_url.startsWith('https://')).map(r => r.shoe_id as string),
    )
    const needCatalogue = [...all].filter(id => !withOfferImage.has(id))
    const withCatalogueImage = new Set<string>()
    if (needCatalogue.length) {
      const { data: shoes } = await supabase.from('shoes').select('id, image_url, image_url_cdn').in('id', needCatalogue)
      for (const s of (shoes ?? []) as any[]) if (s.image_url_cdn || s.image_url) withCatalogueImage.add(s.id as string)
    }
    const shoeIds = [...all].filter(id => withOfferImage.has(id) || withCatalogueImage.has(id))
    return { shoeIds }
  }

  const list = String(ids ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(s => ID_RE.test(s))
    .slice(0, MAX_IDS)

  if (!list.length) return { offers: {} as Record<string, ShoeOfferDto[]> }

  const { data, error } = await supabase
    .from('v_shoe_offers')
    .select('shoe_id, merchant_slug, merchant_name, network, price, price_checked_at, priority_rank, merchant_image_url, gender')
    .in('shoe_id', list)
    .in('gender', genders)
    .order('priority_rank', { ascending: true })

  if (error) {
    console.error('[offers] lookup failed:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Offers unavailable' })
  }

  // Un marchand peut avoir une offre mixte ET une offre à la variante du profil : on garde la variante exacte
  const picked = new Map<string, any>()
  for (const row of (data ?? []) as any[]) {
    const key = `${row.shoe_id}|${row.merchant_slug}`
    const prev = picked.get(key)
    if (!prev || (row.gender === sexe && prev.gender !== sexe)) picked.set(key, row)
  }

  const offers: Record<string, ShoeOfferDto[]> = {}
  for (const row of picked.values()) {
    ;(offers[row.shoe_id] ??= []).push({
      merchantSlug: row.merchant_slug,
      merchantName: row.merchant_name,
      network: row.network ?? null,
      price: row.price != null ? Number(row.price) : null,
      priceCheckedAt: row.price_checked_at ?? null,
      imageUrl: typeof row.merchant_image_url === 'string' && row.merchant_image_url.startsWith('https://') ? row.merchant_image_url : null,
      redirectUrl: `/api/affiliate/${encodeURIComponent(row.merchant_slug)}/${encodeURIComponent(row.shoe_id)}?country=${country}&sexe=${sexe}`,
    })
  }

  // Meilleur prix d'abord quand les prix sont connus et récents, sinon ordre de priorité
  for (const arr of Object.values(offers)) {
    arr.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
  }

  return { offers }
})
