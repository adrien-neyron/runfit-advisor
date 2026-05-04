<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    shoeId: string
    merchant?: string
    country?: string
    label?: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'primary' | 'secondary'
  }>(),
  {
    merchant: 'amazon',
    country:  'FR',
    size:     'md',
    variant:  'primary',
  },
)

const emit = defineEmits<{ click: [] }>()

// Passe par l'endpoint serveur : tracking + tag garanti, pas d'URL affiliée exposée
const href = computed(
  () => `/api/affiliate/${props.merchant}/${props.shoeId}?country=${props.country}`,
)

const displayLabel = computed(() => {
  if (props.label) return props.label
  const labels: Record<string, string> = {
    amazon:    'Amazon',
    irun:      'i-Run',
    alltricks: 'Alltricks',
    decathlon: 'Decathlon',
    courir:    'Courir',
  }
  return `Voir le prix chez ${labels[props.merchant] ?? props.merchant}`
})

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
}

const variantClasses: Record<string, string> = {
  primary:   'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
}
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="nofollow sponsored noopener noreferrer"
    :class="[
      'inline-flex items-center justify-center font-semibold rounded-lg transition-colors',
      sizeClasses[size],
      variantClasses[variant],
    ]"
    @click="emit('click')"
  >
    <slot>{{ displayLabel }}</slot>
    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  </a>
</template>
