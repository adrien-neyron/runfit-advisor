<script setup lang="ts">
import { ArrowLeft, Send, CheckCircle } from 'lucide-vue-next'

const router = useRouter()

useHead({
  title: 'Contact — RunMatch',
})

const form = reactive({
  name:    '',
  email:   '',
  subject: 'general',
  message: '',
})

const subjects = [
  { value: 'general',     label: 'Question générale' },
  { value: 'affiliation', label: 'Partenariat / Affiliation' },
  { value: 'bug',         label: 'Signaler un bug' },
  { value: 'rgpd',        label: 'Données personnelles (RGPD)' },
  { value: 'other',       label: 'Autre' },
]

const loading  = ref(false)
const sent     = ref(false)
const error    = ref('')

async function submit() {
  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    error.value = 'Merci de remplir tous les champs obligatoires.'
    return
  }
  error.value = ''
  loading.value = true

  // Encode en mailto — pas de backend nécessaire pour un MVP
  const body = encodeURIComponent(
    `Nom : ${form.name}\nSujet : ${subjects.find(s => s.value === form.subject)?.label}\n\n${form.message}`
  )
  window.location.href = `mailto:contact@runmatch.fr?subject=${encodeURIComponent('[RunMatch] ' + (subjects.find(s => s.value === form.subject)?.label ?? form.subject))}&body=${body}`

  loading.value = false
  sent.value    = true
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="container flex items-center h-16">
        <UiButton variant="ghost" size="icon" aria-label="Retour" @click="router.push('/')">
          <ArrowLeft class="w-5 h-5" />
        </UiButton>
        <span class="ml-4 font-black tracking-tighter">
          RUN<span class="text-gradient">MATCH</span>
        </span>
      </div>
    </div>

    <div class="container max-w-lg pt-24 pb-16 px-4">
      <h1 class="text-3xl font-black tracking-tight">Nous contacter</h1>
      <p class="text-muted-foreground mt-2 mb-8">
        Une question, un partenariat, un bug ? On vous répond sous 48h.
      </p>

      <!-- Confirmation -->
      <div
        v-if="sent"
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0 }"
        class="flex flex-col items-center text-center gap-4 py-16"
      >
        <CheckCircle class="w-16 h-16 text-green-500" :stroke-width="1.5" />
        <h2 class="text-xl font-black">Message envoyé !</h2>
        <p class="text-muted-foreground text-sm max-w-xs">
          Votre client mail s'est ouvert avec le message pré-rempli.
          Envoyez-le et nous vous répondrons sous 48h.
        </p>
        <UiButton variant="outline" @click="sent = false">
          Envoyer un autre message
        </UiButton>
      </div>

      <!-- Formulaire -->
      <form v-else class="space-y-5" @submit.prevent="submit">
        <!-- Nom -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold" for="contact-name">Nom *</label>
          <input
            id="contact-name"
            v-model="form.name"
            type="text"
            autocomplete="name"
            placeholder="Votre nom"
            class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>

        <!-- Email -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold" for="contact-email">Email *</label>
          <input
            id="contact-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="votre@email.com"
            class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>

        <!-- Sujet -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold" for="contact-subject">Sujet</label>
          <select
            id="contact-subject"
            v-model="form.subject"
            class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
          >
            <option v-for="s in subjects" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>

        <!-- Message -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold" for="contact-message">Message *</label>
          <textarea
            id="contact-message"
            v-model="form.message"
            rows="5"
            placeholder="Décrivez votre demande…"
            class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
          />
        </div>

        <!-- Erreur -->
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

        <!-- Affiliation note -->
        <p class="text-xs text-muted-foreground">
          Pour toute demande de partenariat ou d'affiliation, merci de préciser votre site et
          votre audience dans le message.
        </p>

        <UiButton type="submit" variant="hero" size="lg" class="w-full gap-2" :disabled="loading">
          <Send class="w-4 h-4" />
          Envoyer le message
        </UiButton>
      </form>
    </div>

    <AppFooter />
  </div>
</template>
