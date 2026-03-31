<script setup lang="ts">
import { ArrowLeft, ArrowRight, X, Check, Sparkles } from 'lucide-vue-next'
import type { UserProfile } from '~/data/products'

interface QuestionOption {
  value: string
  label: string
  emoji?: string
  description?: string
}

interface Question {
  id: keyof UserProfile
  title: string
  subtitle: string
  options: QuestionOption[]
}

const questions: Question[] = [
  {
    id: 'sexe',
    title: 'Tu es ?',
    subtitle: 'Pour adapter les modèles à ta morphologie',
    options: [
      { value: 'homme', label: 'Homme', emoji: '🏃‍♂️' },
      { value: 'femme', label: 'Femme', emoji: '🏃‍♀️' },
    ],
  },
  {
    id: 'foulee',
    title: "Où s'use ta semelle ?",
    subtitle: 'Regarde tes anciennes chaussures de sport',
    options: [
      { value: 'pronateur', label: 'Côté intérieur', emoji: '↙️', description: "La semelle est plus usée à l'intérieur" },
      { value: 'neutre', label: 'De façon uniforme', emoji: '⬇️', description: 'Usure équilibrée sur toute la largeur' },
      { value: 'supinateur', label: 'Côté extérieur', emoji: '↘️', description: "La semelle est plus usée à l'extérieur" },
    ],
  },
  {
    id: 'niveau',
    title: 'Tu cours...',
    subtitle: 'Pour ajuster la technicité de la chaussure',
    options: [
      { value: 'débutant', label: 'Mes débuts', emoji: '🌱', description: 'Moins de 2 sorties par semaine' },
      { value: 'intermédiaire', label: 'Régulièrement', emoji: '⚡', description: '2 à 4 sorties par semaine' },
      { value: 'avancé', label: 'Intensément', emoji: '🔥', description: '4 sorties ou plus par semaine' },
    ],
  },
  {
    id: 'distance',
    title: 'Ta sortie type ?',
    subtitle: "L'amorti varie selon la distance parcourue",
    options: [
      { value: '5km', label: '5 km', emoji: '🏁' },
      { value: '10km', label: '10 km', emoji: '🏅' },
      { value: 'semi', label: 'Semi-marathon', emoji: '🥈' },
      { value: 'marathon', label: 'Marathon', emoji: '🥇' },
      { value: 'ultra', label: 'Ultra', emoji: '🏔️' },
    ],
  },
  {
    id: 'terrain',
    title: 'Tu cours où ?',
    subtitle: 'La semelle est spécialement conçue pour le terrain',
    options: [
      { value: 'route', label: 'Sur route', emoji: '🛣️', description: 'Asphalte, trottoirs' },
      { value: 'trail', label: 'En trail', emoji: '🌲', description: 'Sentiers, chemins de terre' },
      { value: 'mixte', label: 'Les deux', emoji: '🔄', description: 'Route et sentiers en alternance' },
    ],
  },
  {
    id: 'objectif',
    title: 'Tu cours pour ?',
    subtitle: 'Pour prioriser les bonnes caractéristiques',
    options: [
      { value: 'performance', label: 'Aller plus vite', emoji: '🚀', description: 'Dépasser mes limites, battre mes records' },
      { value: 'confort', label: 'Le plaisir de courir', emoji: '☁️', description: 'Bien-être et régularité' },
      { value: 'prévention', label: 'Durer longtemps', emoji: '🛡️', description: 'Protéger mes articulations' },
    ],
  },
  {
    id: 'largeurPied',
    title: 'Tes chaussures habituelles ?',
    subtitle: 'Pour un chaussant parfait',
    options: [
      { value: 'étroit', label: 'Souvent trop larges', emoji: '◽', description: 'Mes pieds sont plutôt fins' },
      { value: 'standard', label: 'Tombent bien', emoji: '◻️', description: 'Les pointures standard me vont' },
      { value: 'large', label: 'Serrent aux orteils', emoji: '⬜', description: "J'ai besoin de plus d'espace" },
    ],
  },
  {
    id: 'blessures',
    title: 'Des douleurs liées à la course ?',
    subtitle: 'Pour intégrer le bon niveau de soutien',
    options: [
      { value: 'oui', label: "Oui, j'en ai eu", emoji: '🩹', description: 'Genou, tendon, fasciite plantaire…' },
      { value: 'non', label: 'Jamais', emoji: '💪', description: 'Pas de blessure significative' },
    ],
  },
  {
    id: 'dropPreference',
    title: 'Ta sensation préférée ?',
    subtitle: 'Le drop = différence de hauteur talon / avant-pied',
    options: [
      { value: 'faible', label: 'Proche du sol', emoji: '🦶', description: 'Foulée naturelle, drop 0–6 mm' },
      { value: 'moyen', label: 'Équilibré', emoji: '👟', description: 'Compromis polyvalent, drop 7–9 mm' },
      { value: 'élevé', label: 'Bien amorti sous le talon', emoji: '🔝', description: 'Attaque talon, drop 10–12 mm' },
    ],
  },
  {
    id: 'amortPreference',
    title: 'Sous tes pieds, tu veux ?',
    subtitle: 'Amorti = confort vs réactivité',
    options: [
      { value: 'faible', label: 'Sentir la route', emoji: '⚡', description: 'Réactif et léger, proche du sol' },
      { value: 'moyen', label: 'Un bon compromis', emoji: '⚖️', description: 'Confort et réactivité équilibrés' },
      { value: 'élevé', label: 'Un maximum de moelleux', emoji: '☁️', description: 'Confort et protection maximaux' },
    ],
  },
]

