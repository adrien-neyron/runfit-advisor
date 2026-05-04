// =============================================================================
// Edge Function : check-affiliate-links
// Planification : quotidienne à 04h00 UTC via pg_cron
// =============================================================================
// Pour chaque lien affilié (batch de 50, status != 'dead' en priorité) :
//   1. Requête HEAD avec suivi de redirections → capture final_url + http_status
//   2. Mise à jour status : active / unknown / dead
//   3. Compteur d'échecs consécutifs → dead automatique après DEAD_THRESHOLD
//   4. Rate limiting par domaine (500ms min) + détection 429
//
// Stratégie retry :
//   2xx              → active, consecutive_failures = 0
//   404 / 410        → dead immédiat (page supprimée — définitif)
//   429              → domaine banni ce run, last_checked_at NON mis à jour
//                      (sera retentéé au prochain cron)
//   5xx / timeout    → consecutive_failures++, dead après DEAD_THRESHOLD
//   3xx (loop/block) → unknown, consecutive_failures++
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const BATCH_SIZE          = 50    // liens vérifiés par invocation
const DEAD_THRESHOLD      = 5     // échecs consécutifs avant status = dead
const MAX_REDIRECTS       = 8     // hops max avant abandon
const HEAD_TIMEOUT_MS     = 12_000
const DOMAIN_MIN_DELAY_MS = 500   // délai minimum entre 2 requêtes sur le même domaine
const GLOBAL_DELAY_MS     = 120   // délai minimum entre 2 requêtes (tous domaines)

// Codes qui indiquent une page définitivement supprimée
const DEAD_CODES = new Set([404, 410, 451])

// User-Agent neutre — évite les blocages anti-bot agressifs
const UA =
  'Mozilla/5.0 (compatible; RunFitBot/1.0; link-health-check; +https://runfit.app)'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinkRow {
  id: string
  shoe_id: string
  merchant: string
  affiliate_url: string | null
  url: string                    // legacy fallback
  status: 'active' | 'dead' | 'unknown'
  consecutive_failures: number
  last_checked_at: string | null
}

interface ProbeResult {
  httpStatus: number | null
  finalUrl: string | null
  error?: string
  rateLimited: boolean           // 429 reçu → ne pas compter comme echec
}

interface LinkUpdate {
  http_status: number | null
  final_url: string | null
  status: 'active' | 'dead' | 'unknown'
  consecutive_failures: number
  failure_since: string | null
  last_checked_at: string        // toujours mis à jour (sauf 429)
  updated_at: string
}

interface RunSummary {
  checked: number
  active: number
  dead: number
  unknown: number
  rate_limited: number           // liens skippés (domaine banni ce run)
  errors: number
  elapsed_ms: number
  dead_links: { id: string; merchant: string; url: string; http_status: number | null }[]
}

// ─── Rate limiter par domaine ─────────────────────────────────────────────────

class DomainRateLimiter {
  private lastRequestAt = new Map<string, number>()
  private bannedDomains = new Set<string>()

  ban(domain: string): void {
    this.bannedDomains.add(domain)
  }

  isBanned(domain: string): boolean {
    return this.bannedDomains.has(domain)
  }

  /**
   * Attend le délai nécessaire avant d'autoriser une requête sur ce domaine.
   * Respecte à la fois le délai par domaine et le délai global.
   */
  async wait(domain: string): Promise<void> {
    const now = Date.now()
    const last = this.lastRequestAt.get(domain) ?? 0
    const wait = Math.max(0, last + DOMAIN_MIN_DELAY_MS - now)

    if (wait > 0) {
      await delay(wait)
    } else {
      // Délai global minimum même si le domaine est libre
      await delay(GLOBAL_DELAY_MS)
    }

    this.lastRequestAt.set(domain, Date.now())
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

/**
 * Probe d'un lien affilié.
 * Stratégie :
 *   1. HEAD (léger, respecté par la majorité des CDN e-commerce)
 *   2. Si HEAD retourne 405/403/400 → fallback GET avec Range: bytes=0-0
 *      (télécharge seulement 1 octet — confirme l'existence sans charger la page)
 *   3. Suit les redirections manuellement pour capturer final_url
 *      (fetch natif avec redirect:'follow' + res.url suffit dans Deno)
 */
async function probeLink(url: string): Promise<ProbeResult> {
  const headers = {
    'User-Agent': UA,
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  }

  // ── Tentative 1 : HEAD ────────────────────────────────────────────────────
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers,
      redirect: 'follow',
      signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
    })

