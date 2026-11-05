/**
 * Tests de non-régression du moteur de recommandation.
 * Lancer : npx tsx scripts/test-reco.ts
 */
import { getRecommendations, type UserProfile } from '../data/products'

const base: UserProfile = {
  sexe: 'homme', taille: 178, poids: 72, largeurPied: 'standard', foulee: 'neutre',
  niveau: 'intermédiaire', distance: '10km', terrain: 'route', objectif: 'confort',
  blessures: 'non', dropPreference: 'moyen', amortPreference: 'moyen',
}

let failures = 0
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failures++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${ok ? '' : ` — ${detail}`}`)
}

const profiles: Record<string, UserProfile> = {
  'route neutre': base,
  'trail neutre': { ...base, terrain: 'trail' },
  'route pronateur': { ...base, foulee: 'pronateur', blessures: 'oui' },
  'route hyperpronateur': { ...base, foulee: 'hyperpronateur' },
  'débutant performance': { ...base, niveau: 'débutant', objectif: 'performance' },
  'mixte': { ...base, terrain: 'mixte' },
  'ultra trail supinateur': { ...base, foulee: 'supinateur', terrain: 'trail', distance: 'ultra' },
  'gabarit 95 kg': { ...base, poids: 95 },
}

for (const [name, profile] of Object.entries(profiles)) {
  const recs = getRecommendations(profile, 3)
  check(`${name}: 3 résultats`, recs.length === 3, String(recs.length))
  check(`${name}: pourcentages entre 0 et 100`, recs.every((r) => r.percent >= 0 && r.percent <= 100), recs.map((r) => r.percent).join(','))
  check(`${name}: classement décroissant`, recs.every((r, i) => i === 0 || recs[i - 1].score >= r.score))
  if (profile.terrain === 'route') {
    check(`${name}: aucune chaussure trail pure`, recs.every((r) => r.product.terrain.some((t) => t === 'route' || t === 'mixte')), recs.map((r) => r.product.id).join(','))
  }
  if (profile.terrain === 'trail') {
    check(`${name}: aucune chaussure route pure`, recs.every((r) => r.product.terrain.some((t) => t === 'trail' || t === 'mixte')), recs.map((r) => r.product.id).join(','))
  }
  if (profile.foulee === 'pronateur' || profile.foulee === 'hyperpronateur') {
    check(`${name}: chaussures pour pronateur`, recs.every((r) => r.product.foulee.includes('pronateur')), recs.map((r) => r.product.id).join(','))
  }
}

// Tri à score égal : le prix réel le plus bas passe en premier
const tie = getRecommendations({ ...base, objectif: 'performance' }, 3)
const live = Object.fromEntries(tie.map((r, i) => [r.product.id, 100 + (2 - i) * 10])) // inverse l'ordre des prix
const tieLive = getRecommendations({ ...base, objectif: 'performance' }, 3, undefined, live)
const sameScore = tie.every((r) => r.score === tie[0].score)
if (sameScore) check('égalité: prix réel le plus bas en premier', live[tieLive[0].product.id] <= live[tieLive[1].product.id])

console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests passent')
process.exit(failures ? 1 : 0)
