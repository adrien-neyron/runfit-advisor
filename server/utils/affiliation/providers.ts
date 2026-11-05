import { amazonProvider } from './amazon'
import { buildAwinDeeplink, isAwinUrl, parseAwinTag, sanitizeClickRef, withAwinClickRef } from './awin'
import type { AffiliateProvider } from './types'

// Providers "ASIN" (construction de l'URL côté serveur). Awin/CJ passent par resolveRedirectUrl.
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

// ─────────────────────────────────────────────────────────────────────────────
// Redirecteur multi-réseaux
// ─────────────────────────────────────────────────────────────────────────────

export type AffiliateNetworkId = 'amazon' | 'awin' | 'cj' | 'manual'

/**
 * Les slugs historiques (affiliate_links.merchant, AffiliateButton) ne sont pas
 * ceux de la table `merchants`. On accepte les deux.
 */
const MERCHANT_SLUG_ALIASES: Record<string, string> = {
  amazon: 'amazon-fr',
  irun: 'i-run',
  'i-run': 'i-run',
  therunningcollective: 'trc',
}

export function merchantSlugCandidates(merchant: string): string[] {
  const m = merchant.toLowerCase()
  return Array.from(new Set([m, MERCHANT_SLUG_ALIASES[m]].filter(Boolean) as string[]))
}

/**
 * Clé de comparaison tolérante entre slugs, noms de marchands et retailer_name :
 * « Amazon.fr », « amazon-fr », « amazon » → « amazon » ; « i-Run », « irun » → « irun ».
 */
export function normalizeMerchantKey(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/(fr|com)$/, '')
}

export function merchantKeys(values: Array<string | null | undefined>): Set<string> {
  const keys = new Set<string>()
  for (const v of values) {
    if (!v) continue
    for (const c of [v, ...merchantSlugCandidates(v)]) keys.add(normalizeMerchantKey(c))
  }
  keys.delete('')
  return keys
}

export interface ResolveRedirectParams {
  merchant: string                 // slug tel que reçu dans l'URL
  network?: AffiliateNetworkId | null
  affiliateTag?: string | null     // merchants.affiliate_tag
  awinPublisherId?: string         // AWIN_PUBLISHER_ID
  asin?: string | null
  affiliateUrl?: string | null     // URL déjà affiliée stockée en DB
  productUrl?: string | null       // URL produit brute du marchand
  country?: string
  clickRef: string                 // = click_id sans tirets
}

function assertHttpUrl(raw: string): string {
  const u = new URL(raw) // lève si invalide
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    throw new Error(`Unsupported URL protocol: ${u.protocol}`)
  }
  return u.toString()
}

/**
 * Construit l'URL finale vers laquelle rediriger l'utilisateur, avec l'identifiant
 * de clic propagé au réseau (ascsubtag Amazon, clickref Awin).
 * Lève une Error (message lisible) si le marchand n'est pas exploitable.
 */
export function resolveRedirectUrl(p: ResolveRedirectParams): string {
  const country = p.country ?? 'FR'
  const ref = sanitizeClickRef(p.clickRef)
  // Réseau explicite (table merchants) > Amazon (provider ASIN) > redirection simple si on a une URL.
  const network: AffiliateNetworkId | null =
    p.network ??
    (REGISTRY[p.merchant.toLowerCase()] ? 'amazon' : p.affiliateUrl || p.productUrl ? 'manual' : null)

  switch (network) {
    case 'amazon': {
      const url = resolveAffiliateUrl({
        merchant: 'amazon',
        country,
        asin: p.asin,
        affiliateUrl: p.affiliateUrl ?? p.productUrl,
      })
      // ascsubtag : retrouvé dans les rapports Amazon Associates → rapprochement avec nos clics
      const u = new URL(url)
      u.searchParams.set('ascsubtag', ref)
      return u.toString()
    }

    case 'awin': {
      const stored = p.affiliateUrl
      if (stored && isAwinUrl(stored)) return withAwinClickRef(assertHttpUrl(stored), ref)

      const destination = p.productUrl ?? stored
      if (!destination) throw new Error(`No destination URL for Awin merchant "${p.merchant}"`)

      const cfg = parseAwinTag(p.affiliateTag, p.awinPublisherId)
      if (!cfg) {
        // Programme pas (encore) configuré : on n'abandonne pas l'utilisateur, on l'envoie
        // sur le marchand sans tracking. Le clic reste enregistré (target_url non-Awin).
        console.warn(
          `[affiliate] Awin non configuré pour "${p.merchant}" (merchants.affiliate_tag + AWIN_PUBLISHER_ID) : redirection sans tracking`,
        )
        return assertHttpUrl(destination)
      }
      return buildAwinDeeplink(cfg, assertHttpUrl(destination), ref)
    }

    case 'manual': {
      const url = p.affiliateUrl ?? p.productUrl
      if (!url) throw new Error(`No URL for merchant "${p.merchant}"`)
      return assertHttpUrl(url)
    }

    default:
      throw new Error(`No affiliate network resolved for "${p.merchant}"`)
  }
}
