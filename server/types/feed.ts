// ============================================================
// Types — système de flux affiliés
// ============================================================

/** Format de flux supporté par les parsers */
export type FeedFormat = 'xml' | 'csv' | 'json'

/** Réseau d'affiliation supporté */
export type AffiliateNetwork = 'amazon' | 'awin' | 'cj' | 'manual'

/** Statut de stock normalisé */
export type StockStatus = 'in_stock' | 'out_of_stock' | 'preorder' | 'unknown'

/** Statut de validation d'URL */
export type UrlStatus = 'valid' | 'fallback' | 'broken' | 'unknown'

// ── Produit normalisé issu d'un flux ────────────────────────────────────────

/**
 * Item produit normalisé après parsing d'un flux marchand.
 * Tous les parsers (XML/CSV/JSON) retournent ce format commun.
 */
export interface NormalizedProductFeedItem {
  /** ID externe chez le marchand */
  externalProductId: string
  /** Nom de la marque (ex: "Nike") */
  brand: string
  /** Nom du modèle (ex: "Pegasus 41") */
  model: string
  /** Prix en euros */
  price: number
  /** Devise (par défaut 'EUR') */
  currency: string
  /** URL produit sur le site du marchand */
  productUrl: string
  /** URL image produit */
  imageUrl?: string
  /** Statut de stock */
  stockStatus: StockStatus
  /** Catégorie produit (ex: 'running', 'trail') */
  category?: string
  /** Description courte */
  description?: string
  /** Données brutes du parser, pour debug */
  raw?: Record<string, unknown>
}

// ── Configuration marchand ───────────────────────────────────────────────────

export interface MerchantConfig {
  id: string
  name: string
  slug: string
  feedUrl: string | null
  feedFormat: FeedFormat
  affiliateNetwork: AffiliateNetwork | null
  affiliateTag: string | null
  country: string
  logoUrl: string | null
  isActive: boolean
  lastSyncAt: string | null
}

// ── Résultat de sync ─────────────────────────────────────────────────────────

export interface FeedSyncResult {
  merchantSlug: string
  status: 'success' | 'error' | 'partial'
  itemsFetched: number
  itemsUpserted: number
  itemsRemoved: number
  errorMessage?: string
  durationMs: number
}

// ── Génération de lien affilié ───────────────────────────────────────────────

export interface AffiliateLinkOptions {
  network: AffiliateNetwork
  productUrl: string
  /** Tag partenaire (ex: "runfit-21" pour Amazon) */
  affiliateTag?: string
  /** ID de l'annonceur AWIN ou CJ */
  advertiserId?: string
  /** Publisher ID AWIN ou CJ */
  publisherId?: string
}
