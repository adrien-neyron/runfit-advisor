/**
 * Apply SQL migrations to Supabase PostgreSQL
 *
 * Usage :
 *   node scripts/apply-migrations.mjs
 *
 * Requires dans .env :
 *   DATABASE_URL=postgresql://postgres:[password]@db.pdpmmahwzxkytstoaxjb.supabase.co:5432/postgres
 *
 * Comment trouver DATABASE_URL :
 *   Supabase Dashboard > Project Settings (engrenage) > Database > Connection String > URI
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Lire .env manuellement (pas de dotenv requis)
function loadEnv() {
  try {
    const envPath = join(__dirname, '../.env')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/)
      if (match) process.env[match[1]] = match[2]
    }
  } catch {
    // .env absent, on utilise les variables système
  }
}

loadEnv()

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error(`
❌  DATABASE_URL manquante dans .env

Comment la trouver :
  1. Supabase Dashboard → Project Settings (engrenage en bas à gauche)
  2. Onglet "Database"
  3. Section "Connection string" → onglet "URI"
  4. Copier l'URL et remplacer [YOUR-PASSWORD] par votre mot de passe DB

Format :
  DATABASE_URL=postgresql://postgres:[password]@db.pdpmmahwzxkytstoaxjb.supabase.co:5432/postgres

Ajoutez cette ligne dans votre fichier .env puis relancez ce script.
`)
  process.exit(1)
}

// Répertoire des migrations
const MIGRATIONS_DIR = join(__dirname, '../supabase/migrations')

// Récupérer les fichiers de migration dans l'ordre
const migrationFiles = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort()

console.log(`\n🔄 Applying ${migrationFiles.length} migrations...\n`)

const client = new pg.Client({ connectionString: DATABASE_URL })

try {
  await client.connect()
  console.log('✅  Connected to Supabase PostgreSQL\n')

  for (const file of migrationFiles) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8')

    try {
      await client.query(sql)
      console.log(`  ✅  ${file}`)
    } catch (err) {
      console.error(`  ❌  ${file}`)
      console.error(`      ${err.message}\n`)
      // On continue — les migrations utilisent IF NOT EXISTS (idempotentes)
    }
  }

  console.log('\n✨  Migrations terminées !\n')
} catch (err) {
  console.error('❌  Erreur de connexion :', err.message)
  console.error('\nVérifiez que DATABASE_URL est correcte et que votre IP est autorisée dans Supabase.\n')
  process.exit(1)
} finally {
  await client.end()
}
