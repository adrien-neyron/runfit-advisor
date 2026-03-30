<script setup lang="ts">
// La page /questionnaire redirige directement vers la modale sur l'accueil
// ou affiche la modale si on y accède directement
const router = useRouter()
const modalOpen = ref(true)

const handleClose = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center">
    <ToastContainer />
    <QuestionnaireModal :open="modalOpen" @close="handleClose" />
    <div class="text-center text-muted-foreground text-sm">
      Chargement du questionnaire…
    </div>
  </div>
</template>
