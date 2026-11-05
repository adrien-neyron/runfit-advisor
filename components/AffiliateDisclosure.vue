<script setup lang="ts">
/**
 * Mention d'affiliation, adaptée aux réseaux réellement présents sur la page.
 * - Amazon Associates impose sa phrase exacte dès qu'un lien Amazon est affiché.
 * - Awin (Deporvillage, etc.) : mention de rémunération claire et proche des liens.
 * Sans information sur les offres, on affiche les deux (cas le plus prudent).
 */
const props = defineProps<{
  compact?: boolean
  offers?: Array<{ network?: string | null; merchantSlug?: string | null }>
}>()

const isAmazon = (o: { network?: string | null; merchantSlug?: string | null }) =>
  /amazon/i.test(`${o.network ?? ''} ${o.merchantSlug ?? ''}`)

const known = computed(() => !!props.offers && props.offers.length > 0)
const hasAmazon = computed(() => !known.value || props.offers!.some(isAmazon))
const hasOther = computed(() => !known.value || props.offers!.some(o => !isAmazon(o)))
</script>

<template>
  <p
    data-id="affiliate-disclosure"
    :class="[
      'text-xs text-muted-foreground',
      compact ? 'mt-1' : 'mt-4 px-1 border-t border-border pt-3',
    ]"
  >
    <span class="font-medium">Liens affiliés — </span>
    <template v-if="hasOther">
      RunMatch perçoit une commission sur les achats effectués via ses liens partenaires, sans surcoût pour vous.
      Cette rémunération ne modifie pas le classement des chaussures.
    </template>
    <template v-if="hasAmazon">
      En tant que Partenaire Amazon, nous réalisons un bénéfice sur les achats remplissant les conditions requises.
    </template>
    Les prix affichés sont indicatifs et peuvent varier.
  </p>
</template>
