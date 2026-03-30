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

  return { fetchMerchantOffers, trackOfferClick, buildDynamicMerchantLinks }
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
