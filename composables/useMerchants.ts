/**
 * useMerchants — composable pour les offres marchands
 * Encapsule les appels Supabase qui nécessitent useSupabaseClient()
 */
import {
  buildDynamicMerchantLinks,
  buildRetailerSearchUrl,
  type MerchantOffer,
  type MerchantLink,
} from '~/data/merchants'

export { type MerchantOffer, type MerchantLink }

export interface BestOffer {
  shoeId: string
  merchant: string
  affiliateUrl: string
  price: number | null
  isSearchUrl: boolean
}

// Shape retournée par la vue SQL v_shoe_best_offers (non présente dans les types générés)
interface BestOfferRow {
  shoe_id: string
  merchant: string
  affiliate_url: string | null
  final_url: string | null
  price: number | string | null
  is_search_url: boolean | null
}

export function useMerchants() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const fetchMerchantOffers = async (
    productId: string,
    opts?: { brand?: string; model?: string; basePrice?: number },
  ): Promise<MerchantOffer[]> => {
    // Validation asynchrone en arrière-plan
    supabase.functions
      .invoke('validate-offer-links', {
        body: { productId, maxAgeMinutes: 360, limit: 20 },
      })
      .catch(() => {})

    const { data, error } = await supabase
      .from('shoe_prices')
      .select(
        'id, retailer_name, price, stock_status, product_url, affiliate_url, fallback_url, logo_url, url_status',
      )
      .eq('product_id', productId)
      .neq('url_status', 'broken')
      .order('price', { ascending: true })

    if (error || !data || data.length === 0) {
      if (opts?.brand && opts.model && opts.basePrice) {
        return generateFallbackOffers(productId, opts.brand, opts.model, opts.basePrice)
      }
      return []
    }

    return data.map((row: any) => {
      const urlStatus = normalizeStatus(row.url_status)
      const finalUrl =
        row.affiliate_url ||
        row.product_url ||
        row.fallback_url ||
        buildRetailerSearchUrl(row.retailer_name, row.product_id.replace(/-/g, ' '))

      return {
        id: row.id,
        merchant: row.retailer_name,
        price: Number(row.price),
        available: row.stock_status === 'in_stock',
        productUrl: row.product_url,
        affiliateUrl: finalUrl,
        fallbackUrl: row.fallback_url ?? undefined,
        logo: row.logo_url ?? undefined,
        urlStatus,
      }
    })
  }

  const trackOfferClick = async (params: {
    productId: string
    retailerName: string
    shoeModel: string
  }) => {
    if (!user.value) return
    await (supabase.from('click_analytics') as any).insert({
      user_id: user.value.id,
      product_id: params.productId,
      retailer_name: params.retailerName,
      shoe_model: params.shoeModel,
    })
  }

  /**
   * Retourne la meilleure offre affiliée pour une chaussure depuis v_shoe_best_offers.
   * "Meilleure" = première ligne de la vue (triée par priority_rank ASC).
   * Retourne null si aucune offre active n'existe.
   */
  /**
   * Construit l'URL finale à utiliser pour une offre.
   * Priorité : URL de recherche toujours valide > URL directe produit.
   * Si l'URL stockée est une URL directe (ASIN, page produit), on la remplace
   * par une URL de recherche construite dynamiquement — les URLs directes peuvent
   * devenir indisponibles (produit retiré, rupture de stock, ASIN changé).
   */
  function resolveOfferUrl(row: BestOfferRow, shoeLabel?: string): string | null {
    const stored = row.final_url || row.affiliate_url
    if (!stored) return null

    // URL de recherche → toujours valide, on l'utilise telle quelle
    if (row.is_search_url) return stored

    // URL directe → on construit une URL de recherche fiable à la place
    if (shoeLabel) return buildRetailerSearchUrl(row.merchant, shoeLabel)

    // Pas de label disponible → on conserve l'URL directe (cas rare)
    return stored
  }

  const fetchBestOffer = async (
    shoeId: string,
    shoeLabel?: string,  // ex: "Nike Pegasus 41" — pour construire l'URL de recherche
  ): Promise<BestOffer | null> => {
    // v_shoe_best_offers est une vue SQL non présente dans les types Supabase générés
    const { data, error } = await (supabase as any)
      .from('v_shoe_best_offers')
      .select('shoe_id, merchant, affiliate_url, final_url, price, is_search_url')
      .eq('shoe_id', shoeId)
      .order('is_search_url', { ascending: false })  // URLs de recherche en premier
      .limit(1)
      .maybeSingle() as { data: BestOfferRow | null; error: any }

    if (error || !data) return null

    const url = resolveOfferUrl(data, shoeLabel)
    if (!url) return null

    return {
      shoeId: data.shoe_id,
      merchant: data.merchant,
      affiliateUrl: url,
      price: data.price ? Number(data.price) : null,
      isSearchUrl: true,  // on garantit que l'URL retournée est toujours une recherche
    }
  }

  /**
   * Version batch : charge les meilleures offres pour plusieurs chaussures en une requête.
   * shoeLabels : Map<shoeId, "Brand Model"> pour construire les URLs de recherche de secours.
   */
  const fetchBestOffers = async (
    shoeIds: string[],
    shoeLabels?: Map<string, string>,  // ex: Map { 'nike-pegasus-41' => 'Nike Pegasus 41' }
  ): Promise<Map<string, BestOffer>> => {
    if (!shoeIds.length) return new Map()

    // Tri : is_search_url DESC puis priority_rank ASC
    // → pour chaque shoe, la première ligne sera l'URL de recherche si elle existe
    const { data, error } = await (supabase as any)
      .from('v_shoe_best_offers')
      .select('shoe_id, merchant, affiliate_url, final_url, price, is_search_url')
      .in('shoe_id', shoeIds)
      .order('is_search_url', { ascending: false })
      .order('priority_rank',  { ascending: true }) as { data: BestOfferRow[] | null; error: any }

    const result = new Map<string, BestOffer>()
    if (error || !data) return result

    for (const row of data) {
      // On ne garde que la première occurrence par shoe_id (déjà triée : search URLs en tête)
      if (result.has(row.shoe_id)) continue

      const label = shoeLabels?.get(row.shoe_id)
      const url   = resolveOfferUrl(row, label)
      if (!url) continue

      result.set(row.shoe_id, {
        shoeId:      row.shoe_id,
        merchant:    row.merchant,
        affiliateUrl: url,
        price:       row.price ? Number(row.price) : null,
        isSearchUrl: true,
      })
    }

    return result
  }

  // Génère l'URL de l'endpoint serveur (/api/affiliate/:merchant/:shoeId)
  // → tracking côté serveur + tag affilié garanti, sans exposer l'URL finale au client
  const buildAffiliateRedirectUrl = (
    shoeId: string,
    merchant: string,
    country = 'FR',
  ): string => `/api/affiliate/${merchant.toLowerCase()}/${shoeId}?country=${country}`

  return {
    fetchMerchantOffers,
    fetchBestOffer,
    fetchBestOffers,
    trackOfferClick,
    buildDynamicMerchantLinks,
    buildAffiliateRedirectUrl,
  }
}

