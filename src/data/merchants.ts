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

function normalizeStatus(status?: string | null): OfferUrlStatus {
  if (status === "valid" || status === "fallback" || status === "broken") return status;
  return "unknown";
}

/**
 * Fetch merchant offers from the database, validates stale links server-side,
 * and returns only routable offers sorted by price ascending.
 */
export async function fetchMerchantOffers(productId: string): Promise<MerchantOffer[]> {
  await supabase.functions.invoke("validate-offer-links", {
    body: { productId, maxAgeMinutes: 360, limit: 20 },
  });

  const { data, error } = await supabase
    .from("shoe_prices")
    .select("id, retailer_name, price, stock_status, product_url, affiliate_url, fallback_url, logo_url, url_status")
    .eq("product_id", productId)
    .in("url_status", ["valid", "fallback"])
    .order("price", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const urlStatus = normalizeStatus(row.url_status);
    const finalUrl = row.affiliate_url || row.product_url || row.fallback_url || "";

    return {
      id: row.id,
      merchant: row.retailer_name,
      price: Number(row.price),
      available: row.stock_status === "in_stock" && Boolean(finalUrl),
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

