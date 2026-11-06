// Import direct du module (au lieu du barrel #supabase/server) : évite l'avertissement Rollup
// de dépendance circulaire entre chunks. @nuxtjs/supabase ne déclare que le barrel.
declare module '#supabase/server/serverSupabaseClient' {
  export { serverSupabaseClient } from '#supabase/server'
}
