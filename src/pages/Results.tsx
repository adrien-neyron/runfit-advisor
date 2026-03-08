import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Share2, RotateCcw } from "lucide-react";
import { UserProfile, Recommendation, getRecommendations } from "@/data/products";
import ScoreRing from "@/components/ScoreRing";

const Results = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("runmatch-profile");
    if (!stored) {
      navigate("/questionnaire");
      return;
    }
    const p = JSON.parse(stored) as UserProfile;
    setProfile(p);
    const recs = getRecommendations(p);
    setRecommendations(recs);
    setTimeout(() => setRevealed(true), 600);
  }, [navigate]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate("/questionnaire")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-black tracking-tighter">
            RUN<span className="text-gradient">MATCH</span>
          </span>
          <Button variant="ghost" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="pt-24 pb-16 container max-w-4xl">
        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
            Vos <span className="text-gradient">recommandations</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[
              { label: "Foulée", value: profile.foulee },
              { label: "Terrain", value: profile.terrain },
              { label: "Niveau", value: profile.niveau },
              { label: "Objectif", value: profile.objectif },
            ].map((tag) => (
              <span
                key={tag.label}
                className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
              >
                {tag.label}: {tag.value}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <div className="space-y-6">
          {recommendations.length === 0 && revealed && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                Aucune chaussure ne correspond parfaitement à votre profil.
              </p>
              <Button variant="hero" onClick={() => navigate("/questionnaire")}>
                <RotateCcw className="w-4 h-4" />
                Recommencer
              </Button>
            </div>
          )}

          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="bg-card rounded-2xl card-shadow overflow-hidden border border-border"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 relative overflow-hidden bg-secondary">
                  <img
                    src={rec.product.image}
                    alt={rec.product.model}
                    className="w-full h-56 md:h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {i === 0 && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full accent-gradient text-primary-foreground text-xs font-bold">
                      MEILLEUR MATCH
                    </div>
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

                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {rec.product.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {rec.reasons.map((reason) => (
                      <div key={reason} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full accent-gradient flex-shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-black">{rec.product.prix} €</span>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/produit/${rec.product.id}`)}
                      >
                        Détails
                      </Button>
                      <Button variant="hero">
                        <ShoppingBag className="w-4 h-4" />
                        Acheter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Restart */}
        <div className="text-center mt-12">
          <Button variant="ghost" onClick={() => navigate("/questionnaire")}>
            <RotateCcw className="w-4 h-4" />
            Refaire le questionnaire
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
