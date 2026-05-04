/**
 * upload-shoe-images.mjs
 * ──────────────────────
 * Pipeline batch : télécharge les images sources, génère 3 tailles WebP
 * via Sharp, uploade dans le bucket Supabase Storage "shoes", met à jour
 * image_url_cdn et image_source_url sur chaque chaussure.
 *
 * Structure Storage :
 *   shoes/{brand-slug}/{shoe-slug}/thumb.webp   → 200 × 200 px
 *   shoes/{brand-slug}/{shoe-slug}/card.webp    → 600 × 600 px  ← image_url_cdn
 *   shoes/{brand-slug}/{shoe-slug}/full.webp    → 1200 × 1200 px
 *
 * Légalité : les images proviennent des CDN officiels des marques via les
 * programmes d'affiliation (Amazon, AWIN). Usage autorisé pour présentation produit.
 *
 * Usage :
 *   SUPABASE_SERVICE_ROLE_KEY=<clé> node scripts/upload-shoe-images.mjs
 *
 * Options :
 *   --dry-run       Affiche ce qui serait fait sans uploader ni modifier la DB
 *   --force         Re-upload même si image_url_cdn est déjà défini
 *   --id=<shoe-id>  Traite uniquement cette chaussure
 *   --no-sharp      Saute la conversion WebP (upload brut) — utile si Sharp indisponible
 */

import { createClient } from '@supabase/supabase-js'

// ─── Configuration ────────────────────────────────────────────────────────────

const SUPABASE_URL       = 'https://pdpmmahwzxkytstoaxjb.supabase.co'
const SERVICE_ROLE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET             = 'shoes'
const CDN_BASE           = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`

// Délai entre chaque chaussure pour ne pas spammer les CDN (ms)
const DELAY_MS           = 350

// Tailles WebP générées
const SIZES = {
  thumb: { width: 200, height: 200, quality: 80 },
  card:  { width: 600, height: 600, quality: 82 },
  full:  { width: 1200, height: 1200, quality: 85 },
}

// ─── Arguments CLI ────────────────────────────────────────────────────────────

const args    = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const FORCE   = args.includes('--force')
const NO_SHARP = args.includes('--no-sharp')
const ONLY_ID = (args.find(a => a.startsWith('--id=')) ?? '').replace('--id=', '') || null

// ─── Initialisation ───────────────────────────────────────────────────────────

if (!SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY manquant.')
  console.error('   Exemple : SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/upload-shoe-images.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// Sharp chargé dynamiquement pour ne pas bloquer si --no-sharp
let sharp = null
if (!NO_SHARP) {
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.warn('⚠️  Sharp non disponible — utilisation de --no-sharp automatique')
    sharp = null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Construit le chemin Storage et l'URL CDN pour une variante d'image.
 */
function storagePath(brandSlug, shoeSlug, variant) {
  return `${brandSlug}/${shoeSlug}/${variant}.webp`
}

function cdnUrl(path) {
  return `${CDN_BASE}/${path}`
}

/**
 * Nettoie un slug : minuscules, tirets, sans caractères spéciaux.
 */
function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Télécharge une image distante avec retry via proxy.
 * Retourne { buffer: ArrayBuffer, contentType: string }.
 */
async function downloadImage(url) {
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'

  const fetchOptions = {
    headers: {
      'User-Agent': UA,
      'Accept': 'image/webp,image/avif,image/png,image/*,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9',
      'Referer': 'https://www.google.com/',
    },
    signal: AbortSignal.timeout(20_000),
  }

  // Essai 1 : direct
  try {
    const res = await fetch(url, fetchOptions)
    if (res.ok) {
      const ct = res.headers.get('content-type') ?? ''
      if (ct.startsWith('image/')) {
        return { buffer: await res.arrayBuffer(), contentType: ct }
      }
      // Réponse OK mais content-type non-image (ex: redirect HTML) → essai proxy
    }
    if (res.status === 404) throw new Error('HTTP 404 — URL expirée')
    if (res.status === 403) {
      // 403 Forbidden → hotlink protection, on passe directement au proxy
    }
  } catch (e) {
    if (String(e.message).includes('404')) throw e
    // Timeout ou réseau → essai proxy
  }

  // Essai 2 : proxy allorigins (contourne hotlink protection et CORS)
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  try {
    const res2 = await fetch(proxyUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(30_000),
    })

    if (!res2.ok) throw new Error(`Proxy ${res2.status}`)

    const buffer2 = await res2.arrayBuffer()
    if (buffer2.byteLength < 1000) throw new Error('Réponse proxy trop petite')

    const ct2 = res2.headers.get('content-type') ?? 'image/jpeg'
    return { buffer: buffer2, contentType: ct2.startsWith('image/') ? ct2 : 'image/jpeg' }
  } catch (proxyErr) {
    // Proxy échoué → essai 3 : proxy alternatif corsproxy.io
  }

  // Essai 3 : proxy alternatif
  const proxy3Url = `https://corsproxy.io/?${encodeURIComponent(url)}`
  const res3 = await fetch(proxy3Url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(30_000),
  })

  if (!res3.ok) throw new Error(`Tous les proxies ont échoué (${new URL(url).hostname}) — téléchargement manuel requis`)

  const buffer3 = await res3.arrayBuffer()
  if (buffer3.byteLength < 1000) throw new Error('Image trop petite — URL probablement invalide')

  const ct3 = res3.headers.get('content-type') ?? 'image/jpeg'
  return { buffer: buffer3, contentType: ct3.startsWith('image/') ? ct3 : 'image/jpeg' }
}

