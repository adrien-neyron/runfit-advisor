<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo / titre -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-xl mb-4">
          <span class="text-white text-xl font-bold">R</span>
        </div>
        <h1 class="text-white text-2xl font-bold">RunFit Admin</h1>
        <p class="text-gray-400 text-sm mt-1">Backoffice de gestion</p>
      </div>

      <!-- Formulaire -->
      <div class="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="admin@example.com"
              class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div v-if="errorMsg" class="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
            {{ errorMsg }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const supabase = useSupabaseClient()
const router   = useRouter()
const user     = useSupabaseUser()

// Déjà connecté → rediriger
if (user.value) {
  await navigateTo('/admin/dashboard')
}

const email    = ref('')
const password = ref('')
const loading  = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  loading.value  = true
  errorMsg.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email:    email.value,
    password: password.value,
  })

  if (error) {
    errorMsg.value = error.message === 'Invalid login credentials'
      ? 'Email ou mot de passe incorrect.'
      : error.message
    loading.value = false
    return
  }

  await router.push('/admin/dashboard')
}
</script>
