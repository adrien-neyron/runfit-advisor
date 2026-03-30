// ============================================================
// GET /api/admin/shoes-drafts
// ============================================================
// Retourne les chaussures non validées (is_draft = true)
// avec leurs images et liens affiliés.

import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('shoes')
    .select(
      `
      id, brand, model, slug, category, drop_mm, poids_g, weight_g,
      pronation, terrain_type, gender, release_year, prix,
      image_url, image_original_url, is_active, is_draft, created_at,
      brands ( id, name, slug, logo_url ),
      shoe_images ( id, url_optimized, url_original, is_primary, angle ),
      affiliate_links ( id, merchant, url, price_last_seen, is_active )
    `
    )
    .eq('is_draft', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
