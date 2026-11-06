import { defineStore } from 'pinia'
import type { UserProfile } from '~/data/products'

// Profil invité : localStorage, pour reprendre le questionnaire d'une session à l'autre.
// Un utilisateur connecté n'est jamais mis en cache ici : la base est la source de vérité.
const GUEST_KEY = 'runmatch-profile'

const OPTIONAL_FIELDS: (keyof UserProfile)[] = ['budget', 'voutePlantaire', 'volume']

function toUserProfile(row: Record<string, unknown>): UserProfile {
  return {
    sexe: (row.sexe as string) || 'homme',
    foulee: (row.foulee as string) || 'neutre',
    niveau: (row.niveau as string) || 'débutant',
    distance: (row.distance as string) || '10km',
    terrain: (row.terrain as string) || 'route',
    objectif: (row.objectif as string) || 'confort',
    largeurPied: (row.largeur_pied as string) || 'standard',
    blessures: (row.blessures as string) || 'non',
    dropPreference: (row.drop_preference as string) || 'moyen',
    amortPreference: (row.amort_preference as string) || 'moyen',
    taille: (row.taille as number) ?? 175,
    poids: (row.poids as number) ?? 70,
    budget: (row.budget as string) || undefined,
    voutePlantaire: (row.voute_plantaire as string) || undefined,
    volume: (row.volume as string) || undefined,
    healthConsent: !!row.health_consent_at,
    healthConsentAt: (row.health_consent_at as string) || null,
  }
}

export const useUserProfileStore = defineStore('userProfile', () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  const profile = ref<UserProfile | null>(null)
  const loading = ref(true)

  const readGuestProfile = (): UserProfile | null => {
    try {
      const stored = localStorage.getItem(GUEST_KEY)
      return stored ? (JSON.parse(stored) as UserProfile) : null
    } catch {
      return null
    }
  }
  const writeGuestProfile = (p: UserProfile) => {
    try { localStorage.setItem(GUEST_KEY, JSON.stringify(p)) } catch { /* stockage plein ou bloqué */ }
  }
  const clearGuestProfile = () => {
    try { localStorage.removeItem(GUEST_KEY) } catch { /* ignore */ }
  }

  // Charge depuis la DB si connecté, sinon depuis le stockage local (invité).
  // À la première connexion, un profil invité existant est fusionné dans le compte.
  const loadProfile = async () => {
    loading.value = true

    if (user.value) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.value.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('[useUserProfileStore] Erreur lecture DB:', error)
      }

      if (data) {
        // Le profil du compte l'emporte : le brouillon invité devient inutile
        profile.value = toUserProfile(data as Record<string, unknown>)
        clearGuestProfile()
      } else {
        const guest = readGuestProfile()
        if (guest) {
          // Compte sans profil : on y enregistre celui commencé en invité
          await saveProfile(guest)
          clearGuestProfile()
        }
      }
    } else {
      profile.value = readGuestProfile()
    }

    loading.value = false
  }

  const saveProfile = async (input: UserProfile) => {
    // Donnée de santé : sans consentement explicite, on ne conserve aucune réponse « blessures »
    const consent = !!input.healthConsent
    const p: UserProfile = {
      ...input,
      blessures: consent ? input.blessures : 'non',
      healthConsent: consent,
      healthConsentAt: consent ? (input.healthConsentAt ?? new Date().toISOString()) : null,
    }
    profile.value = p

    if (!user.value) {
      writeGuestProfile(p)
    } else {
      await (supabase.from('user_profiles') as any).upsert(
        {
          user_id: user.value.id,
          sexe: p.sexe,
          foulee: p.foulee,
          niveau: p.niveau,
          distance: p.distance,
          terrain: p.terrain,
          objectif: p.objectif,
          largeur_pied: p.largeurPied,
          blessures: p.blessures,
          drop_preference: p.dropPreference,
          amort_preference: p.amortPreference,
          taille: p.taille,
          poids: p.poids,
          budget: p.budget ?? null,
          voute_plantaire: p.voutePlantaire ?? null,
          volume: p.volume ?? null,
          health_consent_at: p.healthConsentAt ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
    }
  }

  // Recharge quand l'utilisateur change.
  // À la déconnexion : on efface le profil de l'ancien utilisateur (mémoire + appareil) pour
  // repartir d'un état invité vierge, sans reste de données personnelles ni de santé.
  watch(user, (newUser, oldUser) => {
    if (oldUser && !newUser) {
      clearGuestProfile()
      profile.value = null
    }
    loadProfile()
  }, { immediate: true })

  // Complétion des champs optionnels (0–100%)
  const enrichmentComplete = computed(() =>
    !!profile.value && OPTIONAL_FIELDS.every(f => !!profile.value![f]),
  )

  const enrichmentProgress = computed(() => {
    if (!profile.value) return 0
    const filled = OPTIONAL_FIELDS.filter(f => !!profile.value![f]).length
    return Math.round((filled / OPTIONAL_FIELDS.length) * 100)
  })

  const missingOptionalFields = computed(() =>
    OPTIONAL_FIELDS.filter(f => !profile.value?.[f]),
  )

  return { profile, loading, saveProfile, loadProfile, enrichmentComplete, enrichmentProgress, missingOptionalFields }
})
