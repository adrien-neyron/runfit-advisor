<script setup lang="ts">
import { ArrowRight, Zap, Target, Shield, User, PenLine } from 'lucide-vue-next'

const router = useRouter()
const user = useSupabaseUser()
const authStore = useAuthStore()
const profileStore = useUserProfileStore()

const modalOpen = ref(false)

const handleCTA = () => {
  if (user.value && profileStore.profile) {
    router.push('/swipe')
  } else {
    modalOpen.value = true
  }
}

const features = [
  { icon: Target, title: 'Analyse', desc: 'Réponds à notre questionnaire morphologique et sportif intelligent.' },
  { icon: Zap, title: 'Matche', desc: 'Notre algorithme analyse ton profil pour trouver la chaussure idéale.' },
  { icon: Shield, title: 'Cours', desc: 'Reçois tes recommandations personnalisées et commande en un clic.' },
]

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_url: string | null
  published_at: string | null
  tags: string[]
}

const { data: blogData } = await useFetch<{ posts: BlogPost[] }>('/api/blog')
const blogPosts = computed(() => blogData.value?.posts?.slice(0, 3) ?? [])

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

useSeoMeta({
  title: 'RunMatch — Trouve ta chaussure de running idéale',
  description: 'Réponds à quelques questions, swipe les modèles : RunMatch te recommande la chaussure de running adaptée à ton profil, avec les meilleures offres.',
})
</script>

<template>
  <div class="bg-background">
    <ToastContainer />
    <QuestionnaireModal :open="modalOpen" @close="modalOpen = false" />

    <!-- Nav -->
    <nav class="fixed top-0 w-full z-50 bg-background/20 backdrop-blur-xl border-b border-border">
      <div class="container flex items-center justify-between h-16">
        <span class="text-xl font-black tracking-tighter">
          RUN<span class="text-gradient">MATCH</span>
        </span>
        <div class="flex items-center gap-2">
          <template v-if="user">
            <UiButton variant="ghost" size="sm" to="/profil">
              <User class="w-4 h-4" />
              Mon profil
            </UiButton>
            <UiButton variant="ghost" size="sm" @click="authStore.signOut()">
              Déconnexion
            </UiButton>
          </template>
          <template v-else>
            <UiButton variant="ghost" size="sm" to="/connexion">
              <User class="w-4 h-4" />
              Connexion
            </UiButton>
          </template>
        </div>
      </div>
    </nav>

    <!-- Hero sticky -->
    <section class="sticky top-0 z-0 h-screen flex items-center">
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style="background-image: url('/hero-bg.webp')"
        aria-hidden="true"
      />
      <div
        class="absolute inset-0"
        style="background: linear-gradient(105deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.18) 100%)"
        aria-hidden="true"
      />

      <div class="container relative z-10 pt-16">
        <div
          v-motion
          :initial="{ opacity: 0, x: -40 }"
          :enter="{ opacity: 1, x: 0, transition: { duration: 800 } }"
          class="space-y-6 max-w-xl"
        >
          <h1 class="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] text-white drop-shadow-lg">
            Arrête de te tromper<br />
            <span class="text-gradient">de chaussures de running.</span>
          </h1>
          <p class="text-lg text-white/70 max-w-md leading-relaxed drop-shadow">
            Analyse ton profil + swipe de modèles adaptés →<br />
            Trouve ta paire idéale en 2 minutes.
          </p>
          <div class="flex flex-wrap gap-4 pt-2">
            <UiButton variant="hero" size="xl" @click="handleCTA">
              Commencer maintenant
              <ArrowRight class="w-5 h-5" />
            </UiButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Features + Footer (scrolle par-dessus le hero) -->
    <div class="relative z-10 bg-card rounded-t-3xl shadow-[0_-12px_48px_rgba(0,0,0,0.25)]">
      <section class="py-24">
        <div class="container">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
            class="text-center mb-16"
          >
            <h2 class="text-3xl md:text-4xl font-black tracking-tight">Comment ça marche</h2>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div
              v-for="(feature, i) in features"
              :key="feature.title"
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: i * 150 } }"
              class="text-center space-y-4 p-8 rounded-2xl bg-background card-shadow"
            >
              <div class="w-14 h-14 mx-auto rounded-xl accent-gradient flex items-center justify-center">
                <component :is="feature.icon" class="w-7 h-7 text-white" />
              </div>
              <h3 class="text-xl font-bold">{{ feature.title }}</h3>
              <p class="text-muted-foreground leading-relaxed">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Blog section -->
      <section id="blog" class="py-24 border-t border-border">
        <div class="container">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
            class="text-center mb-16"
          >
            <h2 class="text-3xl md:text-4xl font-black tracking-tight">Le blog RunMatch</h2>
            <p class="text-muted-foreground mt-3 max-w-lg mx-auto">Conseils, comparatifs et guides pour bien choisir tes chaussures de running.</p>
          </div>

          <div v-if="blogPosts.length" class="grid md:grid-cols-3 gap-6">
            <NuxtLink
              v-for="(post, i) in blogPosts"
              :key="post.id"
              :to="`/blog/${post.slug}`"
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: i * 120 } }"
              class="group rounded-2xl bg-background card-shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div
                class="h-44 bg-muted overflow-hidden"
              >
                <BlogCoverImage
                  v-if="post.cover_url"
                  :src="post.cover_url"
                  :alt="post.title"
                  class="w-full h-full"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-secondary"><PenLine class="w-9 h-9 text-muted-foreground" aria-hidden="true" /></div>
              </div>
              <div class="p-5 space-y-2">
                <div class="flex flex-wrap gap-1.5 mb-1">
                  <span
                    v-for="tag in post.tags.slice(0, 2)"
                    :key="tag"
                    class="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 font-medium"
                  >{{ tag }}</span>
                </div>
                <h3 class="font-bold text-base leading-snug group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                  {{ post.title }}
                </h3>
                <p class="text-sm text-muted-foreground line-clamp-2">{{ post.excerpt }}</p>
                <p class="text-xs text-muted-foreground pt-1">{{ formatDate(post.published_at) }}</p>
              </div>
            </NuxtLink>
          </div>

          <p v-else class="text-center text-muted-foreground text-sm">Aucun article pour l'instant.</p>
        </div>
      </section>

    </div>
  </div>
</template>
