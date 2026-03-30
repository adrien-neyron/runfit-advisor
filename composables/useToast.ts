/**
 * useToast — système de notifications simple
 */
interface Toast {
  id: string
  title: string
  description?: string
  type?: 'default' | 'success' | 'error'
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const toast = (opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const duration = opts.duration ?? 3500
    toasts.value.push({ ...opts, id })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, duration)
  }

  const dismiss = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toast, dismiss, toasts }
}
