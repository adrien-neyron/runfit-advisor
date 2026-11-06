<script setup lang="ts">
import { Mail, MailCheck, Lock, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const user = useSupabaseUser()
const authStore = useAuthStore()

// Redirige si déjà connecté
watchEffect(() => {
  if (user.value) router.push('/profil')
})

// ?signup=1 (lien depuis « Mes matchs ») ouvre directement l'inscription
type AuthMode = 'login' | 'signup' | 'reset' | 'magic'
const MIN_PASSWORD_LENGTH = 8
const mode = ref<AuthMode>(route.query.signup ? 'signup' : 'login')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
// ?compte-supprime=1 : confirmation persistante après une suppression de compte
const info = ref(route.query['compte-supprime'] ? 'Ton compte et tes données ont été supprimés.' : '')

// Confirmation d'inscription : écran persistant (et non un toast éphémère)
const signupSent = ref(false)
const confirmTitle = ref<HTMLElement | null>(null)
const resending = ref(false)
const resendInfo = ref('')

const handleResend = async () => {
  resending.value = true
  resendInfo.value = ''
  const { error: resendError } = await authStore.resendConfirmation(email.value)
  resending.value = false
  resendInfo.value = resendError
    ? 'Impossible de renvoyer l\'email pour le moment. Réessaie dans quelques minutes.'
    : 'Email renvoyé. Pense à vérifier tes courriers indésirables.'
}

const editSignupEmail = () => {
  signupSent.value = false
  resendInfo.value = ''
}

const switchMode = (next: AuthMode) => {
  mode.value = next
  error.value = ''
  info.value = ''
}

// Mot de passe oublié : message identique que le compte existe ou non (pas de fuite d'information)
const handleReset = async () => {
  if (!email.value) {
    error.value = 'Saisis ton adresse email.'
    return
  }
  loading.value = true
  error.value = ''
  info.value = ''
  await authStore.resetPassword(email.value)
  loading.value = false
  info.value = 'Si un compte existe avec cet email, tu vas recevoir un lien pour choisir un nouveau mot de passe.'
}

// Lien magique : même message que le compte existe ou non (pas de fuite d'information)
const handleMagicLink = async () => {
  if (!email.value) {
    error.value = 'Saisis ton adresse email.'
    return
  }
  loading.value = true
  error.value = ''
  info.value = ''
  const { error: otpError } = await authStore.signInWithMagicLink(email.value)
  loading.value = false
  if (otpError) {
    error.value = 'Impossible d\'envoyer le lien pour le moment. Réessaie dans quelques minutes.'
    return
  }
  info.value = 'Lien envoyé. Ouvre l\'email reçu pour te connecter, pense à vérifier tes courriers indésirables.'
}

// La consigne est lue avant la saisie (aria-describedby) et rappelée dans l'erreur
const passwordDescribedBy = computed(() => {
  const ids = [mode.value === 'signup' ? 'password-hint' : '', error.value ? 'auth-error' : ''].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})

const handleSubmit = async () => {
  if (mode.value === 'reset') return handleReset()
  if (mode.value === 'magic') return handleMagicLink()

  if (!email.value || !password.value) {
    error.value = 'Remplis tous les champs.'
    return
  }

  if (mode.value === 'signup' && password.value.length < MIN_PASSWORD_LENGTH) {
    error.value = `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`
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
    signupSent.value = true
    await nextTick()
    confirmTitle.value?.focus()
  }
}

useSeoMeta({
  title: 'Connexion — RunMatch',
  description: 'Connecte-toi pour retrouver ton profil et tes matchs.',
  robots: 'noindex, nofollow',
})
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
      <!-- Confirmation d'inscription -->
      <div v-if="signupSent" class="text-center space-y-4" data-id="signup-confirmation">
        <NuxtLink to="/" class="text-2xl font-black tracking-tighter">
          RUN<span class="text-gradient">MATCH</span>
        </NuxtLink>
        <MailCheck class="w-12 h-12 mx-auto text-brand mt-4" aria-hidden="true" />
        <h1 ref="confirmTitle" tabindex="-1" class="text-xl font-black focus:outline-none">Vérifie ta boîte mail</h1>
        <p class="text-sm text-muted-foreground">
          Nous avons envoyé un lien de confirmation à <strong class="text-foreground">{{ email }}</strong>.
          Clique dessus pour activer ton compte. Pense à vérifier tes courriers indésirables.
        </p>
        <p v-if="resendInfo" role="status" class="text-sm font-medium rounded-xl bg-secondary p-3">{{ resendInfo }}</p>
        <div class="flex flex-col gap-2 pt-2">
          <UiButton variant="outline" size="lg" :disabled="resending" :aria-busy="resending" @click="handleResend">
            Renvoyer l'email
          </UiButton>
          <button
            type="button"
            class="text-sm text-brand font-semibold hover:underline rounded py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            @click="editSignupEmail"
          >
            Modifier l'adresse email
          </button>
        </div>
      </div>

      <template v-else>
      <!-- Brand -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-2xl font-black tracking-tighter">
          RUN<span class="text-gradient">MATCH</span>
        </NuxtLink>
        <h1 class="text-xl font-black mt-4">
          {{ { login: 'Connexion', signup: 'Créer un compte', reset: 'Mot de passe oublié', magic: 'Connexion par lien email' }[mode] }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ { login: 'Bon retour parmi nous !', signup: 'Rejoins RunMatch gratuitement', reset: 'Saisis ton email, on t\'envoie un lien pour en choisir un nouveau.', magic: 'Saisis ton email, on t\'envoie un lien pour te connecter sans mot de passe.' }[mode] }}
        </p>
      </div>

      <!-- Formulaire -->
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Email -->
        <div class="space-y-1.5">
          <label for="email" class="text-sm font-medium">Email</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              :aria-invalid="error ? 'true' : undefined"
              :aria-describedby="error ? 'auth-error' : undefined"
              placeholder="toi@exemple.fr"
              class="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <!-- Mot de passe -->
        <div v-if="mode === 'login' || mode === 'signup'" class="space-y-1.5">
          <label for="password" class="text-sm font-medium">Mot de passe</label>
          <p v-if="mode === 'signup'" id="password-hint" class="text-sm text-muted-foreground">
            {{ MIN_PASSWORD_LENGTH }} caractères minimum.
          </p>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              required
              :aria-invalid="error ? 'true' : undefined"
              :aria-describedby="passwordDescribedBy"
              placeholder="••••••••"
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
        </div>

        <div v-if="mode === 'login'" class="flex flex-wrap justify-between gap-x-4 gap-y-1 -mt-2">
          <button
            type="button"
            class="text-sm text-brand font-medium hover:underline rounded py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            @click="switchMode('magic')"
          >
            Recevoir un lien de connexion
          </button>
          <button
            type="button"
            class="text-sm text-brand font-medium hover:underline rounded py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            @click="switchMode('reset')"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <!-- Confirmation d'envoi du lien (annoncée aux lecteurs d'écran) -->
        <p v-if="info" role="status" class="text-sm font-medium rounded-xl bg-secondary p-3">{{ info }}</p>

        <!-- Erreur : annoncée aux lecteurs d'écran dès son apparition -->
        <p v-if="error" id="auth-error" role="alert" class="text-sm text-destructive font-medium">{{ error }}</p>

        <!-- Soumettre -->
        <UiButton type="submit" variant="hero" size="lg" class="w-full" :disabled="loading" :aria-busy="loading">
          <template v-if="loading">
            <span class="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true" />
            <span class="sr-only">Connexion en cours…</span>
          </template>
          <span v-else>{{ { login: 'Se connecter', signup: 'Créer mon compte', reset: 'Envoyer le lien', magic: 'Envoyer le lien' }[mode] }}</span>
        </UiButton>
      </form>

      <!-- Basculer connexion / inscription / retour -->
      <p v-if="mode === 'login' || mode === 'signup'" class="text-center text-sm text-muted-foreground mt-6">
        {{ mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?' }}
        <button
          type="button"
          class="text-brand font-semibold hover:underline ml-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          @click="switchMode(mode === 'login' ? 'signup' : 'login')"
        >
          {{ mode === 'login' ? 'S\'inscrire' : 'Se connecter' }}
        </button>
      </p>
      <p v-else class="text-center text-sm mt-6">
        <button
          type="button"
          class="text-brand font-semibold hover:underline rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          @click="switchMode('login')"
        >
          Retour à la connexion
        </button>
      </p>

      <div class="text-center mt-4">
        <NuxtLink to="/" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Retour à l'accueil
        </NuxtLink>
      </div>
      </template>
    </div>
  </div>
</template>
