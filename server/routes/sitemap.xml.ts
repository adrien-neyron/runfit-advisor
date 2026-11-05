import { getSupabaseAdmin } from '../utils/supabaseAdmin'

/**
 * GET /sitemap.xml — pages publiques + une entrée par chaussure active.
 * Les pages privées (profil, résultats, swipe…) sont volontairement absentes (noindex).
 * L'URL de base vient de NUXT_PUBLIC_SITE_URL (à renseigner avec le domaine de production).
 */
const STATIC_PAGES = ['/', '/a-propos', '/contact', '/confidentialite']

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export default defineEventHandler(async (event) => {
  const base = String(useRuntimeConfig(event).public.siteUrl || '').replace(/\/+$/, '')

  const { data, error } = await getSupabaseAdmin()
    .from('shoes')
    .select('id, updated_at')
    .eq('is_active', true)
    .order('id')
  if (error) console.error('[sitemap] shoes lookup failed:', error.message)

  const urls = [
    ...STATIC_PAGES.map((p) => ({ loc: `${base}${p === '/' ? '' : p}${p === '/' ? '/' : ''}`, lastmod: null as string | null })),
    ...((data ?? []) as Array<{ id: string; updated_at: string | null }>).map((s) => ({
      loc: `${base}/shoes/${s.id}`,
      lastmod: s.updated_at ? new Date(s.updated_at).toISOString().slice(0, 10) : null,
    })),
  ]

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
      .join('\n') +
    `\n</urlset>\n`

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
  return xml
})
