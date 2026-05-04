<script setup lang="ts">
defineProps<{ compact?: boolean }>()
</script>

<template>
  <p
    :class="[
      'text-xs text-muted-foreground',
      compact
        ? 'mt-1'
        : 'mt-4 px-1 border-t border-border pt-3',
    ]"
  >
    <span class="font-medium">Liens affiliés — </span>
    En tant que Partenaire Amazon, nous réalisons un bénéfice sur les achats remplissant les conditions requises.
    Les prix affichés sont indicatifs et peuvent varier.
  </p>
</template>
