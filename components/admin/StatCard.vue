<template>
  <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
    <p class="text-sm text-gray-400 mb-1">{{ label }}</p>
    <p
      class="text-3xl font-bold"
      :class="{
        'text-green-400': color === 'green',
        'text-orange-400': color === 'orange',
        'text-red-400': color === 'red',
        'text-blue-400': color === 'blue',
        'text-white': !color,
      }"
    >
      {{ value }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number
  color?: 'green' | 'orange' | 'red' | 'blue'
}>()
</script>
