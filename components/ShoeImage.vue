<script setup lang="ts">
import { Footprints } from 'lucide-vue-next'

interface Props {
  src?: string | null
  alt: string
  class?: string
  loading?: 'eager' | 'lazy'
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
})

const error = ref(false)

// Réinitialiser l'erreur si l'URL source change (important quand le composant est réutilisé)
watch(() => props.src, () => { error.value = false })

// Pas de photo fiable (ou photo cassée) : on n'affiche pas d'image, mais un repère neutre
const noPhoto = computed(() => error.value || !props.src)
</script>

<template>
  <div
    v-if="noPhoto"
    role="img"
    :aria-label="`${alt} — photo non disponible`"
    class="flex flex-col items-center justify-center gap-2 text-neutral-400 bg-neutral-100"
    :class="props.class"
  >
    <Footprints class="w-10 h-10" aria-hidden="true" />
    <span class="text-xs font-medium">Photo à venir</span>
  </div>
  <img
    v-else
    :src="src!"
    :alt="alt"
    :loading="loading"
    :class="props.class"
    @error="error = true"
  />
</template>
