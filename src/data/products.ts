export interface Product {
  id: string;
  brand: string;
  model: string;
  foulee: ("pronateur" | "supinateur" | "neutre")[];
  terrain: ("route" | "trail" | "mixte")[];
  amorti: "faible" | "moyen" | "élevé";
  poids: number; // grams
  prix: number;
  image: string;
  description: string;
  benefits: string[];
  niveau: ("débutant" | "intermédiaire" | "avancé")[];
  objectif: ("performance" | "confort" | "prévention")[];
}

export const products: Product[] = [
  {
    id: "nike-pegasus-41",
    brand: "Nike",
    model: "Air Zoom Pegasus 41",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "moyen",
    poids: 272,
    prix: 139.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop",
    description: "La chaussure polyvalente par excellence. Le Pegasus 41 offre un amorti réactif pour vos courses quotidiennes.",
    benefits: ["Amorti React", "Polyvalence", "Durabilité", "Confort longue distance"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "performance"],
  },
  {
    id: "asics-gt-2000",
    brand: "Asics",
    model: "GT-2000 12",
    foulee: ["pronateur"],
    terrain: ["route"],
    amorti: "élevé",
    poids: 295,
    prix: 149.99,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=400&fit=crop",
    description: "Stabilité et confort pour les pronateurs. Le système de support guide votre foulée naturellement.",
    benefits: ["Support pronation", "Gel Cushioning", "Stabilité renforcée", "Respirabilité"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },
  {
    id: "brooks-ghost-16",
    brand: "Brooks",
    model: "Ghost 16",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "élevé",
    poids: 286,
    prix: 139.99,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=400&fit=crop",
    description: "Un amorti moelleux et une transition fluide pour un confort maximal kilomètre après kilomètre.",
    benefits: ["DNA LOFT v2", "Transition fluide", "Confort premium", "Amorti doux"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },
  {
    id: "hoka-speedgoat-6",
    brand: "Hoka",
    model: "Speedgoat 6",
    foulee: ["neutre", "supinateur"],
    terrain: ["trail"],
    amorti: "élevé",
    poids: 310,
    prix: 159.99,
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=400&fit=crop",
    description: "La référence trail. Accroche Vibram et amorti maximal pour dévorer les sentiers.",
    benefits: ["Semelle Vibram", "Amorti maximal", "Protection pierres", "Accroche tout-terrain"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance", "confort"],
  },
  {
    id: "salomon-ultra-glide",
    brand: "Salomon",
    model: "Ultra Glide 2",
    foulee: ["neutre"],
    terrain: ["trail", "mixte"],
    amorti: "moyen",
    poids: 280,
    prix: 149.99,
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&h=400&fit=crop",
    description: "Polyvalence trail avec un confort longue distance remarquable. Idéale pour ultra et longues sorties.",
    benefits: ["Contagrip MA", "Energy Surge", "Confort ultra-distance", "Légèreté"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance", "confort"],
  },
  {
    id: "new-balance-fresh-foam",
    brand: "New Balance",
    model: "Fresh Foam X 1080v13",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "élevé",
    poids: 298,
    prix: 159.99,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=400&fit=crop",
    description: "L'amorti ultime pour les supinateurs. Fresh Foam X offre un rebond et un confort exceptionnels.",
    benefits: ["Fresh Foam X", "Hypoknit", "Amorti premium", "Respirabilité maximale"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "prévention"],
  },
  {
    id: "nike-vaporfly-3",
    brand: "Nike",
    model: "ZoomX Vaporfly 3",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "moyen",
    poids: 186,
    prix: 259.99,
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=400&fit=crop",
    description: "La chaussure de compétition la plus rapide. Plaque carbone et mousse ZoomX pour des records.",
    benefits: ["Plaque carbone", "ZoomX Foam", "Ultra-légère", "Retour d'énergie maximal"],
    niveau: ["avancé"],
    objectif: ["performance"],
  },
  {
    id: "asics-gel-trabuco",
    brand: "Asics",
    model: "Gel-Trabuco 12",
    foulee: ["pronateur", "neutre"],
    terrain: ["trail"],
    amorti: "moyen",
    poids: 320,
    prix: 139.99,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=400&fit=crop",
    description: "Trail robuste avec stabilité. Parfaite pour les pronateurs qui veulent attaquer les sentiers.",
    benefits: ["ASICSGRIP", "Gel Technology", "Rock Protection", "Stabilité trail"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["prévention", "confort"],
  },
  {
    id: "saucony-endorphin-speed",
    brand: "Saucony",
    model: "Endorphin Speed 4",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "moyen",
    poids: 218,
    prix: 179.99,
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&h=400&fit=crop",
    description: "Vitesse et polyvalence. La plaque en nylon propulse chaque foulée pour des tempos explosifs.",
    benefits: ["PWRRUN PB", "Plaque nylon", "Speedroll", "Polyvalence tempo"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance"],
  },
  {
    id: "mizuno-wave-rider",
    brand: "Mizuno",
    model: "Wave Rider 28",
    foulee: ["neutre", "supinateur"],
    terrain: ["route", "mixte"],
    amorti: "moyen",
    poids: 275,
    prix: 144.99,
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&h=400&fit=crop",
    description: "Le confort dynamique par Mizuno. La plaque Wave offre stabilité et transition fluide.",
    benefits: ["Mizuno Wave", "ENERZY", "Transition fluide", "Confort dynamique"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },
];

export interface UserProfile {
  sexe: string;
  taille: number;
  poids: number;
  largeurPied: string;
  foulee: string;
  niveau: string;
  distance: string;
  terrain: string;
  objectif: string;
}

export interface Recommendation {
  product: Product;
  score: number;
  reasons: string[];
}

export function getRecommendations(profile: UserProfile): Recommendation[] {
  const scored = products.map((product) => {
    let score = 0;
    const reasons: string[] = [];

    // Foulée match (most important)
    if (product.foulee.includes(profile.foulee as any)) {
      score += 35;
      const fouleeLabel = profile.foulee === "pronateur" ? "stabilité" : profile.foulee === "supinateur" ? "amorti renforcé" : "universalité";
      reasons.push(`Adaptée à votre foulée ${profile.foulee} — ${fouleeLabel}`);
    }

    // Terrain match
    if (product.terrain.includes(profile.terrain as any)) {
      score += 25;
      reasons.push(`Conçue pour le ${profile.terrain}`);
    } else if (product.terrain.includes("mixte")) {
      score += 10;
      reasons.push("Polyvalente tous terrains");
    }

    // Niveau match
    if (product.niveau.includes(profile.niveau as any)) {
      score += 15;
      reasons.push(`Adaptée au niveau ${profile.niveau}`);
    }

    // Objectif match
    if (product.objectif.includes(profile.objectif as any)) {
      score += 15;
      reasons.push(`Optimisée pour : ${profile.objectif}`);
    }

    // Distance bonus
    if (
      (profile.distance === "marathon" || profile.distance === "ultra") &&
      product.amorti === "élevé"
    ) {
      score += 10;
      reasons.push("Amorti renforcé pour longues distances");
    }
    if (
      (profile.distance === "5km" || profile.distance === "10km") &&
      product.poids < 250
    ) {
      score += 10;
      reasons.push("Légèreté idéale pour les distances courtes");
    }

    return { product, score, reasons };
  });

  return scored
    .filter((r) => r.score > 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
