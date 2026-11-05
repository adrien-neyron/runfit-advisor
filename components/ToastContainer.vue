<script setup lang="ts">
import { X } from 'lucide-vue-next'

const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <!-- Zone live toujours présente : les nouvelles notifications sont annoncées aux lecteurs d'écran -->
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-relevant="additions"
      class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-2"
      >
        <div
          v-for="t in toasts"
          :key="t.id"
          :role="t.type === 'error' ? 'alert' : 'status'"
          class="bg-card border border-border rounded-2xl shadow-xl pl-4 pr-2 py-3 pointer-events-auto flex items-start gap-2"
          :class="{
            'border-green-500/30': t.type === 'success',
            'border-destructive/30': t.type === 'error',
          }"
        >
          <div class="flex-1 min-w-0 pt-0.5">
            <p class="font-semibold text-sm">{{ t.title }}</p>
            <p v-if="t.description" class="text-xs text-muted-foreground mt-0.5">{{ t.description }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 w-9 h-9 -mt-0.5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Fermer la notification"
            @click="dismiss(t.id)"
          >
            <X class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
