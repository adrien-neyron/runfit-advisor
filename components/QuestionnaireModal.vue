<script setup lang="ts">
import {
  ArrowLeft, ArrowRight, X, Check, Sparkles, ChevronRight,
  Info, Sprout, TrendingUp, Flame, Route, TreePine, Shuffle, Rocket, Smile, ShieldCheck, HeartPulse, ThumbsUp, HelpCircle,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { UserProfile } from '~/data/products'

interface QuestionOption {
  value: string
  label: string
  /** Pictogramme SVG qui montre la réponse (components/QuestionIcon.vue) */
  icon?: string
  /** Icône Lucide pour les notions sans forme à dessiner */
  glyph?: Component
  /** Valeur typographique (distance, volume, budget) */
  badge?: string
  /** Petite unité sous la valeur typographique (ex. « km ») */
  badgeUnit?: string
  /** Texte fixe, ou fonction des réponses déjà données (ex. adapter au terrain) */
  description?: string | ((answers: Partial<UserProfile>) => string)
}

interface Question {
  id: keyof UserProfile
  title: string
  subtitle: string
  /** Précision affichée sous les options (ex. conseil de santé) */
  footnote?: string
  options: QuestionOption[]
}

// ─── Questions ────────────────────────────────────────────────────────────────

const questions: Question[] = [
  // ── CORE (Q1–Q5) ──
  {
    id: 'sexe',
    title: 'Tu es un homme ou une femme ?',
    subtitle: 'Pour adapter les modèles à ta morphologie',
    options: [
      { value: 'homme', label: 'Un homme', icon: 'sexe-homme' },
      { value: 'femme', label: 'Une femme', icon: 'sexe-femme' },
    ],
  },
  {
    id: 'foulee',
    footnote: "En cas de douleurs ou d'usure très marquée, un podologue peut confirmer ton type de foulée. Une chaussure ne remplace pas son avis.",
    title: "Où s'use ta semelle ?",
    subtitle: 'Regarde tes anciennes chaussures de sport',
    options: [
      { value: 'pronateur', label: 'Pronation', icon: 'foulee-pronateur', description: "La semelle s'use côté intérieur" },
      { value: 'hyperpronateur', label: 'Hyperpronation', icon: 'foulee-hyperpronateur', description: "La semelle s'use en diagonale de l'extérieur vers l'intérieur" },
      { value: 'neutre', label: 'Foulée neutre', icon: 'foulee-neutre', description: "La semelle s'use de façon uniforme" },
      { value: 'supinateur', label: 'Supination', icon: 'foulee-supinateur', description: "La semelle s'use côté extérieur" },
    ],
  },
  {
    id: 'niveau',
    title: 'Tu cours...',
    subtitle: 'Pour ajuster la technicité de la chaussure',
    options: [
      { value: 'débutant', label: 'Mes débuts', glyph: Sprout, description: 'Moins de 2 sorties par semaine' },
      { value: 'intermédiaire', label: 'Régulièrement', glyph: TrendingUp, description: '2 à 4 sorties par semaine' },
      { value: 'avancé', label: 'Intensément', glyph: Flame, description: '4 sorties ou plus par semaine' },
    ],
  },
  {
    id: 'terrain',
    title: 'Tu cours où ?',
    subtitle: 'La semelle est spécialement conçue pour le terrain',
    options: [
      { value: 'route', label: 'Sur route', glyph: Route, description: 'Asphalte, trottoirs' },
      { value: 'trail', label: 'En trail', glyph: TreePine, description: 'Sentiers, chemins de terre' },
      { value: 'mixte', label: 'Les deux', glyph: Shuffle, description: 'Route et sentiers en alternance' },
    ],
  },
  {
    id: 'distance',
    title: 'Ta sortie type ?',
    subtitle: 'Chaque distance demande autre chose à la chaussure',
    options: [
      { value: '5km', label: 'Vitesse, dynamisme', badge: '5', badgeUnit: 'km',
        description: (a) => a.terrain === 'trail' ? 'Court et vif, accroche et appuis précis' : 'Effort court et vif, appuis réactifs' },
      { value: '10km', label: 'Vitesse soutenue', badge: '10', badgeUnit: 'km',
        description: (a) => a.terrain === 'trail' ? 'Allure rapide, le dénivelé pèse vite' : 'Allure rapide et régulière' },
      { value: 'semi', label: 'Endurance et allure', badge: '21', badgeUnit: 'km',
        description: (a) => a.terrain === 'trail' ? "Accroche, protection, gestion d'effort" : "Régularité, l'amorti compte" },
      { value: 'marathon', label: 'Endurance et rythme', badge: '42', badgeUnit: 'km',
        description: (a) => a.terrain === 'trail' ? 'Bien plus long que sur route' : "Économie d'effort, confort durable" },
      { value: 'ultra', label: "Endurance, gestion d'effort", badge: '50+', badgeUnit: 'km',
        description: 'Alimentation, protection du pied' },
    ],
  },
  // ── ENRICHISSEMENT (Q6–Q13) ──
  {
    id: 'objectif',
    title: 'Tu cours pour ?',
    subtitle: 'Pour prioriser les bonnes caractéristiques',
    options: [
      { value: 'performance', label: 'Aller plus vite', glyph: Rocket, description: 'Dépasser mes limites, battre mes records' },
      { value: 'confort', label: 'Le plaisir de courir', glyph: Smile, description: 'Bien-être et régularité' },
      { value: 'prévention', label: 'Durer longtemps', glyph: ShieldCheck, description: 'Protéger mes articulations' },
    ],
  },
  {
    id: 'largeurPied',
    title: 'Tes chaussures habituelles ?',
    subtitle: 'Pour un chaussant parfait',
    options: [
      { value: 'étroit', label: 'Souvent trop larges', icon: 'largeur-etroit', description: 'Mes pieds sont plutôt fins' },
      { value: 'standard', label: 'Tombent bien', icon: 'largeur-standard', description: 'Les pointures standard me vont' },
      { value: 'large', label: 'Serrent aux orteils', icon: 'largeur-large', description: "J'ai besoin de plus d'espace" },
    ],
  },
  {
    id: 'blessures',
    title: 'Des douleurs liées à la course ?',
    subtitle: 'Pour intégrer le bon niveau de soutien',
    options: [
      { value: 'oui', label: "Oui, j'en ai eu", glyph: HeartPulse, description: 'Genou, tendon, fasciite plantaire…' },
      { value: 'non', label: 'Jamais', glyph: ThumbsUp, description: 'Pas de blessure significative' },
    ],
  },
  {
    id: 'dropPreference',
    title: 'Ta sensation préférée ?',
    subtitle: 'Le drop = différence de hauteur talon / avant-pied',
    options: [
      { value: 'faible', label: 'Proche du sol', icon: 'drop-faible', description: 'Foulée naturelle, drop 0–6 mm' },
      { value: 'moyen', label: 'Équilibré', icon: 'drop-moyen', description: 'Compromis polyvalent, drop 7–9 mm' },
      { value: 'élevé', label: 'Bien amorti sous le talon', icon: 'drop-eleve', description: 'Attaque talon, drop 10–12 mm' },
    ],
  },
  {
    id: 'amortPreference',
    title: 'Sous tes pieds, tu veux ?',
    subtitle: 'Amorti = confort vs réactivité',
    options: [
      { value: 'faible', label: 'Sentir la route', icon: 'amorti-faible', description: 'Réactif et léger, proche du sol' },
      { value: 'moyen', label: 'Un bon compromis', icon: 'amorti-moyen', description: 'Confort et réactivité équilibrés' },
      { value: 'élevé', label: 'Un maximum de moelleux', icon: 'amorti-eleve', description: 'Confort et protection maximaux' },
    ],
  },
  {
    id: 'volume',
    title: "Combien de km par semaine ?",
    subtitle: 'Influence la durabilité et le niveau d\'amorti idéal',
    options: [
      { value: '0-10', label: 'Moins de 10 km', badge: '<10', description: 'Débutant ou reprise' },
      { value: '10-25', label: '10 à 25 km', badge: '10–25', description: 'Coureur régulier' },
      { value: '25-50', label: '25 à 50 km', badge: '25–50', description: 'Entraînement soutenu' },
      { value: '50+', label: 'Plus de 50 km', badge: '50+', description: 'Athlète accompli' },
    ],
  },
  {
    id: 'voutePlantaire',
    title: 'Ta voûte plantaire ?',
    subtitle: 'Influence le maintien et le soutien de la chaussure',
    options: [
      { value: 'plat', label: 'Pied plat', icon: 'voute-plat', description: 'Voûte basse — nécessite du soutien' },
      { value: 'normale', label: 'Normale', icon: 'voute-normale', description: 'Voûte standard' },
      { value: 'creux', label: 'Pied creux', icon: 'voute-creux', description: 'Voûte prononcée — besoin d\'amorti' },
      { value: 'inconnu', label: 'Je ne sais pas', glyph: HelpCircle },
    ],
  },
  {
    id: 'budget',
    title: 'Ton budget ?',
    subtitle: 'Pour te montrer uniquement des modèles accessibles',
    options: [
      { value: '<100', label: 'Moins de 100 €', badge: '€', description: 'Bon rapport qualité/prix' },
      { value: '100-140', label: '100 – 140 €', badge: '€€', description: 'Milieu de gamme' },
      { value: '140-180', label: '140 – 180 €', badge: '€€€', description: 'Haut de gamme' },
      { value: '180+', label: '180 € et plus', badge: '€€€€', description: 'Top performance' },
    ],
  },
]

// Nombre de questions core (Q1–Q5)
const CORE_COUNT = 5

// Simulation modèles compatibles par palier de réponses
const REMAINING = [120, 84, 61, 45, 33, 23, 15, 12, 10, 8, 6, 4, 3]

const FEEDBACKS: Record<string, string> = {
  sexe: 'Morphologie prise en compte',
  foulee: 'On cible déjà les bonnes semelles',
  niveau: 'Technicité ajustée',
  distance: "Niveau d'amorti calibré",
  terrain: 'Semelle sélectionnée',
  objectif: 'On priorise ce qui compte',
  largeurPied: 'Chaussant affiné',
  blessures: 'Soutien intégré au profil',
  dropPreference: 'Géométrie ajustée',
  amortPreference: 'Amorti calibré',
  volume: 'Volume pris en compte',
  voutePlantaire: 'Morphologie affinée',
  budget: 'Budget intégré !',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  initialAnswers?: Partial<UserProfile>
  onComplete?: () => void
  /** Mode enrichissement : démarre directement aux nouvelles questions optionnelles */
  enrichmentOnly?: boolean
  /** Démarre directement à la question indiquée (id), pour ajuster un seul critère */
  startAt?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const profileStore = useUserProfileStore()

// ─── State ────────────────────────────────────────────────────────────────────

const step              = ref(0)
const answers           = ref<Partial<UserProfile>>({ taille: 175, poids: 70 })
const showCoreComplete  = ref(false)
const showTeaser        = ref(false)
const showAnalysis      = ref(false)
const analysisStage     = ref<'analyzing' | 'found'>('analyzing')
const feedbackText      = ref('')
const feedbackVisible   = ref(false)
const selecting         = ref(false)

// ─── Computed ─────────────────────────────────────────────────────────────────

// Étape de départ selon le mode
const startStep = computed(() => {
  if (props.startAt) {
    const target = questions.findIndex(q => q.id === props.startAt)
    if (target >= 0) return target
  }
  if (!props.enrichmentOnly) return 0
  const idx = questions.findIndex(q => q.id === 'volume')
  return idx >= 0 ? idx : CORE_COUNT
})

const current = computed(() => questions[step.value])
watch(step, () => { keyboardPending.value = false })

const describe = (o: QuestionOption) =>
  typeof o.description === 'function' ? o.description(answers.value) : o.description

const answeredCount = computed(() =>
  Object.keys(answers.value).filter(k => !['taille', 'poids'].includes(k)).length,
)

const remainingCount = computed(() =>
  REMAINING[Math.min(answeredCount.value, REMAINING.length - 1)],
)

// Affichage de la progression (relatif au mode)
const displayStep = computed(() =>
  props.enrichmentOnly ? step.value - startStep.value + 1 : step.value + 1,
)
const displayTotal = computed(() =>
  props.enrichmentOnly ? questions.length - startStep.value : questions.length,
)

const profileBars = computed(() => {
  const a = answers.value
  let stabilite = 20
  let amorti    = 20
  let dynamisme = 20

  if (a.foulee === 'hyperpronateur') stabilite += 55
  else if (a.foulee === 'pronateur') stabilite += 42
  else if (a.foulee === 'neutre') stabilite += 18
  if (a.blessures === 'oui') stabilite += 22
  if (a.objectif === 'prévention') stabilite += 15
  if (a.voutePlantaire === 'plat') stabilite += 15

  if (a.amortPreference === 'élevé') amorti += 58
  else if (a.amortPreference === 'moyen') amorti += 32
  else if (a.amortPreference === 'faible') amorti += 8
  if (['marathon', 'ultra'].includes(a.distance as string)) amorti += 12
  if (a.objectif === 'confort') amorti += 10
  if (a.dropPreference === 'élevé') amorti += 8
  if (a.voutePlantaire === 'creux') amorti += 12

  if (a.objectif === 'performance') dynamisme += 52
  else if (a.objectif === 'confort') dynamisme += 12
  if (a.niveau === 'avancé') dynamisme += 28
  else if (a.niveau === 'intermédiaire') dynamisme += 14
  if (a.amortPreference === 'faible') dynamisme += 18
  if (['5km', '10km'].includes(a.distance as string)) dynamisme += 10

  return [
    { label: 'Stabilité',  value: Math.min(95, stabilite) },
    { label: 'Amorti',     value: Math.min(95, amorti) },
    { label: 'Dynamisme',  value: Math.min(95, dynamisme) },
  ]
})

const teaserLines = computed(() => {
  const a = answers.value
  const lines: string[] = []

  if (a.foulee === 'hyperpronateur') lines.push('Contrôle maximal de la pronation')
  else if (a.foulee === 'pronateur') lines.push('Support de pronation')
  else if (a.foulee === 'supinateur') lines.push('Amorti latéral renforcé')
  else lines.push('Chaussure universelle')

  if (a.amortPreference === 'élevé' || a.objectif === 'confort') lines.push('Amorti élevé')
  else if (a.amortPreference === 'faible' || a.objectif === 'performance') lines.push('Réactivité maximale')
  else lines.push('Amorti modéré')

  if (a.dropPreference === 'élevé') lines.push('Drop élevé (10–12 mm)')
  else if (a.dropPreference === 'faible') lines.push('Drop faible (0–6 mm)')
  else lines.push('Drop polyvalent (7–9 mm)')

  if (a.budget) {
    const budgetLabel: Record<string, string> = {
      '<100': 'Budget < 100 €',
      '100-140': 'Budget 100–140 €',
      '140-180': 'Budget 140–180 €',
      '180+': 'Budget 180 €+',
    }
    lines.push(budgetLabel[a.budget] ?? '')
  }

  return lines.filter(Boolean)
})

// ─── Watchers ─────────────────────────────────────────────────────────────────

watch(
  () => props.open,
  (val) => {
    if (val) {
      step.value            = startStep.value
      showCoreComplete.value = false
      showTeaser.value      = false
      showAnalysis.value    = false
      analysisStage.value   = 'analyzing'
      feedbackVisible.value = false
      selecting.value       = false
      answers.value         = props.initialAnswers
        ? { taille: 175, poids: 70, ...props.initialAnswers }
        : { taille: 175, poids: 70 }
    }
  },
  { immediate: true },
)

// ─── Accessibilité de la modale (RGAA 7.x / WCAG 2.1.2, 2.4.3, 4.1.2) ─────────
const panelRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Place le focus sur le titre de l'écran courant (question, teaser, analyse…) */
const focusScreenTitle = () => {
  const target = panelRef.value?.querySelector<HTMLElement>('[data-autofocus]')
  ;(target ?? panelRef.value)?.focus({ preventScroll: true })
}

/** Rend le reste de la page inerte tant que la modale est ouverte (Teleport → body) */
const setBackgroundInert = (inert: boolean) => {
  const root = document.getElementById('__nuxt')
  if (!root) return
  if (inert) root.setAttribute('inert', '')
  else root.removeAttribute('inert')
}

// Escape + piège à focus (Tab / Maj+Tab restent dans la modale)
const handleKey = (e: KeyboardEvent) => {
  if (!props.open) return
  if (e.key === 'Escape') { emit('close'); return }
  if (e.key !== 'Tab' || !panelRef.value) return
  const items = Array.from(panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter((el) => el.offsetParent !== null)
  if (!items.length) { e.preventDefault(); panelRef.value.focus(); return }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement as HTMLElement | null
  if (e.shiftKey && (active === first || active === panelRef.value)) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus() }
}
onMounted(() => document.addEventListener('keydown', handleKey))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKey)
  document.body.style.overflow = ''
  setBackgroundInert(false)
})

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  setBackgroundInert(val)
  if (val) {
    previouslyFocused = document.activeElement as HTMLElement | null
  } else {
    // Restitue le focus à l'élément qui a ouvert la modale
    nextTick(() => previouslyFocused?.focus?.({ preventScroll: true }))
  }
}, { immediate: true })