    if (res.status === 429) {
      return { httpStatus: 429, finalUrl: null, rateLimited: true }
    }

    // HEAD réussi (même 404/410 — on a l'info)
    if (res.status !== 405 && res.status !== 403 && res.status !== 400) {
      return {
        httpStatus: res.status,
        finalUrl: res.url !== url ? res.url : null,
        rateLimited: false,
      }
    }
  } catch (e) {
    // HEAD a échoué réseau — on tente GET avant de capituler
    const isTimeout = String(e).includes('Timeout') || String(e).includes('timeout')
    if (isTimeout) {
      return { httpStatus: null, finalUrl: null, error: 'Timeout HEAD', rateLimited: false }
    }
  }

  // ── Tentative 2 : GET partiel (Range: 0-0) ────────────────────────────────
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { ...headers, Range: 'bytes=0-0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
    })

    // Consomme le body minimal pour libérer la connexion
    await res.body?.cancel()

    if (res.status === 429) {
      return { httpStatus: 429, finalUrl: null, rateLimited: true }
    }

    // 206 Partial Content = lien valide (site supporte Range)
    const effectiveStatus = res.status === 206 ? 200 : res.status

    return {
      httpStatus: effectiveStatus,
      finalUrl: res.url !== url ? res.url : null,
      rateLimited: false,
    }
  } catch (e) {
    return {
      httpStatus: null,
      finalUrl: null,
      error: e instanceof Error ? e.message : String(e),
      rateLimited: false,
    }
  }
}

/**
 * Détermine le nouveau statut + compteur à partir d'un résultat de probe.
 */
