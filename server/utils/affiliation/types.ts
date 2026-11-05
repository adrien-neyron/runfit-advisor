export interface AffiliateProvider {
  readonly merchant: string
  buildProductUrl(asin: string, country?: string): string
  buildSearchUrl(query: string, country?: string): string
  ensureTag(url: string, country?: string): string
  isValidUrl(url: string): boolean
}

export interface AffiliateClickPayload {
  /** Identifiant unique du clic, propagé au réseau (ascsubtag / clickref) */
  click_id: string
  shoe_id: string | null
  merchant: string
  country: string
  network?: string | null
  asin?: string | null
  user_id?: string | null
  /** URL finale vers laquelle l'utilisateur a été redirigé */
  target_url?: string | null
  user_agent?: string | null
  referer?: string | null
  ip_hash?: string | null
  /** Page d'origine du clic (liste blanche) : swipe, matches, resultats, fiche, profil, equipement, autre */
  src?: string | null
}
