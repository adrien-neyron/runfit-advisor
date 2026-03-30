// ============================================================
// Affiliate Link Service — génération de liens trackés
// ============================================================
// Réseaux supportés :
//   - Amazon PartnerNet  (tag= query param)
//   - AWIN               (deeplink via tracker awin1.com)
//   - CJ Affiliate       (deeplink via anrdoezrs.net)
//   - Manual             (URL retournée telle quelle)

import type { AffiliateLinkOptions, AffiliateNetwork } from '../types/feed'

// ── Générateurs par réseau ───────────────────────────────────────────────────

/**
 * Amazon PartnerNet : ajoute simplement `?tag=<affiliateTag>` à l'URL produit.
 * Si l'URL est une URL de recherche Amazon, le tag est aussi injecté.
 */
function buildAmazonLink(productUrl: string, affiliateTag: string): string {
  try {
    const u = new URL(productUrl)
    u.searchParams.set('tag', affiliateTag)
    // Nettoie les paramètres de tracking superflus
    for (const p of ['ref', 'ref_', 'linkId', 'linkCode', 'camp', 'creative', 'creativeASIN']) {
      u.searchParams.delete(p)
    }
    return u.toString()
  } catch {
    // URL malformée : append naïf
    const sep = productUrl.includes('?') ? '&' : '?'
    return `${productUrl}${sep}tag=${affiliateTag}`
  }
}

/**
 * AWIN : enveloppe l'URL de destination dans le deeplink tracker AWIN.
 * Format : https://www.awin1.com/cread.php?awinmid=<advertiserId>&awinaffid=<publisherId>&ued=<encodedUrl>
 */
function buildAwinLink(
  productUrl: string,
  advertiserId: string,
  publisherId: string,
): string {
  const encoded = encodeURIComponent(productUrl)
  return `https://www.awin1.com/cread.php?awinmid=${advertiserId}&awinaffid=${publisherId}&ued=${encoded}`
}

/**
 * CJ Affiliate : enveloppe l'URL dans le tracker CJ.
 * Format : https://www.anrdoezrs.net/click-<publisherId>-<advertiserId>?url=<encodedUrl>
 */
function buildCjLink(
  productUrl: string,
  advertiserId: string,
  publisherId: string,
): string {
  const encoded = encodeURIComponent(productUrl)
  return `https://www.anrdoezrs.net/click-${publisherId}-${advertiserId}?url=${encoded}`
}

// ── Point d'entrée principal ─────────────────────────────────────────────────

/**
 * Génère un lien affilié tracké pour un produit.
 *
 * @param opts - Configuration du lien affilié
 * @returns URL avec tracking affilié, ou URL originale en cas de paramètres manquants
 *
 * @example
 * // Amazon
 * generateAffiliateLink({ network: 'amazon', productUrl: 'https://www.amazon.fr/dp/B0XXXXX', affiliateTag: 'runfit-21' })
 *
 * // AWIN
 * generateAffiliateLink({ network: 'awin', productUrl: 'https://i-run.fr/...', advertiserId: '12345', publisherId: '67890' })
 */
export function generateAffiliateLink(opts: AffiliateLinkOptions): string {
  const { network, productUrl, affiliateTag, advertiserId, publisherId } = opts

  switch (network) {
    case 'amazon': {
      if (!affiliateTag) {
        console.warn('[affiliateLink] Amazon : affiliateTag manquant, URL non trackée')
        return productUrl
      }
      return buildAmazonLink(productUrl, affiliateTag)
    }

    case 'awin': {
      if (!advertiserId || !publisherId) {
        console.warn('[affiliateLink] AWIN : advertiserId/publisherId manquants, URL non trackée')
        return productUrl
      }
      return buildAwinLink(productUrl, advertiserId, publisherId)
    }

    case 'cj': {
      if (!advertiserId || !publisherId) {
        console.warn('[affiliateLink] CJ : advertiserId/publisherId manquants, URL non trackée')
        return productUrl
      }
      return buildCjLink(productUrl, advertiserId, publisherId)
    }

    case 'manual':
    default:
      return productUrl
  }
}

/**
 * Génère un lien affilié à partir d'une configuration simple par réseau.
 * Wrapper pratique pour les cas où on a le network + tag seulement.
 */
export function buildAffiliateUrl(
  productUrl: string,
  network: AffiliateNetwork,
  config: { tag?: string; advertiserId?: string; publisherId?: string } = {},
): string {
  return generateAffiliateLink({
    network,
    productUrl,
    affiliateTag: config.tag,
    advertiserId: config.advertiserId,
    publisherId: config.publisherId,
  })
}
