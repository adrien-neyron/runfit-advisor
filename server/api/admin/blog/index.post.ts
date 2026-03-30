// POST /api/admin/blog — créer un article
import { requireAdmin } from '../../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../../utils/supabaseAdmin'

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { title, slug, excerpt, content, cover_url, published, author_name, tags } = body

  if (!title?.trim()) throw createError({ statusCode: 400, message: 'Titre requis' })
  if (!content?.trim()) throw createError({ statusCode: 400, message: 'Contenu requis' })

  const finalSlug = (slug?.trim() || toSlug(title))
  const supabase  = getSupabaseAdmin()

  const row = {
    title:        title.trim(),
    slug:         finalSlug,
    excerpt:      (excerpt ?? '').trim(),
    content:      content.trim(),
    cover_url:    cover_url || null,
    published:    published === true,
    published_at: published === true ? new Date().toISOString() : null,
    author_name:  (author_name || 'RunMatch').trim(),
    tags:         Array.isArray(tags) ? tags : [],
  }

  const { data, error } = await (supabase as any)
    .from('blog_posts')
    .insert(row)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
