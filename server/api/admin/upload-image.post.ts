// ============================================================
// POST /api/admin/upload-image
// ============================================================
// Upload manuel d'une image pour une chaussure.
// Passe par le pipeline Sharp (3 tailles WebP).
//
// Champs multipart/form-data :
//   file       : fichier image (jpg, png, webp)
//   shoe_id    : identifiant de la chaussure
//   angle      : (optionnel) side | top | outsole | lifestyle  (défaut: side)
//   is_primary : (optionnel) "true" | "false"  (défaut: false)

import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import sharp from 'sharp'
import { requireAdmin } from '../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'

const BUCKET = 'shoes'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Form data manquant.' })
  }

  const fileField    = formData.find((f) => f.name === 'file')
  const shoeIdField  = formData.find((f) => f.name === 'shoe_id')
  const angleField   = formData.find((f) => f.name === 'angle')
  const primaryField = formData.find((f) => f.name === 'is_primary')

  if (!fileField?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Champ "file" manquant.' })
  }
  if (!shoeIdField?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Champ "shoe_id" manquant.' })
  }

  const shoeId    = Buffer.from(shoeIdField.data).toString('utf-8').trim()
  const angle     = angleField
    ? Buffer.from(angleField.data).toString('utf-8').trim()
    : 'side'
  const isPrimary = primaryField
    ? Buffer.from(primaryField.data).toString('utf-8').trim() === 'true'
    : false

  const supabase = getSupabaseAdmin()

  // Vérifier que la chaussure existe
  const { data: shoe } = await supabase
    .from('shoes')
    .select('id, slug, brand, brands(slug)')
    .eq('id', shoeId)
    .single()

  if (!shoe) {
    throw createError({ statusCode: 404, statusMessage: `Chaussure "${shoeId}" introuvable.` })
  }

  const brandSlug = (shoe.brands as any)?.slug || shoe.brand.toLowerCase()
  const shoeSlug  = (shoe as any).slug || shoeId
  const base      = `${brandSlug}/${shoeSlug}`
  const suffix    = angle !== 'side' ? `-${angle}` : ''

  const paths = {
    thumb: `${base}/thumb${suffix}.webp`,
    card:  `${base}/card${suffix}.webp`,
    full:  `${base}/full${suffix}.webp`,
  }

  const imageBuffer = Buffer.from(fileField.data)

  // Générer les 3 tailles WebP en parallèle
  const [thumbBuf, cardBuf, fullBuf] = await Promise.all([
    sharp(imageBuffer)
      .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(),
    sharp(imageBuffer)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer(),
    sharp(imageBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer(),
  ])

  // Upload en parallèle dans Storage
  const uploads = await Promise.all([
    supabase.storage.from(BUCKET).upload(paths.thumb, thumbBuf, {
      contentType: 'image/webp', upsert: true, cacheControl: '31536000',
    }),
    supabase.storage.from(BUCKET).upload(paths.card, cardBuf, {
      contentType: 'image/webp', upsert: true, cacheControl: '31536000',
    }),
    supabase.storage.from(BUCKET).upload(paths.full, fullBuf, {
      contentType: 'image/webp', upsert: true, cacheControl: '31536000',
    }),
  ])

  const uploadErrors = uploads.filter((u) => u.error).map((u) => u.error!.message)
  if (uploadErrors.length > 0) {
    throw createError({ statusCode: 500, statusMessage: uploadErrors.join(' | ') })
  }

  const base64Url = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}`
  const urls = {
    thumb: `${base64Url}/${paths.thumb}`,
    card:  `${base64Url}/${paths.card}`,
    full:  `${base64Url}/${paths.full}`,
  }

  // Enregistrer en base
  const { data: imageRecord, error: imgError } = await supabase
    .from('shoe_images')
    .insert({
      shoe_id:          shoeId,
      url_original:     urls.full,
      url_optimized:    urls.card,
      is_primary:       isPrimary,
      angle:            angle as any,
      source:           'manual',
      last_verified_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (imgError) {
    throw createError({ statusCode: 500, statusMessage: imgError.message })
  }

  // Si image primaire → mettre à jour shoes.image_url
  if (isPrimary) {
    await supabase
      .from('shoes')
      .update({ image_url: urls.card })
      .eq('id', shoeId)
  }

  return { urls, image: imageRecord }
})