// Simulation chaussures éliminées par étape
const REMAINING = [120, 84, 61, 45, 33, 23, 15, 10, 7, 4, 3]

// Micro-feedback contextuel par question
const FEEDBACKS: Record<string, string> = {
  sexe: 'Morphologie prise en compte',
  foulee: 'On cible déjà les bonnes semelles',
  niveau: 'Technicité ajustée',
  distance: "Niveau d'amorti calibré",
  terrain: 'Semelle sélectionnée',
  objectif: 'On priorise ce qui compte',
  largeurPied: 'Chaussant affiné',
  blessures: 'Soutien intégré au profil',
  dropPreference: 'Géométrie ajustée — encore une !',
  amortPreference: 'Profil complet !',
}

interface Props {
  open: boolean
  initialAnswers?: Partial<UserProfile>
  onComplete?: () => void
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const profileStore = useUserProfileStore()

const step            = ref(0)
const answers         = ref<Partial<UserProfile>>({ taille: 175, poids: 70 })
const showTeaser      = ref(false)
const showAnalysis    = ref(false)
const analysisStage   = ref<'analyzing' | 'found'>('analyzing')
const feedbackText    = ref('')
const feedbackVisible = ref(false)
const selecting       = ref(false)

const current       = computed(() => questions[step.value])
const answeredCount = computed(() =>
  Object.keys(answers.value).filter((k) => !['taille', 'poids'].includes(k)).length,
)
const remainingCount = computed(() => REMAINING[Math.min(answeredCount.value, REMAINING.length - 1)])

const profileBars = computed(() => {
  const a = answers.value
  let stabilite = 20
  let amorti    = 20
  let dynamisme = 20

  if (a.foulee === 'pronateur') stabilite += 42
  else if (a.foulee === 'neutre') stabilite += 18
  if (a.blessures === 'oui') stabilite += 22
  if (a.objectif === 'prévention') stabilite += 15

  if (a.amortPreference === 'élevé') amorti += 58
  else if (a.amortPreference === 'moyen') amorti += 32
  else if (a.amortPreference === 'faible') amorti += 8
  if (['marathon', 'ultra'].includes(a.distance as string)) amorti += 12
  if (a.objectif === 'confort') amorti += 10
  if (a.dropPreference === 'élevé') amorti += 8

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

  if (a.foulee === 'pronateur') lines.push('Support de pronation')
  else if (a.foulee === 'supinateur') lines.push('Amorti latéral renforcé')
  else lines.push('Chaussure universelle')

  if (a.amortPreference === 'élevé' || a.objectif === 'confort') lines.push('Amorti élevé')
  else if (a.amortPreference === 'faible' || a.objectif === 'performance') lines.push('Réactivité maximale')
  else lines.push('Amorti modéré')

  if (a.dropPreference === 'élevé') lines.push('Drop élevé (10–12 mm)')
  else if (a.dropPreference === 'faible') lines.push('Drop faible (0–6 mm)')
  else lines.push('Drop polyvalent (7–9 mm)')

  return lines
})

// Reset à l'ouverture
watch(
  () => props.open,
  (val) => {
    if (val) {
      step.value          = 0
      showTeaser.value    = false
      showAnalysis.value  = false
      analysisStage.value = 'analyzing'
      feedbackVisible.value = false
      selecting.value     = false
      answers.value       = props.initialAnswers
        ? { taille: 175, poids: 70, ...props.initialAnswers }
        : { taille: 175, poids: 70 }
    }
  },
)

// Escape + scroll lock
onMounted(() => {
  const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && props.open) emit('close') }
  document.addEventListener('keydown', handleKey)
  onUnmounted(() => document.removeEventListener('keydown', handleKey))
})
watch(() => props.open, (val) => { document.body.style.overflow = val ? 'hidden' : '' })

