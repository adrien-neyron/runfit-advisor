// GET /api/admin/blog — tous les articles (admin)
import { requireAdmin } from '../../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = getSupabaseAdmin()

  const { data, error } = await (supabase as any)
    .from('blog_posts')
    .select('id, title, slug, excerpt, published, published_at, author_name, tags, created_at')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { posts: data ?? [] }
})
