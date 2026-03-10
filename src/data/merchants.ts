import { supabase } from "@/integrations/supabase/client";

export type OfferUrlStatus = "valid" | "fallback" | "broken" | "unknown";

export interface MerchantOffer {
  id: string;
  merchant: string;
  price: number;
  available: boolean;
  productUrl: string;
  affiliateUrl: string;
  fallbackUrl?: string;
  logo?: string;
  urlStatus: OfferUrlStatus;
}

// Tag Amazon Associates France — à remplacer par votre vrai tag une fois inscrit
const AMAZON_AFFILIATE_TAG = "runfit-21";

/**
 * Construit une URL de recherche toujours valide pour un retailer donné.
 * Utilisée comme fallback côté client si l'affiliate_url stockée est vide.
 */
export function buildRetailerSearchUrl(retailerName: string, query: string): string {
  const q = encodeURIComponent(query);
  const n = retailerName.toLowerCase();

  // ── E-commerce généraliste ──────────────────────────────────────────────
  if (n.includes("amazon"))
    return `https://www.amazon.fr/s?k=${q}+running&i=sporting&tag=${AMAZON_AFFILIATE_TAG}`;

  // ── Enseignes sport grand public (France) ────────────────────────────────
  if (n.includes("courir"))          return `https://www.courir.com/search?q=${q}`;
  if (n.includes("foot locker"))     return `https://www.footlocker.fr/search?query=${q}`;
  if (n.includes("jd sports"))       return `https://www.jdsports.fr/search/jd/${q}/`;
  if (n.includes("intersport"))      return `https://www.intersport.fr/catalogsearch/result/?q=${q}`;
  if (n.includes("sport 2000"))      return `https://www.sport2000.fr/search?q=${q}`;
  if (n.includes("decathlon"))       return `https://www.decathlon.fr/search?Ntt=${q}`;

  // ── Spécialistes running / outdoor ──────────────────────────────────────
  if (n.includes("running collective"))
    return `https://www.therunningcollective.com/fr/search?q=${q}`;
  if (n.includes("alltricks"))       return `https://www.alltricks.fr/s?search=${q}`;
  if (n.includes("ekosport"))        return `https://www.ekosport.fr/catalogsearch/result/?q=${q}`;
  if (n.includes("running addict"))  return `https://www.runningaddict.fr/catalogsearch/result/?q=${q}`;

  // ── Marques en direct ────────────────────────────────────────────────────
  if (n.includes("nike"))            return `https://www.nike.com/fr/search?q=${q}`;
  if (n.includes("adidas"))          return `https://www.adidas.fr/search?q=${q}`;
  if (n.includes("asics"))           return `https://www.asics.com/fr/fr-fr/search?q=${q}`;
  if (n.includes("brooks"))          return `https://www.brooksrunning.com/fr_fr/search?q=${q}`;
  if (n.includes("hoka"))            return `https://www.hoka.com/fr-fr/search?q=${q}`;
  if (n.includes("salomon"))         return `https://www.salomon.com/fr-fr/search?q=${q}`;
  if (n.includes("new balance"))     return `https://www.newbalance.fr/search?q=${q}`;
  if (n.includes("saucony"))         return `https://www.saucony.com/fr/search?q=${q}`;
  if (n.includes("mizuno"))          return `https://www.mizuno.com/eu/fr/search?q=${q}`;
  if (n.includes("on running") || n.includes("on-running") || n === "on")
    return `https://www.on-running.com/fr-fr/sport/running/search/${q}`;

  return `https://www.google.com/search?q=${encodeURIComponent(`${query} chaussure running ${retailerName}`)}`;
}

function normalizeStatus(status?: string | null): OfferUrlStatus {
  if (status === "valid" || status === "fallback" || status === "broken") return status;
  return "unknown";
}

