<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4 text-center">
    <p class="text-6xl">🏃</p>
    <h1 class="text-3xl font-black tracking-tight">Page introuvable</h1>
    <p class="text-muted-foreground max-w-xs">
      Cette page n'existe pas ou a été déplacée.
    </p>
    <UiButton variant="hero" @click="router.push('/')">
      Retour à l'accueil
    </UiButton>
  </div>
</template>
