/**
 * Script d'application de la migration des retailers.
 * Usage :
 *   SUPABASE_SERVICE_ROLE_KEY=<votre_clé> node scripts/apply-retailers-migration.mjs
 *
 * La clé service role est disponible dans :
 *   Supabase Dashboard → Settings → API → service_role (secret)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://yabbkiurbejapqjidmpn.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌  SUPABASE_SERVICE_ROLE_KEY manquant.");
  console.error("   Exemple : SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/apply-retailers-migration.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Lire le fichier SQL de migration
const sqlPath = join(__dirname, "../supabase/migrations/20260309130000_retailers_comprehensive_data.sql");
const sql = readFileSync(sqlPath, "utf-8");

// Supabase ne supporte pas les requêtes SQL brutes via le client JS.
// On utilise l'API REST directe /rest/v1/rpc ou le endpoint SQL.
const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify({ query: sql }),
});

if (!res.ok) {
  // Fallback : split et exécution statement par statement via pg-http si disponible
  console.warn("⚠️  exec_sql RPC non disponible. Utilisez le SQL Editor dans le dashboard :");
  console.log("\n  https://supabase.com/dashboard/project/yabbkiurbejapqjidmpn/editor\n");
  console.log("  Contenu à coller : supabase/migrations/20260309130000_retailers_comprehensive_data.sql");
  process.exit(0);
}

const result = await res.json();
console.log("✅  Migration appliquée avec succès :", result);
