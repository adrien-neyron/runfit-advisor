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
  // Images — 3 colonnes legacy + 2 nouveaux champs (migration 20260427000002)
  image_url: string | null          // URL servie (CDN Storage ou externe)
  image_storage_path: string | null // Chemin dans bucket Storage (legacy)
  image_original_url: string | null // URL source originale (legacy)
  image_url_cdn: string | null      // URL CDN Supabase Storage — source de vérité
  image_source_url: string | null   // URL de re-téléchargement source
  last_image_check: string | null   // Dernière vérification disponibilité image
  is_active: boolean
  is_available: boolean             // Colonne générée (offer_count_active > 0)
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
  merchant: string              // Plus de CHECK restrictif depuis migration 20260427000002
  country: string
  url: string                   // Colonne legacy conservée
  affiliate_url: string | null  // Alias propre de url (migration 20260427000002)
  final_url: string | null      // URL finale après redirections
  http_status: number | null    // Dernier code HTTP de la probe
  status: 'active' | 'dead' | 'unknown'
  price_last_seen: number | null
  last_checked_at: string | null
  is_active: boolean            // Colonne legacy conservée
  created_at: string
  updated_at: string
}

// Résultat du pipeline image (3 variantes WebP)
export interface ImagePipelineResult {
  thumb: string        // URL publique 200px
  card: string         // URL publique 600px (utilisé comme image_url_cdn)
  full: string         // URL publique 1200px
  storagePaths: {
    thumb: string
    card: string
    full: string
  }
}

// Résultat du pipeline avec mise à jour DB incluse
export interface ImageSaveResult extends ImagePipelineResult {
  shoeId: string
  sourceUrl: string
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
