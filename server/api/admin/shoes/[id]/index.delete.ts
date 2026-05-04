// ============================================================
// DELETE /api/admin/shoes/:id
// ============================================================
// Désactive une chaussure (is_active = false, is_available = false).
// Passe par ?hard=true pour une suppression définitive.

import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'
import { requireAdmin } from '../../../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const shoeId = getRouterParam(event, 'id')
  if (!shoeId) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètre "id" manquant.' })
  }

  const { hard } = getQuery(event)
  const supabase  = getSupabaseAdmin()

  if (hard === 'true') {
    // Suppression définitive
    const { error } = await supabase.from('shoes').delete().eq('id', shoeId)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { deleted: true, id: shoeId }
  }

  // Désactivation douce (défaut)
  // is_available est une colonne GENERATED — elle se recalcule automatiquement
  const { error } = await supabase
    .from('shoes')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', shoeId)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { deactivated: true, id: shoeId }
})
