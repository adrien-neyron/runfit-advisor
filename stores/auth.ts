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
      options: { emailRedirectTo: window.location.origin },
    })
    return { error }
  }

  const signOut = async () => {
    await client.auth.signOut()
  }

  return { user, signIn, signUp, signOut }
})
