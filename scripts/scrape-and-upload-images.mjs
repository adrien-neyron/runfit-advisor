/**
 * scrape-and-upload-images.mjs
 * ─────────────────────────────
 * Utilise Playwright (Google Chrome local) pour charger les pages produit
 * officielles de chaque marque, extraire l'image principale et l'uploader dans
 * le bucket Supabase Storage "shoe-images".
 *
 * Usage :
 *   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/scrape-and-upload-images.mjs
 *   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/scrape-and-upload-images.mjs --dry-run
 *   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/scrape-and-upload-images.mjs --force
 *   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/scrape-and-upload-images.mjs --id=hoka-clifton-9
 *   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/scrape-and-upload-images.mjs --headed
 */

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

// ─── Config ────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://pdpmmahwzxkytstoaxjb.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'shoe-images';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE   = args.includes('--force');
const HEADED  = args.includes('--headed');
const ONLY_ID = (args.find(a => a.startsWith('--id=')) ?? '').replace('--id=', '') || null;

if (!SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY manquant.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// ─── Pages produit par shoe ID ─────────────────────────────────────────────
const SHOE_PAGES = {
  // Nike
  'nike-pegasus-41':          'https://www.nike.com/t/air-zoom-pegasus-41-mens-road-running-shoes-FD2722-401',
  'nike-invincible-3':        'https://www.runningwarehouse.com/Nike_Air_Zoom_Invincible_3_Mens/descpageRUNM-NAZIP3M.html',
  'nike-vaporfly-3':          'https://www.nike.com/t/zoomx-vaporfly-next-3-road-racing-shoes-DV4129-900',

  // Brooks
  'brooks-ghost-16':          'https://www.brooksrunning.com/en_us/ghost-16/110418.html',
  'brooks-glycerin-21':       'https://www.brooksrunning.com/en_us/glycerin-21/110412.html',
  'brooks-adrenaline-gts-23': 'https://www.brooksrunning.com/en_us/adrenaline-gts-23/120381.html',
  'brooks-cascadia-17':       'https://www.brooksrunning.com/en_us/cascadia-17/110393.html',

  // Hoka — via Running Warehouse (hoka.com bloque les bots)
  'hoka-clifton-9':           'https://www.runningwarehouse.com/Hoka_Clifton_9_Mens/descpageRUNM-HC9M.html',
  'hoka-bondi-8':             'https://www.runningwarehouse.com/Hoka_Bondi_8_Mens/descpageRUNM-HB8M.html',
  'hoka-speedgoat-6':         'https://www.hoka.com/en/us/mens-trail-running-shoes/speedgoat-6/1147793.html',
  'hoka-challenger-7':        'https://www.runningwarehouse.com/Hoka_Challenger_ATR_7_Mens/descpageRUNM-HCATR7M.html',

  // New Balance — via Running Warehouse (nb.scene7.com 403 sans Referer valide)
  'new-balance-fresh-foam': 'https://www.runningwarehouse.com/New_Balance_Fresh_Foam_X_1080v13_Mens/descpageRUNM-NBM1080V13M.html',
  'new-balance-860v14':     'https://www.runningwarehouse.com/New_Balance_Fresh_Foam_X_860v14_Mens/descpageRUNM-NBM860V14M.html',

  // Saucony
  'saucony-endorphin-speed': 'https://www.saucony.com/en/endorphin-speed-4/58852M.html',
  'saucony-kinvara-14':      'https://www.saucony.com/en/kinvara-14/S20823.html',
  'saucony-guide-17':        'https://www.saucony.com/en/guide-17/S20936.html',
  'saucony-peregrine-14':    'https://www.saucony.com/en/peregrine-14/S20916.html',

  // Adidas
  'adidas-ultraboost-light':    'https://www.adidas.com/us/ultraboost-light-shoes/GY9350.html',
  'adidas-adizero-adios-pro-3': 'https://www.adidas.com/us/adizero-adios-pro-3-shoes/GY8237.html',

  // Salomon — via Running Warehouse (salomon.com bloque les bots)
  'salomon-speedcross-6': 'https://www.runningwarehouse.com/Salomon_Speedcross_6_Mens/descpageRUNM-SSC6M.html',
  'salomon-ultra-glide':  'https://www.runningwarehouse.com/Salomon_Ultra_Glide_2_Mens/descpageRUNM-SUG2M.html',

  // On Running — via Running Warehouse (on.com renvoie des SVG)
  'on-cloudmonster-2': 'https://sp.yimg.com/ib/th?id=OPEC.H%2f3SOyKIpAImuQ474C474&o=5&pid=21.1&w=174&h=174',

  // Mizuno
  'mizuno-wave-rider': 'https://usa.mizuno.com/running-wave-rider-28-mens',
};

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Convertit les URLs AVIF en format accepté par Supabase (JPEG/PNG/WebP) */
function avoidAvif(url) {
  if (!url) return url;
  // Nike CDN (scene7 f_auto)
  url = url.replace('/f_auto,', '/f_png,').replace(',f_auto,', ',f_png,').replace(',f_auto', ',f_png');
  // Brooks
  if (url.includes('brooksrunning.com') && !url.includes('sfrm=')) {
    url += (url.includes('?') ? '&' : '?') + 'sfrm=png';
  }
  // Cloudinary (inclut Salomon, On Running) — gère f_auto avec slash OU virgule
  url = url.replace(/\/f_auto([,/])/g, '/f_jpg$1');
  // Salomon CDN direct
  if (url.includes('salomon.com') || url.includes('salomonsports.com')) {
    url = url.replace(/\.avif(\?|$)/, '.jpg$1').replace('format=avif', 'format=jpg');
  }
  return url;
}

function isValidProductImage(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return false;
  const hasExt = /\.(jpe?g|png|webp|avif)/i.test(url);
  const isCdn  = /scene7|cloudinary|imgix|cdn\.|images\.|media\.|assets\.|ctfassets|shopify/i.test(url);
  return hasExt || isCdn;
}

function resolveUrl(url, base) {
  if (!url) return null;
  try { return new URL(url, base).href; } catch { return url; }
}

function findImageInSchema(data) {
  if (!data) return null;
  if (data['@type'] === 'Product') {
    const img = data.image;
    if (typeof img === 'string') return img;
    if (Array.isArray(img) && img.length) return typeof img[0] === 'string' ? img[0] : img[0]?.url;
    if (img?.url) return img.url;
  }
  if (data['@graph']) {
    for (const node of data['@graph']) {
      const found = findImageInSchema(node);
      if (found) return found;
    }
  }
  return null;
}

function brandSelectors(shoeId) {
  if (shoeId.startsWith('nike-'))         return ['img[src*="static.nike.com"][src*="t_PDP"]', '[data-testid="hero-image"] img', '[class*="hero-image"] img'];
  if (shoeId.startsWith('brooks-'))       return ['.primary-image-container img', 'img[src*="brooksrunning.com/dw/image"]', '.product-images img'];
  if (shoeId.startsWith('hoka-'))         return ['img[src*="hoka.com"]', 'img[src*="ctfassets"]', '[class*="product-image"] img'];
  if (shoeId.startsWith('adidas-'))       return ['img[src*="assets.adidas.com"][src*="h_840"]', 'img[src*="assets.adidas.com"][src*="h_400"]', '[data-testid="image-zoom"] img'];
  if (shoeId.startsWith('saucony-'))      return ['.product-image img', '[class*="ProductGallery"] img', 'img[src*="saucony"]'];
  if (shoeId.startsWith('salomon-'))      return ['[class*="ProductImage"] img', 'img[src*="salomon"]', '[data-testid*="image"] img'];
  if (shoeId.startsWith('new-balance-'))  return ['img[src*="nb.scene7.com"]', 'img[src*="newbalance.com/is/image"]', '.product-detail__image img'];
  if (shoeId.startsWith('on-'))           return ['img[src*="cdn.on.com"]', 'img[src*="on.com"][src*="product"]', '[class*="ProductImage"] img'];
  if (shoeId.startsWith('mizuno-'))       return ['img[src*="bigcommerce"]', 'img[src*="mizuno"]', '.productView-image img'];
  return ['[class*="product"] img', '[class*="hero"] img'];
}

// ─── Extraction de l'image ─────────────────────────────────────────────────
async function extractImageUrl(page, shoeId, capturedImages) {
  // Stratégie 0 : interception réseau — le plus fiable pour les SPA
  // Capture les vraies images chargées par le navigateur
  if (capturedImages.length > 0) {
    // Taille connue > 15 KB en priorité, sinon taille inconnue (chunked = 0)
    const withSize    = capturedImages.filter(img => img.size > 15000);
    const withUnknown = capturedImages.filter(img => img.size === 0);
    const best = (withSize.length ? withSize : withUnknown)
      .sort((a, b) => b.size - a.size)[0];
    if (best) {
      console.log(`       → interception réseau (${best.size ? (best.size / 1024).toFixed(0) + ' KB' : 'taille inconnue'})`);
      return avoidAvif(best.url);
    }
  }

  // Stratégie 1 : og:image (server-rendered)
  try {
    const og = await page.$eval('meta[property="og:image"]', el => el.getAttribute('content'));
    if (isValidProductImage(og)) { console.log('       → og:image'); return avoidAvif(resolveUrl(og, page.url())); }
  } catch {}

  // Stratégie 2 : JSON-LD Product schema
  try {
    const scripts = await page.$$eval('script[type="application/ld+json"]',
      els => els.map(el => { try { return JSON.parse(el.textContent); } catch { return null; } })
    );
    for (const d of scripts.filter(Boolean)) {
      const img = findImageInSchema(d);
      if (img && isValidProductImage(img)) { console.log('       → JSON-LD'); return avoidAvif(resolveUrl(img, page.url())); }
    }
  } catch {}

  // Stratégie 3 : sélecteurs spécifiques par marque
  for (const sel of brandSelectors(shoeId)) {
    try {
      const url = await page.$eval(sel, img => img.src || img.currentSrc || img.getAttribute('data-src') || '');
      const resolved = resolveUrl(url, page.url());
      if (isValidProductImage(resolved)) { console.log(`       → sélecteur : ${sel}`); return avoidAvif(resolved); }
    } catch {}
  }

  // Stratégie 4 : plus grande image visible (fallback)
  try {
    const largest = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter(img => {
          const src = img.currentSrc || img.src || '';
          return src.startsWith('http') && img.naturalWidth > 400 && img.naturalHeight > 400 &&
                 !src.match(/logo|icon|sprite|badge|flag|avatar|banner|tracking|pixel|1x1/i);
        })
        .sort((a, b) => b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight)
        .map(img => img.currentSrc || img.src)[0] || null
    );
    if (largest && isValidProductImage(largest)) { console.log('       → plus grande image'); return avoidAvif(largest); }
  } catch {}

  return null;
}

