<script setup lang="ts">
/**
 * « Pourquoi ce match » : les 3 critères qui pèsent le plus + les points d'attention,
 * en langage simple. Les raisons arrivent déjà classées par importance depuis le moteur.
 */
const props = defineProps<{
  reasons: string[]
  cautions?: string[]
}>()

const top = computed(() => props.reasons.slice(0, 3))
const more = computed(() => props.reasons.slice(3))
const cautionList = computed(() => (props.cautions ?? []).slice(0, 2))
</script>

<template>
  <div data-id="why-match" class="space-y-3">
    <div v-if="top.length">
      <h3 class="text-sm font-black mb-2">Pourquoi ce match</h3>
      <ul class="space-y-1.5">
        <li v-for="r in top" :key="r" class="flex items-start gap-2 text-sm">
          <span class="mt-1.5 w-1.5 h-1.5 rounded-full accent-gradient flex-shrink-0" aria-hidden="true" />
          <span>{{ r }}</span>
        </li>
      </ul>
      <details v-if="more.length" class="mt-2 text-sm">
        <summary class="cursor-pointer text-xs font-bold text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded">
          Voir les {{ more.length }} autres raisons
        </summary>
        <ul class="space-y-1.5 mt-2">
          <li v-for="r in more" :key="r" class="flex items-start gap-2">
            <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/50 flex-shrink-0" aria-hidden="true" />
            <span>{{ r }}</span>
          </li>
        </ul>
      </details>
    </div>

    <div v-if="cautionList.length" class="rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2">
      <h3 class="text-xs font-black mb-1">À savoir</h3>
      <ul class="space-y-1">
        <li v-for="c in cautionList" :key="c" class="text-xs text-muted-foreground">{{ c }}</li>
      </ul>
    </div>
  </div>
</template>
