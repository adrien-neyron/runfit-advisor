import { supabase } from "@/integrations/supabase/client";

export interface MerchantOffer {
  merchant: string;
  price: number;
  available: boolean;
  productUrl: string;
  affiliateUrl: string;
  logo?: string;
}

/**
 * Fetch merchant offers from the database, sorted by price ascending.
 */
export async function fetchMerchantOffers(productId: string): Promise<MerchantOffer[]> {
  const { data, error } = await supabase
    .from("shoe_prices")
    .select("*")
    .eq("product_id", productId)
    .order("price", { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => ({
    merchant: row.retailer_name,
    price: Number(row.price),
    available: row.stock_status === "in_stock",
    productUrl: row.product_url,
    affiliateUrl: row.affiliate_url,
  }));
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
