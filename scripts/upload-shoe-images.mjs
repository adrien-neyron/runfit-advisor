/**
 * upload-shoe-images.mjs
 * ─────────────────────
 * Télécharge les images des chaussures depuis les CDN officiels des marques
 * et les upload dans le bucket Supabase Storage "shoe-images".
 * Met ensuite à jour la colonne image_url de chaque chaussure.
 *
 * Légalité : les images proviennent des CDN officiels des marques
 * (Nike, Asics, Brooks, Hoka, Adidas, New Balance, Salomon, Saucony,
 * Mizuno, On Running). En tant que site affilié, l'usage de ces images
 * à des fins de présentation produit est autorisé par les conditions
 * des programmes d'affiliation respectifs.
 *
 * Usage :
 *   SUPABASE_SERVICE_ROLE_KEY=<votre_clé> node scripts/upload-shoe-images.mjs
 *
 * Clé service role :
 *   Supabase Dashboard → Settings → API → service_role (secret)
 *
 * Options :
 *   --dry-run   Affiche ce qui serait fait sans uploader
 *   --force     Re-upload même si image_storage_path est déjà défini
 *   --id=<id>   Traite uniquement la chaussure avec cet id
 */

import { createClient } from "@supabase/supabase-js";

// ─── Configuration ────────────────────────────────────────────
const SUPABASE_URL = "https://pdpmmahwzxkytstoaxjb.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "shoe-images";

// Parse les arguments CLI
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const ONLY_ID = (args.find((a) => a.startsWith("--id=")) ?? "").replace("--id=", "") || null;

if (!SERVICE_ROLE_KEY) {
  console.error("❌  SUPABASE_SERVICE_ROLE_KEY manquant.");
  console.error("   Exemple : SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/upload-shoe-images.mjs");
  process.exit(1);
}

if (DRY_RUN) console.log("🧪  Mode DRY-RUN — aucune modification ne sera effectuée.\n");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Détecte l'extension à partir du Content-Type ou de l'URL.
 * Retourne toujours une extension valide (défaut : webp).
 */
function detectExtension(contentType = "", url = "") {
  if (contentType.includes("webp") || url.includes(".webp")) return "webp";
  if (contentType.includes("png") || url.includes(".png")) return "png";
  if (contentType.includes("jpeg") || url.includes(".jpg") || url.includes(".jpeg")) return "jpg";
  return "webp"; // défaut
}

/**
 * Télécharge une image depuis une URL avec plusieurs stratégies de retry.
 * Certains CDN bloquent les requêtes sans User-Agent valide.
 */
async function downloadImage(url) {
  const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

  // Essai 1 : direct
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "image/webp,image/avif,image/png,image/*,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9",
        "Referer": "https://www.google.com/",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) {
      const ct = res.headers.get("content-type") ?? "";
      if (ct.startsWith("image/")) {
        const buffer = await res.arrayBuffer();
        return { buffer, contentType: ct };
      }
    }
    // 404 réel → inutile d'essayer le proxy
    if (res.status === 404) throw new Error(`HTTP 404 — URL expirée`);
  } catch (e) {
    if (e.message.includes("404")) throw e;
    // Autre erreur (CORS, timeout, etc.) → essai proxy
  }

  // Essai 2 : via allorigins.win (contourne CORS/hotlink côté serveur)
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const res2 = await fetch(proxyUrl, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(20_000),
  });

  if (!res2.ok) throw new Error(`Proxy ${res2.status} pour ${new URL(url).hostname}`);

  const ct2 = res2.headers.get("content-type") ?? "image/jpeg";
  const buffer2 = await res2.arrayBuffer();

  if (buffer2.byteLength < 500) throw new Error("Réponse proxy trop petite (probablement une erreur HTML)");

  return { buffer: buffer2, contentType: ct2.startsWith("image/") ? ct2 : "image/jpeg" };
}

/**
 * Upload un buffer dans Supabase Storage.
 * Retourne l'URL publique de l'objet uploadé.
 */
