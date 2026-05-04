<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <nav class="border-b border-gray-800 bg-gray-900 px-6 py-3 flex items-center gap-4">
      <NuxtLink to="/admin/shoes" class="text-gray-400 hover:text-white transition-colors text-sm">
        ← Catalogue
      </NuxtLink>
      <span class="text-gray-600">/</span>
      <span class="text-sm font-medium">Nouvelle chaussure</span>
    </nav>

    <div class="max-w-3xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold mb-6">Nouvelle chaussure</h1>

      <form @submit.prevent="handleCreate" class="space-y-6">

        <!-- Identité -->
        <FormSection title="Identité">
          <div class="grid grid-cols-2 gap-3">
            <FormField label="Marque *">
              <input v-model="form.brand" type="text" required placeholder="Brooks" @input="autoId" class="form-input" />
            </FormField>
            <FormField label="Modèle *">
              <input v-model="form.model" type="text" required placeholder="Cascadia 19" @input="autoId" class="form-input" />
            </FormField>
            <FormField label="ID (slug)" class="col-span-2">
              <input v-model="form.id" type="text" required placeholder="brooks-cascadia-19" class="form-input font-mono text-xs" />
              <p class="text-xs text-gray-600 mt-1">Généré automatiquement. Modifiable.</p>
            </FormField>
          </div>
        </FormSection>

        <!-- Classification -->
        <FormSection title="Classification">
          <div class="grid grid-cols-2 gap-3">
            <FormField label="Catégorie">
              <select v-model="form.category" class="form-input">
                <option value="">— Non défini —</option>
                <option value="road">Route</option>
                <option value="trail">Trail</option>
                <option value="daily">Quotidien / Mixte</option>
                <option value="race">Compétition</option>
              </select>
            </FormField>
            <FormField label="Genre">
              <select v-model="form.gender" class="form-input">
                <option value="unisex">Unisexe</option>
                <option value="men">Homme</option>
                <option value="women">Femme</option>
              </select>
            </FormField>
            <FormField label="Année de sortie">
              <input v-model.number="form.release_year" type="number" min="2020" max="2030" placeholder="2025" class="form-input" />
            </FormField>
            <FormField label="Prix catalogue (€)">
              <input v-model.number="form.prix" type="number" step="0.01" min="0" placeholder="129.99" class="form-input" />
            </FormField>
          </div>
        </FormSection>

        <!-- Specs techniques -->
        <FormSection title="Spécifications techniques">
          <div class="grid grid-cols-3 gap-3">
            <FormField label="Drop (mm)">
              <input v-model.number="form.drop_mm" type="number" min="0" max="20" placeholder="8" class="form-input" />
            </FormField>
            <FormField label="Poids (g)">
              <input v-model.number="form.poids_g" type="number" min="100" max="600" placeholder="290" class="form-input" />
            </FormField>
            <FormField label="Pronation">
              <select v-model="form.pronation" class="form-input">
                <option value="">— Non défini —</option>
                <option value="neutral">Neutre</option>
                <option value="stability">Stabilité (pronateur)</option>
                <option value="motion_control">Contrôle de mouvement</option>
              </select>
            </FormField>
            <FormField label="Amorti">
              <select v-model="form.amorti" class="form-input">
                <option value="faible">Faible</option>
                <option value="moyen">Moyen</option>
                <option value="élevé">Élevé</option>
                <option value="maximal">Maximal</option>
              </select>
            </FormField>
            <FormField label="Stabilité">
              <select v-model="form.stabilite" class="form-input">
                <option value="faible">Faible</option>
                <option value="moyenne">Moyenne</option>
                <option value="élevée">Élevée</option>
              </select>
            </FormField>
            <FormField label="Dynamisme">
              <select v-model="form.dynamisme" class="form-input">
                <option value="faible">Faible</option>
                <option value="moyen">Moyen</option>
                <option value="élevé">Élevé</option>
              </select>
            </FormField>
          </div>
        </FormSection>

        <!-- Tableaux de valeurs -->
        <FormSection title="Profil">
          <div class="grid grid-cols-2 gap-4">
            <FormField label="Foulée">
              <CheckGroup v-model="form.foulee" :options="['neutre','pronateur','supinateur']" />
            </FormField>
            <FormField label="Terrain">
              <CheckGroup v-model="form.terrain" :options="['route','trail','mixte']" />
            </FormField>
            <FormField label="Niveau">
              <CheckGroup v-model="form.niveau" :options="['débutant','intermédiaire','avancé']" />
            </FormField>
            <FormField label="Largeur disponible">
              <CheckGroup v-model="form.largeur_disponible" :options="['standard','large','étroit']" />
            </FormField>
            <FormField label="Objectif" class="col-span-2">
              <CheckGroup v-model="form.objectif" :options="['confort','performance','prévention','compétition','trail']" />
            </FormField>
          </div>
        </FormSection>

        <!-- Description -->
        <FormSection title="Description">
          <FormField label="Description courte">
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Décris la chaussure en 1-2 phrases..."
              class="form-input resize-none"
            />
          </FormField>
          <FormField label="Bénéfices clés (1 par ligne)">
            <textarea
              v-model="benefitsRaw"
              rows="4"
              placeholder="BioMoGo DNA&#10;Rock Shield&#10;TrailTack Rubber"
              class="form-input resize-none font-mono text-xs"
            />
          </FormField>
        </FormSection>

        <!-- Erreur -->
        <div v-if="errorMsg" class="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
          {{ errorMsg }}
        </div>

        <!-- Actions -->
        <div class="flex gap-3 justify-end pt-2">
          <NuxtLink to="/admin/shoes" class="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-colors">
            Annuler
          </NuxtLink>
          <button
            type="submit"
            :disabled="saving"
            class="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {{ saving ? 'Création...' : 'Créer la chaussure' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const router = useRouter()

