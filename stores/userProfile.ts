import { defineStore } from 'pinia'
import type { UserProfile } from '~/data/products'

const SESSION_KEY = 'runmatch-profile'

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
  }
}

export const useUserProfileStore = defineStore('userProfile', () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  const profile = ref<UserProfile | null>(null)
  const loading = ref(true)

  // Charge depuis la DB si connecté, sinon depuis sessionStorage
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
        const p = toUserProfile(data as Record<string, unknown>)
        profile.value = p
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(p))
      } else {
        const stored = sessionStorage.getItem(SESSION_KEY)
        if (stored) profile.value = JSON.parse(stored)
      }
    } else {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) profile.value = JSON.parse(stored)
    }

    loading.value = false
  }

  // Recharge quand l'utilisateur change
  watch(user, () => loadProfile(), { immediate: true })

  const saveProfile = async (p: UserProfile) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(p))
    profile.value = p

    if (user.value) {
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
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
    }
  }

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
