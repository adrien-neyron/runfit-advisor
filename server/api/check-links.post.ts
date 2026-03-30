/**
 * Vérifie si un lien affiche bien le modèle de chaussure demandé.
 * Télécharge les premiers 80 Ko de la page et cherche le nom du modèle
 * + détecte les pages d'erreur / "produit introuvable".
 */

interface LinkToCheck {
  url: string
  brand: string
  model: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ links: LinkToCheck[] }>(event)
  const links = (body?.links ?? []).slice(0, 8)

  if (!links.length) return {}

  const results: Record<string, 'ok' | 'unavailable' | 'unknown'> = {}

  await Promise.allSettled(
    links.map(async ({ url, brand, model }) => {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 9000)

        const res = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
          },
          redirect: 'follow',
        })
        clearTimeout(timer)

        // 404 / 410 : URL clairement morte
        if (res.status === 404 || res.status === 410) {
          results[url] = 'unavailable'
          await res.body?.cancel()
          return
        }

        if (res.status < 200 || res.status >= 300) {
          results[url] = 'unknown'
          await res.body?.cancel()
          return
        }

        // Lire au maximum 80 Ko (suffisant pour head + body partiel)
        const MAX_BYTES = 80_000
        const reader = res.body?.getReader()
        let html = ''
        let bytesRead = 0

        if (reader) {
          const decoder = new TextDecoder()
          try {
            while (bytesRead < MAX_BYTES) {
              const { done, value } = await reader.read()
              if (done) break
              html += decoder.decode(value, { stream: true })
              bytesRead += value.length
            }
          } finally {
            await reader.cancel()
          }
        }

        results[url] = analyzeContent(html, brand, model)
      } catch {
        results[url] = 'unknown'
      }
    }),
  )

  return results
})

// ── Analyse du contenu HTML ───────────────────────────────────────────────────

function analyzeContent(html: string, brand: string, model: string): 'ok' | 'unavailable' | 'unknown' {
  const lower = html.toLowerCase()

  // Patterns d'erreur explicites (pages "produit introuvable")
  const ERROR_PATTERNS = [
    'page introuvable',
    'page not found',
    'erreur 404',
    '404 error',
    'produit introuvable',
    'produit non trouvé',
    'article introuvable',
    "cette page n'existe",
    "n'existe plus",
    'no longer available',
    'product not found',
    'item not found',
    'aucun résultat',
    'aucun produit',
    '0 résultat',
    '0 produit',
    'no results found',
    'no products found',
  ]

  const hasErrorPage = ERROR_PATTERNS.some((p) => lower.includes(p))

  // Mots significatifs du modèle (> 2 chars pour éviter faux positifs sur "GT", "4"…)
  const modelWords = model
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)

  const brandPresent = lower.includes(brand.toLowerCase())

  const matchCount = modelWords.filter((w) => lower.includes(w)).length
  // Exige au moins 2 mots du modèle trouvés, ou tous s'il y en a moins de 2
  const modelPresent =
    modelWords.length > 0 &&
    matchCount >= Math.min(2, modelWords.length)

  // Résolution
  if (modelPresent && brandPresent) return 'ok'
  if (modelPresent) return 'ok'        // brand absente mais modèle présent → ok
  if (hasErrorPage) return 'unavailable'

  // Page chargée mais modèle absent (SPA non rendue, anti-bot, résultats vides)
  return 'unknown'
}
