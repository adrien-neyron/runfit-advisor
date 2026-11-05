// ============================================================
// Rapprochement strict « produit du flux marchand » ↔ « chaussure du catalogue »
// ============================================================
// Principe : mieux vaut rater une correspondance que lier la mauvaise chaussure
// (un lien vers la Nimbus 26 sur une fiche Nimbus 27 = achat raté, client déçu).
//
// Règles :
//  1. la marque doit correspondre
//  2. TOUS les mots du modèle du catalogue doivent figurer dans le titre (numéro de version compris)
//  3. le titre ne doit pas contenir de numéro de version absent du catalogue (« Wave Rider 28 » ≠ « Wave Rider »)
//  4. les variantes enfant / imperméables (GTX…) sont écartées si le catalogue ne les vise pas
//  5. en cas d'égalité entre deux chaussures du catalogue, on ne choisit pas (null)

export interface CatalogShoe {
  id: string
  brand: string
  model: string
}

export interface FeedCandidate {
  brand: string
  title: string
}

export interface ShoeMatch {
  shoeId: string
  /** Mots du titre qui ne sont pas dans le modèle (plus petit = titre plus proche du modèle) */
  extraTokens: number
}

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // « 860v14 » et « 860 v14 » doivent donner les mêmes mots (écritures différentes selon catalogue / flux)
    .replace(/(\d)v(\d)/g, '$1 v$2')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
}

function brandKey(s: string): string {
  return tokenize(s).join('')
}

// Variantes qui ne sont pas la chaussure du catalogue, sauf si le catalogue les contient
const VARIANT_TOKENS = new Set([
  'gtx', 'goretex', 'gore', 'tex', 'wp', 'waterproof', 'impermeable',
  'junior', 'jr', 'kids', 'kid', 'enfant', 'enfants', 'nino', 'nina', 'ninos', 'infantil', 'infantile',
  'gs', 'ps', 'td', 'boys', 'girls', 'bebe',
])

const VERSION_NUMBER = /^\d{1,2}$/
const VERSION_V = /^v\d+$/

interface PreparedShoe {
  shoe: CatalogShoe
  brandKey: string
  brandTokens: string[]
  modelTokens: string[]
}

// Préparation du catalogue une seule fois (un flux peut contenir des centaines de milliers de lignes)
const PREPARED = new WeakMap<CatalogShoe[], PreparedShoe[]>()

function prepare(catalog: CatalogShoe[]): PreparedShoe[] {
  let p = PREPARED.get(catalog)
  if (!p) {
    p = catalog
      .map(shoe => ({
        shoe,
        brandKey: brandKey(shoe.brand),
        brandTokens: tokenize(shoe.brand),
        modelTokens: tokenize(shoe.model),
      }))
      .filter(s => s.modelTokens.length > 0)
    PREPARED.set(catalog, p)
  }
  return p
}

const UNKNOWN_BRAND = new Set(['', 'unknown', 'inconnu'])

/**
 * Les flux ont souvent une ligne par taille : « Chaussures Brooks Ghost 16 bleu - 43.5 ».
 * La pointure finale n'est pas un numéro de version : on la retire avant de comparer.
 */
export function stripTrailingSize(title: string): string {
  return title.replace(/\s+-\s+(?:(?:EU|UK|US|FR)\s*)?\d{1,2}(?:[.,]\d)?(?:\s?\d\/\d|\(\d\/\d\))?\s*$/i, '')
}

export function matchShoe(candidate: FeedCandidate, catalog: CatalogShoe[]): ShoeMatch | null {
  const titleTokens = tokenize(stripTrailingSize(candidate.title))
  if (titleTokens.length === 0) return null
  const titleSet = new Set(titleTokens)

  const feedBrandKey = brandKey(candidate.brand)
  const feedBrandTokens = tokenize(candidate.brand)
  const brandUnknown = UNKNOWN_BRAND.has(feedBrandKey)

  let best: { shoe: CatalogShoe; modelTokens: string[]; extra: number } | null = null
  let tie = false

  for (const s of prepare(catalog)) {
    // Marque : colonne « brand_name » du flux ; à défaut, la marque doit figurer dans le titre
    const brandOk = brandUnknown
      ? s.brandTokens.every(t => titleSet.has(t))
      : feedBrandKey === s.brandKey || feedBrandKey.startsWith(s.brandKey) || s.brandKey.startsWith(feedBrandKey)
    if (!brandOk) continue

    if (!s.modelTokens.every(t => titleSet.has(t))) continue

    const modelSet = new Set(s.modelTokens)
    // Les mots de la marque (catalogue ET flux, ex. « Inov-8 » → inov, 8) ne comptent pas comme extras
    const brandTokens = new Set([...s.brandTokens, ...feedBrandTokens])
    const extras = titleTokens.filter(t => !modelSet.has(t) && !brandTokens.has(t))

    // Numéro de version du titre inconnu du catalogue → autre génération
    if (extras.some(t => VERSION_NUMBER.test(t) || VERSION_V.test(t))) continue
    // Variante (enfant, GTX…) non visée par le catalogue
    if (extras.some(t => VARIANT_TOKENS.has(t))) continue

    if (!best || s.modelTokens.length > best.modelTokens.length) {
      best = { shoe: s.shoe, modelTokens: s.modelTokens, extra: extras.length }
      tie = false
    } else if (s.modelTokens.length === best.modelTokens.length) {
      tie = true
    }
  }

  if (!best || tie) return null
  return { shoeId: best.shoe.id, extraTokens: best.extra }
}
