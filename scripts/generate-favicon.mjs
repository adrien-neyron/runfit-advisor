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
  <rect width="100" height="100" rx="22" fill="url(#bg)"/>

  <!--
    Chaussure de running — profil gauche (talon à gauche, orteil à droite)

    Architecture :
      1. Semelle outsole  — rectangle arrondi bas
      2. Tige (upper)     — forme avec côté gauche vertical (talon),
                            dessus courbe talon→pointe, côté droit arrondi (toe box)
      3. Trou du col      — découpe fill-rule evenodd, ovale en haut-gauche
      4. Bande latérale   — détail décoratif
  -->

  <!-- 1. Semelle outsole (bande épaisse bas) -->
  <rect x="10" y="72" width="80" height="12" rx="6" fill="white"/>

  <!-- 2. Tige + 3. Trou de col (evenodd = vrai trou) -->
  <path fill-rule="evenodd" fill="white" d="
    M 10 72
    L 10 40
    C 10 30 18 22 28 24
    C 42 24 58 34 74 48
    C 82 54 90 62 90 72
    Z

    M 14 40
    C 14 32 20 26 28 26
    C 24 32 20 42 20 56
    C 17 50 14 46 14 40
    Z
  "/>

  <!-- 4. Bande latérale (swoosh style) -->
  <path d="M 32 68 C 50 62 68 62 84 68"
        stroke="#FF6B1A" stroke-width="4.5"
        fill="none" stroke-linecap="round" opacity="0.8"/>
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
