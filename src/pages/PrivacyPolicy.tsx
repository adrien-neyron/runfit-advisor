import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Retour">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="ml-4 font-black tracking-tighter">
            RUN<span className="text-gradient">MATCH</span>
          </span>
        </div>
      </div>

      <div className="pt-24 pb-16 container max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-8">
          Politique de confidentialité
        </h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-bold text-foreground">1. Données collectées</h2>
            <p>
              RunMatch collecte uniquement les données nécessaires à la recommandation de chaussures :
              profil morphologique (taille, poids, sexe, largeur du pied), profil sportif (foulée, niveau, distance, terrain, objectif)
              et préférences techniques (drop, amorti, historique de blessures).
            </p>
            <p>
              <strong>Minimisation des données :</strong> Nous ne collectons aucune donnée qui ne soit pas directement liée à la recommandation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">2. Utilisation des données</h2>
            <p>
              Vos données sont utilisées exclusivement pour générer des recommandations personnalisées de chaussures de running.
              Aucune donnée n'est vendue ni partagée avec des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">3. Stockage et sécurité</h2>
            <p>
              Les données du questionnaire sont stockées localement dans votre navigateur (sessionStorage) et sur nos serveurs sécurisés
              si vous créez un compte. Les données sont chiffrées en transit et au repos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">4. Vos droits (RGPD)</h2>
            <p>Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Droit d'accès :</strong> Consulter toutes vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> Modifier vos informations</li>
              <li><strong>Droit à l'effacement :</strong> Supprimer votre compte et toutes vos données</li>
              <li><strong>Droit à la portabilité :</strong> Exporter vos données dans un format lisible</li>
              <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">5. Cookies</h2>
            <p>
              RunMatch utilise uniquement des cookies essentiels au fonctionnement du site (préférences de consentement).
              Aucun cookie de tracking ou publicitaire n'est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">6. Suppression de compte</h2>
            <p>
              Vous pouvez supprimer votre compte et toutes les données associées à tout moment depuis les paramètres de votre profil.
              La suppression est définitive et irréversible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">7. Contact</h2>
            <p>
              Pour toute question relative à la protection de vos données, vous pouvez nous contacter à :
              <strong> privacy@runmatch.app</strong>
            </p>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            Dernière mise à jour : Mars 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
