// GET /api/account/export — export des données personnelles de l'utilisateur connecté (RGPD art. 15 et 20)
//
// Retourne un JSON structuré : compte, profil, équipement, clics d'affiliation et messages de contact
// liés à ce compte. Le jeton est vérifié côté serveur ; seules les lignes de l'appelant sont lues.
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import { requireUser } from '../../utils/requireUser'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const admin = getSupabaseAdmin()

  const emails = user.email ? [user.email, user.email.toLowerCase()] : []

  const [profile, equipment, clicks, clickAnalytics, contact] = await Promise.all([
    admin.from('user_profiles').select('*').eq('user_id', user.id),
    admin.from('user_shoes').select('*').eq('user_id', user.id),
    admin.from('affiliate_clicks').select('*').eq('user_id', user.id),
    admin.from('click_analytics').select('*').eq('user_id', user.id),
    emails.length
      ? admin.from('contact_messages').select('id, created_at, name, email, subject, message').in('email', emails)
      : Promise.resolve({ data: [], error: null }),
  ])

  const failed = [profile, equipment, clicks, clickAnalytics, contact].find((r) => r.error)
  if (failed?.error) {
    console.error('[account/export]', failed.error.message)
    throw createError({ statusCode: 500, statusMessage: 'Export impossible pour le moment.' })
  }

  setResponseHeader(event, 'Cache-Control', 'no-store')
  return {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email, createdAt: user.created_at },
    profile: profile.data ?? [],
    equipment: equipment.data ?? [],
    affiliateClicks: clicks.data ?? [],
    clickAnalytics: clickAnalytics.data ?? [],
    contactMessages: contact.data ?? [],
  }
})
