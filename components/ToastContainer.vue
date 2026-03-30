<script setup lang="ts">
const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-2"
      >
        <div
          v-for="t in toasts"
          :key="t.id"
          class="bg-card border border-border rounded-2xl shadow-xl px-4 py-3.5 pointer-events-auto cursor-pointer"
          :class="{
            'border-green-500/30': t.type === 'success',
            'border-destructive/30': t.type === 'error',
          }"
          @click="dismiss(t.id)"
        >
          <p class="font-semibold text-sm">{{ t.title }}</p>
          <p v-if="t.description" class="text-xs text-muted-foreground mt-0.5">{{ t.description }}</p>
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
