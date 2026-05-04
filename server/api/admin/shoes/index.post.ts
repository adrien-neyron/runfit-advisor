// ============================================================
// POST /api/admin/shoes
// ============================================================
// Crée une nouvelle chaussure en base.
// Body JSON : tous les champs requis d'une chaussure.

import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../../utils/supabaseAdmin'

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<Record<string, unknown>>(event)
  if (!body?.brand || !body?.model) {
    throw createError({ statusCode: 400, statusMessage: 'Champs "brand" et "model" requis.' })
  }

  const brand = String(body.brand).trim()
  const model = String(body.model).trim()
  const id    = body.id ? String(body.id).trim() : `${toSlug(brand)}-${toSlug(model)}`
  const slug  = body.slug ? String(body.slug).trim() : id

  const supabase = getSupabaseAdmin()

  // Vérifier unicité
  const { data: existing } = await supabase
    .from('shoes')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: `ID "${id}" déjà utilisé. Modifie l'ID manuellement.` })
  }

  const row = {
    id,
    slug,
    brand,
    model,
    category:           body.category        ?? null,
    gender:             body.gender          ?? 'unisexe',
    release_year:       body.release_year    ?? null,
    prix:               Number(body.prix)    || 0,
    drop_mm:            Number(body.drop_mm) || 0,
    poids_g:            Number(body.poids_g) || 0,
    amorti:             body.amorti          ?? 'moyen',
    stabilite:          body.stabilite       ?? 'moyenne',
    dynamisme:          body.dynamisme       ?? 'moyen',
    pronation:          body.pronation       ?? null,
    terrain_type:       body.terrain_type    ?? null,
    foulee:             body.foulee          ?? [],
    terrain:            body.terrain         ?? [],
    niveau:             body.niveau          ?? [],
    objectif:           body.objectif        ?? [],
    largeur_disponible: body.largeur_disponible ?? [],
    description:        body.description     ?? '',
    benefits:           body.benefits        ?? [],
    is_active:          false,
    is_draft:           true,
    is_available:       false,
    offer_count_active: 0,
  }

  const { data, error } = await supabase
    .from('shoes')
    .insert(row)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
