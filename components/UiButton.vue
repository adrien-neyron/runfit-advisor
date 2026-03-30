<script setup lang="ts">
interface Props {
  variant?: 'default' | 'hero' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  disabled: false,
  type: 'button',
})

const emit = defineEmits<{ click: [e: MouseEvent] }>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'hero':
      return 'accent-gradient text-white hover:opacity-90 shadow-md'
    case 'outline':
      return 'border-2 border-border bg-background hover:bg-secondary text-foreground'
    case 'ghost':
      return 'bg-transparent hover:bg-secondary text-foreground'
    case 'destructive':
      return 'bg-destructive text-destructive-foreground hover:opacity-90'
    default:
      return 'bg-primary text-primary-foreground hover:opacity-90'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-8 px-3 text-xs gap-1.5'
    case 'lg':
      return 'h-11 px-6 text-base gap-2'
    case 'xl':
      return 'h-14 px-8 text-base gap-2'
    case 'icon':
      return 'h-9 w-9 p-0'
    default:
      return 'h-9 px-4 text-sm gap-2'
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none active:scale-95"
    :class="[variantClasses, sizeClasses, props.class]"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>