/**
 * Génère les 3 variantes WebP via Sharp.
 * Si Sharp est indisponible, retourne le buffer brut pour les 3 tailles.
 */
async function generateVariants(sourceBuffer) {
  const buf = Buffer.from(sourceBuffer)

  if (!sharp) {
    // Mode dégradé : upload brut sans conversion
    return {
      thumb: buf,
      card:  buf,
      full:  buf,
      contentType: 'image/webp',
    }
  }

  const [thumbBuf, cardBuf, fullBuf] = await Promise.all([
    sharp(buf).resize(SIZES.thumb.width, SIZES.thumb.height, { fit: 'inside', withoutEnlargement: true }).webp({ quality: SIZES.thumb.quality }).toBuffer(),
    sharp(buf).resize(SIZES.card.width,  SIZES.card.height,  { fit: 'inside', withoutEnlargement: true }).webp({ quality: SIZES.card.quality  }).toBuffer(),
    sharp(buf).resize(SIZES.full.width,  SIZES.full.height,  { fit: 'inside', withoutEnlargement: true }).webp({ quality: SIZES.full.quality  }).toBuffer(),
  ])

  return { thumb: thumbBuf, card: cardBuf, full: fullBuf, contentType: 'image/webp' }
}

/**
 * Uploade un buffer dans Supabase Storage.
 */
async function uploadVariant(buffer, path, contentType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: '31536000', // 1 an — compatible Cloudflare CDN
    })

  if (error) throw new Error(`Upload Storage (${path}) : ${error.message}`)
}

/**
 * Met à jour les colonnes image dans la table shoes.
 */
async function updateShoeDb(shoeId, sourceUrl, cardPath) {
  const cardCdnUrl = cdnUrl(cardPath)

  const { error } = await supabase
    .from('shoes')
    .update({
      image_url_cdn:      cardCdnUrl,   // nouveau — source de vérité CDN
      image_source_url:   sourceUrl,    // nouveau — URL de re-téléchargement
      image_url:          cardCdnUrl,   // legacy compat
      image_storage_path: cardPath,     // legacy compat
      last_image_check:   new Date().toISOString(),
      updated_at:         new Date().toISOString(),
    })
    .eq('id', shoeId)

  if (error) throw new Error(`DB update (${shoeId}) : ${error.message}`)
  return cardCdnUrl
}

// ─── Pipeline par chaussure ────────────────────────────────────────────────────

