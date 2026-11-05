<script setup lang="ts">
import { Lock, Eye, EyeOff } from 'lucide-vue-next'

/**
 * Page d'arrivée du lien « mot de passe oublié » envoyé par Supabase.
 * Le lien ouvre une session de récupération : tant qu'elle n'existe pas, on n'affiche pas le formulaire.
 */
const router = useRouter()
const user = useSupabaseUser()
const authStore = useAuthStore()
const { toast } = useToast()

const state = ref<'checking' | 'form' | 'invalid'>('checking')
const password = ref('')
const confirm = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  // La session de récupération est lue dans l'URL par le module Supabase : on lui laisse un court délai
  const stop = watch(
    user,
    (u) => {
      if (u) {
        state.value = 'form'
        stop()
      }
    },
    { immediate: true },
  )
  setTimeout(() => {
    if (state.value === 'checking') state.value = 'invalid'
  }, 3000)
})

const handleSubmit = async () => {
  error.value = ''
  if (password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Les deux mots de passe ne sont pas identiques.'
    return
  }
  loading.value = true
  const { error: err } = await authStore.updatePassword(password.value)
  loading.value = false
  if (err) {
    error.value = err.message?.includes('different from the old password')
      ? 'Choisis un mot de passe différent de l\'ancien.'
      : 'Impossible de modifier le mot de passe. Demande un nouveau lien depuis la page de connexion.'
    return
  }
  toast({ title: 'Mot de passe modifié', description: 'Tu es connecté.', type: 'success' })
  router.push('/profil')
}

useSeoMeta({
  title: 'Nouveau mot de passe — RunMatch',
  description: 'Choisis un nouveau mot de passe pour ton compte RunMatch.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <ToastContainer />
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-2xl font-black tracking-tighter">
          RUN<span class="text-gradient">MATCH</span>
        </NuxtLink>
        <h1 class="text-xl font-black mt-4">Nouveau mot de passe</h1>
      </div>

      <p v-if="state === 'checking'" role="status" class="text-center text-sm text-muted-foreground">
        Vérification du lien…
      </p>

      <div v-else-if="state === 'invalid'" class="text-center space-y-4">
        <p role="alert" class="text-sm">
          Ce lien n'est plus valide ou a déjà été utilisé.
        </p>
        <UiButton variant="hero" to="/connexion">Demander un nouveau lien</UiButton>
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-1.5">
          <label for="new-password" class="text-sm font-medium">Nouveau mot de passe</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input
              id="new-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              minlength="8"
              aria-describedby="password-hint"
              class="w-full h-10 pl-9 pr-11 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              class="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" aria-hidden="true" />
              <Eye v-else class="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <p id="password-hint" class="text-xs text-muted-foreground">8 caractères minimum.</p>
        </div>

        <div class="space-y-1.5">
          <label for="confirm-password" class="text-sm font-medium">Confirme le mot de passe</label>
          <input
            id="confirm-password"
            v-model="confirm"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            class="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <p v-if="error" role="alert" class="text-sm text-destructive font-medium">{{ error }}</p>

        <UiButton type="submit" variant="hero" size="lg" class="w-full" :disabled="loading" :aria-busy="loading">
          <template v-if="loading">
            <span class="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true" />
            <span class="sr-only">Enregistrement en cours…</span>
          </template>
          <span v-else>Enregistrer</span>
        </UiButton>
      </form>
    </div>
  </div>
</template>
