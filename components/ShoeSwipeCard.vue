<script setup lang="ts">
import { Heart, X, Star } from 'lucide-vue-next'
import type { Shoe } from '~/data/shoes'

interface Props {
  shoe: Shoe
  score: number
  isTop: boolean
  /** 0 = carte au-dessus (front), 1 = milieu, 2 = derrière */
  stackIndex: number
  /** Déclenche une sortie programmatique (bouton) */
  exitDirection?: 'left' | 'right' | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  swipe: [liked: boolean]
  exitComplete: []
}>()

const SWIPE_THRESHOLD = 80

// Score → 1-5 étoiles (max théorique ~90 pts)
const starCount = computed(() => Math.min(5, Math.max(1, Math.round((props.score / 90) * 5))))

const x = ref(0)
const isDragging = ref(false)

let dragStartX = 0
let lastVelocityX = 0
let lastClientX = 0
let lastTime = 0

// ── Dérivées visuelles ──────────────────────────────────────────────────────
const rotate = computed(() => x.value * 0.07)
const likeOpacity = computed(() => Math.max(0, Math.min(1, (x.value - 20) / 80)))
const nopeOpacity = computed(() => Math.max(0, Math.min(1, (-x.value - 20) / 80)))

const cardStyle = computed(() => {
  const scale = 1 - props.stackIndex * 0.045
  const yOffset = -props.stackIndex * 10
  if (props.isTop) {
    return {
      transform: `translateX(${x.value}px) rotate(${rotate.value}deg)`,
      transition: isDragging.value ? 'none' : 'transform 0.35s ease-out',
      zIndex: 10 - props.stackIndex,
      cursor: isDragging.value ? 'grabbing' : 'grab',
      transformOrigin: 'bottom center',
    }
  }
  return {
    transform: `scale(${scale}) translateY(${yOffset}px)`,
    transition: 'transform 0.3s ease-out',
    zIndex: 10 - props.stackIndex,
    transformOrigin: 'bottom center',
  }
})

// ── Sortie programmatique (boutons X / ❤️) ──────────────────────────────────
watch(
  () => props.exitDirection,
  (dir) => {
    if (!dir || !props.isTop) return
    x.value = dir === 'right' ? 750 : -750
    setTimeout(() => emit('exitComplete'), 380)
  },
)

// ── Drag (pointer events) ───────────────────────────────────────────────────
function onPointerDown(e: PointerEvent) {
  if (!props.isTop) return
  isDragging.value = true
  dragStartX = e.clientX - x.value
  lastClientX = e.clientX
  lastTime = e.timeStamp
  lastVelocityX = 0
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value || !props.isTop) return
  const dt = e.timeStamp - lastTime
  if (dt > 0) lastVelocityX = (e.clientX - lastClientX) / dt
  lastClientX = e.clientX
  lastTime = e.timeStamp
  x.value = e.clientX - dragStartX
}

function onPointerUp() {
  if (!isDragging.value || !props.isTop) return
  isDragging.value = false

  const velocityBoost = Math.abs(lastVelocityX) > 0.5 // px/ms

  if (x.value > SWIPE_THRESHOLD || (velocityBoost && x.value > 30)) {
    x.value = 750
    setTimeout(() => emit('swipe', true), 320)
  } else if (x.value < -SWIPE_THRESHOLD || (velocityBoost && x.value < -30)) {
    x.value = -750
    setTimeout(() => emit('swipe', false), 320)
  } else {
    x.value = 0 // snap back — la transition CSS gère l'animation
  }
}
</script>

<template>
  <div
    class="absolute inset-0 select-none touch-none"
    :style="cardStyle"
    role="group"
    aria-roledescription="carte"
    :aria-label="`${shoe.brand} ${shoe.model}`"
    :aria-hidden="isTop ? undefined : 'true'"
    :inert="isTop ? undefined : true"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <!-- Overlays MATCH / PASSE -->
    <template v-if="isTop">
      <div
        aria-hidden="true"
        class="absolute top-7 left-5 z-20 border-4 border-green-700 text-green-700 dark:border-green-500 dark:text-green-500 font-black text-xl px-3 py-1 rounded-xl pointer-events-none -rotate-[22deg]"
        :style="{ opacity: likeOpacity }"
      >
        <span class="inline-flex items-center gap-1.5">MATCH <Heart class="w-5 h-5 fill-current" aria-hidden="true" /></span>
      </div>
      <div
        aria-hidden="true"
        class="absolute top-7 right-5 z-20 border-4 border-red-700 text-red-700 dark:border-red-400 dark:text-red-400 font-black text-xl px-3 py-1 rounded-xl pointer-events-none rotate-[22deg]"
        :style="{ opacity: nopeOpacity }"
      >
        <span class="inline-flex items-center gap-1.5">PASSE <X class="w-5 h-5" aria-hidden="true" /></span>
      </div>
    </template>

    <!-- Carte -->
    <div class="w-full h-full bg-card rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col">
      <!-- Image -->
      <div class="flex-[4] bg-white relative overflow-hidden">
        <ShoeImage
          :src="shoe.image"
          :alt="`${shoe.brand} ${shoe.model}`"
          class="w-full h-full object-contain p-5 mix-blend-multiply [filter:brightness(1.04)_contrast(1.03)]"
          loading="eager"
        />
        <span class="absolute top-3 left-3 bg-white/90 text-neutral-900 border border-neutral-200 text-xs font-bold px-2.5 py-1 rounded-full">
          {{ shoe.brand }}
        </span>
      </div>

      <!-- Infos -->
      <div class="flex-[5] px-5 py-4 flex flex-col justify-between">
        <div>
          <h2 class="text-xl font-black tracking-tight leading-snug">{{ shoe.model }}</h2>
          <!-- Étoiles de correspondance -->
          <div class="flex items-center gap-1 mt-1.5 mb-1">
            <span class="flex items-center gap-0.5" role="img" :aria-label="`Correspondance : ${starCount} sur 5`">
              <Star
                v-for="i in 5"
                :key="i"
                class="w-4 h-4"
                :class="i <= starCount ? 'text-brand fill-current' : 'text-muted-foreground/40'"
                aria-hidden="true"
              />
            </span>
            <span class="text-sm text-muted-foreground ml-1 font-medium">Correspondance</span>
          </div>
          <p class="text-sm text-muted-foreground leading-relaxed">{{ shoe.description }}</p>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="tag in shoe.tags.slice(0, 4)"
            :key="tag"
            class="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium capitalize"
          >
            {{ tag }}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="spec in [
              { label: 'Drop', value: `${shoe.drop}mm` },
              { label: 'Poids', value: `${shoe.poids}g` },
              { label: 'Amorti', value: shoe.amorti },
            ]"
            :key="spec.label"
            class="text-center bg-secondary/60 rounded-xl py-2"
          >
            <p class="text-sm text-muted-foreground uppercase tracking-wider">{{ spec.label }}</p>
            <p class="text-sm font-black capitalize mt-0.5">{{ spec.value }}</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