const triggerFeedback = (questionId: string) => {
  feedbackText.value    = FEEDBACKS[questionId] ?? ''
  feedbackVisible.value = true
  setTimeout(() => (feedbackVisible.value = false), 1200)
}

const handleSelect = async (value: string) => {
  if (selecting.value) return
  selecting.value = true

  const updated = { ...answers.value, [current.value.id]: value }
  answers.value  = updated
  triggerFeedback(current.value.id)

  const isLast         = step.value === questions.length - 1
  const isPenultimate  = step.value === questions.length - 2

  if (isLast) {
    // Animation finale puis sauvegarde
    const profile: UserProfile = {
      sexe:           (updated.sexe as string)           || 'homme',
      taille:          updated.taille                    || 175,
      poids:           updated.poids                     || 70,
      largeurPied:    (updated.largeurPied as string)    || 'standard',
      foulee:         (updated.foulee as string)         || 'neutre',
      niveau:         (updated.niveau as string)         || 'débutant',
      distance:       (updated.distance as string)       || '10km',
      terrain:        (updated.terrain as string)        || 'route',
      objectif:       (updated.objectif as string)       || 'confort',
      blessures:      (updated.blessures as string)      || 'non',
      dropPreference: (updated.dropPreference as string) || 'moyen',
      amortPreference:(updated.amortPreference as string)|| 'moyen',
    }
    setTimeout(async () => {
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
    }, 250)
  } else if (isPenultimate) {
    // Teaser avant la dernière question
    setTimeout(() => {
      showTeaser.value = true
      selecting.value  = false
    }, 300)
  } else {
    setTimeout(() => {
      step.value++
      selecting.value = false
    }, 300)
  }
}

