/**
 * Génère les fichiers favicon pour RunMatch :
 *   public/favicon.svg          → favicon haute qualité (navigateurs modernes)
 *   public/favicon.ico          → favicon legacy (ICO multi-tailles : 16, 32, 48)
 *   public/apple-touch-icon.png → icône iOS 180×180
 *
 * Usage : node scripts/generate-favicon.mjs
 */

import sharp from 'sharp'
import { writeFileSync } from 'fs'

// ── Design SVG ───────────────────────────────────────────────────────────────
// Fond : gradient orange → rouge (couleurs primaires RunMatch)
// Icône : chaussure de running stylisée en blanc (paths purs, sans texte)
// viewBox 100×100 → sharp redimensionne proprement

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#FF6B1A"/>
      <stop offset="100%" stop-color="#E53535"/>
    </linearGradient>
  </defs>

  <!-- Fond arrondi -->
  <rect width="100" height="100" rx="22" fill="url(#bg)"/>

  <!-- Chaussure de running stylisée — semelle + upper + empeigne -->
  <!-- Semelle épaisse -->
  <path d="M12 68 C12 68 14 74 22 74 L80 74 C86 74 88 70 88 67 C88 64 85 62 80 62 L52 62 C46 60 42 54 38 50 C34 46 28 44 22 46 C16 48 12 55 12 62 Z"
        fill="white"/>

  <!-- Upper (tige de la chaussure) -->
  <path d="M22 46 C28 44 36 46 42 54 C46 60 52 62 58 62 L74 62 C74 62 72 52 62 48 C52 44 44 42 36 38 C30 35 22 36 18 40 C15 43 16 47 22 46 Z"
        fill="white" opacity="0.92"/>

  <!-- Lacets (3 bandes horizontales) -->
  <line x1="36" y1="58" x2="50" y2="60" stroke="#FF6B1A" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="40" y1="53" x2="54" y2="56" stroke="#FF6B1A" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="44" y1="48" x2="57" y2="51" stroke="#FF6B1A" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Swoosh / bande latérale -->
  <path d="M22 64 C30 61 42 63 54 65" stroke="#FF6B1A" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>
</svg>`

// ── Génération des fichiers ───────────────────────────────────────────────────

const svgBuffer = Buffer.from(SVG, 'utf-8')

async function generatePng(size) {
  return sharp(svgBuffer, { density: 300 })
    .resize(size, size)
    .png()
    .toBuffer()
}

// ICO multi-tailles (16, 32, 48)
function buildIco(pngEntries) {
  // pngEntries : [{ size, buffer }]
  const headerSize   = 6
  const dirEntrySize = 16
  const dirSize      = pngEntries.length * dirEntrySize
  const totalHeader  = headerSize + dirSize

  // Calcul des offsets
  let offset = totalHeader
  const offsets = pngEntries.map(({ buffer }) => {
    const o = offset
    offset += buffer.length
    return o
  })

  const ico = Buffer.alloc(offset)

  // ICONDIR
  ico.writeUInt16LE(0, 0) // Reserved
  ico.writeUInt16LE(1, 2) // Type: ICO
  ico.writeUInt16LE(pngEntries.length, 4)

  // ICONDIRENTRY
  pngEntries.forEach(({ size, buffer }, i) => {
    const base = headerSize + i * dirEntrySize
    ico.writeUInt8(size >= 256 ? 0 : size, base)
    ico.writeUInt8(size >= 256 ? 0 : size, base + 1)
    ico.writeUInt8(0, base + 2)
    ico.writeUInt8(0, base + 3)
    ico.writeUInt16LE(1, base + 4)
    ico.writeUInt16LE(32, base + 6)
    ico.writeUInt32LE(buffer.length, base + 8)
    ico.writeUInt32LE(offsets[i], base + 12)
  })

  // PNG data
  pngEntries.forEach(({ buffer }, i) => {
    buffer.copy(ico, offsets[i])
  })

  return ico
}

console.log('Génération du favicon RunMatch…')

const [png16, png32, png48, png180] = await Promise.all([
  generatePng(16),
  generatePng(32),
  generatePng(48),
  generatePng(180),
])

// favicon.ico (16 + 32 + 48)
const ico = buildIco([
  { size: 16, buffer: png16 },
  { size: 32, buffer: png32 },
  { size: 48, buffer: png48 },
])
writeFileSync('public/favicon.ico', ico)
console.log('✓ public/favicon.ico')

// favicon.svg (navigateurs modernes — qualité maximale)
writeFileSync('public/favicon.svg', SVG)
console.log('✓ public/favicon.svg')

// apple-touch-icon.png (iOS)
writeFileSync('public/apple-touch-icon.png', png180)
console.log('✓ public/apple-touch-icon.png')

// favicon-32x32.png (fallback PNG pour certains navigateurs)
writeFileSync('public/favicon-32x32.png', png32)
console.log('✓ public/favicon-32x32.png')

console.log('\n✅ Favicon générés avec succès !')
