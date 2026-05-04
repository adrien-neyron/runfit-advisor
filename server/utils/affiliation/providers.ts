import { amazonProvider } from './amazon'
// import { irunProvider }      from './irun'      // future
// import { alltricksProvider } from './alltricks'  // future
import type { AffiliateProvider } from './types'

const REGISTRY: Record<string, AffiliateProvider> = {
  amazon: amazonProvider,
}

export function getAffiliateProvider(merchant: string): AffiliateProvider {
  const provider = REGISTRY[merchant.toLowerCase()]
  if (!provider) throw new Error(`No affiliate provider registered for "${merchant}"`)
  return provider
}

export function resolveAffiliateUrl(params: {
  merchant: string
  asin?: string | null
  affiliateUrl?: string | null
  query?: string
  country?: string
}): string {
  const provider = getAffiliateProvider(params.merchant)
  const country = params.country ?? 'FR'

  // Priorité 1 : ASIN → URL produit propre avec tag garanti
  if (params.asin) return provider.buildProductUrl(params.asin, country)

  // Priorité 2 : URL stockée → injecter/vérifier le tag
  if (params.affiliateUrl) return provider.ensureTag(params.affiliateUrl, country)

  // Priorité 3 : recherche de secours
  if (params.query) return provider.buildSearchUrl(params.query, country)

  throw new Error(
    `Cannot resolve affiliate URL for "${params.merchant}": requires asin, affiliateUrl, or query`,
  )
}
