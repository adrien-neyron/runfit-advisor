<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const router = useRouter()

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  published: boolean
  published_at: string | null
  author_name: string
  tags: string[]
  created_at: string
}

const posts   = ref<Post[]>([])
const loading = ref(true)
const deleting = ref<string | null>(null)

async function fetchPosts() {
  loading.value = true
  const { posts: data } = await $fetch<{ posts: Post[] }>('/api/admin/blog')
  posts.value = data
  loading.value = false
}

async function togglePublish(post: Post) {
  await $fetch(`/api/admin/blog/${post.id}`, {
    method: 'PATCH',
    body: { published: !post.published },
  })
  await fetchPosts()
}

async function deletePost(id: string) {
  if (!confirm('Supprimer cet article définitivement ?')) return
  deleting.value = id
  await $fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
  await fetchPosts()
  deleting.value = null
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(fetchPosts)
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <!-- Nav -->
    <nav class="border-b border-gray-800 bg-gray-900 px-6 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/dashboard" class="flex items-center gap-3">
          <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-sm font-bold">R</div>
          <span class="font-semibold text-gray-100">RunFit Admin</span>
        </NuxtLink>
        <span class="text-gray-600">/</span>
        <span class="text-gray-300">Blog</span>
      </div>
      <button
        class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        @click="router.push('/admin/blog/new')"
      >
        + Nouvel article
      </button>
    </nav>

    <div class="max-w-5xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">Articles de blog</h1>
          <p class="text-gray-400 text-sm mt-1">{{ posts.length }} article{{ posts.length !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 4" :key="i" class="bg-gray-900 border border-gray-800 rounded-xl h-20 animate-pulse" />
      </div>

      <!-- Liste -->
      <div v-else-if="posts.length" class="space-y-3">
        <div
          v-for="post in posts"
          :key="post.id"
          class="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-gray-700 transition-colors"
        >
          <!-- Statut publié -->
          <div
            class="w-2 h-2 rounded-full shrink-0"
            :class="post.published ? 'bg-green-500' : 'bg-gray-600'"
          />

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold truncate">{{ post.title }}</p>
            <p class="text-xs text-gray-500 mt-0.5">
              <span :class="post.published ? 'text-green-400' : 'text-gray-500'">
                {{ post.published ? 'Publié' : 'Brouillon' }}
              </span>
              <span class="mx-1.5">·</span>
              {{ formatDate(post.published_at || post.created_at) }}
              <span v-if="post.tags.length" class="mx-1.5">·</span>
              <span v-for="tag in post.tags.slice(0,3)" :key="tag"
                class="inline-block bg-gray-800 text-gray-400 text-[10px] px-1.5 py-0.5 rounded mr-1">
                {{ tag }}
              </span>
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              class="text-xs px-3 py-1.5 rounded-lg border transition-colors"
              :class="post.published
                ? 'border-gray-700 text-gray-400 hover:border-gray-600'
                : 'border-green-700 text-green-400 hover:bg-green-900/30'"
              @click="togglePublish(post)"
            >
              {{ post.published ? 'Dépublier' : 'Publier' }}
            </button>

            <button
              class="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-400 transition-colors"
              @click="router.push(`/admin/blog/${post.id}`)"
            >
              Modifier
            </button>

            <button
              class="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-500 hover:border-red-700 hover:text-red-400 transition-colors disabled:opacity-40"
              :disabled="deleting === post.id"
              @click="deletePost(post.id)"
            >
              {{ deleting === post.id ? '…' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Vide -->
      <div v-else class="text-center py-24 text-gray-500">
        <p class="text-4xl mb-4">✍️</p>
        <p class="font-semibold text-gray-300">Aucun article pour l'instant</p>
        <p class="text-sm mt-2">Créez votre premier article pour le faire apparaître sur la landing page.</p>
        <button
          class="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          @click="router.push('/admin/blog/new')"
        >
          Créer un article
        </button>
      </div>
    </div>
  </div>
</template>
