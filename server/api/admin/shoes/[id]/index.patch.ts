// ============================================================
// PATCH /api/admin/shoes/:id
// ============================================================
// Met à jour les champs d'une chaussure via le service role
// (contourne le RLS qui bloque les writes clients authentifiés).
//
// Body JSON : { image_original_url?, image_url?, category?, ... }
// Règle spéciale : si image_original_url est fourni et image_url
// absent, on copie image_original_url → image_url pour que
// l'image soit visible immédiatement dans l'app et le catalogue.

import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../../../utils/supabaseAdmin'

// Champs autorisés à être modifiés via cette route
const ALLOWED_FIELDS = new Set([
  'image_original_url',
  'image_url',
  'model',
  'brand',
  'category',
  'pronation',
  'terrain_type',
  'gender',
  'release_year',
  'drop_mm',
  'weight_g',
  'prix',
  'is_active',
  'is_draft',
  'slug',
])

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const shoeId = getRouterParam(event, 'id')
  if (!shoeId) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètre "id" manquant.' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Body JSON manquant.' })
  }

  // Filtrer uniquement les champs autorisés
  const updates: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(key)) {
      updates[key] = value
    }
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Aucun champ valide à mettre à jour.' })
  }

  // Synchronisation automatique image_url ← image_original_url
  // Si on fournit une URL source mais pas d'image_url explicite,
  // on utilise l'URL source comme image affichée (hotlink direct).
  // Le pipeline Sharp remplacera ça par une URL Storage lors du validate.
  if ('image_original_url' in updates && !('image_url' in updates)) {
    updates.image_url = updates.image_original_url
  }

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('shoes')
    .update(updates)
    .eq('id', shoeId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
