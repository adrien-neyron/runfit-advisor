<script setup lang="ts">
const route = useRoute()

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_url: string | null
  published_at: string | null
  author_name: string
  tags: string[]
}

const { data: post, error } = await useFetch<Post>(`/api/blog/${route.params.slug}`)

if (error.value || !post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
}

useSeoMeta({
  title: post.value?.title ?? 'Article',
  description: post.value?.excerpt ?? '',
  ogImage: post.value?.cover_url ?? undefined,
})

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Rendu Markdown minimal (remplace les balises de base)
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-black mt-12 mb-6">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-orange-400 hover:underline" target="_blank" rel="noopener">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/^(?!<[h|l])/gm, '')
    .split('\n\n')
    .map(block => {
      if (block.startsWith('<h') || block.startsWith('<li')) return block
      if (block.trim() === '') return ''
      return `<p class="mb-4 leading-relaxed text-muted-foreground">${block.trim()}</p>`
    })
    .join('\n')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Nav simple -->
    <nav class="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
      <div class="container flex items-center h-14 gap-3">
        <NuxtLink to="/" class="text-lg font-black tracking-tighter">
          RUN<span class="text-gradient">MATCH</span>
        </NuxtLink>
        <span class="text-muted-foreground">/</span>
        <NuxtLink to="/#blog" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Blog
        </NuxtLink>
      </div>
    </nav>

    <article class="container max-w-2xl py-16">
      <!-- Image de couverture -->
      <BlogCoverImage
        v-if="post?.cover_url"
        :src="post.cover_url"
        :alt="post.title"
        class="w-full h-64 rounded-2xl mb-10"
      />

      <!-- Tags -->
      <div v-if="post?.tags?.length" class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 font-medium"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Titre -->
      <h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
        {{ post?.title }}
      </h1>

      <!-- Meta -->
      <div class="flex items-center gap-3 text-sm text-muted-foreground mb-10 pb-8 border-b border-border">
        <span>{{ post?.author_name }}</span>
        <span v-if="post?.published_at">·</span>
        <span v-if="post?.published_at">{{ formatDate(post.published_at) }}</span>
      </div>

      <!-- Contenu -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div
        class="prose-content"
        v-html="renderMarkdown(post?.content ?? '')"
      />
    </article>

    <div class="container max-w-2xl pb-16">
      <NuxtLink
        to="/#blog"
        class="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Retour aux articles
      </NuxtLink>
    </div>

  </div>
</template>

<style scoped>
.prose-content :deep(h1),
.prose-content :deep(h2),
.prose-content :deep(h3) {
  color: hsl(var(--foreground));
}
.prose-content :deep(li) {
  margin-bottom: 0.25rem;
}
.prose-content :deep(li + li) {
  margin-top: 0;
}
</style>
