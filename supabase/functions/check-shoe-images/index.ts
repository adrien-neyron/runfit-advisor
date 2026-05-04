// =============================================================================
// Edge Function : check-shoe-images
// Planification : quotidienne via pg_cron (voir README ou migration cron)
// =============================================================================
// Pour chaque chaussure dont last_image_check est NULL ou > 30 jours :
//   1. HEAD check sur image_url_cdn (notre bucket Storage)
//   2. Si inaccessible et image_source_url disponible → re-télécharge + re-upload
//   3. Met à jour last_image_check dans tous les cas
//
// Batch max : 20 chaussures par invocation (évite le timeout 60s des Edge Functions)
// Note : Deno ne supporte pas Sharp → upload du buffer brut (pas de reconversion WebP)
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BUCKET                = 'shoes'
const BATCH_SIZE            = 20
const CHECK_INTERVAL_DAYS   = 30
const HEAD_TIMEOUT_MS       = 10_000
const DOWNLOAD_TIMEOUT_MS   = 25_000

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShoeRow {
  id: string
  brand: string
  model: string
  slug: string | null
  image_url_cdn: string | null
  image_source_url: string | null
}

interface CheckResult {
  shoeId: string
  label: string
  cdnOk: boolean
  redownloaded: boolean
  error?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * HEAD request sur l'URL CDN pour vérifier l'accessibilité.
 * Retourne true si le serveur répond 2xx ou 3xx.
 */
async function headCheck(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
    })
    return res.ok || (res.status >= 300 && res.status < 400)
  } catch {
    return false
  }
}

/**
 * Télécharge une image source distante et retourne son buffer.
 * User-Agent navigateur pour passer les hotlink protections courantes.
 */
async function downloadImage(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      Accept: 'image/webp,image/avif,image/png,image/*,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ${url}`)
  }

  const ct = res.headers.get('content-type') ?? ''
  if (!ct.startsWith('image/')) {
    throw new Error(`Content-Type non-image (${ct}) — ${url}`)
  }

  return res.arrayBuffer()
}

/**
 * Re-uploade le buffer brut dans le bucket Storage.
 * Écrase les 3 variantes avec le même buffer (pas de Sharp en Deno).
 * Seule la variante card est nécessaire pour image_url_cdn.
 */
