<script setup lang="ts">
import { Download, Trash2 } from 'lucide-vue-next'

// Droits RGPD : export (art. 15/20) et suppression du compte (art. 17).
// La confirmation de suppression utilise un <dialog> natif : piège à focus, Échap et
// restitution du focus sont gérés par le navigateur.
const user = useSupabaseUser()
const client = useSupabaseClient()

const GUEST_KEYS = ['runmatch-profile', 'runmatch-guest-matches', 'runmatch-user-matches']

const accessToken = async () => (await client.auth.getSession()).data.session?.access_token

// ─── Export ───────────────────────────────────────────────────────────────────
const exporting = ref(false)
const exportMessage = ref('')
const exportFailed = ref(false)

const exportData = async () => {
  exporting.value = true
  exportMessage.value = ''
  exportFailed.value = false
  try {
    const token = await accessToken()
    const data = await $fetch<Record<string, unknown>>('/api/account/export', {
      headers: { Authorization: `Bearer ${token}` },
    })
    // Les matchs sont stockés sur l'appareil : on les ajoute à l'export
    let localMatches: unknown = {}
    try { localMatches = JSON.parse(localStorage.getItem('runmatch-user-matches') ?? '{}') } catch { /* ignore */ }

    const blob = new Blob([JSON.stringify({ ...data, matchesOnThisDevice: localMatches }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `runmatch-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    exportMessage.value = 'Export téléchargé.'
  } catch {
    exportFailed.value = true
    exportMessage.value = 'Export impossible pour le moment. Réessaie dans quelques minutes.'
  } finally {
    exporting.value = false
  }
}

// ─── Suppression ──────────────────────────────────────────────────────────────
const dialogRef = ref<HTMLDialogElement | null>(null)
const typedEmail = ref('')
const deleting = ref(false)
const deleteError = ref('')

const canDelete = computed(
  () => !!user.value?.email && typedEmail.value.trim().toLowerCase() === user.value.email.toLowerCase(),
)

const openDialog = () => {
  typedEmail.value = ''
  deleteError.value = ''
  dialogRef.value?.showModal()
}
const closeDialog = () => dialogRef.value?.close()

const deleteAccount = async () => {
  if (!canDelete.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    const token = await accessToken()
    await $fetch('/api/account/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { email: typedEmail.value },
    })
    for (const key of GUEST_KEYS) {
      try { localStorage.removeItem(key) } catch { /* ignore */ }
    }
    try { await client.auth.signOut({ scope: 'local' }) } catch { /* la session n'existe déjà plus côté serveur */ }
    await navigateTo('/connexion?compte-supprime=1')
  } catch {
    deleteError.value = 'La suppression a échoué. Réessaie, ou écris-nous depuis la page Contact (sujet « Données personnelles »).'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <section aria-labelledby="data-title" class="rounded-2xl border border-border bg-card p-4" data-id="account-data">
    <h2 id="data-title" class="text-sm font-black mb-1">Mes données</h2>
    <p class="text-sm text-muted-foreground leading-relaxed">
      Télécharge une copie de tes données, ou supprime définitivement ton compte.
    </p>

    <div class="flex flex-wrap gap-2 mt-3">
      <UiButton variant="outline" size="sm" class="gap-1.5" :disabled="exporting" :aria-busy="exporting" @click="exportData">
        <Download class="w-4 h-4" aria-hidden="true" />
        Télécharger mes données
      </UiButton>
      <UiButton variant="outline" size="sm" class="gap-1.5 text-destructive border-destructive/40" @click="openDialog">
        <Trash2 class="w-4 h-4" aria-hidden="true" />
        Supprimer mon compte
      </UiButton>
    </div>

    <p v-if="exportMessage" :role="exportFailed ? 'alert' : 'status'" class="text-sm mt-3" :class="exportFailed ? 'text-destructive font-medium' : 'text-muted-foreground'">
      {{ exportMessage }}
    </p>

    <dialog
      ref="dialogRef"
      aria-labelledby="delete-title"
      aria-describedby="delete-desc"
      class="w-[min(92vw,28rem)] rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xl backdrop:bg-black/50"
    >
      <h3 id="delete-title" class="text-lg font-black">Supprimer mon compte ?</h3>
      <p id="delete-desc" class="text-sm text-muted-foreground mt-2 leading-relaxed">
        Cette action est définitive. Ton profil, ton équipement et tes messages de contact seront supprimés. Les clics
        sur des liens marchands sont conservés sans lien avec toi.
      </p>

      <form class="mt-4 space-y-3" @submit.prevent="deleteAccount">
        <div class="space-y-1.5">
          <label for="delete-email" class="text-sm font-medium">Saisis ton adresse email pour confirmer</label>
          <input
            id="delete-email"
            v-model="typedEmail"
            type="email"
            autocomplete="off"
            required
            :aria-describedby="deleteError ? 'delete-error' : undefined"
            class="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <p v-if="deleteError" id="delete-error" role="alert" class="text-sm text-destructive font-medium">{{ deleteError }}</p>

        <div class="flex flex-wrap justify-end gap-2 pt-1">
          <UiButton type="button" variant="outline" @click="closeDialog">Annuler</UiButton>
          <UiButton type="submit" variant="hero" class="bg-destructive" :disabled="!canDelete || deleting" :aria-busy="deleting">
            <template v-if="deleting">
              <span class="sr-only">Suppression en cours…</span>
              <span class="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true" />
            </template>
            <span v-else>Supprimer définitivement</span>
          </UiButton>
        </div>
      </form>
    </dialog>
  </section>
</template>
