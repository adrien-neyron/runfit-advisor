import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "runmatch-cookie-consent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleRefuse = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "refused");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4"
          role="dialog"
          aria-label="Consentement cookies"
        >
          <div className="container max-w-3xl">
            <div className="bg-card border border-border rounded-2xl p-6 card-shadow flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Cookie className="w-8 h-8 text-primary flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">Nous respectons votre vie privée</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  RunMatch utilise des cookies essentiels pour le fonctionnement du site. Aucune donnée n'est partagée avec des tiers.{" "}
                  <a href="/confidentialite" className="underline hover:text-primary transition-colors">
                    Politique de confidentialité
                  </a>
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={handleRefuse}>
                  Refuser
                </Button>
                <Button variant="hero" size="sm" onClick={handleAccept}>
                  Accepter
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
