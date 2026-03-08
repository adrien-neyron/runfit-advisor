export interface Technology {
  name: string;
  category: "amorti" | "plaque" | "stabilité" | "semelle" | "tige";
  description: string;
  benefit: string;
  detail: string;
}

export const technologies: Record<string, Technology> = {
  // Mousses d'amorti
  "React": {
    name: "Nike React",
    category: "amorti",
    description: "Mousse légère à retour d'énergie élevé développée par Nike.",
    benefit: "Rebond dynamique et amorti durable pour les longues distances.",
    detail: "Le React combine légèreté, réactivité et durabilité. Il absorbe l'énergie de l'impact et la restitue à chaque foulée, réduisant la fatigue musculaire.",
  },
  "ZoomX": {
    name: "Nike ZoomX",
    category: "amorti",
    description: "La mousse la plus légère et réactive de Nike, dérivée de l'aérospatiale.",
    benefit: "Retour d'énergie maximal (environ 85%) pour la compétition.",
    detail: "Initialement développée pour l'industrie aérospatiale, cette mousse PEBA offre le meilleur rapport légèreté/retour d'énergie du marché. Utilisée dans les chaussures de compétition.",
  },
  "Gel": {
    name: "Asics Gel",
    category: "amorti",
    description: "Technologie d'amorti à base de gel silicone intégrée au talon et à l'avant-pied.",
    benefit: "Absorption des chocs exceptionnelle, protège les articulations.",
    detail: "Le Gel Asics se déforme à l'impact pour absorber les vibrations puis reprend sa forme initiale. Il est placé stratégiquement aux zones de fort impact.",
  },
  "Fresh Foam": {
    name: "New Balance Fresh Foam",
    category: "amorti",
    description: "Mousse à cellules fermées offrant un amorti moelleux et un rebond naturel.",
    benefit: "Confort premium et transition fluide du talon aux orteils.",
    detail: "La version Fresh Foam X utilise des données de pression pour optimiser les zones d'amorti. Le résultat est une semelle qui s'adapte au mouvement naturel du pied.",
  },
  "DNA LOFT": {
    name: "Brooks DNA LOFT",
    category: "amorti",
    description: "Mousse ultra-moelleuse qui combine EVA, caoutchouc et air.",
    benefit: "Amorti doux et silencieux, idéal pour le confort quotidien.",
    detail: "DNA LOFT v2 est 10% plus léger que la version originale tout en conservant la même douceur. Il s'adapte à chaque coureur en se comprimant selon le poids et la vitesse.",
  },
  "CMEVA": {
    name: "Hoka CMEVA",
    category: "amorti",
    description: "Mousse EVA comprimée offrant un volume d'amorti maximal avec un poids contenu.",
    benefit: "Amorti maximal sans alourdir la chaussure.",
    detail: "Hoka est connu pour ses semelles volumineuses. La mousse CMEVA permet d'obtenir un stack height élevé (hauteur de semelle) tout en restant relativement légère.",
  },
  "PWRRUN PB": {
    name: "Saucony PWRRUN PB",
    category: "amorti",
    description: "Mousse PEBA ultra-légère et réactive de Saucony.",
    benefit: "Propulsion maximale pour les séances de vitesse.",
    detail: "Le PWRRUN PB est la mousse la plus performante de Saucony, offrant un retour d'énergie comparable au ZoomX de Nike mais avec sa propre signature de rebond.",
  },
  "ENERZY": {
    name: "Mizuno ENERZY",
    category: "amorti",
    description: "Mousse souple à haut rebond qui complète la plaque Wave Mizuno.",
    benefit: "Confort amélioré sans sacrifier la réactivité signature de Mizuno.",
    detail: "ENERZY est 17% plus souple que les mousses précédentes de Mizuno. Combinée avec la plaque Wave, elle crée un équilibre unique entre amorti et dynamisme.",
  },
  "Energy Surge": {
    name: "Salomon Energy Surge",
    category: "amorti",
    description: "Mousse légère à retour d'énergie élevé pour les longues distances trail.",
    benefit: "Confort prolongé sur ultra-distances avec rebond constant.",
    detail: "Développée pour les ultra-traileurs, cette mousse maintient ses propriétés d'amorti même après plusieurs heures de course sur terrain accidenté.",
  },

  // Plaques
  "Plaque carbone": {
    name: "Plaque carbone intégrale",
    category: "plaque",
    description: "Plaque rigide en fibre de carbone intégrée dans la semelle intermédiaire.",
    benefit: "Effet de levier qui propulse le pied vers l'avant, réduisant la dépense d'énergie.",
    detail: "La plaque carbone agit comme un ressort : elle se courbe sous le poids du coureur puis se relâche pour propulser le pied. Les études montrent un gain d'efficacité de 4% en moyenne. Réservée aux coureurs expérimentés.",
  },
  "Plaque nylon": {
    name: "Plaque nylon Speedroll",
    category: "plaque",
    description: "Plaque en nylon souple intégrée dans la semelle pour faciliter la transition.",
    benefit: "Propulsion douce et naturelle, plus accessible que le carbone.",
    detail: "Moins rigide que le carbone, la plaque nylon offre un effet de propulsion modéré. Elle guide le pied dans la transition talon-orteils sans forcer une mécanique non naturelle.",
  },
  "Wave": {
    name: "Mizuno Wave",
    category: "plaque",
    description: "Plaque ondulée en plastique qui disperse l'énergie de l'impact.",
    benefit: "Stabilité et transition fluide uniques à Mizuno.",
    detail: "La technologie Wave est la signature de Mizuno depuis 25 ans. La forme ondulée distribue les forces d'impact sur une surface plus large, offrant stabilité sans rigidité.",
  },

  // Stabilité
  "LITETRUSS": {
    name: "Asics LITETRUSS",
    category: "stabilité",
    description: "Renfort médial léger qui guide le pied sans le contraindre.",
    benefit: "Correction douce de la pronation, adaptée aux coureurs qui surpronent.",
    detail: "Contrairement aux anciens systèmes de contrôle du mouvement très rigides, le LITETRUSS guide la foulée de manière progressive et confortable.",
  },
  "ASICSGRIP": {
    name: "Asics ASICSGRIP",
    category: "semelle",
    description: "Gomme d'accroche haute performance pour les terrains techniques.",
    benefit: "Adhérence fiable sur surfaces humides, boueuses et rocheuses.",
    detail: "Le composé ASICSGRIP est conçu pour les conditions trail exigeantes. Les crampons multidirectionnels offrent traction en montée et en descente.",
  },

  // Semelles
  "Vibram Megagrip": {
    name: "Vibram Megagrip",
    category: "semelle",
    description: "Semelle extérieure Vibram haute adhérence pour tous les terrains.",
    benefit: "Accroche exceptionnelle sur roche, terre et boue.",
    detail: "Vibram est le leader mondial des semelles outdoor. Le composé Megagrip offre une adhérence maximale tout en restant durable. C'est la référence pour le trail technique.",
  },
  "Contagrip MA": {
    name: "Salomon Contagrip MA",
    category: "semelle",
    description: "Gomme Salomon multi-terrains avec crampons agressifs.",
    benefit: "Polyvalence trail avec bonne accroche sur terrains variés.",
    detail: "Le Contagrip MA (Multi Activity) est optimisé pour les terrains mixtes. Les crampons sont suffisamment profonds pour le trail tout en restant confortables sur route.",
  },

  // Tige
  "Hypoknit": {
    name: "New Balance Hypoknit",
    category: "tige",
    description: "Tige en maille technique offrant respirabilité et maintien ciblé.",
    benefit: "Pied au frais et bien maintenu, même sur longues distances.",
    detail: "Le Hypoknit combine des zones de maille ouverte pour la ventilation avec des zones plus denses pour le maintien. Le résultat est un upper qui respire sans se déformer.",
  },
};

// Map product benefits to technology keys
export const productTechMap: Record<string, string[]> = {
  "nike-pegasus-41": ["React"],
  "asics-gt-2000": ["Gel", "LITETRUSS"],
  "brooks-ghost-16": ["DNA LOFT"],
  "hoka-speedgoat-6": ["CMEVA", "Vibram Megagrip"],
  "salomon-ultra-glide": ["Energy Surge", "Contagrip MA"],
  "new-balance-fresh-foam": ["Fresh Foam", "Hypoknit"],
  "nike-vaporfly-3": ["ZoomX", "Plaque carbone"],
  "asics-gel-trabuco": ["Gel", "ASICSGRIP"],
  "saucony-endorphin-speed": ["PWRRUN PB", "Plaque nylon"],
  "mizuno-wave-rider": ["ENERZY", "Wave"],
};

export function getProductTechnologies(productId: string): Technology[] {
  const keys = productTechMap[productId] || [];
  return keys.map((k) => technologies[k]).filter(Boolean);
}
