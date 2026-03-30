// DELETE /api/admin/blog/:id — supprimer un article
import { requireAdmin } from '../../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id manquant' })

  const { error } = await (getSupabaseAdmin() as any)
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})
