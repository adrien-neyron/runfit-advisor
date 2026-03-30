// ============================================================
// Utilitaire : vérification accès admin
// ============================================================
// À appeler en tête de chaque route API admin.
// Vérifie que l'utilisateur est authentifié ET dans ADMIN_EMAILS.

import { createError } from 'h3'
import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
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
  // Si vide ou absent → tous les utilisateurs connectés sont admin (mode dev)
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (adminEmails.length > 0 && !adminEmails.includes(user.email ?? '')) {
    throw createError({
      statusCode: 403,
      statusMessage: `Accès refusé. ${user.email} n'est pas dans la liste admin.`,
    })
  }

  return user
}
