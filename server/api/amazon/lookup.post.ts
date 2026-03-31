/**
 * POST /api/amazon/lookup
 * Recherche l'ASIN exact d'une chaussure sur Amazon et retourne le lien affilié.
 *
 * Body: { brand: string, model: string, gender: 'Homme' | 'Femme', keywords?: string }
 */

import { lookupAmazonAsin } from '~/server/services/amazonPaApi.service'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { brand, model, gender, keywords } = await readBody(event)

  if (!brand || !model) {
    throw createError({ statusCode: 400, statusMessage: 'brand et model sont requis' })
  }
  if (!config.amazonPaAccessKey || !config.amazonPaSecretKey) {
    throw createError({ statusCode: 500, statusMessage: 'Clés Amazon PA API non configurées (AMAZON_PA_ACCESS_KEY / AMAZON_PA_SECRET_KEY)' })
  }

  return lookupAmazonAsin(
    brand,
    model,
    gender ?? 'Homme',
    config.amazonPaAccessKey,
    config.amazonPaSecretKey,
    keywords ?? '',
  )
})
