// POST /api/account/delete — suppression définitive du compte de l'utilisateur connecté (RGPD art. 17)
//
// - Confirmation obligatoire : l'adresse e-mail du compte doit être renvoyée dans le corps
// - user_profiles et user_shoes disparaissent en cascade avec l'utilisateur (ON DELETE CASCADE)
// - affiliate_clicks et click_analytics sont anonymisés (user_id passe à NULL, ON DELETE SET NULL)
// - Les messages de contact envoyés depuis cette adresse sont supprimés (meilleur effort)
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import { requireUser } from '../../utils/requireUser'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ email?: string }>(event)

  const typed = String(body?.email ?? '').trim().toLowerCase()
  if (!user.email || typed !== user.email.toLowerCase()) {
    throw createError({ statusCode: 400, statusMessage: 'L\'adresse e-mail de confirmation ne correspond pas.' })
  }

  const admin = getSupabaseAdmin()

  const { error: contactError } = await admin
    .from('contact_messages')
    .delete()
    .in('email', [user.email, user.email.toLowerCase()])
  if (contactError) console.error('[account/delete] contact_messages:', contactError.message)

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('[account/delete]', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Suppression impossible pour le moment. Réessaie ou contacte-nous.' })
  }

  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { ok: true }
})
