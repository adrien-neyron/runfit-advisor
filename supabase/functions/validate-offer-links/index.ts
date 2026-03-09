import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type OfferRow = {
  id: string;
  product_id: string;
  retailer_name: string;
  product_url: string;
  affiliate_url: string;
  fallback_url: string | null;
  url_status: string | null;
};

function buildFallbackUrl(retailerName: string, productId: string): string {
  const q = encodeURIComponent(productId.replace(/-/g, " "));
  const n = retailerName.toLowerCase();

  if (n.includes("i-run") || n.includes("irun")) return `https://www.i-run.fr/recherche.html?text=${q}`;
  if (n.includes("alltricks")) return `https://www.alltricks.fr/s?search=${q}`;
  if (n.includes("amazon")) return `https://www.amazon.fr/s?k=${q}%20chaussure%20running`;
  if (n.includes("decathlon")) return `https://www.decathlon.fr/search?Ntt=${q}`;

  return `https://www.google.com/search?q=${encodeURIComponent(`${retailerName} ${productId.replace(/-/g, " ")} running`)}`;
}

async function getStatusCode(url: string): Promise<number> {
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (head.status !== 405) return head.status;
  } catch (_) {
    // fallback to GET
  }

  const get = await fetch(url, { method: "GET", redirect: "follow" });
  return get.status;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing backend secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json().catch(() => ({}));

    const productId: string | undefined = body?.productId;
    const offerIds: string[] = Array.isArray(body?.offerIds) ? body.offerIds : [];
    const limit: number = typeof body?.limit === "number" ? Math.min(Math.max(body.limit, 1), 100) : 50;

    let query = admin
      .from("shoe_prices")
      .select("id, product_id, retailer_name, product_url, affiliate_url, fallback_url, url_status")
      .order("price", { ascending: true })
      .limit(limit);

    if (productId) query = query.eq("product_id", productId);
    if (offerIds.length > 0) query = query.in("id", offerIds);

    const { data, error } = await query;
    if (error) throw error;

    const offers = (data ?? []) as OfferRow[];
    const results: Array<{ id: string; urlStatus: string; statusCode: number; affiliateUrl: string; fallbackUrl: string | null }> = [];

    for (const offer of offers) {
      const checkedUrl = offer.affiliate_url || offer.product_url;
      const fallback = buildFallbackUrl(offer.retailer_name, offer.product_id);

      let statusCode = 0;
      let urlStatus = "broken";
      let resolvedAffiliateUrl = checkedUrl;
      let resolvedFallbackUrl: string | null = null;
      let errorMessage: string | null = null;

      try {
        statusCode = await getStatusCode(checkedUrl);

        if (statusCode >= 200 && statusCode < 400) {
          urlStatus = "valid";
        } else if (statusCode === 404 || statusCode === 410) {
          urlStatus = "fallback";
          resolvedAffiliateUrl = fallback;
          resolvedFallbackUrl = fallback;
        } else {
          urlStatus = "fallback";
          resolvedAffiliateUrl = fallback;
          resolvedFallbackUrl = fallback;
        }
      } catch (error) {
        urlStatus = "fallback";
        resolvedAffiliateUrl = fallback;
        resolvedFallbackUrl = fallback;
        errorMessage = error instanceof Error ? error.message : "Validation failed";
      }

      await admin
        .from("shoe_prices")
        .update({
          url_status: urlStatus,
          affiliate_url: resolvedAffiliateUrl,
          fallback_url: resolvedFallbackUrl,
          last_checked_at: new Date().toISOString(),
        })
        .eq("id", offer.id);

      await admin.from("link_validation_logs").insert({
        shoe_price_id: offer.id,
        product_id: offer.product_id,
        retailer_name: offer.retailer_name,
        checked_url: checkedUrl,
        resolved_url: resolvedAffiliateUrl,
        status_code: statusCode || null,
        result: urlStatus,
        error_message: errorMessage,
      });

      results.push({
        id: offer.id,
        urlStatus,
        statusCode,
        affiliateUrl: resolvedAffiliateUrl,
        fallbackUrl: resolvedFallbackUrl,
      });
    }

    return new Response(JSON.stringify({ checked: results.length, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
