<script setup lang="ts">
import { Footprints } from 'lucide-vue-next'


useSeoMeta({
  title: 'Page introuvable — RunMatch',
  description: "Cette page n'existe pas.",
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4 text-center">
    <Footprints class="w-14 h-14 text-brand" aria-hidden="true" />
    <h1 class="text-3xl font-black tracking-tight">Page introuvable</h1>
    <p class="text-muted-foreground max-w-xs">
      Cette page n'existe pas ou a été déplacée.
    </p>
    <UiButton variant="hero" to="/">
      Retour à l'accueil
    </UiButton>
  </div>
</template>
