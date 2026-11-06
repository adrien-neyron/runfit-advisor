import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export interface ShoeMatch {
  shoeId: string
  liked: boolean
  timestamp: number
}

// Invités : localStorage (conservés sur l'appareil entre les sessions, fusionnés au compte à l'inscription)
const GUEST_KEY = 'runmatch-guest-matches'
// Connectés : localStorage (persistant)
const USER_KEY  = 'runmatch-user-matches'

export const useMatchesStore = defineStore('matches', () => {
  const user = useSupabaseUser()

  const guestMatches = useStorage<Record<string, ShoeMatch>>(GUEST_KEY, {})
  const userMatches  = useStorage<Record<string, ShoeMatch>>(USER_KEY, {})

  // À la connexion : migrer les matchs invités → compte
  watch(user, (newUser, oldUser) => {
    if (newUser && !oldUser && Object.keys(guestMatches.value).length > 0) {
      // Les matchs invités l'emportent sur d'éventuels matchs déjà en localStorage
      userMatches.value = { ...userMatches.value, ...guestMatches.value }
      guestMatches.value = {}
    }
  })

  const activeMatches = computed<Record<string, ShoeMatch>>(() =>
    user.value ? userMatches.value : guestMatches.value,
  )

  const swipe = (shoeId: string, liked: boolean) => {
    const match: ShoeMatch = { shoeId, liked, timestamp: Date.now() }
    if (user.value) {
      userMatches.value = { ...userMatches.value, [shoeId]: match }
    } else {
      guestMatches.value = { ...guestMatches.value, [shoeId]: match }
    }
  }

  const clearMatches = () => {
    if (user.value) userMatches.value = {}
    else guestMatches.value = {}
  }

  const isLiked   = (shoeId: string) => activeMatches.value[shoeId]?.liked === true
  const hasSwiped = (shoeId: string) => shoeId in activeMatches.value

  const likedShoes = computed(() =>
    Object.values(activeMatches.value).filter((m) => m.liked),
  )

  const isGuest         = computed(() => !user.value)
  const guestLikedCount = computed(() =>
    Object.values(guestMatches.value).filter((m) => m.liked).length,
  )

  return {
    likedShoes,
    swipe,
    clearMatches,
    isLiked,
    hasSwiped,
    isGuest,
    guestLikedCount,
  }
})
