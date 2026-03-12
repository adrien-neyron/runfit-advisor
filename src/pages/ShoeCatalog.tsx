import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, X } from "lucide-react";
import { products } from "@/data/products";

const brands = [...new Set(products.map((p) => p.brand))].sort();
const terrains = ["route", "trail", "mixte"] as const;

const ShoeCatalog = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [terrainFilter, setTerrainFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !`${p.brand} ${p.model}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (brandFilter && p.brand !== brandFilter) return false;
      if (terrainFilter && !p.terrain.includes(terrainFilter as any)) return false;
      return true;
    });
  }, [search, brandFilter, terrainFilter]);

  const hasFilters = search || brandFilter || terrainFilter;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Catalogue Chaussures Running — Comparateur & Avis | RunMatch</title>
        <meta name="description" content="Découvrez notre catalogue de chaussures running : Nike, Asics, Hoka, Brooks, Saucony et plus. Comparez les prix, caractéristiques et trouvez la paire idéale." />
        <link rel="canonical" href="https://runmatch.app/shoes" />
      </Helmet>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-black tracking-tighter">
            RUN<span className="text-gradient">MATCH</span>
          </Link>
          <Button variant="hero" size="sm" onClick={() => navigate("/questionnaire")}>
            Trouver ma chaussure <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="pt-24 pb-16 container max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
            Catalogue <span className="text-gradient">Running</span>
          </h1>
          <p className="text-muted-foreground text-lg">{products.length} modèles analysés et comparés</p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Rechercher un modèle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setBrandFilter(brandFilter === b ? null : b)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${brandFilter === b ? "accent-gradient text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {b}
              </button>
            ))}
            <span className="w-px bg-border mx-1" />
            {terrains.map((t) => (
              <button
                key={t}
                onClick={() => setTerrainFilter(terrainFilter === t ? null : t)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${terrainFilter === t ? "accent-gradient text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {t}
              </button>
            ))}
            {hasFilters && (
              <button onClick={() => { setSearch(""); setBrandFilter(null); setTerrainFilter(null); }} className="px-3 py-1.5 rounded-full text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1">
                <X className="w-3 h-3" /> Effacer
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <Link to={`/shoes/${p.id}`} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-colors block">
                <div className="bg-secondary aspect-square flex items-center justify-center p-4">
                  <img src={p.image} alt={`${p.brand} ${p.model}`} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                  <p className="text-sm font-bold truncate">{p.model}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-gradient">{p.prix} €</p>
                    <div className="flex gap-1">
                      {p.terrain.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground capitalize">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Aucun modèle ne correspond à vos filtres.</p>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-border">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2026 RunMatch</span>
          <div className="flex gap-4">
            <Link to="/confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShoeCatalog;
