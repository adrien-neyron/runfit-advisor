<script setup lang="ts">
import { MailCheck, MailWarning } from 'lucide-vue-next'

/**
 * Page de retour des liens Supabase (confirmation d'email, lien magique).
 * `redirectOptions.callback` pointe ici : la session est ouverte par le client Supabase à partir
 * de l'URL ; on attend l'utilisateur puis on redirige. En cas de lien expiré ou invalide, on l'explique.
 */
const user = useSupabaseUser()
const route = useRoute()

type State = 'checking' | 'error'
const state = ref<State>('checking')
const title = ref<HTMLElement | null>(null)

// Supabase place les erreurs dans le hash (#error=access_denied&error_code=otp_expired) ou la query
const readError = () => {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return (
    params.get('error_code') ||
    params.get('error') ||
    (route.query.error_code as string | undefined) ||
    (route.query.error as string | undefined) ||
    null
  )
}

const errorCode = ref<string | null>(null)

watch(
  user,
  (u) => {
    if (u) navigateTo('/profil', { replace: true })
  },
  { immediate: true },
)

onMounted(() => {
  errorCode.value = readError()
  if (errorCode.value) {
    state.value = 'error'
    return
  }
  // Pas de session au bout de 8 s : lien déjà utilisé ou expiré
  setTimeout(() => {
    if (!user.value) state.value = 'error'
  }, 8000)
})

watch(state, async () => {
  await nextTick()
  title.value?.focus()
})

const expired = computed(() => errorCode.value === 'otp_expired')

useSeoMeta({
  title: 'Confirmation de ton compte — RunMatch',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-sm text-center space-y-4">
      <NuxtLink to="/" class="text-2xl font-black tracking-tighter">
        RUN<span class="text-gradient">MATCH</span>
      </NuxtLink>

      <div v-if="state === 'checking'" role="status" class="space-y-4 pt-4">
        <MailCheck class="w-12 h-12 mx-auto text-brand" aria-hidden="true" />
        <h1 ref="title" tabindex="-1" class="text-xl font-black focus:outline-none">Confirmation en cours…</h1>
        <p class="text-sm text-muted-foreground">On ouvre ta session, un instant.</p>
      </div>

      <div v-else class="space-y-4 pt-4">
        <MailWarning class="w-12 h-12 mx-auto text-brand" aria-hidden="true" />
        <h1 ref="title" tabindex="-1" class="text-xl font-black focus:outline-none">
          {{ expired ? 'Ce lien a expiré' : 'Lien invalide ou déjà utilisé' }}
        </h1>
        <p class="text-sm text-muted-foreground">
          Si ton compte est déjà confirmé, tu peux simplement te connecter. Sinon, crée ton compte à nouveau
          pour recevoir un nouveau lien de confirmation.
        </p>
        <div class="flex flex-col gap-2 pt-2">
          <UiButton to="/connexion" variant="hero" size="lg">Me connecter</UiButton>
          <UiButton to="/connexion?signup=1" variant="outline" size="lg">Recevoir un nouveau lien</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
