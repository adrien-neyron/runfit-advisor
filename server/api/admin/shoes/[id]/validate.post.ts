// ============================================================
// POST /api/admin/shoes/:id/validate
// ============================================================
// Valide une chaussure draft :
//   1. Lance le pipeline image si image_original_url est défini
//   2. Crée l'entrée shoe_images avec l'URL optimisée
//   3. Active la chaussure (is_active = true, is_draft = false)

import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../../../utils/supabaseAdmin'
import { processAffiliateImage } from '../../../../services/imagePipeline'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const shoeId = getRouterParam(event, 'id')
  if (!shoeId) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètre "id" manquant.' })
  }

  const supabase = getSupabaseAdmin()

  // Récupérer la chaussure
  const { data: shoe, error: fetchError } = await supabase
    .from('shoes')
    .select('id, brand, model, slug, is_draft, image_original_url, image_url, brands(slug)')
    .eq('id', shoeId)
    .single()

  if (fetchError || !shoe) {
    throw createError({
      statusCode: 404,
      statusMessage: `Chaussure "${shoeId}" introuvable.`,
    })
  }

  let imageProcessed = false
  let imageUrls: Awaited<ReturnType<typeof processAffiliateImage>> | null = null

  // Pipeline image si une URL source est disponible
  const imageSource = shoe.image_original_url || shoe.image_url
  if (imageSource) {
    try {
      const brandSlug =
        (shoe.brands as any)?.slug ||
        shoe.brand.toLowerCase().replace(/\s+/g, '-')
      const shoeSlug = shoe.slug || shoeId

      imageUrls = await processAffiliateImage(imageSource, brandSlug, shoeSlug)

      // Créer ou mettre à jour shoe_images (image principale)
      await supabase.from('shoe_images').upsert(
        {
          shoe_id: shoeId,
          url_original: imageSource,
          url_optimized: imageUrls.card,
          is_primary: true,
          angle: 'side',
          source: 'affiliate',
          last_verified_at: new Date().toISOString(),
        },
        // Si une image primaire existe déjà pour cette chaussure, on la remplace
        { onConflict: 'shoe_id', ignoreDuplicates: false }
      )

      // Mettre à jour l'URL image principale sur la chaussure
      await supabase
        .from('shoes')
        .update({ image_url: imageUrls.card })
        .eq('id', shoeId)

      imageProcessed = true
    } catch (err: any) {
      // On continue la validation même si le pipeline image échoue
      console.error(`[validate] Pipeline image échoué pour ${shoeId} :`, err.message)
    }
  }

  // Activer la chaussure
  const { data: updated, error: updateError } = await supabase
    .from('shoes')
    .update({
      is_active: true,
      is_draft: false,
    })
    .eq('id', shoeId)
    .select()
    .single()

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Erreur lors de l'activation : ${updateError.message}`,
    })
  }

  return {
    shoe: updated,
    imageProcessed,
    imageUrls,
  }
})
