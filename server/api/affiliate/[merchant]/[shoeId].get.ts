import { serverSupabaseServiceRole } from '#supabase/server'
import { resolveAffiliateUrl } from '~/server/utils/affiliation/providers'
import type { AffiliateClickPayload } from '~/server/utils/affiliation/types'

export default defineEventHandler(async (event) => {
  const { merchant, shoeId } = getRouterParams(event)
  const { country = 'FR' } = getQuery(event) as { country?: string }

  // Empêche l'indexation de cet endpoint par les moteurs de recherche
  setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache')

  if (!shoeId || !merchant) {
    throw createError({ statusCode: 400, statusMessage: 'shoeId and merchant are required' })
  }

  const supabase = serverSupabaseServiceRole(event)

  // Récupère le lien affilié actif depuis la DB
  const { data: link } = await supabase
    .from('affiliate_links')
    .select('asin, affiliate_url, status')
    .eq('shoe_id', shoeId)
    .eq('merchant', merchant)
    .eq('country', country)
    .eq('status', 'active')
    .maybeSingle()

  if (!link) {
    throw createError({
      statusCode: 404,
      statusMessage: `No active affiliate link for shoe ${shoeId} / merchant ${merchant}`,
    })
  }

  // Construit l'URL finale avec tag garanti
  let finalUrl: string
  try {
    finalUrl = resolveAffiliateUrl({
      merchant,
      country,
      asin:         link.asin,
      affiliateUrl: link.affiliate_url,
    })
  } catch (err: any) {
    throw createError({ statusCode: 422, statusMessage: err.message })
  }

  // Tracking du clic — fire-and-forget, ne bloque jamais la redirection
  const reqHeaders = getRequestHeaders(event)
  const rawIp =
    getRequestHeader(event, 'x-forwarded-for') ??
    getRequestHeader(event, 'x-real-ip') ?? ''

  const payload: AffiliateClickPayload = {
    shoe_id:    shoeId,
    merchant,
    country,
    asin:       link.asin ?? null,
    user_agent: reqHeaders['user-agent'] ?? null,
    referer:    reqHeaders['referer'] ?? null,
    ip_hash:    rawIp ? await hashIp(rawIp) : null,
  }

  // On insère sans await : la redirection part immédiatement
  supabase.from('affiliate_clicks').insert(payload).then()

  // 302 transparent : le navigateur affiche l'URL Amazon finale (pas de cloaking)
  return sendRedirect(event, finalUrl, 302)
})

// Hash IP RGPD-safe : 16 caractères hex suffisent pour la déduplication
async function hashIp(rawIp: string): Promise<string> {
  const ip   = rawIp.split(',')[0].trim()
  const salt = process.env.IP_HASH_SALT ?? 'runmatch-ip-salt'
  const buf  = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(ip + salt),
  )
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}
