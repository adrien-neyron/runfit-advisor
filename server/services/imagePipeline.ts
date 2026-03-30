// ============================================================
// Image Pipeline — RunFit Admin
// ============================================================
// Télécharge une image distante, génère 3 tailles WebP via Sharp,
// uploade dans le bucket Supabase Storage "shoes".
//
// Structure Storage :
//   shoes/{brand-slug}/{shoe-slug}/thumb.webp   → 200px
//   shoes/{brand-slug}/{shoe-slug}/card.webp    → 600px
//   shoes/{brand-slug}/{shoe-slug}/full.webp    → 1200px

import sharp from 'sharp'
import { getSupabaseAdmin } from '../utils/supabaseAdmin'
import type { ImagePipelineResult } from '../types/admin'

const BUCKET = 'shoes'

// ─── Helpers privés ───────────────────────────────────────────────────────────

/**
 * Construit l'URL publique Cloudflare/Supabase pour un chemin Storage.
 */
function publicUrl(storagePath: string): string {
  const base = process.env.SUPABASE_URL
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

/**
 * Télécharge une image distante et retourne un Buffer.
 * Timeout 30s, User-Agent défini pour éviter les blocages CDN.
 */
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; RunFitBot/1.0; +https://runfit.app)',
      Accept: 'image/*',
    },
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    throw new Error(
      `Téléchargement échoué (${response.status} ${response.statusText}) : ${url}`
    )
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Upload un buffer WebP dans Supabase Storage.
 * Écrase le fichier si déjà présent (upsert).
 */
async function uploadBuffer(buffer: Buffer, storagePath: string): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'image/webp',
      upsert: true,
      cacheControl: '31536000', // 1 an — compatible Cloudflare CDN
    })

  if (error) {
    throw new Error(`Upload Storage échoué (${storagePath}) : ${error.message}`)
  }
}

// ─── Export principal ─────────────────────────────────────────────────────────

/**
 * Pipeline complet :
 * 1. Télécharge l'image source
 * 2. Génère thumb (200px), card (600px), full (1200px) en WebP
 * 3. Uploade les 3 variantes dans Storage
 * 4. Retourne les URLs publiques + chemins Storage
 *
 * @param imageUrl   URL de l'image source (CDN affilié ou marque)
 * @param brandSlug  Slug de la marque  (ex: "nike")
 * @param shoeSlug   Slug de la chaussure (ex: "pegasus-41")
 */
export async function processAffiliateImage(
  imageUrl: string,
  brandSlug: string,
  shoeSlug: string
): Promise<ImagePipelineResult> {
  // 1. Téléchargement
  const sourceBuffer = await downloadImage(imageUrl)

  // 2. Chemins de destination dans Storage
  const base = `${brandSlug}/${shoeSlug}`
  const paths = {
    thumb: `${base}/thumb.webp`,
    card: `${base}/card.webp`,
    full: `${base}/full.webp`,
  }

  // 3. Génération des 3 tailles en parallèle
  //    fit: 'inside' = conserve le ratio, ne dépasse pas les dimensions
  const [thumbBuf, cardBuf, fullBuf] = await Promise.all([
    sharp(sourceBuffer)
      .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(),

    sharp(sourceBuffer)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer(),

    sharp(sourceBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer(),
  ])

  // 4. Upload en parallèle
  await Promise.all([
    uploadBuffer(thumbBuf, paths.thumb),
    uploadBuffer(cardBuf, paths.card),
    uploadBuffer(fullBuf, paths.full),
  ])

  // 5. Résultat
  return {
    thumb: publicUrl(paths.thumb),
    card: publicUrl(paths.card),
    full: publicUrl(paths.full),
    storagePaths: paths,
  }
}
