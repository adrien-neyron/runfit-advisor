<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route  = useRoute()
const router = useRouter()

const isNew = computed(() => route.params.id === 'new')

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_url: string | null
  published: boolean
  author_name: string
  tags: string[]
}

const form = reactive<Omit<Post, 'id'>>({
  title:       '',
  slug:        '',
  excerpt:     '',
  content:     '',
  cover_url:   null,
  published:   false,
  author_name: 'RunMatch',
  tags:        [],
})

const tagsInput = ref('')
const saving     = ref(false)
const loading    = ref(!isNew.value)
const error      = ref('')

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
}

watch(() => form.title, (val) => {
  if (isNew.value && !form.slug) {
    form.slug = toSlug(val)
  }
})

if (!isNew.value) {
  const { data } = await useFetch<Post>(`/api/admin/blog/single/${route.params.id}`)
  if (data.value) {
    Object.assign(form, data.value)
    tagsInput.value = data.value.tags.join(', ')
  }
  loading.value = false
}

async function save() {
  if (!form.title.trim()) { error.value = 'Le titre est requis.'; return }
  if (!form.content.trim()) { error.value = 'Le contenu est requis.'; return }

  error.value = ''
  saving.value = true

  form.tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)

  try {
    if (isNew.value) {
      await $fetch('/api/admin/blog', { method: 'POST', body: { ...form } })
    } else {
      await $fetch(`/api/admin/blog/${route.params.id}`, { method: 'PATCH', body: { ...form } })
    }
    await router.push('/admin/blog')
  } catch (e: any) {
    error.value = e?.data?.message || 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <!-- Nav -->
    <nav class="border-b border-gray-800 bg-gray-900 px-6 py-3 flex items-center gap-3">
      <NuxtLink to="/admin/dashboard" class="flex items-center gap-3">
        <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-sm font-bold">R</div>
        <span class="font-semibold text-gray-100">RunFit Admin</span>
      </NuxtLink>
      <span class="text-gray-600">/</span>
      <NuxtLink to="/admin/blog" class="text-gray-400 hover:text-white transition-colors">Blog</NuxtLink>
      <span class="text-gray-600">/</span>
      <span class="text-gray-300">{{ isNew ? 'Nouvel article' : 'Modifier' }}</span>
    </nav>

    <div class="max-w-3xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold">{{ isNew ? 'Nouvel article' : 'Modifier l\'article' }}</h1>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <span class="text-sm text-gray-400">{{ form.published ? 'Publié' : 'Brouillon' }}</span>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              :class="form.published ? 'bg-green-600' : 'bg-gray-700'"
              @click="form.published = !form.published"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="form.published ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </label>
          <button
            class="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? 'Sauvegarde…' : 'Sauvegarder' }}
          </button>
        </div>
      </div>

      <div v-if="error" class="mb-6 bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="h-12 bg-gray-900 border border-gray-800 rounded-lg animate-pulse" />
      </div>

      <div v-else class="space-y-5">
        <!-- Titre -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Titre <span class="text-red-400">*</span></label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Mon super article"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <!-- Slug -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Slug (URL)</label>
          <div class="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 focus-within:border-orange-500 transition-colors">
            <span class="text-gray-600 text-sm mr-1">/blog/</span>
            <input
              v-model="form.slug"
              type="text"
              placeholder="mon-super-article"
              class="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none text-sm"
            />
          </div>
        </div>

        <!-- Extrait -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Extrait</label>
          <textarea
            v-model="form.excerpt"
            rows="2"
            placeholder="Résumé affiché sur la landing page…"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
          />
        </div>

        <!-- Image de couverture -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">URL de l'image de couverture</label>
          <input
            v-model="form.cover_url"
            type="url"
            placeholder="https://…"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <img
            v-if="form.cover_url"
            :src="form.cover_url"
            alt="Aperçu"
            class="mt-2 h-32 w-full object-cover rounded-lg opacity-80"
          />
        </div>

        <!-- Contenu -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Contenu (Markdown) <span class="text-red-400">*</span></label>
          <textarea
            v-model="form.content"
            rows="18"
            placeholder="# Mon article&#10;&#10;Écrivez votre contenu en Markdown…"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-y font-mono text-sm leading-relaxed"
          />
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Tags (séparés par des virgules)</label>
          <input
            v-model="tagsInput"
            type="text"
            placeholder="running, chaussures, guide"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <!-- Auteur -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Auteur</label>
          <input
            v-model="form.author_name"
            type="text"
            placeholder="RunMatch"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <!-- Actions bas de page -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-800">
          <NuxtLink to="/admin/blog" class="text-sm text-gray-500 hover:text-white transition-colors">
            ← Annuler
          </NuxtLink>
          <button
            class="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? 'Sauvegarde…' : isNew ? 'Créer l\'article' : 'Enregistrer les modifications' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