async function uploadToStorage(shoeId, buffer, contentType, ext) {
  const filePath = `${shoeId}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
      cacheControl: "31536000", // 1 an
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return { publicUrl: data.publicUrl, storagePath: filePath };
}

/**
 * Met à jour la chaussure en DB avec le nouveau chemin Storage.
 */
async function updateShoeImageInDb(shoeId, publicUrl, storagePath) {
  const { error } = await supabase
    .from("shoes")
    .update({
      image_url: publicUrl,
      image_storage_path: storagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shoeId);

  if (error) throw error;
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  console.log("🏃  RunFit — Upload des images vers Supabase Storage\n");

  // Récupère les chaussures à traiter
  let query = supabase
    .from("shoes")
    .select("id, brand, model, image_url, image_original_url, image_storage_path")
    .eq("is_active", true);

  if (ONLY_ID) {
    query = query.eq("id", ONLY_ID);
  } else if (!FORCE) {
    // Skip les chaussures déjà uploadées
    query = query.is("image_storage_path", null);
  }

  const { data: shoes, error } = await query.order("brand");

  if (error) {
    console.error("❌  Erreur lors de la récupération des chaussures :", error.message);
    process.exit(1);
  }

  if (!shoes?.length) {
    console.log("✅  Aucune chaussure à traiter (toutes les images sont déjà dans Storage).");
    console.log("   Utilisez --force pour re-uploader toutes les images.");
    return;
  }

  console.log(`📦  ${shoes.length} chaussure(s) à traiter\n`);

  const results = { success: 0, skipped: 0, failed: 0 };
  const failures = [];

  for (const shoe of shoes) {
    const imageUrl = shoe.image_original_url ?? shoe.image_url;
    const label = `${shoe.brand} ${shoe.model} (${shoe.id})`;

    if (!imageUrl) {
      console.log(`  ⚠️  ${label} — Pas d'URL image, ignoré`);
      results.skipped++;
      continue;
    }

    process.stdout.write(`  📥  ${label} ... `);

    if (DRY_RUN) {
      console.log(`\n       URL : ${imageUrl}`);
      console.log(`       → Storage : ${shoe.id}.*`);
      results.success++;
      continue;
    }

    try {
      // 1. Télécharge l'image
      const { buffer, contentType } = await downloadImage(imageUrl);
      const ext = detectExtension(contentType, imageUrl);

      // 2. Upload vers Supabase Storage
      const { publicUrl, storagePath } = await uploadToStorage(
        shoe.id, buffer, contentType, ext
      );

      // 3. Met à jour la DB
      await updateShoeImageInDb(shoe.id, publicUrl, storagePath);

      console.log(`✅  ${storagePath} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
      results.success++;
    } catch (err) {
      console.log(`❌  ${err.message}`);
      results.failed++;
      failures.push({ id: shoe.id, label, url: imageUrl, error: err.message });
    }

    // Petit délai pour éviter de spammer les CDN
    await new Promise((r) => setTimeout(r, 300));
  }

  // ─── Rapport final ─────────────────────────────────────────
  console.log("\n─────────────────────────────────────────────────");
  console.log(`  ✅  Succès  : ${results.success}`);
  console.log(`  ⚠️  Ignorés : ${results.skipped}`);
  console.log(`  ❌  Échecs  : ${results.failed}`);

  if (failures.length > 0) {
    console.log("\n  Chaussures en échec :");
    for (const f of failures) {
      console.log(`    • ${f.label}`);
      console.log(`      URL    : ${f.url}`);
      console.log(`      Erreur : ${f.error}`);
    }
    console.log("\n  💡 Pour les images bloquées par hotlink protection :");
    console.log("     Téléchargez-les manuellement depuis le site officiel");
    console.log("     puis uploadez-les via le Dashboard Supabase Storage.");
    console.log(`     Bucket : ${BUCKET}`);
    console.log(`     Nommage : {shoe-id}.webp  (ex: hoka-clifton-9.webp)`);
    console.log("\n  Puis mettez à jour la DB :");
    console.log(`     UPDATE shoes`);
    console.log(`     SET image_url = 'https://pdpmmahwzxkytstoaxjb.supabase.co/storage/v1/object/public/${BUCKET}/{shoe-id}.webp',`);
    console.log(`         image_storage_path = '{shoe-id}.webp'`);
    console.log(`     WHERE id = '{shoe-id}';`);
  }

  if (!DRY_RUN && results.success > 0) {
    console.log(`\n  🎉  Images disponibles sur :`);
    console.log(`  https://pdpmmahwzxkytstoaxjb.supabase.co/storage/v1/object/public/${BUCKET}/`);
  }
}

main().catch((err) => {
  console.error("❌  Erreur inattendue :", err);
  process.exit(1);
});
