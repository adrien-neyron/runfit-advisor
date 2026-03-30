/**
 * Seed des marques dans la table brands
 * Utilise la service_role key via l'API REST Supabase
 *
 * Usage : node scripts/seed-brands.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  try {
    const content = readFileSync(join(__dirname, '../.env'), 'utf-8')
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/)
      if (match) process.env[match[1]] = match[2]
    }
  } catch {}
}

loadEnv()

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env')
  process.exit(1)
}

const brands = [
  { name: 'Nike',       slug: 'nike',         logo_url: null },
  { name: 'Adidas',     slug: 'adidas',       logo_url: null },
  { name: 'ASICS',      slug: 'asics',        logo_url: null },
  { name: 'Brooks',     slug: 'brooks',       logo_url: null },
  { name: 'Hoka',       slug: 'hoka',         logo_url: null },
  { name: 'Saucony',    slug: 'saucony',      logo_url: null },
  { name: 'Mizuno',     slug: 'mizuno',       logo_url: null },
  { name: 'On Running', slug: 'on-running',   logo_url: null },
  { name: 'Salomon',    slug: 'salomon',      logo_url: null },
  { name: 'New Balance',slug: 'new-balance',  logo_url: null },
  { name: 'Altra',      slug: 'altra',        logo_url: null },
  { name: 'Inov-8',     slug: 'inov-8',       logo_url: null },
  { name: 'Decathlon',  slug: 'decathlon',    logo_url: null },
]

console.log(`\n🏷️  Seeding ${brands.length} brands...\n`)

const res = await fetch(`${SUPABASE_URL}/rest/v1/brands`, {
  method: 'POST',
  headers: {
    'Content-Type':  'application/json',
    'apikey':        SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Prefer':        'resolution=ignore-duplicates,return=representation',
  },
  body: JSON.stringify(brands),
})

if (!res.ok) {
  const body = await res.text()
  console.error(`❌  Erreur API (${res.status}) :`, body)
  console.error('\n💡  Les migrations doivent être appliquées avant le seeding.')
  console.error('    Exécutez d\'abord : node scripts/apply-migrations.mjs\n')
  process.exit(1)
}

const data = await res.json()
console.log(`✅  ${Array.isArray(data) ? data.length : '?'} marques créées / ignorées (doublons)\n`)
console.log('Marques :')
brands.forEach((b) => console.log(`  • ${b.name} (${b.slug})`))
console.log()