async function processShoe(shoe) {
  const sourceUrl = shoe.image_source_url ?? shoe.image_original_url ?? shoe.image_url

  if (!sourceUrl) throw new Error('Aucune URL source disponible')

  // Slugs pour les chemins Storage
  const brandSlug = toSlug(shoe.slug
    ? shoe.slug.split('-')[0]                        // ex: "nike-pegasus-41" → "nike"
    : (shoe.brands?.slug ?? shoe.brand))
  const shoeSlug  = shoe.slug ?? toSlug(`${shoe.brand}-${shoe.model}`)

  const paths = {
    thumb: storagePath(brandSlug, shoeSlug, 'thumb'),
    card:  storagePath(brandSlug, shoeSlug, 'card'),
    full:  storagePath(brandSlug, shoeSlug, 'full'),
  }

  if (DRY_RUN) {
    return {
      ok: true,
      dryRun: true,
      sourceUrl,
      paths,
      cdnCard: cdnUrl(paths.card),
    }
  }

  // 1. Téléchargement (contentType utilisé par generateVariants en mode no-sharp)
  const { buffer } = await downloadImage(sourceUrl)
  const sizeKb = Math.round(buffer.byteLength / 1024)

  // 2. Génération WebP
  const variants = await generateVariants(buffer)

  // 3. Upload des 3 variantes en parallèle
  await Promise.all([
    uploadVariant(variants.thumb, paths.thumb, variants.contentType),
    uploadVariant(variants.card,  paths.card,  variants.contentType),
    uploadVariant(variants.full,  paths.full,  variants.contentType),
  ])

  // 4. Mise à jour DB
  const cdnCard = await updateShoeDb(shoe.id, sourceUrl, paths.card)

  return { ok: true, sizeKb, paths, cdnCard }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏃  RunFit — Upload images → Supabase Storage\n')

  if (DRY_RUN)  console.log('🧪  Mode DRY-RUN — aucune modification\n')
  if (!sharp)   console.log('⚠️  Sharp non disponible — uploads sans conversion WebP\n')

  // Requête des chaussures à traiter
  let query = supabase
    .from('shoes')
    .select('id, brand, model, slug, image_url, image_original_url, image_source_url, image_url_cdn, brands(slug)')
    .eq('is_active', true)

  if (ONLY_ID) {
    query = query.eq('id', ONLY_ID)
  } else if (!FORCE) {
    // Skip les chaussures déjà uploadées dans le nouveau bucket
    query = query.is('image_url_cdn', null)
  }

  const { data: shoes, error } = await query.order('brand')

  if (error) {
    console.error('❌  Erreur récupération chaussures :', error.message)
    process.exit(1)
  }

  if (!shoes?.length) {
    console.log('✅  Aucune chaussure à traiter.')
    console.log('   (Toutes ont déjà image_url_cdn défini. Utilisez --force pour re-uploader.)')
    return
  }

  console.log(`📦  ${shoes.length} chaussure(s) à traiter\n`)

  const results  = { success: 0, skipped: 0, failed: 0 }
  const failures = []

  for (const shoe of shoes) {
    const label = `${shoe.brand} ${shoe.model} (${shoe.id})`
    process.stdout.write(`  📥  ${label} ... `)

    try {
      const result = await processShoe(shoe)

      if (result.dryRun) {
        console.log(`\n       Source  : ${result.sourceUrl}`)
        console.log(`       → CDN   : ${result.cdnCard}`)
        console.log(`       → paths : ${result.paths.thumb} | ${result.paths.card} | ${result.paths.full}`)
      } else {
        const sharpInfo = sharp ? '(WebP)' : '(brut)'
        console.log(`✅  ${result.sizeKb} KB source ${sharpInfo}`)
        console.log(`         CDN : ${result.cdnCard}`)
      }

      results.success++
    } catch (err) {
      console.log(`❌  ${err.message}`)
      results.failed++
      failures.push({ id: shoe.id, label, error: err.message })
    }

    await new Promise(r => setTimeout(r, DELAY_MS))
  }

  // ─── Rapport final ─────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────────')
  console.log(`  ✅  Succès  : ${results.success}`)
  console.log(`  ⚠️  Ignorés : ${results.skipped}`)
  console.log(`  ❌  Échecs  : ${results.failed}`)

  if (failures.length > 0) {
    console.log('\n  Chaussures en échec :')
    for (const f of failures) {
      console.log(`    • ${f.label}`)
      console.log(`      Erreur : ${f.error}`)
    }
    console.log('\n  💡 Pour les images bloquées par hotlink protection :')
    console.log('     1. Téléchargez manuellement l\'image depuis le site officiel')
    console.log('     2. Uploadez-la via : POST /api/admin/upload-image (multipart/form-data)')
    console.log('        Champs : file, shoe_id, is_primary=true')
  }

  if (!DRY_RUN && results.success > 0) {
    console.log(`\n  🎉  Images disponibles sur :`)
    console.log(`  ${CDN_BASE}/`)
  }
}

main().catch(err => {
  console.error('❌  Erreur inattendue :', err)
  process.exit(1)
})
