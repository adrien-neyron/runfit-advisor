import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Check } from "lucide-react";
import { products } from "@/data/products";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <Button onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="ml-4 font-bold">{product.brand} {product.model}</span>
        </div>
      </div>

      <div className="pt-20 pb-16">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-secondary rounded-2xl overflow-hidden aspect-square"
            >
              <img
                src={product.image}
                alt={product.model}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {product.brand}
                </p>
                <h1 className="text-4xl font-black tracking-tight mt-1">{product.model}</h1>
                <p className="text-3xl font-black text-gradient mt-3">{product.prix} €</p>
              </div>

              <p className="text-muted-foreground leading-relaxed text-lg">
                {product.description}
              </p>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Poids", value: `${product.poids}g` },
                  { label: "Amorti", value: product.amorti },
                  { label: "Terrain", value: product.terrain.join(", ") },
                  { label: "Foulée", value: product.foulee.join(", ") },
                ].map((spec) => (
                  <div key={spec.label} className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{spec.label}</p>
                    <p className="text-sm font-bold mt-1 capitalize">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div>
                <h3 className="font-bold mb-3">Points forts</h3>
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

              {/* CTA */}
              <Button variant="hero" size="xl" className="w-full">
                <ShoppingBag className="w-5 h-5" />
                Ajouter au panier — {product.prix} €
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
