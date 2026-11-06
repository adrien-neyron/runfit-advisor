<script setup lang="ts">
// La page /questionnaire redirige directement vers la modale sur l'accueil
// ou affiche la modale si on y accède directement
const router = useRouter()
const route = useRoute()
const profileStore = useUserProfileStore()

// ?q=<id de question> : ajuste un seul critère (ex. depuis un écran « aucun résultat »).
// Les réponses déjà données sont alors conservées ; sans paramètre, on repart d'un questionnaire vierge.
const startAt = typeof route.query.q === 'string' ? route.query.q : undefined
const modalOpen = ref(false)

// On attend la fin du chargement du profil pour pré-remplir les réponses
watch(
  () => profileStore.loading,
  (loading) => { if (!loading) modalOpen.value = true },
  { immediate: true },
)

const handleClose = () => {
  router.push('/')
}

useSeoMeta({
  title: 'Questionnaire — RunMatch',
  description: 'Réponds à quelques questions pour trouver ta chaussure de running.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center">
    <ToastContainer />
    <QuestionnaireModal
      :open="modalOpen"
      :start-at="startAt"
      :initial-answers="startAt ? (profileStore.profile ?? undefined) : undefined"
      @close="handleClose"
    />
    <div class="text-center text-muted-foreground text-sm">
      Chargement du questionnaire…
    </div>
  </div>
</template>
