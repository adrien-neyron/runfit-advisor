import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Share2, RotateCcw } from "lucide-react";
import { UserProfile, Recommendation, getRecommendations } from "@/data/products";
import { fetchMerchantOffers, trackOfferClick, MerchantOffer } from "@/data/merchants";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ScoreRing from "@/components/ScoreRing";
import RedirectDialog from "@/components/RedirectDialog";

const Results = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [bestOffers, setBestOffers] = useState<Record<string, MerchantOffer | null>>({});
  const [redirect, setRedirect] = useState<{ merchant: string; url: string; productId: string; model: string } | null>(null);

  const handleBuy = (productId: string, model: string) => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour accéder aux offres d'achat." });
      navigate("/connexion");
      return;
    }

    const offer = bestOffers[productId];
    if (!offer || !offer.available || !offer.affiliateUrl) {
      toast({
        title: "Offre indisponible",
        description: "Cette offre n’est plus disponible. Nous vous proposons d’autres marchands.",
      });
      return;
    }

    if (offer.urlStatus === "fallback") {
      toast({
        title: "Lien produit mis à jour",
        description: "La page exacte n'est plus disponible, redirection vers une recherche du modèle chez ce marchand.",
      });
    }

    setRedirect({ merchant: offer.merchant, url: offer.affiliateUrl, productId, model });
  };

  const confirmRedirect = () => {
    if (!redirect) return;
    trackOfferClick({
      userId: user?.id ?? null,
      productId: redirect.productId,
      retailerName: redirect.merchant,
      shoeModel: redirect.model,
    });
    window.open(redirect.url, "_blank", "noopener,noreferrer");
    setRedirect(null);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("runmatch-profile");
    if (!stored) { navigate("/questionnaire"); return; }
    const p = JSON.parse(stored) as UserProfile;
    setProfile(p);
    const recs = getRecommendations(p);
    setRecommendations(recs);
    setTimeout(() => setRevealed(true), 600);

    // Fetch best offer for each recommendation
    recs.forEach((rec) => {
      fetchMerchantOffers(rec.product.id).then((offers) => {
        const best = offers.find((o) => o.available) ?? null;
        setBestOffers((prev) => ({ ...prev, [rec.product.id]: best }));
      });
    });
  }, [navigate]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background" role="main">
      <RedirectDialog
        open={!!redirect}
        merchant={redirect?.merchant ?? ""}
        url={redirect?.url ?? ""}
        onConfirm={confirmRedirect}
        onCancel={() => setRedirect(null)}
      />

      {/* Nav */}
      <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate("/questionnaire")} aria-label="Retour au questionnaire">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-black tracking-tighter">RUN<span className="text-gradient">MATCH</span></span>
          <Button variant="ghost" size="icon" aria-label="Partager les résultats">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="pt-24 pb-16 container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
            Vos <span className="text-gradient">recommandations</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-2 mt-4" role="list" aria-label="Votre profil coureur">
            {[
              { label: "Foulée", value: profile.foulee },
              { label: "Terrain", value: profile.terrain },
              { label: "Niveau", value: profile.niveau },
              { label: "Objectif", value: profile.objectif },
              { label: "Drop", value: profile.dropPreference },
              { label: "Amorti", value: profile.amortPreference },
            ].map((tag) => (
              <span key={tag.label} role="listitem" className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                {tag.label}: {tag.value}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="space-y-6" role="list" aria-label="Chaussures recommandées">
          {recommendations.length === 0 && revealed && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">Aucune chaussure ne correspond parfaitement à votre profil.</p>
              <Button variant="hero" onClick={() => navigate("/questionnaire")}><RotateCcw className="w-4 h-4" />Recommencer</Button>
            </div>
          )}

          {recommendations.map((rec, i) => {
            const best = bestOffers[rec.product.id];
            return (
              <motion.article
                key={rec.product.id}
                role="listitem"
                initial={{ opacity: 0, y: 40 }}
                animate={revealed ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="bg-card rounded-2xl card-shadow overflow-hidden border border-border"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/5 relative overflow-hidden bg-secondary">
                    <img src={rec.product.image} alt={`${rec.product.brand} ${rec.product.model}`} className="w-full h-56 md:h-full object-contain p-4 hover:scale-105 transition-transform duration-500" loading="lazy" />
                    {i === 0 && (
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full accent-gradient text-primary-foreground text-xs font-bold">MEILLEUR MATCH</div>
                    )}
                  </div>

                  <div className="flex-1 p-6 md:p-8 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">{rec.product.brand}</p>
                        <h3 className="text-2xl font-black tracking-tight">{rec.product.model}</h3>
                      </div>
                      <ScoreRing score={rec.score} />
                    </div>

                    <p className="text-muted-foreground mb-4 leading-relaxed">{rec.product.description}</p>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: "Drop", value: `${rec.product.drop}mm` },
                        { label: "Poids", value: `${rec.product.poids}g` },
                        { label: "Amorti", value: rec.product.amorti },
                      ].map((spec) => (
                        <div key={spec.label} className="text-center p-2 rounded-lg bg-secondary">
                          <p className="text-xs text-muted-foreground">{spec.label}</p>
                          <p className="text-sm font-bold capitalize">{spec.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 mb-6">
                      {rec.reasons.map((reason) => (
                        <div key={reason} className="flex items-center gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full accent-gradient flex-shrink-0" aria-hidden="true" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black">{rec.product.prix} €</span>
                        {best && best.price < rec.product.prix && (
                          <span className="ml-2 text-sm font-semibold text-primary">dès {best.price.toFixed(2)} €</span>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => navigate(`/produit/${rec.product.id}`)}>Détails</Button>
                        <Button variant="hero" onClick={() => handleBuy(rec.product.id, `${rec.product.brand} ${rec.product.model}`)}>
                          <ShoppingBag className="w-4 h-4" />
                          {user ? "Voir l'offre" : "Se connecter"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button variant="ghost" onClick={() => navigate("/questionnaire")}><RotateCcw className="w-4 h-4" />Refaire le questionnaire</Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
