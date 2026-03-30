// GET /api/blog/:slug — article complet (public)
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, message: 'slug manquant' })

  const supabase = getSupabaseAdmin()
  const { data, error } = await (supabase as any)
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !data) throw createError({ statusCode: 404, message: 'Article introuvable' })

  return data
})
