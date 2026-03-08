import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import heroShoe from "@/assets/hero-shoe.png";

const Landing = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <span className="text-xl font-black tracking-tighter">
            RUN<span className="text-gradient">MATCH</span>
          </span>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate("/connexion")}>
                <User className="w-4 h-4" />
                Connexion
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="container grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="w-3.5 h-3.5" />
              Recommandation IA personnalisée
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
              Trouvez la
              <br />
              <span className="text-gradient">chaussure</span>
              <br />
              parfaite.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Analysez votre profil de coureur et recevez une recommandation personnalisée en 2 minutes.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button variant="hero" size="xl" onClick={() => navigate("/questionnaire")}>
                Trouver ma chaussure
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="relative flex justify-center items-center"
          >
            <div className="absolute w-80 h-80 rounded-full bg-primary/20 blur-[100px]" />
            <img
              src={heroShoe}
              alt="Chaussure de running"
              className="relative z-10 w-full max-w-lg drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Comment ça marche</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Analysez", desc: "Répondez à notre questionnaire morphologique et sportif intelligent." },
              { icon: Zap, title: "Matchez", desc: "Notre algorithme analyse votre profil pour trouver la chaussure idéale." },
              { icon: Shield, title: "Courez", desc: "Recevez vos recommandations personnalisées et commandez en un clic." },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center space-y-4 p-8 rounded-2xl bg-background card-shadow"
              >
                <div className="w-14 h-14 mx-auto rounded-xl accent-gradient flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2026 RunMatch. Trouvez votre foulée.</span>
          <div className="flex gap-4">
            <a href="/confidentialite" className="hover:text-primary transition-colors underline-offset-4 hover:underline">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