// ─── Download + Upload ─────────────────────────────────────────────────────
async function downloadViaPlaywright(imageUrl, context, pageUrl) {
  const response = await context.request.get(imageUrl, {
    headers: {
      Accept: 'image/webp,image/png,image/jpeg,image/*;q=0.8', // pas d'AVIF
      Referer: pageUrl,
      Origin: new URL(pageUrl).origin,
    },
    timeout: 25000,
  });
  if (!response.ok()) throw new Error(`HTTP ${response.status()} pour ${imageUrl}`);
  const body = await response.body();
  const ct   = response.headers()['content-type'] || 'image/jpeg';
  const minBytes = imageUrl.includes('on.com') ? 4000 : 8000;
  if (body.byteLength < minBytes) throw new Error(`Image trop petite (${body.byteLength}b)`);
  return { buffer: body, contentType: ct };
}

function detectExt(contentType, url) {
  if (contentType.includes('webp') || url.includes('.webp')) return 'webp';
  if (contentType.includes('png')  || url.includes('.png'))  return 'png';
  if (contentType.includes('jpeg') || url.match(/\.jpe?g/))  return 'jpg';
  return 'jpg'; // AVIF non supporté par Supabase → fallback jpg
}

async function uploadToStorage(shoeId, buffer, contentType, ext) {
  const filePath = `${shoeId}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
    contentType, upsert: true, cacheControl: '31536000',
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return { publicUrl: data.publicUrl, storagePath: filePath };
}

async function updateShoeInDb(shoeId, publicUrl, storagePath) {
  const { error } = await supabase.from('shoes')
    .update({ image_url: publicUrl, image_storage_path: storagePath, updated_at: new Date().toISOString() })
    .eq('id', shoeId);
  if (error) throw error;
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('🏃  RunFit — Scraping des images via Playwright\n');
  if (DRY_RUN) console.log('🧪  Mode DRY-RUN — aucune modification.\n');
  if (HEADED)  console.log('👁   Mode HEADED — navigateur visible.\n');

  let query = supabase.from('shoes').select('id, brand, model, image_storage_path').eq('is_active', true);
  if (ONLY_ID)     query = query.eq('id', ONLY_ID);
  else if (!FORCE) query = query.is('image_storage_path', null);

  const { data: shoes, error: dbError } = await query.order('brand');
  if (dbError) { console.error('❌  Erreur DB :', dbError.message); process.exit(1); }
  if (!shoes?.length) { console.log('✅  Toutes les images sont déjà dans Storage. Utilisez --force pour re-uploader.'); return; }

  const todo    = shoes.filter(s => SHOE_PAGES[s.id]);
  const ignored = shoes.filter(s => !SHOE_PAGES[s.id]);
  if (ignored.length) {
    console.log(`ℹ️   ${ignored.length} ignorée(s) (Asics déjà en Storage) : ${ignored.map(s => s.id).join(', ')}\n`);
  }
  if (!todo.length) { console.log('✅  Rien à faire.'); return; }
  console.log(`📦  ${todo.length} chaussure(s) à traiter\n`);

  const browser = await chromium.launch({
    channel: 'chrome', // utilise Chrome installé — pas besoin de télécharger Chromium
    headless: !HEADED,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled', // masque la détection headless
    ],
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
  });
  // Script de stealth : masque tous les indicateurs d'automatisation
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    window.chrome = { runtime: {}, loadTimes: () => {}, csi: () => {}, app: {} };
    const origQuery = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = (p) =>
      p.name === 'notifications' ? Promise.resolve({ state: Notification.permission }) : origQuery(p);
  });

  const results  = { success: 0, failed: 0 };
  const failures = [];

  for (const shoe of todo) {
    const pageUrl = SHOE_PAGES[shoe.id];
    const label   = `${shoe.brand} ${shoe.model}`;
    console.log(`  🔍  ${label} (${shoe.id})`);

    if (DRY_RUN) { console.log(`       Page : ${pageUrl}`); results.success++; continue; }

    // ── Cas spécial : URL directe d'image CDN (ex: Scene7 NB) ──
    const isDirectImageUrl = /\.(jpe?g|png|webp)(\?|$)/i.test(pageUrl) ||
      pageUrl.includes('scene7.com') ||
      pageUrl.includes('nb.scene7');
    if (isDirectImageUrl) {
      try {
        const directUrl = avoidAvif(pageUrl);
        const { buffer, contentType } = await downloadViaPlaywright(directUrl, context, 'https://www.google.com');
        const ext = detectExt(contentType, directUrl);
        const { publicUrl, storagePath } = await uploadToStorage(shoe.id, buffer, contentType, ext);
        await updateShoeInDb(shoe.id, publicUrl, storagePath);
        console.log(`  ✅  ${storagePath} (${(buffer.byteLength / 1024).toFixed(0)} KB) — CDN direct`);
        results.success++;
      } catch (err) {
        console.log(`  ❌  CDN direct : ${err.message}`);
        results.failed++;
        failures.push({ id: shoe.id, label, url: pageUrl, error: err.message });
      }
      continue;
    }

    const page = await context.newPage();

    // Bloque polices et médias pour accélérer le chargement
    await page.route('**/*.{woff,woff2,ttf,otf,mp4,webm,ogg,mp3}', r => r.abort());

    // ── Interception réseau : capture les images réellement téléchargées ──
    const capturedImages = [];
    page.on('response', async (response) => {
      try {
        const ct  = response.headers()['content-type'] || '';
        const url = response.url();
        if (
          response.status() === 200 &&
          ct.startsWith('image/') &&
          !ct.includes('avif') &&  // Supabase ne supporte pas AVIF
          !ct.includes('svg') &&   // SVG non supporté
          !url.match(/logo|icon|sprite|badge|banner|tracking|1x1|pixel/i)
        ) {
          // content-length peut être absent (chunked encoding) → on prend quand même
          const size = parseInt(response.headers()['content-length'] || '0');
          // Filtrer uniquement si la taille est connue ET petite (< 8 KB)
          if (size > 0 && size < 8000) return;
          capturedImages.push({ url, contentType: ct, size });
        }
      } catch {}
    });

    try {
      const slowBrands = ['hoka-', 'new-balance-', 'on-', 'salomon-', 'saucony-', 'nike-'];
      const slow = slowBrands.some(b => shoe.id.startsWith(b));

      // Timeout ignoré : on essaie quand même avec ce qui a chargé
      await page.goto(pageUrl, { waitUntil: slow ? 'networkidle' : 'domcontentloaded', timeout: 50000 })
                .catch(() => {});

      await page.waitForTimeout(slow ? 6000 : 2500);

      // Accepte les cookies si un bandeau est présent
      for (const sel of ['button[id*="accept"]', 'button[class*="accept"]', '#onetrust-accept-btn-handler', '[data-testid*="accept"]', 'button[aria-label*="ccept"]', '[id*="cookie"] button']) {
        try { await page.click(sel, { timeout: 1200 }); await page.waitForTimeout(600); break; } catch {}
      }

      // Scroll pour déclencher le lazy-loading
      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(2000);

      // Extraction de l'image (4 stratégies dont interception réseau)
      const imageUrl = await extractImageUrl(page, shoe.id, capturedImages);
      if (!imageUrl) throw new Error('Aucune image produit trouvée sur la page');

      const { buffer, contentType } = await downloadViaPlaywright(imageUrl, context, pageUrl);
      const ext = detectExt(contentType, imageUrl);
      const { publicUrl, storagePath } = await uploadToStorage(shoe.id, buffer, contentType, ext);
      await updateShoeInDb(shoe.id, publicUrl, storagePath);

      console.log(`  ✅  ${storagePath} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
      results.success++;

    } catch (err) {
      console.log(`  ❌  Erreur : ${err.message}`);
      results.failed++;
      failures.push({ id: shoe.id, label, url: pageUrl, error: err.message });
    } finally {
      await page.close();
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  await browser.close();

  console.log('\n─────────────────────────────────────────────────');
  console.log(`  ✅  Succès  : ${results.success}`);
  console.log(`  ❌  Échecs  : ${results.failed}`);

  if (failures.length) {
    console.log('\n  Chaussures en échec :');
    failures.forEach(f => {
      console.log(`    • ${f.label} (${f.id})`);
      console.log(`      Page   : ${f.url}`);
      console.log(`      Erreur : ${f.error}`);
    });
    console.log(`\n  💡 Déboguer : SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/scrape-and-upload-images.mjs --headed --id=${failures[0].id}`);
    console.log('  💡 Si l\'URL a changé, mettez à jour SHOE_PAGES dans ce fichier.');
  }

  if (!DRY_RUN && results.success > 0) {
    console.log(`\n  🎉  Images disponibles : https://pdpmmahwzxkytstoaxjb.supabase.co/storage/v1/object/public/${BUCKET}/`);
  }
}

main().catch(err => {
  console.error('❌  Erreur inattendue :', err);
  process.exit(1);
});
