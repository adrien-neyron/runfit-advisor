import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, HelpCircle, X } from "lucide-react";
import { UserProfile } from "@/data/products";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionOption {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
}

interface Question {
  id: keyof UserProfile;
  title: string;
  subtitle: string;
  tooltip: string;
  options: QuestionOption[];
}

const questions: Question[] = [
  {
    id: "sexe",
    title: "Vous êtes ?",
    subtitle: "Pour adapter nos recommandations à votre morphologie",
    tooltip: "Le sexe influence la forme du pied, la biomécanique de la foulée et le type de chaussure recommandé (chaussant, amorti, stabilité).",
    options: [
      { value: "homme", label: "Homme", emoji: "🏃‍♂️" },
      { value: "femme", label: "Femme", emoji: "🏃‍♀️" },
    ],
  },
  {
    id: "foulee",
    title: "Quel est votre type de foulée ?",
    subtitle: "Élément clé pour la stabilité de votre chaussure",
    tooltip: "La foulée désigne la façon dont votre pied se pose au sol. Un pronateur roule vers l'intérieur, un supinateur vers l'extérieur, et un neutre reste centré. Si vous ne savez pas, choisissez « Neutre » ou consultez un podologue.",
    options: [
      { value: "pronateur", label: "Pronateur", emoji: "↙️", description: "Votre pied roule vers l'intérieur à l'impact" },
      { value: "neutre", label: "Neutre", emoji: "⬇️", description: "Votre pied reste centré — foulée universelle" },
      { value: "supinateur", label: "Supinateur", emoji: "↘️", description: "Votre pied roule vers l'extérieur à l'impact" },
    ],
  },
  {
    id: "niveau",
    title: "Votre niveau de pratique ?",
    subtitle: "Pour ajuster la technicité de la chaussure",
    tooltip: "Débutant : vous courez depuis moins d'un an ou moins de 2 fois/semaine. Intermédiaire : vous courez régulièrement 2-4 fois/semaine. Avancé : vous vous entraînez 4+ fois/semaine avec des objectifs de performance.",
    options: [
      { value: "débutant", label: "Débutant", emoji: "🌱", description: "Moins d'un an de course ou moins de 2 sorties/semaine" },
      { value: "intermédiaire", label: "Intermédiaire", emoji: "⚡", description: "Course régulière, 2 à 4 sorties/semaine" },
      { value: "avancé", label: "Avancé", emoji: "🔥", description: "Entraînement intensif, 4+ sorties/semaine" },
    ],
  },
  {
    id: "distance",
    title: "Quelle distance courez-vous habituellement ?",
    subtitle: "L'amorti et le poids de la chaussure varient selon la distance",
    tooltip: "Plus la distance est longue, plus vous avez besoin d'amorti et de confort. Pour des distances courtes, une chaussure légère et dynamique est préférable.",
    options: [
      { value: "5km", label: "5 km", emoji: "🏁", description: "Courses courtes et dynamiques" },
      { value: "10km", label: "10 km", emoji: "🏅", description: "Distance intermédiaire populaire" },
      { value: "semi", label: "Semi-marathon", emoji: "🥈", description: "21,1 km — bon compromis distance/vitesse" },
      { value: "marathon", label: "Marathon", emoji: "🥇", description: "42,195 km — amorti et confort essentiels" },
      { value: "ultra", label: "Ultra", emoji: "🏔️", description: "Au-delà du marathon — protection maximale" },
    ],
  },
  {
    id: "terrain",
    title: "Sur quel terrain courez-vous ?",
    subtitle: "La semelle est spécialement adaptée au terrain",
    tooltip: "Route : asphalte et surfaces dures, besoin d'amorti. Trail : sentiers, chemins avec dénivelé, besoin d'accroche. Mixte : vous alternez entre route et sentiers.",
    options: [
      { value: "route", label: "Route", emoji: "🛣️", description: "Asphalte, trottoirs, surfaces dures" },
      { value: "trail", label: "Trail", emoji: "🌲", description: "Sentiers, chemins, terrain accidenté" },
      { value: "mixte", label: "Mixte", emoji: "🔄", description: "Alternance route et sentiers" },
    ],
  },
  {
    id: "objectif",
    title: "Quel est votre objectif principal ?",
    subtitle: "Pour prioriser les caractéristiques de la chaussure",
    tooltip: "Performance : vous cherchez la vitesse et les records. Confort : vous priorisez le bien-être sur la distance. Prévention : vous voulez éviter les blessures et protéger vos articulations.",
    options: [
      { value: "performance", label: "Performance", emoji: "🚀", description: "Vitesse, réactivité et records personnels" },
      { value: "confort", label: "Confort", emoji: "☁️", description: "Bien-être et plaisir de courir" },
      { value: "prévention", label: "Prévention blessures", emoji: "🛡️", description: "Protéger vos articulations et tendons" },
    ],
  },
  {
    id: "largeurPied",
    title: "Largeur de votre pied ?",
    subtitle: "Pour un chaussant optimal sans point de compression",
    tooltip: "Un pied large dans une chaussure étroite peut causer des ampoules et des douleurs. Si vous hésitez, choisissez « Standard ». Si vos chaussures habituelles sont souvent trop serrées, optez pour « Large ».",
    options: [
      { value: "étroit", label: "Étroit", emoji: "◽", description: "Pied fin, peu de largeur au niveau des orteils" },
      { value: "standard", label: "Standard", emoji: "◻️", description: "Largeur classique — convient à la plupart" },
      { value: "large", label: "Large", emoji: "⬜", description: "Pied large, besoin d'espace aux orteils" },
    ],
  },
  {
    id: "blessures",
    title: "Avez-vous un historique de blessures ?",
    subtitle: "Pour adapter la stabilité et le soutien de la chaussure",
    tooltip: "Les blessures passées (tendinites, fasciite plantaire, douleurs aux genoux) influencent le choix de la chaussure. Une chaussure avec plus de stabilité et d'amorti peut aider à prévenir les récidives.",
    options: [
      { value: "oui", label: "Oui", emoji: "🩹", description: "J'ai déjà eu des blessures liées à la course" },
      { value: "non", label: "Non", emoji: "💪", description: "Pas de blessure significative" },
    ],
  },
  {
    id: "dropPreference",
    title: "Quelle préférence de drop ?",
    subtitle: "La différence de hauteur entre le talon et l'avant-pied",
    tooltip: "Le drop est mesuré en mm. Un drop élevé (10-12mm) favorise l'attaque talon et offre plus de protection. Un drop faible (0-6mm) favorise une foulée plus naturelle, médio-pied. Un drop moyen (7-9mm) est un bon compromis pour la plupart des coureurs.",
    options: [
      { value: "faible", label: "Drop faible (0-6mm)", emoji: "🦶", description: "Foulée naturelle, sensation proche du sol" },
      { value: "moyen", label: "Drop moyen (7-9mm)", emoji: "👟", description: "Compromis polyvalent, recommandé pour débuter" },
      { value: "élevé", label: "Drop élevé (10-12mm)", emoji: "🔝", description: "Amorti talon maximal, attaque classique" },
    ],
  },
  {
    id: "amortPreference",
    title: "Quel niveau d'amorti préférez-vous ?",
    subtitle: "Influence directement le confort et la réactivité",
    tooltip: "Amorti faible : sensation de route directe, plus de réactivité pour la vitesse. Amorti moyen : bon compromis entre confort et dynamisme. Amorti élevé : maximum de protection, idéal pour les longues distances ou la prévention.",
    options: [
      { value: "faible", label: "Faible", emoji: "⚡", description: "Réactif et proche du sol, pour la vitesse" },
      { value: "moyen", label: "Moyen", emoji: "⚖️", description: "Compromis confort et réactivité" },
      { value: "élevé", label: "Élevé", emoji: "☁️", description: "Maximum de confort et protection" },
    ],
  },
];

