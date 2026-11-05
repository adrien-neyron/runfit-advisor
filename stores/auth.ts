import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  const signIn = async (email: string, password: string) => {
    const { error } = await client.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/confirm` },
    })
    return { error }
  }

  // Renvoie l'email de confirmation d'inscription
  const resendConfirmation = async (email: string) => {
    const { error } = await client.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/confirm` },
    })
    return { error }
  }

  // Demande d'un lien de réinitialisation (la réponse ne révèle pas si le compte existe)
  const resetPassword = async (email: string) => {
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/mot-de-passe`,
    })
    return { error }
  }

  // Définit le nouveau mot de passe (session de récupération ouverte par le lien reçu par email)
  const updatePassword = async (password: string) => {
    const { error } = await client.auth.updateUser({ password })
    return { error }
  }

  const signOut = async () => {
    await client.auth.signOut()
  }

  return { user, signIn, signUp, resendConfirmation, resetPassword, updatePassword, signOut }
})
