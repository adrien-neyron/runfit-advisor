// ============================================================
// POST /api/admin/shoes/:id/fetch-image
// ============================================================
// Télécharge une image depuis une URL distante, génère 3 tailles
// WebP via Sharp et les stocke dans Supabase Storage.
// Met à jour image_url_cdn, image_url et image_source_url sur la chaussure.
//
// Body JSON : { url: string }

import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import sharp from 'sharp'
import { requireAdmin } from '../../../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../../../utils/supabaseAdmin'

const BUCKET = 'shoes'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'

async function downloadImage(url: string): Promise<Buffer> {
  const opts = {
    headers: {
      'User-Agent': UA,
      'Accept': 'image/png,image/jpeg,image/webp,image/*;q=0.9,*/*;q=0.8',
      'Referer': new URL(url).origin + '/',
    },
    signal: AbortSignal.timeout(20_000),
  }

  // Essai direct
  try {
    const res = await fetch(url, opts)
    if (res.ok) {
      const ct = res.headers.get('content-type') ?? ''
      if (ct.startsWith('image/')) {
        return Buffer.from(await res.arrayBuffer())
      }
    }
    if (res.status === 404) throw new Error('Image introuvable (404)')
  } catch (e: any) {
    if (e.message?.includes('404')) throw e
  }

  // Proxy allorigins
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  const res2 = await fetch(proxyUrl, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(30_000),
  })
  if (res2.ok) {
    const buf = Buffer.from(await res2.arrayBuffer())
    if (buf.length > 1000) return buf
  }

  throw new Error('Impossible de télécharger l\'image (hotlink protection ?). Essaie le drag & drop.')
}

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const shoeId = getRouterParam(event, 'id')
  if (!shoeId) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètre "id" manquant.' })
  }

  const body = await readBody<{ url?: string }>(event)
  if (!body?.url?.startsWith('http')) {
    throw createError({ statusCode: 400, statusMessage: 'URL invalide.' })
  }

  const supabase = getSupabaseAdmin()

  // Récupérer les infos de la chaussure
  const { data: shoe } = await supabase
    .from('shoes')
    .select('id, slug, brand, brands(slug)')
    .eq('id', shoeId)
    .single()

  if (!shoe) {
    throw createError({ statusCode: 404, statusMessage: `Chaussure "${shoeId}" introuvable.` })
  }

  const brandSlug = (shoe.brands as any)?.slug || toSlug(shoe.brand)
  const shoeSlug  = (shoe as any).slug || shoeId

  const paths = {
    thumb: `${brandSlug}/${shoeSlug}/thumb.webp`,
    card:  `${brandSlug}/${shoeSlug}/card.webp`,
    full:  `${brandSlug}/${shoeSlug}/full.webp`,
  }

  // Téléchargement
  let imageBuffer: Buffer
  try {
    imageBuffer = await downloadImage(body.url)
  } catch (e: any) {
    throw createError({
      statusCode: 422,
      statusMessage: `Impossible de télécharger l'image : ${e.message}. Vérifie que l'URL est accessible et pointe vers une image.`,
    })
  }

  // Génération des 3 tailles WebP
  const [thumbBuf, cardBuf, fullBuf] = await Promise.all([
    sharp(imageBuffer).resize(200, 200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
    sharp(imageBuffer).resize(600, 600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
    sharp(imageBuffer).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(),
  ])

  // Upload en parallèle
  const uploads = await Promise.all([
    supabase.storage.from(BUCKET).upload(paths.thumb, thumbBuf, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' }),
    supabase.storage.from(BUCKET).upload(paths.card,  cardBuf,  { contentType: 'image/webp', upsert: true, cacheControl: '31536000' }),
    supabase.storage.from(BUCKET).upload(paths.full,  fullBuf,  { contentType: 'image/webp', upsert: true, cacheControl: '31536000' }),
  ])

  const uploadErrors = uploads.filter((u) => u.error).map((u) => u.error!.message)
  if (uploadErrors.length > 0) {
    throw createError({ statusCode: 500, statusMessage: uploadErrors.join(' | ') })
  }

  const cdnBase = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}`
  const cardCdnUrl = `${cdnBase}/${paths.card}`

  // Mise à jour de la chaussure
  const { error: updateError } = await supabase
    .from('shoes')
    .update({
      image_url_cdn:      cardCdnUrl,
      image_url:          cardCdnUrl,
      image_source_url:   body.url,
      image_original_url: body.url,
      image_storage_path: paths.card,
      last_image_check:   new Date().toISOString(),
      updated_at:         new Date().toISOString(),
    })
    .eq('id', shoeId)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  return { cdnUrl: cardCdnUrl, paths }
})
