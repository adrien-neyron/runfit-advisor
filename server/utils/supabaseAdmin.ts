// ============================================================
// Client Supabase admin (service_role) — usage serveur uniquement
// ============================================================
// Utilise la SUPABASE_SERVICE_ROLE_KEY pour contourner les RLS.
// NE JAMAIS exposer ce client côté navigateur.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Singleton — une seule instance par process Nitro
let _adminClient: SupabaseClient | null = null

/**
 * Retourne un client Supabase avec droits complets (service_role).
 * Les variables d'environnement doivent être définies dans .env :
 *   SUPABASE_URL              → URL du projet
 *   SUPABASE_SERVICE_ROLE_KEY → clé service role (dashboard > Settings > API)
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      '[supabaseAdmin] Variables manquantes : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.'
    )
  }

  _adminClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return _adminClient
}
