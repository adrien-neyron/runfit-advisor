// GET /api/blog — articles publiés (public)
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 10, 50)

  const supabase = getSupabaseAdmin()
  const { data, error } = await (supabase as any)
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_url, published_at, author_name, tags')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { posts: data ?? [] }
})
