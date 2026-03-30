<template>
  <div class="bg-gray-800/50 rounded-lg px-3 py-2">
    <p class="text-xs text-gray-500 mb-0.5">{{ label }}</p>
    <p class="text-sm font-medium text-gray-100">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string }>()
</script>
