// Middleware de navigation — protège toutes les routes /admin/* sauf /admin/login
// Utilise getSession() pour éviter le faux null au refresh (session pas encore restaurée)

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') return

  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return navigateTo('/admin/login')
  }
})
