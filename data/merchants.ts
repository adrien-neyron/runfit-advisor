/**
 * merchants.ts — URL builders et types pour les offres marchands.
 * Les appels Supabase sont dans composables/useMerchants.ts
 */

export type OfferUrlStatus = 'valid' | 'fallback' | 'broken' | 'unknown'

export interface MerchantOffer {
  id: string
  merchant: string
  price: number
  available: boolean
  productUrl: string
  affiliateUrl: string
  fallbackUrl?: string
  logo?: string
  urlStatus: OfferUrlStatus
}

export interface MerchantLink {
  name: string
  logo: string
  url: string
}

// Tag Amazon Associates France
const AMAZON_AFFILIATE_TAG = 'runfit-21'

/**
 * Génère dynamiquement des liens de recherche pour les 5 retailers principaux.
 */
export function buildDynamicMerchantLinks(brand: string, model: string): MerchantLink[] {
  const q = encodeURIComponent(`${brand} ${model}`)
  const qRunning = encodeURIComponent(`${brand} ${model} running`)

  return [
    {
      name: 'Amazon',
      logo: 'https://logo.clearbit.com/amazon.fr',
      url: `https://www.amazon.fr/s?k=${qRunning}&i=sporting&tag=${AMAZON_AFFILIATE_TAG}`,
    },
    {
      name: 'Courir',
      logo: 'https://logo.clearbit.com/courir.com',
      url: `https://www.courir.com/search?q=${q}`,
    },
    {
      name: 'Intersport',
      logo: 'https://logo.clearbit.com/intersport.fr',
      url: `https://www.intersport.fr/catalogsearch/result/?q=${q}`,
    },
    {
      name: 'Foot Locker',
      logo: 'https://logo.clearbit.com/footlocker.fr',
      url: `https://www.footlocker.fr/search?query=${q}`,
    },
    {
      name: 'JD Sports',
      logo: 'https://logo.clearbit.com/jdsports.fr',
      url: `https://www.jdsports.fr/search/jd/${q}/`,
    },
  ]
}

/**
 * Construit une URL de recherche toujours valide pour un retailer donné.
 */
export function buildRetailerSearchUrl(retailerName: string, query: string): string {
  const q = encodeURIComponent(query)
  const n = retailerName.toLowerCase()

  if (n.includes('amazon'))
    return `https://www.amazon.fr/s?k=${q}+running&i=sporting&tag=${AMAZON_AFFILIATE_TAG}`
  if (n.includes('courir')) return `https://www.courir.com/search?q=${q}`
  if (n.includes('foot locker')) return `https://www.footlocker.fr/search?query=${q}`
  if (n.includes('jd sports')) return `https://www.jdsports.fr/search/jd/${q}/`
  if (n.includes('intersport')) return `https://www.intersport.fr/catalogsearch/result/?q=${q}`
  if (n.includes('sport 2000')) return `https://www.sport2000.fr/search?q=${q}`
  if (n.includes('decathlon')) return `https://www.decathlon.fr/search?Ntt=${q}`
  if (n.includes('running collective'))
    return `https://www.therunningcollective.com/fr/search?q=${q}`
  if (n.includes('alltricks')) return `https://www.alltricks.fr/s?search=${q}`
  if (n.includes('ekosport')) return `https://www.ekosport.fr/catalogsearch/result/?q=${q}`
  if (n.includes('running addict')) return `https://www.runningaddict.fr/catalogsearch/result/?q=${q}`
  if (n.includes('nike')) return `https://www.nike.com/fr/search?q=${q}`
  if (n.includes('adidas')) return `https://www.adidas.fr/search?q=${q}`
  if (n.includes('asics')) return `https://www.asics.com/fr/fr-fr/search?q=${q}`
  if (n.includes('brooks')) return `https://www.brooksrunning.com/fr_fr/search?q=${q}`
  if (n.includes('hoka')) return `https://www.hoka.com/fr-fr/search?q=${q}`
  if (n.includes('salomon')) return `https://www.salomon.com/fr-fr/search?q=${q}`
  if (n.includes('new balance')) return `https://www.newbalance.fr/search?q=${q}`
  if (n.includes('saucony')) return `https://www.saucony.com/fr/search?q=${q}`
  if (n.includes('mizuno')) return `https://www.mizuno.com/eu/fr/search?q=${q}`
  if (n.includes('on running') || n.includes('on-running') || n === 'on')
    return `https://www.on-running.com/fr-fr/sport/running/search/${q}`

  return `https://www.google.com/search?q=${encodeURIComponent(`${query} chaussure running ${retailerName}`)}`
}