// ─── Helpers locaux ───────────────────────────────────────────────────────────

const FormSection = defineComponent({
  props: { title: String },
  setup(props, { slots }) {
    return () => h('div', { class: 'bg-gray-900 rounded-xl border border-gray-800 p-5' }, [
      h('h2', { class: 'text-sm font-semibold text-gray-300 mb-4' }, props.title),
      slots.default?.(),
    ])
  },
})

const FormField = defineComponent({
  props: { label: String },
  setup(props, { slots }) {
    return () => h('div', {}, [
      h('label', { class: 'block text-xs text-gray-500 mb-1' }, props.label),
      slots.default?.(),
    ])
  },
})

const CheckGroup = defineComponent({
  props: { modelValue: Array, options: Array },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const toggle = (val: string) => {
      const current = (props.modelValue as string[]) || []
      const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
      emit('update:modelValue', next)
    }
    return () => h('div', { class: 'flex flex-wrap gap-2' },
      (props.options as string[]).map((opt) =>
        h('button', {
          type: 'button',
          onClick: () => toggle(opt),
          class: [
            'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors capitalize',
            ((props.modelValue as string[]) || []).includes(opt)
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500',
          ].join(' '),
        }, opt)
      )
    )
  },
})

// ─── Formulaire ───────────────────────────────────────────────────────────────

function toSlug(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const form = reactive({
  id:                '',
  brand:             '',
  model:             '',
  category:          '',
  gender:            'unisexe',
  release_year:      new Date().getFullYear(),
  prix:              0,
  drop_mm:           0,
  poids_g:           0,
  amorti:            'moyen',
  stabilite:         'moyenne',
  dynamisme:         'moyen',
  pronation:         '',
  foulee:            [] as string[],
  terrain:           [] as string[],
  niveau:            [] as string[],
  objectif:          [] as string[],
  largeur_disponible: [] as string[],
  description:       '',
})

const benefitsRaw = ref('')

function autoId() {
  if (form.brand && form.model) {
    form.id = `${toSlug(form.brand)}-${toSlug(form.model)}`
  }
}

// ─── Envoi ────────────────────────────────────────────────────────────────────

const saving   = ref(false)
const errorMsg = ref('')

async function handleCreate() {
  saving.value   = true
  errorMsg.value = ''

  try {
    const benefits = benefitsRaw.value
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    const payload = {
      ...form,
      benefits,
      category:  form.category  || null,
      pronation: form.pronation || null,
    }

    const created = await $fetch<{ id: string }>('/api/admin/shoes', {
      method: 'POST',
      body: payload,
    })

    await router.push(`/admin/shoes/${created.id}`)
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || err.message
  } finally {
    saving.value = false
  }
}
</script>

<style>
.form-input {
  @apply w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 transition-colors;
}
</style>