async function reuploadImage(
  supabase: ReturnType<typeof createClient>,
  buffer: ArrayBuffer,
  shoe: ShoeRow,
  contentType: string,
): Promise<string> {
  // Détermine le chemin Storage à partir du slug ou brand/model
  const toSlug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const shoeSlug  = shoe.slug ?? toSlug(`${shoe.brand}-${shoe.model}`)
  const brandSlug = shoe.slug
    ? shoe.slug.split('-')[0]
    : toSlug(shoe.brand)

  const cardPath  = `${brandSlug}/${shoeSlug}/card.webp`
  const thumbPath = `${brandSlug}/${shoeSlug}/thumb.webp`
  const fullPath  = `${brandSlug}/${shoeSlug}/full.webp`

  const uploadOptions = {
    contentType,
    upsert: true,
    cacheControl: '31536000',
  }

  // Upload les 3 variantes en parallèle (même buffer — pas de resize en Deno)
  const results = await Promise.allSettled([
    supabase.storage.from(BUCKET).upload(cardPath,  buffer, uploadOptions),
    supabase.storage.from(BUCKET).upload(thumbPath, buffer, uploadOptions),
    supabase.storage.from(BUCKET).upload(fullPath,  buffer, uploadOptions),
  ])

  // On exige au moins le succès de card (utilisé comme image_url_cdn)
  const cardResult = results[0]
  if (cardResult.status === 'rejected' || cardResult.value.error) {
    const msg = cardResult.status === 'rejected'
      ? cardResult.reason
      : cardResult.value.error!.message
    throw new Error(`Upload card échoué : ${msg}`)
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${cardPath}`
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Sécurité basique : accept uniquement POST (invocation cron ou manuelle)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const startTime = Date.now()

  // ── 1. Récupérer le batch de chaussures à vérifier ────────────────────────

  const cutoff = new Date(
    Date.now() - CHECK_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString()

  const { data: shoes, error: fetchError } = await supabase
    .from('shoes')
    .select('id, brand, model, slug, image_url_cdn, image_source_url')
    .eq('is_active', true)
    .or(`last_image_check.is.null,last_image_check.lt.${cutoff}`)
    .order('last_image_check', { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE)

  if (fetchError) {
    return Response.json(
      { error: 'Erreur récupération chaussures', detail: fetchError.message },
      { status: 500 },
    )
  }

  if (!shoes || shoes.length === 0) {
    return Response.json({
      message: 'Aucune chaussure à vérifier.',
      checked: 0,
      elapsed_ms: Date.now() - startTime,
    })
  }

  // ── 2. Vérifier chaque chaussure ─────────────────────────────────────────

  const results: CheckResult[] = []

  for (const shoe of shoes as ShoeRow[]) {
    const label = `${shoe.brand} ${shoe.model} (${shoe.id})`
    const result: CheckResult = {
      shoeId: shoe.id,
      label,
      cdnOk: false,
      redownloaded: false,
    }

    try {
      // 2a. HEAD check sur l'URL CDN actuelle
      if (shoe.image_url_cdn) {
        result.cdnOk = await headCheck(shoe.image_url_cdn)
      }

      // 2b. Si CDN KO → tenter de re-télécharger depuis la source
      if (!result.cdnOk && shoe.image_source_url) {
        const buffer      = await downloadImage(shoe.image_source_url)
        // On tente de détecter le type depuis le contenu (magic bytes)
        const bytes       = new Uint8Array(buffer, 0, 4)
        const isWebP      = bytes[0] === 0x52 && bytes[1] === 0x49 // "RIFF"
        const isPng       = bytes[0] === 0x89 && bytes[1] === 0x50
        const contentType = isWebP ? 'image/webp' : isPng ? 'image/png' : 'image/jpeg'

        const newCdnUrl   = await reuploadImage(supabase, buffer, shoe, contentType)

        // Mettre à jour image_url_cdn et image_url (legacy) avec la nouvelle URL
        const { error: updateErr } = await supabase
          .from('shoes')
          .update({
            image_url_cdn:    newCdnUrl,
            image_url:        newCdnUrl,   // legacy compat
            last_image_check: new Date().toISOString(),
            updated_at:       new Date().toISOString(),
          })
          .eq('id', shoe.id)

        if (updateErr) throw new Error(`DB update : ${updateErr.message}`)

        result.cdnOk        = true
        result.redownloaded = true
      } else {
        // 2c. CDN OK (ou pas de source pour retenter) → update uniquement last_image_check
        const { error: updateErr } = await supabase
          .from('shoes')
          .update({ last_image_check: new Date().toISOString() })
          .eq('id', shoe.id)

        if (updateErr) throw new Error(`DB update timestamp : ${updateErr.message}`)
      }
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err)

      // On met quand même à jour last_image_check pour ne pas re-bloquer la file
      await supabase
        .from('shoes')
        .update({ last_image_check: new Date().toISOString() })
        .eq('id', shoe.id)
        .then()
    }

    results.push(result)
  }

  // ── 3. Rapport ────────────────────────────────────────────────────────────

  const ok          = results.filter((r) => r.cdnOk && !r.error).length
  const redownloads = results.filter((r) => r.redownloaded).length
  const broken      = results.filter((r) => !r.cdnOk && !r.error).length
  const errors      = results.filter((r) => !!r.error).length

  return Response.json({
    checked:      results.length,
    ok,
    redownloaded: redownloads,
    broken,
    errors,
    elapsed_ms:   Date.now() - startTime,
    results,
  })
})
