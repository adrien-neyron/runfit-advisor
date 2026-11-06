// ============================================================
// Utilitaire : vérification accès admin
// ============================================================
// À appeler en tête de chaque route API admin.
// Vérifie que l'utilisateur est authentifié ET dans ADMIN_EMAILS.

import { createError } from 'h3'
import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server/serverSupabaseClient'
import type { User } from '@supabase/supabase-js'

/**
 * Vérifie auth + droits admin. Lance une erreur HTTP si KO.
 * @returns L'objet User Supabase si tout est OK
 */
export async function requireAdmin(event: H3Event): Promise<User> {
  const client = await serverSupabaseClient(event)
  const {
    data: { user },
    error,
  } = await client.auth.getUser()

  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié. Veuillez vous connecter.',
    })
  }

  // ADMIN_EMAILS = liste CSV d'emails autorisés (ex: "a@b.com,c@d.com")
  // Liste vide ou absente → personne n'est admin : une variable oubliée ne doit jamais ouvrir l'accès
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (adminEmails.length === 0) {
    console.error('[requireAdmin] ADMIN_EMAILS est vide : accès admin refusé à tout le monde.')
  }

  if (!adminEmails.includes((user.email ?? '').toLowerCase())) {
    throw createError({
      statusCode: 403,
      statusMessage: `Accès refusé. ${user.email} n'est pas dans la liste admin.`,
    })
  }

  return user
}
