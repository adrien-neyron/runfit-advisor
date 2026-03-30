/**
 * apply-shoes-migrations.mjs
 * ──────────────────────────
 * Applique les migrations de la table shoes + bucket Storage + seed.
 * Affiche le SQL à copier dans le Dashboard si l'API RPC n'est pas disponible.
 *
 * Usage :
 *   SUPABASE_SERVICE_ROLE_KEY=<votre_clé> node scripts/apply-shoes-migrations.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://pdpmmahwzxkytstoaxjb.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌  SUPABASE_SERVICE_ROLE_KEY manquant.");
  console.error(
    "   Exemple : SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/apply-shoes-migrations.mjs"
  );
  process.exit(1);
}

const MIGRATIONS = [
  {
    name: "shoes_table",
    file: "supabase/migrations/20260317000000_shoes_table.sql",
  },
  {
    name: "shoes_seed",
    file: "supabase/migrations/20260317000001_shoes_seed.sql",
  },
];

async function runSql(sql, migrationName) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (res.ok) {
      console.log(`  ✅  ${migrationName} appliqué`);
      return true;
    }
  } catch (_) {
    // ignore, fallback ci-dessous
  }

  return false;
}

async function main() {
  console.log("🏃  RunFit — Application des migrations shoes\n");

  let allApplied = true;
  const manualMigrations = [];

  for (const migration of MIGRATIONS) {
    const filePath = join(__dirname, "..", migration.file);
    let sql;
    try {
      sql = readFileSync(filePath, "utf-8");
    } catch {
      console.error(`  ❌  Fichier introuvable : ${migration.file}`);
      continue;
    }

    process.stdout.write(`  📄  ${migration.name} ... `);
    const applied = await runSql(sql, migration.name);

    if (!applied) {
      console.log("⚠️  RPC non disponible — migration manuelle nécessaire");
      manualMigrations.push(migration);
      allApplied = false;
    }
  }

  if (manualMigrations.length > 0) {
    console.log("\n─────────────────────────────────────────────────────────────");
    console.log("📋  Appliquez ces migrations manuellement dans le SQL Editor :");
    console.log(
      `   https://supabase.com/dashboard/project/pdpmmahwzxkytstoaxjb/editor\n`
    );

    for (const m of manualMigrations) {
      console.log(`  ▸ ${m.file}`);
    }

    console.log("\n  Ordre d'exécution :");
    console.log("  1. 20260317000000_shoes_table.sql  (crée la table + bucket Storage)");
    console.log("  2. 20260317000001_shoes_seed.sql   (insère les 27 chaussures)");
  }

  if (allApplied) {
    console.log("\n✅  Toutes les migrations sont appliquées !");
    console.log("\n  Prochaine étape — upload des images dans Storage :");
    console.log(
      "  SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/upload-shoe-images.mjs"
    );
  }
}

main().catch((err) => {
  console.error("❌  Erreur :", err);
  process.exit(1);
});
