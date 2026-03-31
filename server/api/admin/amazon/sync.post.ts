/**
 * POST /api/admin/amazon/sync
 * Synchronise les ASINs Amazon pour toutes les chaussures du catalogue.
 * Met à jour / insère dans shoe_prices (retailer_name = 'Amazon').
 * Admin uniquement.
 *
 * Body (optionnel): { shoeId?: string, gender?: 'Homme' | 'Femme' }
 *   - shoeId : si fourni, ne traite que cette chaussure
 *   - gender : 'Homme' (défaut) ou 'Femme'
 */

import { lookupAmazonAsin } from '~/server/services/amazonPaApi.service'
import { requireAdmin } from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const config = useRuntimeConfig()
  if (!config.amazonPaAccessKey || !config.amazonPaSecretKey) {
    throw createError({ statusCode: 500, statusMessage: 'Clés Amazon PA API non configurées' })
  }

  const { shoeId, gender = 'Homme' } = await readBody(event).catch(() => ({}))

  // Récupère les chaussures à traiter
  const supabase = await serverSupabaseServiceClient(event)
  const query    = supabase.from('shoes').select('id, brand, model')
  if (shoeId) query.eq('id', shoeId)

  const { data: shoes, error } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!shoes?.length) return { synced: 0, results: [] }

  const results = []
  let synced = 0

  for (const shoe of shoes) {
    try {
      const result = await lookupAmazonAsin(
        shoe.brand,
        shoe.model,
        gender,
        config.amazonPaAccessKey,
        config.amazonPaSecretKey,
      )

      if (!result.ASIN) {
        results.push({ id: shoe.id, model: shoe.model, status: 'not_found' })
        continue
      }

      // Upsert dans shoe_prices
      const priceNum = result.price
        ? parseFloat(result.price.replace(/[^\d,.]/g, '').replace(',', '.'))
        : 0

      await supabase.from('shoe_prices').upsert({
        product_id:    shoe.id,
        retailer_name: 'Amazon',
        price:         priceNum || 0,
        product_url:   `https://www.amazon.fr/dp/${result.ASIN}/`,
        affiliate_url: result.affiliate_link!,
        stock_status:  result.availability?.toLowerCase().includes('stock') ? 'in_stock' : 'unknown',
        logo_url:      'https://logo.clearbit.com/amazon.fr',
        url_status:    'valid',
        currency:      'EUR',
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'product_id,retailer_name' })

      results.push({ id: shoe.id, model: shoe.model, status: 'ok', asin: result.ASIN, price: result.price })
      synced++
    } catch (err: any) {
      results.push({ id: shoe.id, model: shoe.model, status: 'error', message: err?.statusMessage ?? String(err) })
    }

    // Pause anti-throttling PA API (1 req/s)
    await new Promise(r => setTimeout(r, 1100))
  }

  return { synced, total: shoes.length, results }
})
