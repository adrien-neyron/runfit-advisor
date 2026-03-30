<script setup lang="ts">
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

const effectiveSrc = computed(() => {
  if (error.value || !props.src) return '/placeholder.svg'
  return props.src
})
</script>

<template>
  <img
    :src="effectiveSrc"
    :alt="alt"
    :loading="loading"
    :class="props.class"
    @error="error = true"
  />
</template>