const Questionnaire = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserProfile>>({
    taille: 175,
    poids: 70,
  });
  const [showTooltip, setShowTooltip] = useState(false);

  const current = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleSelect = (value: string) => {
    const updated = { ...answers, [current.id]: value };
    setAnswers(updated);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      const profile: UserProfile = {
        sexe: (updated.sexe as string) || "homme",
        taille: updated.taille || 175,
        poids: updated.poids || 70,
        largeurPied: (updated.largeurPied as string) || "standard",
        foulee: (updated.foulee as string) || "neutre",
        niveau: (updated.niveau as string) || "débutant",
        distance: (updated.distance as string) || "10km",
        terrain: (updated.terrain as string) || "route",
        objectif: (updated.objectif as string) || "confort",
        blessures: (updated.blessures as string) || "non",
        dropPreference: (updated.dropPreference as string) || "moyen",
        amortPreference: (updated.amortPreference as string) || "moyen",
      };
      sessionStorage.setItem("runmatch-profile", JSON.stringify(profile));
      setTimeout(() => navigate("/resultats"), 400);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" role="main">
      {/* Header */}
      <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center h-16 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step > 0 ? setStep(step - 1) : navigate("/")}
            aria-label={step > 0 ? "Question précédente" : "Retour à l'accueil"}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label={`Question ${step + 1} sur ${questions.length}`}>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full accent-gradient rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <span className="text-sm text-muted-foreground font-medium" aria-hidden="true">
            {step + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center pt-20 pb-8 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  {current.title}
                </h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-full"
                      aria-label="Plus d'informations sur cette question"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-sm leading-relaxed">
                    {current.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-muted-foreground">{current.subtitle}</p>
            </div>

            {/* Mobile tooltip expand */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground leading-relaxed relative md:hidden"
                >
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                    aria-label="Fermer l'explication"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="pr-6">{current.tooltip}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-3" role="radiogroup" aria-label={current.title}>
              {current.options.map((option) => {
                const isSelected = answers[current.id] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(option.value)}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${option.label}${option.description ? ` — ${option.description}` : ""}`}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 bg-card"
                    }`}
                  >
                    <span className="text-2xl mt-0.5" aria-hidden="true">{option.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-lg font-semibold block">{option.label}</span>
                      {option.description && (
                        <span className="text-sm text-muted-foreground block mt-0.5">{option.description}</span>
                      )}
                    </div>
                    {isSelected && (
                      <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Questionnaire;
