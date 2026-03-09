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
  last_checked_at: string | null;
};

type UrlProbeResult = {
  statusCode: number;
  bodySnippet: string;
};

function buildFallbackUrl(retailerName: string, productId: string): string {
  const q = encodeURIComponent(productId.replace(/-/g, " "));
  const n = retailerName.toLowerCase();

  if (n.includes("i-run") || n.includes("irun")) return `https://www.i-run.fr/recherche?q=${q}`;
  if (n.includes("alltricks")) return `https://www.alltricks.fr/s?search=${q}`;
  if (n.includes("amazon")) return `https://www.amazon.fr/s?k=${q}%20chaussure%20running`;
  if (n.includes("decathlon")) return `https://www.decathlon.fr/search?Ntt=${q}`;

  return `https://www.google.com/search?q=${encodeURIComponent(`${retailerName} ${productId.replace(/-/g, " ")} running`)}`;
}

function isSoft404(content: string): boolean {
  const normalized = content.toLowerCase();
  return [
    "page introuvable",
    "produit n'existe pas",
    "produit indisponible",
    "n'est plus disponible",
    "erreur 404",
    "404 not found",
    "the page you were looking for",
  ].some((needle) => normalized.includes(needle));
}

async function probeUrl(url: string): Promise<UrlProbeResult> {
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (head.status !== 405 && head.status !== 403) {
      return { statusCode: head.status, bodySnippet: "" };
    }
  } catch (_) {
    // fallback to GET
  }

  const get = await fetch(url, { method: "GET", redirect: "follow" });
  const bodySnippet = await get.text().then((txt) => txt.slice(0, 2500)).catch(() => "");
  return { statusCode: get.status, bodySnippet };
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
    const maxAgeMinutes: number = typeof body?.maxAgeMinutes === "number" ? Math.max(body.maxAgeMinutes, 0) : 360;

    let query = admin
      .from("shoe_prices")
      .select("id, product_id, retailer_name, product_url, affiliate_url, fallback_url, last_checked_at")
      .order("price", { ascending: true })
      .limit(limit);

    if (productId) query = query.eq("product_id", productId);
    if (offerIds.length > 0) query = query.in("id", offerIds);

    const { data, error } = await query;
    if (error) throw error;

    const now = Date.now();
    const offers = ((data ?? []) as OfferRow[]).filter((offer) => {
      if (!offer.last_checked_at) return true;
      const ageMs = now - new Date(offer.last_checked_at).getTime();
      return ageMs >= maxAgeMinutes * 60 * 1000;
    });

    const results: Array<{ id: string; urlStatus: string; statusCode: number; affiliateUrl: string; fallbackUrl: string | null }> = [];

    for (const offer of offers) {
      const checkedUrl = offer.product_url || offer.affiliate_url;
      const fallback = buildFallbackUrl(offer.retailer_name, offer.product_id);

      let statusCode = 0;
      let urlStatus = "broken";
      let resolvedAffiliateUrl = offer.affiliate_url || offer.product_url || "";
      let resolvedFallbackUrl: string | null = null;
      let errorMessage: string | null = null;

      try {
        const probe = await probeUrl(checkedUrl);
        statusCode = probe.statusCode;
        const retailer = offer.retailer_name.toLowerCase();

        if (statusCode >= 200 && statusCode < 400 && !isSoft404(probe.bodySnippet)) {
          urlStatus = "valid";
          resolvedAffiliateUrl = offer.affiliate_url || offer.product_url;
        } else if (statusCode === 404 || statusCode === 410 || isSoft404(probe.bodySnippet)) {
          urlStatus = "fallback";
          resolvedAffiliateUrl = fallback;
          resolvedFallbackUrl = fallback;
        } else if ((statusCode === 401 || statusCode === 403 || statusCode === 429) && (retailer.includes("i-run") || retailer.includes("irun"))) {
          // i-Run bloque souvent les robots: pour éviter les faux positifs, on bascule sur une recherche marchand.
          urlStatus = "fallback";
          resolvedAffiliateUrl = fallback;
          resolvedFallbackUrl = fallback;
        } else if (statusCode >= 200 && statusCode < 500) {
          // Cas intermédiaire non bloquant pour les autres marchands.
          urlStatus = "valid";
          resolvedAffiliateUrl = offer.affiliate_url || offer.product_url;
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
          last_verified_at: new Date().toISOString(),
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

