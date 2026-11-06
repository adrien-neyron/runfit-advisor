<script setup lang="ts">
import { Heart, X, Info } from 'lucide-vue-next'
import type { SwipeDeckItem } from '~/data/shoes'

interface Props {
  deck: SwipeDeckItem[]
  onSwipe: (shoeId: string, liked: boolean) => void
  onEmpty: () => void
}

const props = defineProps<Props>()

// Stack : dernier élément = carte du dessus
const stack = ref<SwipeDeckItem[]>([...props.deck])
const exitDirection = ref<'left' | 'right' | null>(null)

const total = props.deck.length
const visibleStack = computed(() => stack.value.slice(-3))
const topShoe = computed(() => stack.value[stack.value.length - 1]?.shoe)
const progress = computed(() => ((total - stack.value.length) / total) * 100)

// Annonce vocale (lecteurs d'écran) : résultat du geste + carte suivante
const announcement = ref('')
const describeTop = () => {
  const item = stack.value[stack.value.length - 1]
  if (!item) return ''
  const stars = Math.min(5, Math.max(1, Math.round((item.score / 90) * 5)))
  return `Modèle ${total - stack.value.length + 1} sur ${total} : ${item.shoe.brand} ${item.shoe.model}, correspondance ${stars} sur 5.`
}

const popTop = (liked: boolean) => {
  if (!topShoe.value) return
  const name = `${topShoe.value.brand} ${topShoe.value.model}`
  props.onSwipe(topShoe.value.id, liked)
  stack.value = stack.value.slice(0, -1)
  const verdict = liked ? `${name} ajouté à tes matchs.` : `${name} passé.`
  announcement.value = stack.value.length ? `${verdict} ${describeTop()}` : `${verdict} Dernier modèle terminé.`
  if (stack.value.length === 0) setTimeout(props.onEmpty, 250)
  exitDirection.value = null
}

// Bouton déclenche une sortie programmatique
const triggerExit = (liked: boolean) => {
  if (exitDirection.value || stack.value.length === 0) return
  exitDirection.value = liked ? 'right' : 'left'
}

// Fin d'animation programmatique
const handleExitComplete = () => {
  popTop(exitDirection.value === 'right')
}

// Fin de drag swipe
const handleDragSwipe = (liked: boolean) => {
  popTop(liked)
}

// Raccourcis clavier : ← passer, → matcher (alternative au glisser, WCAG 2.1.1)
const onKeydown = (e: KeyboardEvent) => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
  const t = e.target as HTMLElement | null
  if (t && (t.closest('input, textarea, select, [contenteditable], [role="dialog"]'))) return
  if (e.key === 'ArrowLeft') { e.preventDefault(); triggerExit(false) }
  else if (e.key === 'ArrowRight') { e.preventDefault(); triggerExit(true) }
}
onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  announcement.value = describeTop()
})
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="stack.length > 0" class="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
    <!-- Annonce pour les lecteurs d'écran -->
    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>

    <!-- Barre de progression -->
    <div class="w-full flex items-center gap-3">
      <div
        class="flex-1 bg-secondary rounded-full h-2 overflow-hidden"
        role="progressbar"
        aria-label="Progression du swipe"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(progress)"
      >
        <div
          class="h-2 rounded-full bg-primary transition-all duration-400 ease-out"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <span class="text-sm text-muted-foreground shrink-0 tabular-nums font-medium">
        {{ total - stack.length }}/{{ total }}
      </span>
    </div>

    <!-- Deck de cartes -->
    <div class="relative w-full" style="height: 440px">
      <ShoeSwipeCard
        v-for="(item, index) in visibleStack"
        :key="item.shoe.id"
        :shoe="item.shoe"
        :score="item.score"
        :is-top="index === visibleStack.length - 1"
        :stack-index="visibleStack.length - 1 - index"
        :exit-direction="index === visibleStack.length - 1 ? exitDirection : null"
        @swipe="index === visibleStack.length - 1 ? handleDragSwipe($event) : undefined"
        @exit-complete="index === visibleStack.length - 1 ? handleExitComplete() : undefined"
      />
    </div>

    <!-- Boutons d'action -->
    <div class="flex items-center justify-center gap-5">
      <button
        type="button"
        :disabled="!!exitDirection || stack.length === 0"
        class="w-14 h-14 rounded-full bg-card border-2 border-red-700 text-red-700 dark:border-red-400 dark:text-red-400 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-40 disabled:scale-100"
        aria-label="Passer ce modèle"
        aria-keyshortcuts="ArrowLeft"
        @click="triggerExit(false)"
      >
        <X class="w-6 h-6" aria-hidden="true" />
      </button>

      <NuxtLink
        v-if="topShoe"
        :to="`/shoes/${topShoe.slug}`"
        class="w-11 h-11 rounded-full bg-card border border-border text-muted-foreground flex items-center justify-center shadow hover:scale-110 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :aria-label="`Voir les détails de ${topShoe.brand} ${topShoe.model}`"
      >
        <Info class="w-4 h-4" aria-hidden="true" />
      </NuxtLink>

      <button
        type="button"
        :disabled="!!exitDirection || stack.length === 0"
        class="w-14 h-14 rounded-full bg-card border-2 border-green-700 text-green-700 dark:border-green-500 dark:text-green-500 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-40 disabled:scale-100"
        aria-label="Matcher ce modèle"
        aria-keyshortcuts="ArrowRight"
        @click="triggerExit(true)"
      >
        <Heart class="w-6 h-6" aria-hidden="true" />
      </button>
    </div>

    <p class="text-sm text-muted-foreground text-center">
      ← Glisse pour passer · Matcher pour garder → <span class="sr-only">Au clavier : flèche gauche pour passer, flèche droite pour matcher.</span>
    </p>
  </div>
</template>
