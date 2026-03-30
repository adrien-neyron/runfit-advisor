<template>
  <div class="bg-gray-900 rounded-xl border border-gray-800 p-5">
    <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>
