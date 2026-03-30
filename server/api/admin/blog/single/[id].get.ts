// GET /api/admin/blog/single/:id — récupère un article par ID (admin)
import { requireAdmin } from '../../../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id manquant' })

  const { data, error } = await (getSupabaseAdmin() as any)
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw createError({ statusCode: 404, message: 'Article introuvable' })

  return data
})
