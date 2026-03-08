import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { UserProfile } from "@/data/products";

interface Question {
  id: keyof UserProfile;
  title: string;
  subtitle: string;
  options: { value: string; label: string; emoji?: string }[];
}

const questions: Question[] = [
  {
    id: "sexe",
    title: "Vous êtes ?",
    subtitle: "Pour adapter nos recommandations",
    options: [
      { value: "homme", label: "Homme", emoji: "🏃‍♂️" },
      { value: "femme", label: "Femme", emoji: "🏃‍♀️" },
    ],
  },
  {
    id: "foulee",
    title: "Quel est votre type de foulée ?",
    subtitle: "Élément clé pour la stabilité de la chaussure",
    options: [
      { value: "pronateur", label: "Pronateur", emoji: "↙️" },
      { value: "neutre", label: "Neutre", emoji: "⬇️" },
      { value: "supinateur", label: "Supinateur", emoji: "↘️" },
    ],
  },
  {
    id: "niveau",
    title: "Votre niveau de pratique ?",
    subtitle: "Pour ajuster la technicité de la chaussure",
    options: [
      { value: "débutant", label: "Débutant", emoji: "🌱" },
      { value: "intermédiaire", label: "Intermédiaire", emoji: "⚡" },
      { value: "avancé", label: "Avancé", emoji: "🔥" },
    ],
  },
  {
    id: "distance",
    title: "Quelle distance courez-vous ?",
    subtitle: "L'amorti varie selon la distance",
    options: [
      { value: "5km", label: "5 km", emoji: "🏁" },
      { value: "10km", label: "10 km", emoji: "🏅" },
      { value: "semi", label: "Semi-marathon", emoji: "🥈" },
      { value: "marathon", label: "Marathon", emoji: "🥇" },
      { value: "ultra", label: "Ultra", emoji: "🏔️" },
    ],
  },
  {
    id: "terrain",
    title: "Sur quel terrain courez-vous ?",
    subtitle: "La semelle est adaptée au terrain",
    options: [
      { value: "route", label: "Route", emoji: "🛣️" },
      { value: "trail", label: "Trail", emoji: "🌲" },
      { value: "mixte", label: "Mixte", emoji: "🔄" },
    ],
  },
  {
    id: "objectif",
    title: "Quel est votre objectif principal ?",
    subtitle: "Pour prioriser les caractéristiques",
    options: [
      { value: "performance", label: "Performance", emoji: "🚀" },
      { value: "confort", label: "Confort", emoji: "☁️" },
      { value: "prévention", label: "Prévention blessures", emoji: "🛡️" },
    ],
  },
  {
    id: "largeurPied",
    title: "Largeur de votre pied ?",
    subtitle: "Pour le confort optimal",
    options: [
      { value: "étroit", label: "Étroit", emoji: "◽" },
      { value: "standard", label: "Standard", emoji: "◻️" },
      { value: "large", label: "Large", emoji: "⬜" },
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

  const current = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleSelect = (value: string) => {
    const updated = { ...answers, [current.id]: value };
    setAnswers(updated);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      // Navigate to results
      const profile: UserProfile = {
        sexe: updated.sexe || "homme",
        taille: updated.taille || 175,
        poids: updated.poids || 70,
        largeurPied: updated.largeurPied || "standard",
        foulee: updated.foulee || "neutre",
        niveau: updated.niveau || "débutant",
        distance: updated.distance || "10km",
        terrain: updated.terrain || "route",
        objectif: updated.objectif || "confort",
      };
      sessionStorage.setItem("runmatch-profile", JSON.stringify(profile));
      setTimeout(() => navigate("/resultats"), 400);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center h-16 gap-4">
          <Button variant="ghost" size="icon" onClick={() => step > 0 ? setStep(step - 1) : navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full accent-gradient rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <span className="text-sm text-muted-foreground font-medium">
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
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                {current.title}
              </h2>
              <p className="text-muted-foreground">{current.subtitle}</p>
            </div>

            <div className="grid gap-3">
              {current.options.map((option) => {
                const isSelected = answers[current.id] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(option.value)}
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 bg-card"
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-lg font-semibold">{option.label}</span>
                    {isSelected && (
                      <ArrowRight className="w-5 h-5 text-primary ml-auto" />
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
