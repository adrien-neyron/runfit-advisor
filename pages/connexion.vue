<script setup lang="ts">
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const user = useSupabaseUser()
const authStore = useAuthStore()
const { toast } = useToast()

// Redirige si déjà connecté
watchEffect(() => {
  if (user.value) router.push('/profil')
})

const mode = ref<'login' | 'signup'>('login')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs.'
    return
  }

  loading.value = true
  error.value = ''

  const result =
    mode.value === 'login'
      ? await authStore.signIn(email.value, password.value)
      : await authStore.signUp(email.value, password.value)

  loading.value = false

  if (result.error) {
    if (result.error.message?.includes('Invalid login credentials')) {
      error.value = 'Email ou mot de passe incorrect.'
    } else if (result.error.message?.includes('User already registered')) {
      error.value = 'Un compte existe déjà avec cet email.'
    } else {
      error.value = result.error.message ?? 'Une erreur est survenue.'
    }
  } else if (mode.value === 'signup') {
    toast({
      title: 'Compte créé !',
      description: 'Vérifiez votre email pour confirmer votre compte.',
      type: 'success',
    })
  }
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <ToastContainer />
    <div
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
      class="w-full max-w-sm"
    >
      <!-- Brand -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-2xl font-black tracking-tighter">
          RUN<span class="text-gradient">MATCH</span>
        </NuxtLink>
        <h1 class="text-xl font-black mt-4">
          {{ mode === 'login' ? 'Connexion' : 'Créer un compte' }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ mode === 'login' ? 'Bon retour parmi nous !' : 'Rejoignez RunMatch gratuitement' }}
        </p>
      </div>

      <!-- Formulaire -->
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Email -->
        <div class="space-y-1.5">
          <label for="email" class="text-sm font-medium">Email</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="vous@exemple.fr"
              class="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <!-- Mot de passe -->
        <div class="space-y-1.5">
          <label for="password" class="text-sm font-medium">Mot de passe</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              required
              placeholder="••••••••"
              class="w-full h-10 pl-9 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Erreur -->
        <p v-if="error" class="text-sm text-destructive font-medium">{{ error }}</p>

        <!-- Soumettre -->
        <UiButton type="submit" variant="hero" size="lg" class="w-full" :disabled="loading">
          <span v-if="loading" class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <span v-else>{{ mode === 'login' ? 'Se connecter' : 'Créer mon compte' }}</span>
        </UiButton>
      </form>

      <!-- Switcher login/signup -->
      <p class="text-center text-sm text-muted-foreground mt-6">
        {{ mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?' }}
        <button
          class="text-primary font-semibold hover:underline ml-1"
          @click="mode = mode === 'login' ? 'signup' : 'login'; error = ''"
        >
          {{ mode === 'login' ? 'S\'inscrire' : 'Se connecter' }}
        </button>
      </p>

      <div class="text-center mt-4">
        <NuxtLink to="/" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Retour à l'accueil
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
