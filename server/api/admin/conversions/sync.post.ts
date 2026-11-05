// POST /api/admin/conversions/sync — import manuel des ventes Awin
// Body optionnel : { days?: number } (1–120, défaut 45)

import { requireAdmin } from '../../../utils/requireAdmin'
import { isAwinApiConfigured, syncAwinConversions } from '../../../services/conversionSync.service'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  if (!isAwinApiConfigured()) {
    throw createError({
      statusCode: 412,
      statusMessage: 'Awin non configuré : définir AWIN_PUBLISHER_ID et AWIN_API_TOKEN',
    })
  }

  const body = await readBody<{ days?: number }>(event).catch(() => ({} as { days?: number }))
  const days = Math.min(Math.max(Math.trunc(Number(body?.days) || 45), 1), 120)

  try {
    return await syncAwinConversions(days)
  } catch (err: any) {
    throw createError({ statusCode: 502, statusMessage: err.message })
  }
})
