export interface AffiliateProvider {
  readonly merchant: string
  buildProductUrl(asin: string, country?: string): string
  buildSearchUrl(query: string, country?: string): string
  ensureTag(url: string, country?: string): string
  isValidUrl(url: string): boolean
}

export interface AffiliateClickPayload {
  shoe_id: string
  merchant: string
  country: string
  asin?: string | null
  user_agent?: string | null
  referer?: string | null
  ip_hash?: string | null
}
