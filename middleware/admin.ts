// Middleware de navigation — protège toutes les routes /admin/* sauf /admin/login

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!user.value) {
      return navigateTo('/admin/login')
    }
  }
})
