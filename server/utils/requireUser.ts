// Authentifie l'appelant à partir du jeton d'accès Supabase (en-tête Authorization: Bearer <jwt>).
// Le jeton est vérifié auprès de Supabase Auth : on ne fait jamais confiance à un identifiant envoyé par le client.
import type { H3Event } from 'h3'
import type { User } from '@supabase/supabase-js'
import { getSupabaseAdmin } from './supabaseAdmin'

export async function requireUser(event: H3Event): Promise<User> {
  const header = getHeader(event, 'authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Authentification requise.' })
  }

  const { data, error } = await getSupabaseAdmin().auth.getUser(token)
  if (error || !data.user) {
    throw createError({ statusCode: 401, statusMessage: 'Session invalide ou expirée.' })
  }
  return data.user
}
