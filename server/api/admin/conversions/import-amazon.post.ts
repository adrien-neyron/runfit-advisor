// POST /api/admin/conversions/import-amazon — import d'un rapport CSV Amazon Associates
// multipart/form-data, champ "file" (.csv ou .tsv, 5 Mo max)

import { requireAdmin } from '../../../utils/requireAdmin'
import { importAmazonCsv } from '../../../services/conversionSync.service'

const MAX_BYTES = 5 * 1024 * 1024

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.data?.length)
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Fichier manquant (champ "file")' })
  }
  if (file.data.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Fichier trop volumineux (5 Mo max)' })
  }

  // Les exports Amazon sont normalement en UTF-8 ; repli latin1 si caractères invalides
  let text = file.data.toString('utf-8')
  if (text.includes('�')) text = file.data.toString('latin1')

  try {
    return await importAmazonCsv(text)
  } catch (err: any) {
    throw createError({ statusCode: 422, statusMessage: err.message })
  }
})