// ─── Sélection : clavier ≠ pointeur (WCAG 3.2.2) ─────────────────────────────
// Au pointeur, un clic sur une option valide et avance (parcours rapide).
// Au clavier, les flèches ne font que choisir : Entrée ou « Valider » avance.
const lastInputWasKeyboard = ref(false)
const keyboardPending = ref(false)

const onOptionClick = (value: string) => {
  if (lastInputWasKeyboard.value) {
    answers.value = { ...answers.value, [current.value.id]: value }
    keyboardPending.value = true
    return
  }
  handleSelect(value)
}

const confirmKeyboardAnswer = () => {
  const value = answers.value[current.value.id] as string | undefined
  if (value) handleSelect(value)
}

// ─── Actions ──────────────────────────────────────────────────────────────────

const triggerFeedback = (questionId: string) => {
  feedbackText.value    = FEEDBACKS[questionId] ?? ''
  feedbackVisible.value = true
  setTimeout(() => (feedbackVisible.value = false), 1200)
}

const buildProfile = (updated: Partial<UserProfile>): UserProfile => ({
  sexe:            (updated.sexe as string)            || 'homme',
  taille:           updated.taille                     || 175,
  poids:            updated.poids                      || 70,
  largeurPied:     (updated.largeurPied as string)     || 'standard',
  foulee:          (updated.foulee as string)          || 'neutre',
  niveau:          (updated.niveau as string)          || 'débutant',
  distance:        (updated.distance as string)        || '10km',
  terrain:         (updated.terrain as string)         || 'route',
  objectif:        (updated.objectif as string)        || 'confort',
  blessures:       updated.healthConsent ? ((updated.blessures as string) || 'non') : 'non',
  dropPreference:  (updated.dropPreference as string)  || 'moyen',
  amortPreference: (updated.amortPreference as string) || 'moyen',
  budget:          updated.budget          as string | undefined,
  voutePlantaire:  updated.voutePlantaire  as string | undefined,
  volume:          updated.volume          as string | undefined,
  // Sans consentement explicite, la réponse « blessures » n'est pas conservée
  healthConsent:   !!updated.healthConsent,
  healthConsentAt: updated.healthConsent ? (updated.healthConsentAt ?? new Date().toISOString()) : null,
})

