// PATCH /api/admin/blog/:id — mettre à jour un article
import { requireAdmin } from '../../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id   = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) throw createError({ statusCode: 400, message: 'id manquant' })

  const supabase = getSupabaseAdmin()

  // Si on publie pour la première fois, on fixe published_at
  const updates: Record<string, unknown> = { ...body }
  if (body.published === true) {
    const { data: existing } = await (supabase as any)
      .from('blog_posts').select('published').eq('id', id).single()
    if (!existing?.published) {
      updates.published_at = new Date().toISOString()
    }
  }
  if (body.published === false) {
    updates.published_at = null
  }

  const { data, error } = await (supabase as any)
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
