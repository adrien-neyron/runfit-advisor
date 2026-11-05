<script setup lang="ts">
import { ArrowLeft, Send, CheckCircle } from 'lucide-vue-next'

useHead({
  title: 'Contact — RunMatch',
})

const form = reactive({
  name:    '',
  email:   '',
  subject: 'general',
  message: '',
  website: '', // honeypot anti-spam : doit rester vide
})

const subjects = [
  { value: 'general',     label: 'Question générale' },
  { value: 'affiliation', label: 'Partenariat / Affiliation' },
  { value: 'bug',         label: 'Signaler un bug' },
  { value: 'rgpd',        label: 'Données personnelles (RGPD)' },
  { value: 'other',       label: 'Autre' },
]

type Field = 'name' | 'email' | 'message'
const FIELD_ORDER: Field[] = ['name', 'email', 'message']
const FIELD_IDS: Record<Field, string> = { name: 'contact-name', email: 'contact-email', message: 'contact-message' }
const FIELD_LABELS: Record<Field, string> = { name: 'Nom', email: 'Email', message: 'Message' }

const loading = ref(false)
const sent = ref(false)
const formError = ref('')
const fieldErrors = reactive<Partial<Record<Field, string>>>({})

const summaryRef = ref<HTMLElement | null>(null)
const successTitle = ref<HTMLElement | null>(null)

const hasErrors = computed(() => FIELD_ORDER.some((f) => fieldErrors[f]))

// Mêmes règles que le serveur (server/api/contact.post.ts) : retour immédiat sans aller-retour réseau
function validate(): boolean {
  FIELD_ORDER.forEach((f) => delete fieldErrors[f])
  const name = form.name.trim()
  const email = form.email.trim()
  const message = form.message.trim()
  if (name.length < 2) fieldErrors.name = 'Indique ton nom (2 caractères minimum).'
  if (!email) fieldErrors.email = 'Indique ton adresse email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Saisis une adresse email valide, par exemple toi@exemple.fr.'
  if (message.length < 10) fieldErrors.message = 'Ton message est trop court (10 caractères minimum).'
  return !hasErrors.value
}

function focusField(id: string) {
  document.getElementById(id)?.focus()
}

async function focusSummary() {
  await nextTick()
  summaryRef.value?.focus()
}

async function submit() {
  formError.value = ''
  if (!validate()) {
    await focusSummary()
    return
  }

  loading.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: { ...form } })
    sent.value = true
    form.name = ''
    form.email = ''
    form.subject = 'general'
    form.message = ''
    await nextTick()
    successTitle.value?.focus()
  } catch (e: any) {
    const serverErrors = e?.data?.data?.fieldErrors as Partial<Record<Field, string>> | undefined
    if (serverErrors) {
      FIELD_ORDER.forEach((f) => { if (serverErrors[f]) fieldErrors[f] = serverErrors[f] })
    } else if (e?.statusCode === 429 || e?.status === 429) {
      formError.value = 'Trop de messages envoyés. Réessaie dans une heure.'
    } else {
      formError.value = e?.data?.message || "Ton message n'a pas pu être envoyé. Vérifie ta connexion et réessaie."
    }
    await focusSummary()
  } finally {
    loading.value = false
  }
}