const launchAnalysis = async (profile: UserProfile) => {
  showAnalysis.value  = true
  analysisStage.value = 'analyzing'
  await profileStore.saveProfile(profile)
  setTimeout(() => {
    analysisStage.value = 'found'
    setTimeout(() => {
      emit('close')
      if (props.onComplete) props.onComplete()
      else router.push('/swipe')
    }, 1400)
  }, 1900)
}

// Quitter après les 5 questions core — recommandations de base
const skipToResults = async () => {
  showCoreComplete.value = false
  await launchAnalysis(buildProfile(answers.value))
}

// Continuer vers les questions d'enrichissement
const continueFromCore = () => {
  showCoreComplete.value = false
  step.value = CORE_COUNT
  selecting.value = false
}

const continueFromTeaser = () => {
  showTeaser.value = false
  step.value++
}

// Donnée de santé (question « blessures ») : consentement explicite avant de répondre
const needsHealthConsent = computed(() => current.value.id === 'blessures' && !answers.value.healthConsent)

const acceptHealthConsent = () => {
  answers.value = { ...answers.value, healthConsent: true, healthConsentAt: new Date().toISOString() }
}

const declineHealthConsent = async () => {
  answers.value = { ...answers.value, healthConsent: false, healthConsentAt: null }
  await handleSelect('non') // réponse neutre, aucune donnée de santé conservée
}

