<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'

// Message d'erreur non bloquant avec action « Réessayer ».
// role="status" : annoncé poliment sans interrompre la saisie ; le contenu de repli reste utilisable.
defineProps<{
  message: string
  busy?: boolean
}>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    role="status"
    class="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary p-3 text-sm"
    data-id="retry-notice"
  >
    <p class="flex-1 min-w-48">{{ message }}</p>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 min-h-11 px-3 rounded-lg font-semibold text-brand hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
      :disabled="busy"
      :aria-busy="busy"
      @click="$emit('retry')"
    >
      <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': busy }" aria-hidden="true" />
      Réessayer
    </button>
  </div>
</template>
