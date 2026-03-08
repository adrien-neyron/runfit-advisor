export interface Product {
  id: string;
  brand: string;
  model: string;
  foulee: ("pronateur" | "supinateur" | "neutre")[];
  terrain: ("route" | "trail" | "mixte")[];
  amorti: "faible" | "moyen" | "élevé";
  drop: number; // mm
  stabilite: "faible" | "moyenne" | "élevée";
  dynamisme: "faible" | "moyen" | "élevé";
  largeurDisponible: ("étroit" | "standard" | "large")[];
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
    drop: 10,
    stabilite: "moyenne",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 272,
    prix: 139.99,
    image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/0868a654-c3e9-4342-a64a-5b45df7a8ad8/NIKE+PEGASUS+41.png",
    description: "La chaussure polyvalente par excellence. Le Pegasus 41 offre un amorti React réactif pour vos courses quotidiennes, du fractionné au footing long.",
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
    drop: 8,
    stabilite: "élevée",
    dynamisme: "moyen",
    largeurDisponible: ["étroit", "standard", "large"],
    poids: 295,
    prix: 149.99,
    image: "https://images.asics.com/is/image/asics/1011B691_005_SR_RT_GLB?$sfPDP$",
    description: "Stabilité et confort pour les pronateurs. Le système de support LITETRUSS guide votre foulée naturellement sur de longues distances.",
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
    drop: 12,
    stabilite: "moyenne",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 286,
    prix: 139.99,
    image: "https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw1e8c5a92/images/110418/110418_071_l_Ghost16.png",
    description: "Un amorti moelleux DNA LOFT v2 et une transition fluide pour un confort maximal kilomètre après kilomètre.",
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
    drop: 4,
    stabilite: "moyenne",
    dynamisme: "élevé",
    largeurDisponible: ["standard", "large"],
    poids: 310,
    prix: 159.99,
    image: "https://img.therunningcollective.fr/hoka-one-one-speedgoat-6-m-1160x725-DF6EC0.webp",
    description: "La référence trail. Semelle Vibram Megagrip et amorti maximal CMEVA pour dévorer tous les sentiers techniques.",
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
    drop: 6,
    stabilite: "moyenne",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 280,
    prix: 149.99,
    image: "https://img.therunningcollective.fr/salomon-ultra-glide-2-m-1160x725-780B72.webp",
    description: "Polyvalence trail avec un confort longue distance remarquable grâce à la mousse Energy Surge. Idéale pour ultra et longues sorties.",
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
    drop: 6,
    stabilite: "faible",
    dynamisme: "moyen",
    largeurDisponible: ["étroit", "standard", "large"],
    poids: 298,
    prix: 159.99,
    image: "https://nb.scene7.com/is/image/NB/m1080v13_nb_02_i?$pdpflexF2$&qlt=80&fmt=webp&wid=440&hei=440",
    description: "L'amorti ultime pour les supinateurs. Fresh Foam X offre un rebond naturel et un confort exceptionnels avec un upper Hypoknit respirant.",
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
    drop: 8,
    stabilite: "faible",
    dynamisme: "élevé",
    largeurDisponible: ["étroit", "standard"],
    poids: 186,
    prix: 259.99,
    image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b1bcddbe-3024-4e5d-b756-fbb1e4763a2b/NIKE+ZOOMX+VAPORFLY+NEXT%25+3.png",
    description: "La chaussure de compétition la plus rapide. Plaque carbone intégrale et mousse ZoomX pour des records personnels.",
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
    drop: 8,
    stabilite: "élevée",
    dynamisme: "moyen",
    largeurDisponible: ["standard"],
    poids: 320,
    prix: 139.99,
    image: "https://images.asics.com/is/image/asics/1011B799_002_SR_RT_GLB?$sfPDP$",
    description: "Trail robuste avec stabilité ASICSGRIP. Parfaite pour les pronateurs qui veulent attaquer les sentiers techniques en toute confiance.",
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
    drop: 8,
    stabilite: "faible",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 218,
    prix: 179.99,
    image: "https://img.therunningcollective.fr/saucony-endorphin-speed-4-m-1160x725-9A3E30.webp",
    description: "Vitesse et polyvalence. La plaque en nylon SPEEDROLL propulse chaque foulée pour des tempos explosifs et des courses rapides.",
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
    drop: 12,
    stabilite: "moyenne",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 275,
    prix: 144.99,
    image: "https://img.therunningcollective.fr/mizuno-wave-rider-28-m-1160x725-0A0101.webp",
    description: "Le confort dynamique par Mizuno. La plaque Wave ENERZY offre stabilité, transition fluide et un excellent retour d'énergie.",
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
  blessures: string;
  dropPreference: string;
  amortPreference: string;
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
      score += 30;
      const fouleeLabel = profile.foulee === "pronateur" ? "stabilité" : profile.foulee === "supinateur" ? "amorti renforcé" : "universalité";
      reasons.push(`Adaptée à votre foulée ${profile.foulee} — ${fouleeLabel}`);
    }

    // Terrain match
    if (product.terrain.includes(profile.terrain as any)) {
      score += 20;
      reasons.push(`Conçue pour le ${profile.terrain}`);
    } else if (product.terrain.includes("mixte")) {
      score += 8;
      reasons.push("Polyvalente tous terrains");
    }

    // Niveau match
    if (product.niveau.includes(profile.niveau as any)) {
      score += 12;
      reasons.push(`Adaptée au niveau ${profile.niveau}`);
    }

    // Objectif match
    if (product.objectif.includes(profile.objectif as any)) {
      score += 12;
      reasons.push(`Optimisée pour : ${profile.objectif}`);
    }

    // Largeur pied match
    if (product.largeurDisponible.includes(profile.largeurPied as any)) {
      score += 8;
      reasons.push(`Disponible en largeur ${profile.largeurPied}`);
    }

    // Drop preference
    if (profile.dropPreference === "faible" && product.drop <= 6) {
      score += 8;
      reasons.push(`Drop faible (${product.drop}mm) — foulée naturelle`);
    } else if (profile.dropPreference === "élevé" && product.drop >= 10) {
      score += 8;
      reasons.push(`Drop élevé (${product.drop}mm) — amorti talon`);
    } else if (profile.dropPreference === "moyen" && product.drop > 6 && product.drop < 10) {
      score += 8;
      reasons.push(`Drop moyen (${product.drop}mm) — polyvalent`);
    }

    // Amorti preference
    if (profile.amortPreference && product.amorti === profile.amortPreference) {
      score += 8;
      reasons.push(`Niveau d'amorti ${product.amorti} correspondant`);
    }

    // Blessures → prévention bonus
    if (profile.blessures === "oui" && product.objectif.includes("prévention")) {
      score += 10;
      reasons.push("Recommandée pour la prévention des blessures");
    }
    if (profile.blessures === "oui" && product.stabilite === "élevée") {
      score += 5;
      reasons.push("Stabilité renforcée pour protéger vos articulations");
    }

    // Distance bonus
    if (
      (profile.distance === "marathon" || profile.distance === "ultra") &&
      product.amorti === "élevé"
    ) {
      score += 8;
      reasons.push("Amorti renforcé pour longues distances");
    }
    if (
      (profile.distance === "5km" || profile.distance === "10km") &&
      product.poids < 250
    ) {
      score += 8;
      reasons.push("Légèreté idéale pour les distances courtes");
    }

    return { product, score, reasons };
  });

  return scored
    .filter((r) => r.score > 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
