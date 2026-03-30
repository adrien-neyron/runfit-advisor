// ============================================================
// POST /api/admin/import-csv
// ============================================================
// Upload un CSV affilié (multipart/form-data, champ "file"),
// parse chaque ligne et crée les chaussures en statut "draft".
//
// Format CSV attendu (ligne d'en-tête obligatoire) :
//   brand_slug, model_name, category, drop_mm, weight_g,
//   pronation, terrain_type, gender, release_year, price,
//   url_amazon, url_irun, url_alltricks, image_url
//
// Exemple :
//   nike,Pegasus 41,road,10,280,neutral,road,unisex,2024,129.99,
//   https://amzn.to/xxx,https://irun.fr/...,,...,https://cdn.nike.com/...

import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { requireAdmin } from '../../utils/requireAdmin'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import type { CsvShoeRow, ImportResult } from '../../types/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  // Récupérer le fichier CSV
  const formData = await readMultipartFormData(event)
  const fileField = formData?.find((f) => f.name === 'file')

  if (!fileField?.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Champ "file" manquant. Envoyez le CSV en multipart/form-data.',
    })
  }

  const csvText = Buffer.from(fileField.data).toString('utf-8')
  const rows = parseCsv(csvText)

  if (rows.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'CSV vide ou sans données valides.' })
  }

  const supabase = getSupabaseAdmin()
  const result: ImportResult = { imported: 0, skipped: 0, errors: [], shoes: [] }

  for (const row of rows) {
    try {
      const brandSlug = row.brand_slug?.trim()
      const modelName = row.model_name?.trim()

      if (!brandSlug || !modelName) {
        result.errors.push(`Ligne ignorée : brand_slug ou model_name manquant.`)
        result.skipped++
        continue
      }

      // Retrouver la brand (doit exister)
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('slug', brandSlug)
        .single()

      if (!brand) {
        result.errors.push(
          `Marque "${brandSlug}" introuvable. Créez-la d'abord dans le backoffice.`
        )
        result.skipped++
        continue
      }

      const shoeId = `${brandSlug}-${slugify(modelName)}`

      // Vérifier si déjà importée
      const { data: existing } = await supabase
        .from('shoes')
        .select('id')
        .eq('id', shoeId)
        .maybeSingle()

      if (existing) {
        result.skipped++
        continue
      }

      // Insérer la chaussure en draft
      const { error: insertError } = await supabase.from('shoes').insert({
        id: shoeId,
        // Colonnes legacy (app)
        brand: brandSlug,
        model: modelName,
        description: '',
        prix: parseFloat(row.price) || 0,
        foulee: [],
        terrain: row.terrain_type ? [row.terrain_type.trim()] : [],
        amorti: 'moyen',
        drop_mm: parseInt(row.drop_mm, 10) || 8,
        poids_g: parseInt(row.weight_g, 10) || 280,
        stabilite: 'moyenne',
        dynamisme: 'moyen',
        largeur_disponible: ['standard'],
        niveau: [],
        objectif: [],
        benefits: [],
        image_url: row.image_url?.trim() || null,
        image_original_url: row.image_url?.trim() || null,
        is_active: false,
        // Colonnes admin
        brand_id: brand.id,
        slug: shoeId,
        category: row.category?.trim() || null,
        pronation: row.pronation?.trim() || null,
        terrain_type: row.terrain_type?.trim() || null,
        gender: row.gender?.trim() || 'unisex',
        release_year: parseInt(row.release_year, 10) || null,
        weight_g: parseInt(row.weight_g, 10) || null,
        is_draft: true,
      })

      if (insertError) {
        result.errors.push(`Erreur insertion "${shoeId}" : ${insertError.message}`)
        result.skipped++
        continue
      }

      // Insérer les liens affiliés présents
      const affiliates = [
        { merchant: 'amazon' as const, url: row.url_amazon },
        { merchant: 'irun' as const, url: row.url_irun },
        { merchant: 'alltricks' as const, url: row.url_alltricks },
      ].filter((l) => l.url?.trim())

      if (affiliates.length > 0) {
        await supabase.from('affiliate_links').upsert(
          affiliates.map((l) => ({
            shoe_id: shoeId,
            merchant: l.merchant,
            country: 'fr',
            url: l.url!.trim(),
            price_last_seen: parseFloat(row.price) || null,
          })),
          { onConflict: 'shoe_id,merchant,country' }
        )
      }

      result.imported++
      result.shoes.push(shoeId)
    } catch (err: any) {
      result.errors.push(
        `Erreur inattendue pour "${row.model_name}" : ${err.message}`
      )
      result.skipped++
    }
  }

  return result
})

// ─── Parseur CSV minimal ──────────────────────────────────────────────────────

function parseCsv(text: string): CsvShoeRow[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0)

  if (lines.length < 2) return []

  const headers = parseLine(lines[0])
  const rows: CsvShoeRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] ?? '').trim()
    })
    rows.push(row as unknown as CsvShoeRow)
  }

  return rows
}

// Gère les guillemets doubles et les virgules dans les champs
function parseLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