const continueFromTeaser = () => {
  showTeaser.value = false
  step.value++
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="!showAnalysis && emit('close')"
        />

        <!-- Panel -->
        <div
          class="relative bg-card rounded-2xl shadow-2xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto z-10"
          @click.stop
        >
          <!-- Close (masqué pendant l'analyse) -->
          <button
            v-if="!showAnalysis"
            class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Fermer"
            @click="emit('close')"
          >
            <X class="w-4 h-4" />
          </button>

          <Transition name="screen-fade" mode="out-in">

            <!-- ═══ ÉCRAN ANALYSE ══════════════════════════════════════════════ -->
            <div v-if="showAnalysis" key="analysis" class="px-8 py-20 text-center">
              <Transition name="screen-fade" mode="out-in">
                <div v-if="analysisStage === 'analyzing'" key="analyzing" class="space-y-5">
                  <div class="w-16 h-16 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <div>
                    <p class="text-xl font-black tracking-tight">Analyse en cours…</p>
                    <p class="text-sm text-muted-foreground mt-1">Comparaison avec 120 modèles</p>
                  </div>
                </div>
                <div v-else key="found" class="space-y-5">
                  <div class="w-16 h-16 mx-auto rounded-full accent-gradient flex items-center justify-center">
                    <Sparkles class="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p class="text-2xl font-black tracking-tight leading-tight">
                      Ta sélection personnalisée<br />est prête ✓
                    </p>
                    <p class="text-sm text-muted-foreground mt-2">Lance le swipe pour découvrir tes paires →</p>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- ═══ ÉCRAN TEASER ═══════════════════════════════════════════════ -->
            <div v-else-if="showTeaser" key="teaser" class="px-8 pt-9 pb-8">
              <div class="text-center mb-6">
                <div class="w-14 h-14 mx-auto rounded-full accent-gradient flex items-center justify-center mb-4">
                  <Sparkles class="w-7 h-7 text-white" />
                </div>
                <p class="text-xl font-black tracking-tight leading-tight">
                  On pense déjà savoir<br />ce qu'il te faut
                </p>
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
                    <Check class="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span class="text-sm font-semibold">{{ line }}</span>
                </div>
              </div>

              <!-- Profil running -->
              <div class="space-y-2 mb-7">
                <p class="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                  Ton profil running
                </p>
                <div v-for="bar in profileBars" :key="bar.label" class="flex items-center gap-3">
                  <span class="text-[11px] text-muted-foreground w-16 shrink-0">{{ bar.label }}</span>
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
                <ArrowRight class="w-4 h-4" />
              </UiButton>
            </div>

            <!-- ═══ QUESTIONS ══════════════════════════════════════════════════ -->
            <div v-else key="questions" class="px-8 pt-8 pb-6 sm:px-10 sm:pt-9">
              <!-- Brand + compteur chaussures -->
              <div class="text-center mb-5">
                <span class="text-2xl font-black tracking-tighter">
                  RUN<span class="text-gradient">MATCH</span>
                </span>
                <div class="mt-2.5 flex items-center justify-center gap-1.5">
                  <span class="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {{ remainingCount }} modèles compatibles
                  </span>
                </div>
              </div>

              <!-- Barre de progression -->
              <div class="mb-5">
                <div class="flex items-center justify-between mb-1.5">
                  <button
                    class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    @click="step > 0 ? step-- : emit('close')"
                  >
                    <ArrowLeft class="w-3.5 h-3.5" />
                    {{ step > 0 ? 'Précédent' : 'Retour' }}
                  </button>
                  <span class="text-xs text-muted-foreground font-medium tabular-nums">
                    {{ step + 1 }} / {{ questions.length }}
                  </span>
                </div>
                <div class="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    class="h-full accent-gradient rounded-full transition-all duration-400 ease-out"
                    :style="{ width: `${((answeredCount) / questions.length) * 100}%` }"
                  />
                </div>
              </div>

              <!-- Question (slide) -->
              <Transition name="slide-question" mode="out-in">
                <div :key="step">
                  <h2 class="text-xl font-black tracking-tight text-center mb-1">{{ current.title }}</h2>
                  <p class="text-sm text-muted-foreground text-center mb-4">{{ current.subtitle }}</p>

                  <!-- Options -->
                  <div class="grid gap-2" role="radiogroup" :aria-label="current.title">
                    <button
                      v-for="option in current.options"
                      :key="option.value"
                      role="radio"
                      :aria-checked="answers[current.id] === option.value"
                      class="flex items-center gap-3.5 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:scale-[1.015] active:scale-[0.985]"
                      :class="
                        answers[current.id] === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40 bg-background'
                      "
                      @click="handleSelect(option.value)"
                    >
                      <span v-if="option.emoji" class="text-xl shrink-0">{{ option.emoji }}</span>
                      <div class="flex-1 min-w-0">
                        <span class="font-semibold text-sm block">{{ option.label }}</span>
                        <span
                          v-if="option.description"
                          class="text-xs text-muted-foreground block mt-0.5 leading-tight"
                        >
                          {{ option.description }}
                        </span>
                      </div>
                      <Check
                        v-if="answers[current.id] === option.value"
                        class="w-4 h-4 text-primary shrink-0"
                      />
                    </button>
                  </div>

                  <!-- Profil en cours de construction (visible après 2 réponses) -->
                  <div v-if="answeredCount >= 2" class="mt-5 space-y-1.5">
                    <p class="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mb-2">
                      Ton profil se construit
                    </p>
                    <div v-for="bar in profileBars" :key="bar.label" class="flex items-center gap-2.5">
                      <span class="text-[11px] text-muted-foreground w-16 shrink-0">{{ bar.label }}</span>
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
              <Transition name="feedback-toast">
                <div
                  v-if="feedbackVisible"
                  class="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary"
                >
                  <Check class="w-3.5 h-3.5 shrink-0" />
                  {{ feedbackText }}
                </div>
              </Transition>
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