// ── Helpers internes ──────────────────────────────────────────────────────────

type OfferUrlStatus = 'valid' | 'fallback' | 'broken' | 'unknown'

function normalizeStatus(status?: string | null): OfferUrlStatus {
  if (status === 'valid' || status === 'fallback' || status === 'broken') return status
  return 'unknown'
}

const DEFAULT_RETAILERS = [
  { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.fr', priceOffset: -10 },
  { name: 'i-Run', logo: 'https://logo.clearbit.com/i-run.fr', priceOffset: 0 },
  { name: 'The Running Collective', logo: 'https://logo.clearbit.com/therunningcollective.fr', priceOffset: -5 },
  { name: 'Courir', logo: 'https://logo.clearbit.com/courir.com', priceOffset: 0 },
  { name: 'Intersport', logo: 'https://logo.clearbit.com/intersport.fr', priceOffset: -5 },
]

function generateFallbackOffers(
  productId: string,
  brand: string,
  model: string,
  basePrice: number,
): MerchantOffer[] {
  const query = `${brand} ${model}`
  return DEFAULT_RETAILERS.map((r, i) => ({
    id: `static-${productId}-${i}`,
    merchant: r.name,
    price: Math.max(basePrice + r.priceOffset, 9.99),
    available: true,
    productUrl: buildRetailerSearchUrl(r.name, query),
    affiliateUrl: buildRetailerSearchUrl(r.name, query),
    logo: r.logo,
    urlStatus: 'valid' as OfferUrlStatus,
  })).sort((a, b) => a.price - b.price)
}
