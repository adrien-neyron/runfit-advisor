/**
 * useShoeOffers — source unique des offres d'achat « idéales » (lien produit direct, marchand monétisable).
 * Remplace les anciens appels à shoe_prices / v_shoe_best_offers côté client.
 */
export interface ShoeOffer {
  merchantSlug: string
  merchantName: string
  network: string | null
  /** null = prix non vérifié récemment : on ne l'affiche pas */
  price: number | null
  priceCheckedAt: string | null
  /** À utiliser tel quel pour le lien d'achat (tracking + attribution côté serveur) */
  redirectUrl: string
  /** Photo du marchand pour cette offre (null = utiliser la photo du catalogue) */
  imageUrl: string | null
}

export function useShoeOffers() {
  // Partagé entre les pages (une seule requête par session de navigation)
  const profileStore = useUserProfileStore()
  // Variante affichée : celle du profil (homme par défaut). Les offres de l'autre genre sont exclues.
  const sexe = () => (profileStore.profile?.sexe === 'femme' ? 'femme' : 'homme')
  const availableFor = (s: string) => useState<string[] | null>(`shoe-offers-available-${s}`, () => null)

  /**
   * Identifiants des chaussures qui ont au moins une offre idéale.
   * Retourne null si l'information est indisponible : l'appelant ne doit alors PAS filtrer
   * (mieux vaut afficher les chaussures sans lien d'achat que de n'en afficher aucune).
   */
  const fetchAvailableShoeIds = async (): Promise<Set<string> | null> => {
    const s = sexe()
    const available = availableFor(s)
    if (available.value) return new Set(available.value)
    try {
      const res = await $fetch<{ shoeIds: string[] }>('/api/offers', { query: { available: 1, sexe: s } })
      available.value = res.shoeIds
      return new Set(res.shoeIds)
    } catch {
      return null
    }
  }

  const fetchOffers = async (shoeIds: string[]): Promise<Map<string, ShoeOffer[]>> => {
    const out = new Map<string, ShoeOffer[]>()
    if (!shoeIds.length) return out
    try {
      const res = await $fetch<{ offers: Record<string, ShoeOffer[]> }>('/api/offers', {
        query: { ids: shoeIds.join(','), sexe: sexe() },
      })
      for (const [id, list] of Object.entries(res.offers ?? {})) out.set(id, list)
    } catch {
      // Pas d'offre affichée plutôt qu'une erreur bloquante
    }
    return out
  }

  /** Meilleure offre = première de la liste (déjà triée par prix récent puis priorité) */
  const bestOf = (offers: ShoeOffer[] | undefined): ShoeOffer | null => offers?.[0] ?? null

  /** Prix réel le plus bas (offre vérifiée < 7 jours) par chaussure ; absent si aucun prix récent. */
  const fetchLivePrices = async (shoeIds: string[]): Promise<Record<string, number>> => {
    const out: Record<string, number> = {}
    const offers = await fetchOffers(shoeIds)
    for (const [id, list] of offers) {
      const prices = list.map((o) => o.price).filter((x): x is number => x != null)
      if (prices.length) out[id] = Math.min(...prices)
    }
    return out
  }

  /** Ajoute la page d'origine au lien d'achat (suivi des clics par écran). */
  const withSrc = (url: string, src: 'swipe' | 'matches' | 'resultats' | 'fiche' | 'profil' | 'equipement'): string =>
    `${url}${url.includes('?') ? '&' : '?'}src=${src}`

  return { fetchAvailableShoeIds, fetchOffers, fetchLivePrices, bestOf, withSrc }
}
