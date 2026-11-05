/**
 * awin.ts — helpers Awin (deeplinks + clickref).
 *
 * Format deeplink Awin :
 *   https://www.awin1.com/cread.php?awinmid=<annonceur>&awinaffid=<publisher>&clickref=<ref>&ued=<url encodée>
 *
 * `clickref` est renvoyé par Awin dans chaque transaction (API Transactions / rapports).
 * On y met notre click_id → chaque vente est rattachée à un clic, donc à une chaussure
 * et à un emplacement dans l'app (étape 2 : import des conversions).
 */

const AWIN_CREAD = 'https://www.awin1.com/cread.php'
const AWIN_HOSTS = new Set(['awin1.com', 'www.awin1.com'])

export interface AwinConfig {
  advertiserId: string // awinmid
  publisherId: string  // awinaffid
}

/** clickref Awin : caractères alphanumériques, "-" et "_" ; 50 caractères max. */
export function sanitizeClickRef(ref: string): string {
  return ref.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50)
}

/**
 * Lit la config Awin d'un marchand.
 * `merchants.affiliate_tag` accepte "awinmid" ou "awinmid:publisherId"
 * (convention déjà utilisée par feedSync.service.ts).
 * Le publisherId par défaut vient de AWIN_PUBLISHER_ID.
 */
export function parseAwinTag(
  tag: string | null | undefined,
  defaultPublisherId?: string,
): AwinConfig | null {
  if (!tag) return null
  const [advertiserId, publisherId] = tag.split(':').map(s => s.trim())
  const pub = publisherId || defaultPublisherId
  if (!advertiserId || !pub) return null
  return { advertiserId, publisherId: pub }
}

export function isAwinUrl(raw: string): boolean {
  try {
    return AWIN_HOSTS.has(new URL(raw).hostname)
  } catch {
    return false
  }
}

/** Enveloppe une URL marchand dans un deeplink Awin tracké. */
export function buildAwinDeeplink(
  cfg: AwinConfig,
  destinationUrl: string,
  clickRef?: string,
): string {
  const u = new URL(AWIN_CREAD)
  u.searchParams.set('awinmid', cfg.advertiserId)
  u.searchParams.set('awinaffid', cfg.publisherId)
  if (clickRef) u.searchParams.set('clickref', sanitizeClickRef(clickRef))
  u.searchParams.set('ued', destinationUrl) // URLSearchParams encode correctement
  return u.toString()
}

/** Ajoute/remplace le clickref sur un deeplink Awin déjà construit (ex. stocké par feedSync). */
export function withAwinClickRef(rawAwinUrl: string, clickRef: string): string {
  const u = new URL(rawAwinUrl)
  u.searchParams.set('clickref', sanitizeClickRef(clickRef))
  return u.toString()
}
