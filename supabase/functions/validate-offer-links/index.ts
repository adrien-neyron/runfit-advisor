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

/**
 * Détecte si une URL est déjà une URL de recherche (toujours valide pour un utilisateur).
 * Ces URLs ne doivent PAS être remplacées par un fallback même si la probe renvoie une erreur.
 */
function isSearchUrl(url: string): boolean {
  return (
    url.includes("/s?") ||
    url.includes("?q=") ||
    url.includes("?k=") ||
    url.includes("?search=") ||
    url.includes("?Ntt=") ||
    url.includes("?query=") ||
    url.includes("/search?") ||
    url.includes("/recherche?") ||
    url.includes("catalogsearch/result") ||
    url.includes("google.com/search")
  );
}

function buildFallbackUrl(retailerName: string, productId: string): string {
  const q = encodeURIComponent(productId.replace(/-/g, " "));
  const n = retailerName.toLowerCase();

  // Retailers spécialisés running
  if (n.includes("i-run") || n.includes("irun")) return `https://www.i-run.fr/recherche?q=${q}`;
  if (n.includes("running collective") || n.includes("therunningcollective")) return `https://www.therunningcollective.fr/recherche?q=${q}`;
  if (n.includes("running addict") || n.includes("runningaddict")) return `https://www.runningaddict.fr/catalogsearch/result/?q=${q}`;

  // Outdoor / multisport
  if (n.includes("alltricks")) return `https://www.alltricks.fr/s?search=${q}`;
  if (n.includes("ekosport")) return `https://www.ekosport.fr/catalogsearch/result/?q=${q}`;

  // Grandes surfaces sport
  if (n.includes("decathlon")) return `https://www.decathlon.fr/search?Ntt=${q}`;
  if (n.includes("intersport")) return `https://www.intersport.fr/catalogsearch/result/?q=${q}`;
  if (n.includes("sport 2000") || n.includes("sport2000")) return `https://www.sport2000.fr/search?q=${q}`;

  // Distribution généraliste sport
  if (n.includes("courir")) return `https://www.courir.com/search?q=${q}`;
  if (n.includes("foot locker") || n.includes("footlocker")) return `https://www.footlocker.fr/search?query=${q}`;
  if (n.includes("jd sports") || n.includes("jdsports")) return `https://www.jdsports.fr/search/jd/${q}/`;

  // Amazon (affiliation)
  if (n.includes("amazon")) return `https://www.amazon.fr/s?k=${q}+chaussure+running&i=sporting&tag=runmatch-21`;

  // Marques en direct
  if (n.includes("nike")) return `https://www.nike.com/fr/search?q=${q}`;
  if (n.includes("asics")) return `https://www.asics.com/fr/fr-fr/search?q=${q}`;
  if (n.includes("brooks")) return `https://www.brooksrunning.com/fr_fr/search?q=${q}`;
  if (n.includes("hoka")) return `https://www.hoka.com/fr-fr/search?q=${q}`;
  if (n.includes("salomon")) return `https://www.salomon.com/fr-fr/search?q=${q}`;
  if (n.includes("new balance") || n.includes("newbalance")) return `https://www.newbalance.fr/search?q=${q}`;
  if (n.includes("saucony")) return `https://www.saucony.com/fr/search?q=${q}`;
  if (n.includes("mizuno")) return `https://www.mizuno.com/eu/fr/search?q=${q}`;

  // Fallback Google Shopping ciblé running
  return `https://www.google.com/search?q=${encodeURIComponent(`${productId.replace(/-/g, " ")} running site:${retailerName.toLowerCase().replace(/\s/g, "")}.fr OR site:${retailerName.toLowerCase().replace(/\s/g, "")}.com`)}`;
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
        // Si l'URL est déjà une URL de recherche, on la marque directement comme valide
        // sans sonder le site (évite les faux positifs dus aux anti-bots).
        if (isSearchUrl(checkedUrl)) {
          urlStatus = "valid";
          resolvedAffiliateUrl = offer.affiliate_url || checkedUrl;
          statusCode = 200;

          await admin.from("shoe_prices").update({
            url_status: "valid",
            affiliate_url: resolvedAffiliateUrl,
            last_checked_at: new Date().toISOString(),
            last_verified_at: new Date().toISOString(),
          }).eq("id", offer.id);

          results.push({ id: offer.id, urlStatus: "valid", statusCode: 200, affiliateUrl: resolvedAffiliateUrl, fallbackUrl: null });
          continue;
        }

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

