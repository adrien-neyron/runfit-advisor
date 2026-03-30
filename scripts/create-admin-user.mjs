/**
 * Crée l'utilisateur admin directement dans Supabase Auth
 * (bypass la confirmation email — réservé aux admins)
 *
 * Usage : node scripts/create-admin-user.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

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

const SUPABASE_URL  = process.env.SUPABASE_URL
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_EMAILS  = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) ?? []

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env')
  process.exit(1)
}

if (ADMIN_EMAILS.length === 0) {
  console.error('❌  ADMIN_EMAILS manquant dans .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

console.log(`\n👤 Création des utilisateurs admin...\n`)

for (const email of ADMIN_EMAILS) {
  // Vérifier si l'utilisateur existe déjà
  const { data: existing } = await supabase.auth.admin.listUsers()
  const alreadyExists = existing?.users?.some(u => u.email === email)

  if (alreadyExists) {
    console.log(`  ⟳  ${email} (existe déjà)`)
    continue
  }

  // Générer un mot de passe temporaire sécurisé
  const tempPassword = `RunFit_${Math.random().toString(36).slice(2, 10)}!`

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,   // bypass confirmation email
    user_metadata: { role: 'admin' }
  })

  if (error) {
    console.error(`  ❌  ${email} : ${error.message}`)
    continue
  }

  console.log(`  ✅  ${email} créé`)
  console.log(`      Mot de passe temporaire : ${tempPassword}`)
  console.log(`      ⚠️  Changez-le après la première connexion !\n`)
}

console.log('✨  Terminé !\n')
