<script setup lang="ts">
import { Heart, X, Info } from 'lucide-vue-next'
import type { SwipeDeckItem } from '~/data/shoes'

interface Props {
  deck: SwipeDeckItem[]
  onSwipe: (shoeId: string, liked: boolean) => void
  onEmpty: () => void
}

const props = defineProps<Props>()
const router = useRouter()

// Stack : dernier élément = carte du dessus
const stack = ref<SwipeDeckItem[]>([...props.deck])
const exitDirection = ref<'left' | 'right' | null>(null)

const total = props.deck.length
const visibleStack = computed(() => stack.value.slice(-3))
const topShoe = computed(() => stack.value[stack.value.length - 1]?.shoe)
const progress = computed(() => ((total - stack.value.length) / total) * 100)

const popTop = (liked: boolean) => {
  if (!topShoe.value) return
  props.onSwipe(topShoe.value.id, liked)
  stack.value = stack.value.slice(0, -1)
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
</script>

<template>
  <div v-if="stack.length > 0" class="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
    <!-- Barre de progression -->
    <div class="w-full flex items-center gap-3">
      <div class="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
        <div
          class="h-2 rounded-full bg-primary transition-all duration-400 ease-out"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <span class="text-xs text-muted-foreground shrink-0 tabular-nums font-medium">
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
        :disabled="!!exitDirection || stack.length === 0"
        class="w-14 h-14 rounded-full bg-card border-2 border-red-400 text-red-400 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-40 disabled:scale-100"
        aria-label="Passer"
        @click="triggerExit(false)"
      >
        <X class="w-6 h-6" />
      </button>

      <button
        class="w-10 h-10 rounded-full bg-card border border-border text-muted-foreground flex items-center justify-center shadow hover:scale-110 active:scale-95 transition-transform"
        aria-label="Voir les détails"
        @click="topShoe && router.push(`/shoes/${topShoe.slug}`)"
      >
        <Info class="w-4 h-4" />
      </button>

      <button
        :disabled="!!exitDirection || stack.length === 0"
        class="w-14 h-14 rounded-full bg-card border-2 border-green-500 text-green-500 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-40 disabled:scale-100"
        aria-label="Matcher"
        @click="triggerExit(true)"
      >
        <Heart class="w-6 h-6" />
      </button>
    </div>

    <p class="text-xs text-muted-foreground text-center">
      ← Glisse pour passer · Matcher pour garder →
    </p>
  </div>
</template>
