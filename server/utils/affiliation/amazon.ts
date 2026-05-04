import type { AffiliateProvider } from './types'

const DOMAINS: Record<string, string> = {
  FR: 'amazon.fr',
  DE: 'amazon.de',
  IT: 'amazon.it',
  ES: 'amazon.es',
  UK: 'amazon.co.uk',
  US: 'amazon.com',
}

// Un tag par locale — compléter lors de l'adhésion aux programmes DE/IT/ES
const TAGS: Record<string, string> = {
  FR: 'runmatch-21',
}

const DEFAULT_COUNTRY = 'FR'
const DEFAULT_TAG = 'runmatch-21'
const LINK_CODE = 'ogi'

function getDomain(country: string): string {
  return DOMAINS[country] ?? DOMAINS[DEFAULT_COUNTRY]
}

function getTag(country: string): string {
  return TAGS[country] ?? DEFAULT_TAG
}

export const amazonProvider: AffiliateProvider = {
  merchant: 'amazon',

  buildProductUrl(asin: string, country = DEFAULT_COUNTRY): string {
    const url = new URL(`https://www.${getDomain(country)}/dp/${asin}`)
    url.searchParams.set('tag',      getTag(country))
    url.searchParams.set('linkCode', LINK_CODE)
    url.searchParams.set('th',       '1')
    url.searchParams.set('psc',      '1')
    return url.toString()
  },

  buildSearchUrl(query: string, country = DEFAULT_COUNTRY): string {
    const url = new URL(`https://www.${getDomain(country)}/s`)
    url.searchParams.set('k',        query)
    url.searchParams.set('tag',      getTag(country))
    url.searchParams.set('linkCode', LINK_CODE)
    url.searchParams.set('i',        'sporting')
    return url.toString()
  },

  // Garantit que tout lien Amazon stocké en DB contient bien le bon tag
  ensureTag(rawUrl: string, country = DEFAULT_COUNTRY): string {
    try {
      const u = new URL(rawUrl)
      const isAmazon = Object.values(DOMAINS).some(
        d => u.hostname === `www.${d}` || u.hostname === d,
      )
      if (!isAmazon) return rawUrl
      u.searchParams.set('tag', getTag(country))
      if (!u.searchParams.has('linkCode')) u.searchParams.set('linkCode', LINK_CODE)
      return u.toString()
    } catch {
      return rawUrl
    }
  },

  isValidUrl(url: string): boolean {
    try {
      const u = new URL(url)
      const isAmazon = Object.values(DOMAINS).some(d => u.hostname === `www.${d}`)
      return isAmazon && u.searchParams.has('tag')
    } catch {
      return false
    }
  },
}