const inputClass = (field: Field) => [
  'w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 transition',
  fieldErrors[field] ? 'border-destructive focus:ring-destructive/40' : 'border-border focus:ring-primary/40',
]
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="container flex items-center h-16">
        <UiButton variant="ghost" size="icon" aria-label="Retour" to="/">
          <ArrowLeft class="w-5 h-5" aria-hidden="true" />
        </UiButton>
        <span class="ml-4 font-black tracking-tighter">
          RUN<span class="text-gradient">MATCH</span>
        </span>
      </div>
    </div>

    <div class="container max-w-lg pt-24 pb-16 px-4">
      <h1 class="text-3xl font-black tracking-tight">Nous contacter</h1>
      <p class="text-muted-foreground mt-2 mb-8">
        Une question, un partenariat, un bug ? On te répond sous 48h.
      </p>

      <!-- Confirmation : message réellement enregistré côté serveur -->
      <div
        v-if="sent"
        class="flex flex-col items-center text-center gap-4 py-16"
        data-id="contact-success"
      >
        <CheckCircle class="w-16 h-16 text-green-600" :stroke-width="1.5" aria-hidden="true" />
        <h2 ref="successTitle" tabindex="-1" class="text-xl font-black focus:outline-none">Message envoyé !</h2>
        <p class="text-muted-foreground text-sm max-w-xs" role="status">
          Merci, on a bien reçu ton message. Nous te répondrons par email sous 48h.
        </p>
        <UiButton variant="outline" @click="sent = false">
          Envoyer un autre message
        </UiButton>
      </div>

      <!-- Formulaire -->
      <form v-else class="space-y-5" novalidate @submit.prevent="submit">
        <!-- Récapitulatif des erreurs : reçoit le focus à la soumission -->
        <div
          v-if="hasErrors || formError"
          ref="summaryRef"
          role="alert"
          tabindex="-1"
          class="rounded-xl border-2 border-destructive p-4 text-sm focus:outline-none"
          data-id="contact-errors"
        >
          <p class="font-bold text-destructive">
            {{ hasErrors ? 'Le formulaire contient des erreurs :' : formError }}
          </p>
          <ul v-if="hasErrors" class="mt-2 list-disc pl-5 space-y-1">
            <li v-for="f in FIELD_ORDER.filter((k) => fieldErrors[k])" :key="f">
              <a :href="`#${FIELD_IDS[f]}`" class="underline font-medium" @click.prevent="focusField(FIELD_IDS[f])">
                {{ FIELD_LABELS[f] }}
              </a>
              : {{ fieldErrors[f] }}
            </li>
          </ul>
        </div>

        <!-- Nom -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold" for="contact-name">Nom <span aria-hidden="true">*</span><span class="sr-only">(obligatoire)</span></label>
          <input
            id="contact-name"
            v-model="form.name"
            type="text"
            autocomplete="name"
            required
            aria-required="true"
            :aria-invalid="fieldErrors.name ? 'true' : undefined"
            :aria-describedby="fieldErrors.name ? 'contact-name-error' : undefined"
            placeholder="Ton nom"
            :class="inputClass('name')"
          />
          <p v-if="fieldErrors.name" id="contact-name-error" class="text-sm text-destructive font-medium">{{ fieldErrors.name }}</p>
        </div>

        <!-- Email -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold" for="contact-email">Email <span aria-hidden="true">*</span><span class="sr-only">(obligatoire)</span></label>
          <input
            id="contact-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            aria-required="true"
            :aria-invalid="fieldErrors.email ? 'true' : undefined"
            :aria-describedby="fieldErrors.email ? 'contact-email-error' : undefined"
            placeholder="ton@email.com"
            :class="inputClass('email')"
          />
          <p v-if="fieldErrors.email" id="contact-email-error" class="text-sm text-destructive font-medium">{{ fieldErrors.email }}</p>
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
          <label class="text-sm font-semibold" for="contact-message">Message <span aria-hidden="true">*</span><span class="sr-only">(obligatoire)</span></label>
          <textarea
            id="contact-message"
            v-model="form.message"
            rows="5"
            required
            aria-required="true"
            :aria-invalid="fieldErrors.message ? 'true' : undefined"
            :aria-describedby="fieldErrors.message ? 'contact-message-error' : undefined"
            placeholder="Décris ta demande…"
            :class="[...inputClass('message'), 'resize-none']"
          />
          <p v-if="fieldErrors.message" id="contact-message-error" class="text-sm text-destructive font-medium">{{ fieldErrors.message }}</p>
        </div>

        <!-- Honeypot anti-spam : invisible et hors parcours clavier -->
        <div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label for="contact-website">Ne pas remplir</label>
          <input id="contact-website" v-model="form.website" type="text" tabindex="-1" autocomplete="off" />
        </div>

        <p class="text-xs text-muted-foreground">
          Les champs marqués d'un astérisque (*) sont obligatoires. Pour toute demande de partenariat ou d'affiliation,
          précise ton site et ton audience dans le message. Tes données servent uniquement à te répondre
          (voir la <NuxtLink to="/confidentialite" class="underline hover:text-brand">politique de confidentialité</NuxtLink>).
        </p>

        <UiButton type="submit" variant="hero" size="lg" class="w-full gap-2" :disabled="loading" :aria-busy="loading">
          <Send class="w-4 h-4" aria-hidden="true" />
          {{ loading ? 'Envoi en cours…' : 'Envoyer le message' }}
        </UiButton>
      </form>
    </div>
  </div>
</template>
