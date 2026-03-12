import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Check, ExternalLink, Info, ChevronDown, ChevronUp, Tag, ArrowRight } from "lucide-react";
import { products, getRelatedProducts } from "@/data/products";
import { fetchMerchantOffers, trackOfferClick, MerchantOffer } from "@/data/merchants";
import { getProductTechnologies, Technology } from "@/data/technologies";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import RedirectDialog from "@/components/RedirectDialog";

const categoryLabels: Record<string, string> = {
  amorti: "Amorti",
  plaque: "Plaque",
  stabilité: "Stabilité",
  semelle: "Semelle",
  tige: "Tige",
};

const TechCard = ({ tech }: { tech: Technology }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase">
            {categoryLabels[tech.category] || tech.category}
          </span>
          <span className="font-semibold">{tech.name}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2">
              <p className="text-sm text-muted-foreground">{tech.description}</p>
              <div className="flex items-start gap-2 bg-primary/5 p-3 rounded-lg">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{tech.benefit}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{tech.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OfferRow = ({ offer, isBest, onBuy }: { offer: MerchantOffer; isBest: boolean; onBuy: () => void }) => (
  <div className={`flex items-center justify-between p-4 rounded-xl border ${isBest ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
    <div className="flex items-center gap-3">
      {isBest && (
        <span className="px-2 py-0.5 rounded-md accent-gradient text-primary-foreground text-xs font-bold">MEILLEUR PRIX</span>
      )}
      {offer.urlStatus === "fallback" && (
        <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-bold">LIEN ALTERNATIF</span>
      )}
      <span className="font-semibold">{offer.merchant}</span>
    </div>
    <div className="flex items-center gap-4">
      <span className={`font-black text-lg ${!offer.available ? "text-muted-foreground line-through" : ""}`}>
        {offer.price.toFixed(2)} €
      </span>
      {offer.available ? (
        <Button size="sm" variant={isBest ? "hero" : "outline"} onClick={onBuy}>
          <ExternalLink className="w-3.5 h-3.5" />
          Voir l'offre
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground font-medium">Indisponible</span>
      )}
    </div>
  </div>
);

const ShoeDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const product = products.find((p) => p.id === slug);
  const techs = slug ? getProductTechnologies(slug) : [];
  const related = slug ? getRelatedProducts(slug) : [];

  const [offers, setOffers] = useState<MerchantOffer[]>([]);
  const [redirect, setRedirect] = useState<{ merchant: string; url: string } | null>(null);

  useEffect(() => {
    if (slug) fetchMerchantOffers(slug).then(setOffers);
  }, [slug]);

  const handleBuy = (offer: MerchantOffer) => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour accéder aux offres d'achat." });
      navigate("/connexion");
      return;
    }
    if (!offer.available || !offer.affiliateUrl) {
      toast({ title: "Offre indisponible", description: "Cette chaussure n'est plus disponible chez ce marchand." });
      return;
    }
    if (offer.urlStatus === "fallback") {
      toast({ title: "Lien alternatif", description: "Redirection vers une recherche du modèle chez ce marchand." });
    }
    setRedirect({ merchant: offer.merchant, url: offer.affiliateUrl });
  };

  const confirmRedirect = () => {
    if (!redirect || !product) return;
    trackOfferClick({ userId: user?.id ?? null, productId: product.id, retailerName: redirect.merchant, shoeModel: `${product.brand} ${product.model}` });
    window.open(redirect.url, "_blank", "noopener,noreferrer");
    setRedirect(null);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Chaussure non trouvée</h1>
          <Button onClick={() => navigate("/shoes")}>Voir le catalogue</Button>
        </div>
      </div>
    );
  }

  const bestPrice = offers.find((o) => o.available)?.price;
  const title = `${product.brand} ${product.model} — Avis, Test & Meilleur Prix | RunMatch`;
  const metaDesc = `Découvrez la ${product.brand} ${product.model} : ${product.description.slice(0, 120)}. Comparateur de prix, avis et compatibilité coureur.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.model}`,
    image: product.image,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    offers: bestPrice
      ? { "@type": "Offer", priceCurrency: "EUR", price: bestPrice, availability: "https://schema.org/InStock" }
      : { "@type": "Offer", priceCurrency: "EUR", price: product.prix },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={`https://runmatch.app/shoes/${product.id}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <RedirectDialog open={!!redirect} merchant={redirect?.merchant ?? ""} url={redirect?.url ?? ""} onConfirm={confirmRedirect} onCancel={() => setRedirect(null)} />

      {/* Nav */}
      <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center h-16 gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Retour">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Link to="/" className="font-black tracking-tighter">RUN<span className="text-gradient">MATCH</span></Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/shoes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Catalogue</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium truncate">{product.brand} {product.model}</span>
        </div>
      </div>

      <main className="pt-20 pb-16">
        <div className="container max-w-5xl space-y-12">
          {/* Hero */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-secondary rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
              <img src={product.image} alt={`${product.brand} ${product.model}`} className="w-full h-full object-contain p-8" loading="eager" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{product.brand}</p>
                <h1 className="text-4xl font-black tracking-tight mt-1">{product.model}</h1>
                <div className="flex items-baseline gap-3 mt-3">
                  <p className="text-3xl font-black text-gradient">{product.prix} €</p>
                  {bestPrice && bestPrice < product.prix && (
                    <span className="text-sm font-semibold text-primary">dès {bestPrice.toFixed(2)} €</span>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed text-lg">{product.description}</p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Poids", value: `${product.poids}g` },
                  { label: "Drop", value: `${product.drop}mm` },
                  { label: "Amorti", value: product.amorti },
                  { label: "Stabilité", value: product.stabilite },
                  { label: "Dynamisme", value: product.dynamisme },
                  { label: "Terrain", value: product.terrain.join(", ") },
                  { label: "Foulée", value: product.foulee.join(", ") },
                  { label: "Largeurs", value: product.largeurDisponible.join(", ") },
                ].map((spec) => (
                  <div key={spec.label} className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{spec.label}</p>
                    <p className="text-sm font-bold mt-1 capitalize">{spec.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="font-bold mb-3">Points forts</h2>
                <div className="space-y-2">
                  {product.benefits.map((b) => (
                    <div key={b} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full accent-gradient flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="hero" size="xl" className="w-full" onClick={() => {
                const best = offers.find((o) => o.available);
                if (best) handleBuy(best);
              }}>
                <ShoppingBag className="w-5 h-5" />
                {user ? `Meilleure offre — ${bestPrice?.toFixed(2) || product.prix} €` : "Se connecter pour acheter"}
              </Button>
            </motion.div>
          </div>

          {/* Technologies */}
          {techs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-black tracking-tight">Technologies expliquées</h2>
              </div>
              <div className="space-y-3">
                {techs.map((tech) => <TechCard key={tech.name} tech={tech} />)}
              </div>
            </section>
          )}

          {/* Compatibilité */}
          <section>
            <h2 className="text-2xl font-black tracking-tight mb-6">Compatibilité coureur</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Foulée", values: product.foulee },
                { label: "Terrain", values: product.terrain },
                { label: "Niveau", values: product.niveau },
                { label: "Objectif", values: product.objectif },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{item.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.values.map((v) => (
                      <span key={v} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">{v}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Comparateur */}
          {offers.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Tag className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-black tracking-tight">Comparateur de prix</h2>
              </div>
              <div className="space-y-3">
                {offers.map((offer, i) => (
                  <OfferRow key={offer.id} offer={offer} isBest={i === 0 && offer.available} onBuy={() => handleBuy(offer)} />
                ))}
              </div>
            </section>
          )}

          {/* Alternatives */}
          {related.length > 0 && (
            <section>
              <h2 className="text-2xl font-black tracking-tight mb-6">Chaussures alternatives</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map((p) => (
                  <Link key={p.id} to={`/shoes/${p.id}`} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-colors">
                    <div className="bg-secondary aspect-square flex items-center justify-center p-4">
                      <img src={p.image} alt={`${p.brand} ${p.model}`} className="w-full h-full object-contain group-hover:scale-105 transition-transform" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                      <p className="text-sm font-bold truncate">{p.model}</p>
                      <p className="text-sm font-black text-gradient mt-1">{p.prix} €</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="text-center py-8">
            <h2 className="text-xl font-bold mb-3">Pas sûr de votre choix ?</h2>
            <p className="text-muted-foreground mb-4">Faites notre questionnaire pour trouver la chaussure idéale pour votre profil.</p>
            <Button variant="hero" size="lg" onClick={() => navigate("/questionnaire")}>
              Trouver ma chaussure <ArrowRight className="w-4 h-4" />
            </Button>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2026 RunMatch</span>
          <div className="flex gap-4">
            <Link to="/shoes" className="hover:text-primary transition-colors">Catalogue</Link>
            <Link to="/confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShoeDetail;
