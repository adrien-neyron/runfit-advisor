// ============================================================
// Types TypeScript — Backoffice Admin RunFit
// ============================================================

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
}

// Chaussure vue backoffice (colonnes legacy + colonnes admin)
export interface ShoeAdmin {
  id: string
  // Colonnes legacy (app)
  brand: string
  model: string
  description: string
  prix: number
  foulee: string[]
  terrain: string[]
  amorti: string
  drop_mm: number
  poids_g: number
  stabilite: string
  dynamisme: string
  largeur_disponible: string[]
  niveau: string[]
  objectif: string[]
  benefits: string[]
  image_url: string | null
  image_original_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Colonnes admin
  brand_id: string | null
  slug: string | null
  category: 'road' | 'trail' | 'daily' | 'race' | null
  pronation: 'neutral' | 'stability' | 'motion_control' | null
  terrain_type: 'road' | 'trail' | 'mixed' | null
  gender: 'men' | 'women' | 'unisex'
  release_year: number | null
  weight_g: number | null
  is_draft: boolean
  // Relations (optionnel via join)
  brands?: Brand | null
  shoe_images?: ShoeImage[]
  affiliate_links?: AffiliateLink[]
}

export interface ShoeImage {
  id: string
  shoe_id: string
  url_original: string
  url_optimized: string | null
  is_primary: boolean
  angle: 'side' | 'top' | 'outsole' | 'lifestyle' | null
  source: 'affiliate' | 'brand' | 'manual'
  last_verified_at: string | null
  created_at: string
}

export interface AffiliateLink {
  id: string
  shoe_id: string
  merchant: 'amazon' | 'irun' | 'alltricks' | 'nike' | 'asics' | 'decathlon' | 'other'
  country: string
  url: string
  price_last_seen: number | null
  last_checked_at: string | null
  is_active: boolean
  created_at: string
}

// Résultat du pipeline image (3 variantes WebP)
export interface ImagePipelineResult {
  thumb: string   // 200px
  card: string    // 600px
  full: string    // 1200px
  storagePaths: {
    thumb: string
    card: string
    full: string
  }
}

// Format d'une ligne dans le CSV d'import
export interface CsvShoeRow {
  brand_slug: string
  model_name: string
  category: string
  drop_mm: string
  weight_g: string
  pronation: string
  terrain_type: string
  gender: string
  release_year: string
  price: string
  url_amazon?: string
  url_irun?: string
  url_alltricks?: string
  image_url?: string
}

// Résumé retourné après import CSV
export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
  shoes: string[]  // IDs des chaussures créées
}