const handleSelect = async (value: string) => {
  if (selecting.value) return
  selecting.value = true

  const updated = { ...answers.value, [current.value.id]: value }
  answers.value = updated
  triggerFeedback(current.value.id)

  const isLast        = step.value === questions.length - 1
  const isPenultimate = step.value === questions.length - 2
  // Fin des 5 questions core (sauf en mode enrichissement où on skipe cet écran)
  const isCoreEnd = !props.enrichmentOnly && step.value === CORE_COUNT - 1

  if (isLast) {
    setTimeout(async () => {
      await launchAnalysis(buildProfile(updated))
    }, 250)
  } else if (isPenultimate && !isCoreEnd) {
    setTimeout(() => {
      showTeaser.value = true
      selecting.value  = false
    }, 300)
  } else if (isCoreEnd) {
    setTimeout(() => {
      showCoreComplete.value = true
      selecting.value        = false
    }, 300)
  } else {
    setTimeout(() => {
      step.value++
      selecting.value = false
    }, 300)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4" @vue:mounted="focusScreenTitle">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
          @click="!showAnalysis && emit('close')"
        />

        <!-- Panel -->
        <div
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          aria-label="Questionnaire de recommandation de chaussures"
          tabindex="-1"
          class="relative bg-card rounded-2xl shadow-2xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto z-10 focus:outline-none"
          @click.stop
        >
          <!-- Close (masqué pendant l'analyse) -->
          <button
            v-if="!showAnalysis"
            type="button"
            class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Fermer le questionnaire"
            @click="emit('close')"
          >
            <X class="w-4 h-4" aria-hidden="true" />
          </button>

          <Transition name="screen-fade" mode="out-in" @after-enter="focusScreenTitle">

            <!-- ═══ ANALYSE ═══════════════════════════════════════════════════════ -->
            <div v-if="showAnalysis" key="analysis" class="px-8 py-20 text-center" role="status" aria-live="polite">
              <Transition name="screen-fade" mode="out-in">
                <div v-if="analysisStage === 'analyzing'" key="analyzing" class="space-y-5">
                  <div class="w-16 h-16 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" aria-hidden="true" />
                  <div>
                    <p data-autofocus tabindex="-1" class="text-xl font-black tracking-tight focus:outline-none">Analyse en cours…</p>
                    <p class="text-sm text-muted-foreground mt-1">Comparaison avec 120 modèles</p>
                  </div>
                </div>
                <div v-else key="found" class="space-y-5">
                  <div class="w-16 h-16 mx-auto rounded-full accent-gradient flex items-center justify-center">
                    <Sparkles class="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p data-autofocus tabindex="-1" class="text-2xl font-black tracking-tight leading-tight focus:outline-none">
                      Ta sélection personnalisée<br />est prête
                    </p>
                    <p class="text-sm text-muted-foreground mt-2">Lance le swipe pour découvrir tes paires →</p>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- ═══ CORE COMPLET — SKIP ou CONTINUER ═════════════════════════════ -->
            <div v-else-if="showCoreComplete" key="core-complete" class="px-8 pt-9 pb-8">
              <div class="text-center mb-5">
                <div class="w-14 h-14 mx-auto rounded-full accent-gradient flex items-center justify-center mb-4">
                  <Sparkles class="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <h2 data-autofocus tabindex="-1" class="text-xl font-black tracking-tight leading-tight focus:outline-none">
                  Tes premières sélections<br />sont prêtes !
                </h2>
                <p class="text-xs text-muted-foreground mt-1.5">
                  Continue pour affiner encore plus
                </p>
              </div>

              <!-- Profil running -->
              <div class="space-y-2 mb-5">
                <p class="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-2">
                  Ton profil running
                </p>
                <div v-for="bar in profileBars" :key="bar.label" class="flex items-center gap-3">
                  <span class="text-xs text-muted-foreground w-16 shrink-0">{{ bar.label }}</span>
                  <div class="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full accent-gradient transition-all duration-700 ease-out"
                      :style="{ width: `${bar.value}%` }"
                    />
                  </div>
                </div>
              </div>

              <!-- Hint -->
              <div class="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-5 text-center">
                <p class="text-xs text-brand font-medium">
                  8 questions de plus → budget, voûte, volume d'entraînement
                </p>
              </div>

              <div class="space-y-2">
                <UiButton variant="hero" class="w-full gap-2" @click="continueFromCore">
                  Affiner mes recommandations
                  <ArrowRight class="w-4 h-4" aria-hidden="true" />
                </UiButton>
                <button
                  type="button"
                  class="w-full text-sm text-muted-foreground hover:text-foreground py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                  @click="skipToResults"
                >
                  Voir mes résultats maintenant →
                </button>
              </div>
            </div>

            <!-- ═══ TEASER ════════════════════════════════════════════════════════ -->
            <div v-else-if="showTeaser" key="teaser" class="px-8 pt-9 pb-8">
              <div class="text-center mb-6">
                <div class="w-14 h-14 mx-auto rounded-full accent-gradient flex items-center justify-center mb-4">
                  <Sparkles class="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <h2 data-autofocus tabindex="-1" class="text-xl font-black tracking-tight leading-tight focus:outline-none">
                  On pense déjà savoir<br />ce qu'il te faut
                </h2>
                <p class="text-xs text-muted-foreground mt-1.5">D'après tes réponses…</p>
              </div>

              <!-- Traits identifiés -->
              <div class="bg-secondary/50 rounded-xl p-4 space-y-3 mb-5">
                <div
                  v-for="line in teaserLines"
                  :key="line"
                  class="flex items-center gap-3"
                >
                  <div class="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check class="w-3 h-3 text-primary-foreground" aria-hidden="true" />
                  </div>
                  <span class="text-sm font-semibold">{{ line }}</span>
                </div>
              </div>

              <!-- Profil running -->
              <div class="space-y-2 mb-7">
                <p class="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                  Ton profil running
                </p>
                <div v-for="bar in profileBars" :key="bar.label" class="flex items-center gap-3">
                  <span class="text-xs text-muted-foreground w-16 shrink-0">{{ bar.label }}</span>
                  <div class="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full accent-gradient transition-all duration-700 ease-out"
                      :style="{ width: `${bar.value}%` }"
                    />
                  </div>
                </div>
              </div>

              <UiButton variant="hero" class="w-full gap-2" @click="continueFromTeaser">
                Dernière question
                <ArrowRight class="w-4 h-4" aria-hidden="true" />
              </UiButton>
            </div>

            <!-- ═══ QUESTIONS ═════════════════════════════════════════════════════ -->
            <div v-else key="questions" class="px-8 pt-8 pb-6 sm:px-10 sm:pt-9">
              <!-- Brand + badge mode enrichissement -->
              <div class="text-center mb-5">
                <span class="text-2xl font-black tracking-tighter">
                  RUN<span class="text-gradient">MATCH</span>
                </span>
                <div class="mt-2.5 flex items-center justify-center gap-2">
                  <span class="inline-flex items-center gap-1.5 bg-primary/10 text-brand text-xs font-bold px-3 py-1 rounded-full">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                    {{ remainingCount }} modèles compatibles
                  </span>
                  <span
                    v-if="enrichmentOnly"
                    class="inline-flex items-center gap-1 bg-secondary text-muted-foreground text-xs font-medium px-2 py-1 rounded-full"
                  >
                    <ChevronRight class="w-3 h-3" aria-hidden="true" />
                    Enrichissement
                  </span>
                </div>
              </div>

              <!-- Barre de progression -->
              <div class="mb-5">
                <div class="flex items-center justify-between mb-1.5">
                  <button
                    type="button"
                    class="flex items-center gap-1 min-h-[44px] pr-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    @click="step > startStep ? step-- : emit('close')"
                  >
                    <ArrowLeft class="w-3.5 h-3.5" aria-hidden="true" />
                    {{ step > startStep ? 'Précédent' : 'Retour' }}
                  </button>
                  <span class="text-xs text-muted-foreground font-medium tabular-nums">
                    <span class="sr-only">Question </span>{{ displayStep }} <span aria-hidden="true">/</span><span class="sr-only"> sur </span> {{ displayTotal }}
                  </span>
                </div>
                <div
                  class="h-1.5 bg-secondary rounded-full overflow-hidden"
                  role="progressbar"
                  aria-label="Progression du questionnaire"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-valuenow="Math.round((answeredCount / questions.length) * 100)"
                >
                  <div
                    class="h-full accent-gradient rounded-full transition-all duration-400 ease-out"
                    :style="{ width: `${(answeredCount / questions.length) * 100}%` }"
                  />
                </div>
              </div>

              <!-- Question (slide) -->
              <Transition name="slide-question" mode="out-in" @after-enter="focusScreenTitle">
                <div :key="step">
                  <h2 data-autofocus tabindex="-1" class="text-xl font-black tracking-tight text-center mb-1 focus:outline-none">{{ current.title }}</h2>
                  <p class="text-sm text-muted-foreground text-center mb-4">{{ current.subtitle }}</p>

                  <!-- Consentement explicite : donnée de santé -->
                  <div v-if="needsHealthConsent" class="rounded-xl border-2 border-border bg-background p-4 space-y-3" data-id="health-consent">
                    <p class="text-sm leading-relaxed">
                      Cette question porte sur votre santé. Pour la poser, RunMatch a besoin de votre
                      <strong>consentement explicite</strong> : votre réponse sert uniquement à ajuster le niveau
                      de soutien des chaussures proposées. Vous pouvez retirer ce consentement à tout moment depuis
                      votre profil. Plus d'informations dans la
                      <NuxtLink to="/confidentialite" target="_blank" class="underline hover:text-brand">politique de confidentialité</NuxtLink>.
                    </p>
                    <div class="grid gap-2">
                      <button
                        type="button"
                        class="px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        @click="acceptHealthConsent"
                      >
                        J'accepte et je réponds
                      </button>
                      <button
                        type="button"
                        class="px-4 py-3 rounded-xl border-2 border-border text-sm font-semibold hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        @click="declineHealthConsent"
                      >
                        Je préfère ne pas répondre
                      </button>
                    </div>
                  </div>

                  <!-- Options : vrais boutons radio natifs (flèches, Espace, lecteurs d'écran) -->
                  <fieldset
                    v-else
                    class="grid gap-2 min-w-0 border-0 p-0 m-0"
                    @keydown.capture="lastInputWasKeyboard = true"
                    @pointerdown.capture="lastInputWasKeyboard = false"
                    @keydown.enter.prevent="confirmKeyboardAnswer"
                  >
                    <legend class="sr-only">{{ current.title }}</legend>
                    <label
                      v-for="option in current.options"
                      :key="option.value"
                      class="relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl border-2 text-left cursor-pointer transition-all duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring hover:scale-[1.015] active:scale-[0.985]"
                      :class="
                        answers[current.id] === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40 bg-background'
                      "
                    >
                      <input
                        type="radio"
                        class="sr-only"
                        :name="`question-${current.id}`"
                        :value="option.value"
                        :checked="answers[current.id] === option.value"
                        @click="onOptionClick(option.value)"
                      />
                      <QuestionIcon v-if="option.icon" :name="option.icon" class="w-14 h-11 shrink-0 text-foreground/70" aria-hidden="true" />
                      <span v-else-if="option.glyph" class="w-14 h-11 shrink-0 flex items-center justify-center">
                        <component :is="option.glyph" class="w-6 h-6 text-brand" aria-hidden="true" />
                      </span>
                      <span
                        v-else-if="option.badge"
                        class="w-14 h-11 shrink-0 flex flex-col items-center justify-center leading-none text-brand tabular-nums"
                        aria-hidden="true"
                      >
                        <span :class="option.badgeUnit ? 'text-xl font-black tracking-tight' : 'text-sm font-black tracking-tight'">{{ option.badge }}</span>
                        <span v-if="option.badgeUnit" class="text-xs font-semibold mt-0.5">{{ option.badgeUnit }}</span>
                      </span>
                      <div class="flex-1 min-w-0">
                        <span class="font-semibold text-sm block">{{ option.label }}</span>
                        <span
                          v-if="describe(option)"
                          class="text-xs text-muted-foreground block mt-0.5 leading-tight"
                        >
                          {{ describe(option) }}
                        </span>
                      </div>
                      <Check
                        v-if="answers[current.id] === option.value"
                        class="w-4 h-4 text-brand shrink-0"
                        aria-hidden="true"
                      />
                    </label>
                  </fieldset>

                  <!-- Clavier : la réponse choisie aux flèches est validée explicitement (Entrée ou bouton) -->
                  <UiButton
                    v-if="keyboardPending && !needsHealthConsent"
                    variant="hero"
                    class="w-full mt-3"
                    @click="confirmKeyboardAnswer"
                  >
                    Valider ma réponse
                  </UiButton>

                  <!-- Précision de la question (conseil de santé) -->
                  <p
                    v-if="current.footnote"
                    class="mt-3 flex items-start gap-2 rounded-xl bg-secondary px-3 py-2.5 text-xs text-muted-foreground leading-relaxed"
                  >
                    <Info class="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
                    <span>{{ current.footnote }}</span>
                  </p>

                  <!-- Profil en cours de construction (visible après 2 réponses) -->
                  <div v-if="answeredCount >= 2" class="mt-5 space-y-1.5">
                    <p class="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-2">
                      Ton profil se construit
                    </p>
                    <div v-for="bar in profileBars" :key="bar.label" class="flex items-center gap-2.5">
                      <span class="text-xs text-muted-foreground w-16 shrink-0">{{ bar.label }}</span>
                      <div class="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full accent-gradient transition-all duration-500 ease-out"
                          :style="{ width: `${bar.value}%` }"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>

              <!-- Micro-feedback -->
              <div role="status" aria-live="polite">
                <Transition name="feedback-toast">
                  <div
                    v-if="feedbackVisible"
                    class="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-brand"
                  >
                    <Check class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {{ feedbackText }}
                  </div>
                </Transition>
              </div>
            </div>

          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

.screen-fade-enter-active,
.screen-fade-leave-active { transition: all 0.3s ease; }
.screen-fade-enter-from { opacity: 0; transform: scale(0.97); }
.screen-fade-leave-to   { opacity: 0; transform: scale(0.97); }

.slide-question-enter-active,
.slide-question-leave-active { transition: all 0.22s ease; }
.slide-question-enter-from   { opacity: 0; transform: translateX(28px); }
.slide-question-leave-to     { opacity: 0; transform: translateX(-28px); }

.feedback-toast-enter-active,
.feedback-toast-leave-active { transition: all 0.25s ease; }
.feedback-toast-enter-from   { opacity: 0; transform: translateY(6px); }
.feedback-toast-leave-to     { opacity: 0; }
</style>