function computeUpdate(
  link: LinkRow,
  probe: ProbeResult,
  now: string,
): LinkUpdate | null {
  // 429 → ne rien enregistrer (le lien sera retesté au prochain cron)
  if (probe.rateLimited) return null

  const base = {
    http_status: probe.httpStatus,
    final_url:   probe.finalUrl,
    last_checked_at: now,
    updated_at:  now,
  }

  // ── Succès 2xx / 3xx résolus ──────────────────────────────────────────────
  if (probe.httpStatus !== null && probe.httpStatus >= 200 && probe.httpStatus < 400) {
    return {
      ...base,
      status:               'active',
      consecutive_failures: 0,
      failure_since:        null,
    }
  }

  // ── Mort définitif 404 / 410 / 451 ───────────────────────────────────────
  if (probe.httpStatus !== null && DEAD_CODES.has(probe.httpStatus)) {
    return {
      ...base,
      status:               'dead',
      consecutive_failures: link.consecutive_failures + 1,
      failure_since:        link.failure_since ?? now,
    }
  }

  // ── Erreur temporaire : 5xx / timeout / réseau ────────────────────────────
  const newFailures = link.consecutive_failures + 1
  const isDead      = newFailures >= DEAD_THRESHOLD

  return {
    ...base,
    status:               isDead ? 'dead' : 'unknown',
    consecutive_failures: newFailures,
    failure_since:        link.failure_since ?? now,
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const startTime  = Date.now()
  const rateLimiter = new DomainRateLimiter()

  // ── 1. Sélection du batch ─────────────────────────────────────────────────
  // Priorité : liens 'unknown' ou 'active' non vérifiés depuis le plus longtemps
  // Les liens 'dead' sont vérifiés moins souvent (toutes les 7 jours)
  // via une seconde requête en fin de batch si des slots restent.

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: liveLinks, error: e1 } = await supabase
    .from('affiliate_links')
    .select('id, shoe_id, merchant, affiliate_url, url, status, consecutive_failures, failure_since, last_checked_at')
    .in('status', ['active', 'unknown'])
    .order('last_checked_at', { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE)

  if (e1) {
    return Response.json({ error: 'Erreur fetch liens actifs', detail: e1.message }, { status: 500 })
  }

  // Complète le batch avec des liens 'dead' à re-vérifier (récupération possible)
  const remaining = BATCH_SIZE - (liveLinks?.length ?? 0)
  let deadLinks: LinkRow[] = []

  if (remaining > 0) {
    const { data } = await supabase
      .from('affiliate_links')
      .select('id, shoe_id, merchant, affiliate_url, url, status, consecutive_failures, failure_since, last_checked_at')
      .eq('status', 'dead')
      .or(`last_checked_at.is.null,last_checked_at.lt.${sevenDaysAgo}`)
      .order('last_checked_at', { ascending: true, nullsFirst: true })
      .limit(remaining)

    deadLinks = (data ?? []) as LinkRow[]
  }

  const links: LinkRow[] = [...(liveLinks ?? []) as LinkRow[], ...deadLinks]

  if (links.length === 0) {
    return Response.json({
      message: 'Aucun lien à vérifier.',
      checked: 0,
      elapsed_ms: Date.now() - startTime,
    })
  }

  // ── 2. Probe de chaque lien ───────────────────────────────────────────────

  const summary: RunSummary = {
    checked: 0, active: 0, dead: 0, unknown: 0,
    rate_limited: 0, errors: 0,
    elapsed_ms: 0,
    dead_links: [],
  }

  for (const link of links) {
    const targetUrl = link.affiliate_url ?? link.url
    if (!targetUrl) continue

    const domain = extractDomain(targetUrl)

    // Domaine banni ce run (a retourné 429 précédemment)
    if (rateLimiter.isBanned(domain)) {
      summary.rate_limited++
      continue
    }

    // Attendre le délai par domaine
    await rateLimiter.wait(domain)

    // Probe
    const probe = await probeLink(targetUrl)
    const now   = new Date().toISOString()

    if (probe.rateLimited) {
      rateLimiter.ban(domain)
      summary.rate_limited++
      continue
    }

    // Calcul des nouvelles valeurs
    const update = computeUpdate(link, probe, now)
    if (!update) {
      summary.rate_limited++
      continue
    }

    // Persistance
    try {
      const { error: updateErr } = await supabase
        .from('affiliate_links')
        .update(update)
        .eq('id', link.id)

      if (updateErr) throw new Error(updateErr.message)
    } catch (err) {
      summary.errors++
      console.error(`[${link.id}] DB update error:`, err)
      continue
    }

    // Comptabilisation
    summary.checked++
    if (update.status === 'active')  summary.active++
    if (update.status === 'dead')    {
      summary.dead++
      summary.dead_links.push({
        id:          link.id,
        merchant:    link.merchant,
        url:         targetUrl,
        http_status: probe.httpStatus,
      })
    }
    if (update.status === 'unknown') summary.unknown++
    if (probe.error)                 summary.errors++
  }

  // ── 3. Mise à jour offer_count_active sur shoes concernées ────────────────
  // Après avoir changé des statuts, recalculer le compteur sur les chaussures
  // dont au moins un lien a été vérifié ce run.
  const affectedShoeIds = [...new Set(links.map((l) => l.shoe_id))]

  if (affectedShoeIds.length > 0) {
    // Appel RPC pour recalculer offer_count_active par chaussure
    // (la fonction est définie dans la migration shoe_prices_monitoring)
    for (const shoeId of affectedShoeIds) {
      const { data: cnt } = await supabase
        .from('affiliate_links')
        .select('id', { count: 'exact', head: true })
        .eq('shoe_id', shoeId)
        .eq('status', 'active')

      await supabase
        .from('shoes')
        .update({ offer_count_active: cnt ?? 0, updated_at: new Date().toISOString() })
        .eq('id', shoeId)
    }
  }

  summary.elapsed_ms = Date.now() - startTime

  return Response.json(summary)
})
