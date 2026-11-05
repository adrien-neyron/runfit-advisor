import { serverSupabaseUser } from '#supabase/server'
import { getSupabaseAdmin } from '~/server/utils/supabaseAdmin'
import { buildRetailerSearchUrl } from '~/data/merchants'
import { merchantKeys, merchantSlugCandidates, normalizeMerchantKey, resolveRedirectUrl } from '~/server/utils/affiliation/providers'
import type { AffiliateNetworkId } from '~/server/utils/affiliation/providers'
import type { AffiliateClickPayload } from '~/server/utils/affiliation/types'

/**
 * GET /api/affiliate/:merchant/:shoeId?country=FR
 *
 * Redirecteur d'affiliation multi-réseaux (Amazon, Awin, manuel).
 *  1. retrouve le marchand (table `merchants`) et le lien actif (affiliate_links),
 *     avec repli sur shoe_prices (flux marchands)
 *  2. génère un click_id, le propage au réseau (ascsubtag / clickref)
 *  3. enregistre le clic (sans bloquer la redirection) puis 302
 */
export default defineEventHandler(async (event) => {
  const { merchant, shoeId } = getRouterParams(event)
  const { country: rawCountry = 'FR', sexe: rawSexe, src: rawSrc } = getQuery(event) as { country?: string; sexe?: string; src?: string }
  // Page d'origine du clic : liste blanche, jamais de valeur libre en base
  const ALLOWED_SRC = ['swipe', 'matches', 'resultats', 'fiche', 'profil', 'equipement']
  const src = ALLOWED_SRC.includes(String(rawSrc)) ? String(rawSrc) : 'autre'
  // Variante du profil : on ne redirige jamais vers la version de l'autre sexe
  const sexe = rawSexe === 'femme' ? 'femme' : 'homme'
  const country = String(rawCountry).toUpperCase() // la base stocke 'fr', l'appli envoie 'FR'

  // Empêche l'indexation de cet endpoint par les moteurs de recherche
  setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache')

  if (!shoeId || !merchant) {
    throw createError({ statusCode: 400, statusMessage: 'shoeId and merchant are required' })
  }

  const config = useRuntimeConfig(event)
  // Client service_role du projet (lit SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
  const supabase = getSupabaseAdmin()
  const slugs = merchantSlugCandidates(merchant)

  // 1a. Marchand (réseau + identifiant annonceur)
  const { data: merchantRow, error: merchantErr } = await supabase
    .from('merchants')
    .select('name, slug, affiliate_network, affiliate_tag')
    .in('slug', slugs)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()
  // Une erreur ici (clé invalide, table absente…) ne doit pas passer inaperçue :
  // sans elle, on retomberait silencieusement sur le lien de recherche.
  if (merchantErr) console.error('[affiliate] merchants lookup failed:', merchantErr.message)

  // 1b. Lien actif (priorité : liens curés dans affiliate_links)
  const { data: link, error: linkErr } = await supabase
    .from('affiliate_links')
    .select('asin, affiliate_url, final_url')
    .eq('shoe_id', shoeId)
    .in('merchant', slugs)
    .ilike('country', country)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (linkErr) console.error('[affiliate] affiliate_links lookup failed:', linkErr.message)

  // 1c. Repli : offres issues de shoe_prices (flux marchands / catalogue).
  // retailer_name n'a pas le même format que le slug (« Amazon » vs « amazon-fr ») :
  // on compare des clés normalisées.
  let feedOffer: { product_url: string | null; affiliate_url: string | null } | null = null
  if (!link) {
    const { data: offers, error: offersErr } = await supabase
      .from('shoe_prices')
      .select('retailer_name, product_url, affiliate_url, priority_rank, gender')
      .eq('product_id', shoeId)
      .in('gender', [sexe, 'unisexe'])
      .neq('url_status', 'broken')
    if (offersErr) console.error('[affiliate] shoe_prices lookup failed:', offersErr.message)

    const keys = merchantKeys([merchant, merchantRow?.slug, merchantRow?.name])
    feedOffer =
      ((offers ?? []) as any[])
        .filter(o => keys.has(normalizeMerchantKey(o.retailer_name ?? '')))
        .sort((x, y) =>
          // la variante exacte du profil passe avant une offre mixte, puis ordre de priorité
          (x.gender === sexe ? 0 : 1) - (y.gender === sexe ? 0 : 1) ||
          (x.priority_rank ?? 50) - (y.priority_rank ?? 50))[0] ?? null
  }

  // 1d. Dernier repli : lien de recherche chez le marchand (même logique que la fiche chaussure).
  // Garantit qu'un clic est toujours tracké et que l'utilisateur n'arrive jamais sur une erreur.
  let searchUrl: string | null = null
  let shoeKnown = true
  if (!link && !feedOffer) {
    const { data: shoe } = await supabase
      .from('shoes')
      .select('brand, model')
      .eq('id', shoeId)
      .maybeSingle()
    // Le catalogue local (data/products.ts) peut contenir des chaussures absentes de la table `shoes` :
    // on déduit alors la requête de l'identifiant (« asics-gel-nimbus-28 » → « asics gel nimbus 28 »).
    shoeKnown = !!shoe
    const query = shoe ? `${shoe.brand} ${shoe.model}` : String(shoeId).replace(/[-_]+/g, ' ')
    searchUrl = buildRetailerSearchUrl(merchantRow?.name ?? merchant, query)
  }

  // 2. Identifiant de clic, propagé au réseau pour l'attribution des ventes
  const clickId = crypto.randomUUID()

  let finalUrl: string
  try {
    finalUrl = resolveRedirectUrl({
      merchant,
      network: (merchantRow?.affiliate_network as AffiliateNetworkId | undefined) ?? null,
      affiliateTag: merchantRow?.affiliate_tag,
      awinPublisherId: config.awinPublisherId || undefined,
      asin: link?.asin ?? null,
      affiliateUrl: link?.affiliate_url ?? feedOffer?.affiliate_url ?? null,
      productUrl: link?.final_url ?? feedOffer?.product_url ?? searchUrl,
      country,
      clickRef: clickId.replace(/-/g, ''),
    })
  } catch (err: any) {
    throw createError({ statusCode: 422, statusMessage: err.message })
  }

  // 3. Tracking du clic — ne bloque jamais la redirection
  const reqHeaders = getRequestHeaders(event)
  const rawIp =
    getRequestHeader(event, 'x-forwarded-for') ??
    getRequestHeader(event, 'x-real-ip') ?? ''

  let userId: string | null = null
  try {
    const user: any = await serverSupabaseUser(event)
    userId = user?.sub ?? user?.id ?? null
  } catch {
    // visiteur anonyme : normal
  }

  const payload: AffiliateClickPayload = {
    click_id:   clickId,
    shoe_id:    shoeKnown ? shoeId : null, // FK vers shoes(id) : null si la chaussure est absente de la base
    merchant:   merchantRow?.slug ?? merchant,
    country,
    network:    merchantRow?.affiliate_network ?? null,
    asin:       link?.asin ?? null,
    user_id:    userId,
    target_url: finalUrl,
    user_agent: reqHeaders['user-agent'] ?? null,
    referer:    reqHeaders['referer'] ?? null,
    ip_hash:    rawIp ? await hashIp(rawIp) : null,
    src,
  }

  // Anti-doublon : un rechargement en boucle, un double-clic ou un robot ne doit pas gonfler les stats.
  // Même visiteur (empreinte IP, à défaut compte), même marchand, même chaussure, moins de 10 s → pas de nouvelle ligne.
  // La redirection, elle, fonctionne toujours : l'utilisateur n'est jamais bloqué.
  const DUPLICATE_WINDOW_MS = 10_000
  const isDuplicate = async (): Promise<boolean> => {
    const who = payload.ip_hash
      ? (['ip_hash', payload.ip_hash] as const)
      : userId ? (['user_id', userId] as const) : null
    if (!who) return false
    let q = supabase
      .from('affiliate_clicks')
      .select('id', { count: 'exact', head: true })
      .eq(who[0], who[1])
      .eq('merchant', payload.merchant)
      .gte('created_at', new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString())
    q = payload.shoe_id ? q.eq('shoe_id', payload.shoe_id) : q.is('shoe_id', null)
    const { count, error } = await q
    if (error) {
      console.error('[affiliate] duplicate check failed:', error.message)
      return false // en cas de doute, on enregistre le clic
    }
    return (count ?? 0) > 0
  }

  // Sur Vercel/serverless, une promesse non attendue peut être coupée à la réponse :
  // waitUntil garde la fonction en vie jusqu'à l'écriture du clic.
  const track = (async () => {
    if (await isDuplicate()) return
    const { error } = await supabase.from('affiliate_clicks').insert(payload)
    if (error) console.error('[affiliate] click insert failed:', error.message)
  })().catch((e: unknown) => console.error('[affiliate] click tracking threw:', e))
  if (typeof event.waitUntil === 'function') event.waitUntil(track)

  // 302 transparent : l'utilisateur voit l'URL réelle du marchand (pas de cloaking)
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