/** Retailers par défaut injectés côté client quand la DB ne retourne aucun résultat. */
const DEFAULT_RETAILERS: Array<{ name: string; logo: string; priceOffset: number }> = [
  { name: "Amazon",                logo: "https://logo.clearbit.com/amazon.fr",                priceOffset: -10 },
  { name: "i-Run",                 logo: "https://logo.clearbit.com/i-run.fr",                 priceOffset: 0   },
  { name: "The Running Collective",logo: "https://logo.clearbit.com/therunningcollective.fr",  priceOffset: -5  },
  { name: "Courir",                logo: "https://logo.clearbit.com/courir.com",               priceOffset: 0   },
  { name: "Intersport",            logo: "https://logo.clearbit.com/intersport.fr",            priceOffset: -5  },
];

/**
 * Génère des offres statiques avec liens de recherche garantis quand la DB est vide.
 * Permet à l'app d'être fonctionnelle immédiatement même sans données en base.
 */
function generateFallbackOffers(productId: string, brand: string, model: string, basePrice: number): MerchantOffer[] {
  const query = `${brand} ${model}`;
  return DEFAULT_RETAILERS.map((r, i) => ({
    id: `static-${productId}-${i}`,
    merchant: r.name,
    price: Math.max(basePrice + r.priceOffset, 9.99),
    available: true,
    productUrl: buildRetailerSearchUrl(r.name, query),
    affiliateUrl: buildRetailerSearchUrl(r.name, query),
    logo: r.logo,
    urlStatus: "valid" as OfferUrlStatus,
  })).sort((a, b) => a.price - b.price);
}

/**
 * Fetch merchant offers from the database, validates stale links server-side,
 * and returns only routable offers sorted by price ascending.
 * Falls back to generated search-URL offers if the DB returns nothing.
 */
export async function fetchMerchantOffers(
  productId: string,
  opts?: { brand?: string; model?: string; basePrice?: number }
): Promise<MerchantOffer[]> {
  // Validation asynchrone en arrière-plan (ne bloque pas l'affichage)
  supabase.functions.invoke("validate-offer-links", {
    body: { productId, maxAgeMinutes: 360, limit: 20 },
  }).catch(() => {/* silencieux si la fonction n'est pas déployée */});

  const { data, error } = await supabase
    .from("shoe_prices")
    .select("id, retailer_name, price, stock_status, product_url, affiliate_url, fallback_url, logo_url, url_status")
    .eq("product_id", productId)
    .neq("url_status", "broken")   // exclut uniquement les liens confirmés cassés
    .order("price", { ascending: true });

  if (error || !data || data.length === 0) {
    // Fallback : génère des offres avec liens de recherche si la DB est vide
    if (opts?.brand && opts.model && opts.basePrice) {
      return generateFallbackOffers(productId, opts.brand, opts.model, opts.basePrice);
    }
    return [];
  }

  return data.map((row) => {
    const urlStatus = normalizeStatus(row.url_status);
    // Garantit toujours une URL valide : affiliate → product → fallback → search généré
    const finalUrl =
      row.affiliate_url ||
      row.product_url ||
      row.fallback_url ||
      buildRetailerSearchUrl(row.retailer_name, row.product_id.replace(/-/g, " "));

    return {
      id: row.id,
      merchant: row.retailer_name,
      price: Number(row.price),
      available: row.stock_status === "in_stock",
      productUrl: row.product_url,
      affiliateUrl: finalUrl,
      fallbackUrl: row.fallback_url ?? undefined,
      logo: row.logo_url ?? undefined,
      urlStatus,
    };
  });
}

/**
 * Track a click on a merchant offer.
 */
export async function trackOfferClick(params: {
  userId: string | null;
  productId: string;
  retailerName: string;
  shoeModel: string;
}) {
  if (!params.userId) return;
  await supabase.from("click_analytics").insert({
    user_id: params.userId,
    product_id: params.productId,
    retailer_name: params.retailerName,
    shoe_model: params.shoeModel,
  });
}

