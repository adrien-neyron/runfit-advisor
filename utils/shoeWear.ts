/**
 * Durée de vie estimée d'une paire de chaussures de running.
 * Repères habituels : 600-800 km sur route, 500-700 km sur trail (valeur médiane utilisée),
 * réduite d'environ 15 % au-delà de 85 kg. Estimation indicative, pas une mesure.
 */
export type WearLevel = 'ok' | 'soon' | 'worn'

export function lifespanKm(terrain: 'route' | 'trail', poidsKg?: number | null): number {
  const base = terrain === 'trail' ? 600 : 700
  return Math.round(poidsKg && poidsKg >= 85 ? base * 0.85 : base)
}

export function wearInfo(km: number, terrain: 'route' | 'trail', poidsKg?: number | null) {
  const lifespan = lifespanKm(terrain, poidsKg)
  const percent = Math.max(0, Math.min(100, Math.round((km / lifespan) * 100)))
  const level: WearLevel = percent >= 100 ? 'worn' : percent >= 80 ? 'soon' : 'ok'
  return { lifespan, percent, level, remaining: Math.max(0, lifespan - Math.round(km)) }
}
