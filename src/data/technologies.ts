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
    detail: "Initialement développée pour l'industrie aérospatiale, cette mousse PEBA offre le meilleur rapport légèreté/retour d'énergie du marché.",
  },
  "Gel": {
    name: "Asics Gel",
    category: "amorti",
    description: "Technologie d'amorti à base de gel silicone intégrée au talon et à l'avant-pied.",
    benefit: "Absorption des chocs exceptionnelle, protège les articulations.",
    detail: "Le Gel Asics se déforme à l'impact pour absorber les vibrations puis reprend sa forme initiale.",
  },
  "Fresh Foam": {
    name: "New Balance Fresh Foam",
    category: "amorti",
    description: "Mousse à cellules fermées offrant un amorti moelleux et un rebond naturel.",
    benefit: "Confort premium et transition fluide du talon aux orteils.",
    detail: "La version Fresh Foam X utilise des données de pression pour optimiser les zones d'amorti.",
  },
  "DNA LOFT": {
    name: "Brooks DNA LOFT",
    category: "amorti",
    description: "Mousse ultra-moelleuse qui combine EVA, caoutchouc et air.",
    benefit: "Amorti doux et silencieux, idéal pour le confort quotidien.",
    detail: "DNA LOFT v2 est 10% plus léger que la version originale tout en conservant la même douceur.",
  },
  "CMEVA": {
    name: "Hoka CMEVA",
    category: "amorti",
    description: "Mousse EVA comprimée offrant un volume d'amorti maximal avec un poids contenu.",
    benefit: "Amorti maximal sans alourdir la chaussure.",
    detail: "Hoka est connu pour ses semelles volumineuses. La mousse CMEVA permet un stack height élevé tout en restant légère.",
  },
  "PWRRUN PB": {
    name: "Saucony PWRRUN PB",
    category: "amorti",
    description: "Mousse PEBA ultra-légère et réactive de Saucony.",
    benefit: "Propulsion maximale pour les séances de vitesse.",
    detail: "Le PWRRUN PB offre un retour d'énergie comparable au ZoomX de Nike mais avec sa propre signature de rebond.",
  },
  "PWRRUN+": {
    name: "Saucony PWRRUN+",
    category: "amorti",
    description: "Mousse TPU souple et réactive pour le confort quotidien.",
    benefit: "Amorti réactif et durable pour les entraînements quotidiens.",
    detail: "Mousse intermédiaire chez Saucony, moins premium que le PB mais excellente pour le quotidien.",
  },
  "ENERZY": {
    name: "Mizuno ENERZY",
    category: "amorti",
    description: "Mousse souple à haut rebond qui complète la plaque Wave Mizuno.",
    benefit: "Confort amélioré sans sacrifier la réactivité signature de Mizuno.",
    detail: "ENERZY est 17% plus souple que les mousses précédentes de Mizuno.",
  },
  "Energy Surge": {
    name: "Salomon Energy Surge",
    category: "amorti",
    description: "Mousse légère à retour d'énergie élevé pour les longues distances trail.",
    benefit: "Confort prolongé sur ultra-distances avec rebond constant.",
    detail: "Développée pour les ultra-traileurs, cette mousse maintient ses propriétés même après plusieurs heures.",
  },
  "FF BLAST PLUS": {
    name: "Asics FF BLAST PLUS",
    category: "amorti",
    description: "Mousse FlyteFoam Blast Plus ultra-réactive et légère.",
    benefit: "Rebond explosif et amorti moelleux combinés.",
    detail: "La dernière génération de mousse Asics, 20% plus légère que les versions précédentes.",
  },
  "CloudTec": {
    name: "On CloudTec",
    category: "amorti",
    description: "Système de pods creux qui se compriment individuellement à l'impact.",
    benefit: "Atterrissage doux et décollage explosif grâce à la Speedboard.",
    detail: "La technologie signature d'On utilise des éléments Cloud individuels pour un amorti ciblé et un rebond propulsif.",
  },
  "BOOST": {
    name: "Adidas BOOST",
    category: "amorti",
    description: "Mousse TPU expansé offrant un retour d'énergie élevé et constant.",
    benefit: "Retour d'énergie constant quel que soit la température ou l'usure.",
    detail: "Développée avec BASF, la mousse BOOST garde ses propriétés dans toutes les conditions climatiques.",
  },
  "Lightstrike PRO": {
    name: "Adidas Lightstrike PRO",
    category: "amorti",
    description: "Mousse ultra-légère et réactive de compétition Adidas.",
    benefit: "Performance maximale pour le tempo et la compétition.",
    detail: "La mousse la plus performante d'Adidas, utilisée dans la gamme Adizero.",
  },
  "Quantic": {
    name: "Altra Quantic",
    category: "amorti",
    description: "Mousse légère et responsive pour le confort quotidien.",
    benefit: "Amorti équilibré dans un format zero-drop.",
    detail: "Mousse développée par Altra pour offrir un amorti fiable sans compromettre la sensation de contact au sol.",
  },
  "PROFLY+": {
    name: "Hoka PROFLY+",
    category: "amorti",
    description: "Mousse bi-densité avec talon souple et avant-pied ferme.",
    benefit: "Atterrissage doux au talon, propulsion ferme à l'avant-pied.",
    detail: "La double densité crée une transition naturelle de l'atterrissage au décollage.",
  },
  "FuelCell": {
    name: "New Balance FuelCell",
    category: "amorti",
    description: "Mousse à base d'azote pour un rebond explosif.",
    benefit: "Propulsion maximale pour les séances rapides.",
    detail: "FuelCell injecte de l'azote dans la mousse pour créer un retour d'énergie supérieur.",
  },

  // Plaques
  "Plaque carbone": {
    name: "Plaque carbone intégrale",
    category: "plaque",
    description: "Plaque rigide en fibre de carbone intégrée dans la semelle intermédiaire.",
    benefit: "Effet de levier qui propulse le pied vers l'avant, réduisant la dépense d'énergie.",
    detail: "La plaque carbone agit comme un ressort. Les études montrent un gain d'efficacité de 4% en moyenne.",
  },
  "Plaque nylon": {
    name: "Plaque nylon Speedroll",
    category: "plaque",
    description: "Plaque en nylon souple pour faciliter la transition.",
    benefit: "Propulsion douce et naturelle, plus accessible que le carbone.",
    detail: "Moins rigide que le carbone, la plaque nylon guide le pied dans la transition talon-orteils.",
  },
  "Wave": {
    name: "Mizuno Wave",
    category: "plaque",
    description: "Plaque ondulée en plastique qui disperse l'énergie de l'impact.",
    benefit: "Stabilité et transition fluide uniques à Mizuno.",
    detail: "La technologie Wave est la signature de Mizuno depuis 25 ans.",
  },
  "Speedboard": {
    name: "On Speedboard",
    category: "plaque",
    description: "Plaque rigide intégrée entre les Cloud pods et la semelle.",
    benefit: "Convertit l'énergie d'atterrissage en propulsion vers l'avant.",
    detail: "La Speedboard fonctionne en synergie avec les pods CloudTec pour un effet catapulte unique.",
  },
  "EnergyRods": {
    name: "Adidas EnergyRods",
    category: "plaque",
    description: "Tiges en fibre de carbone intégrées dans la semelle pour la propulsion.",
    benefit: "Guidage rigide et retour d'énergie sur toute la longueur du pied.",
    detail: "Les EnergyRods 2.0 remplacent la plaque carbone unique par un système multi-tiges pour plus de flexibilité naturelle.",
  },

  // Stabilité
  "LITETRUSS": {
    name: "Asics LITETRUSS",
    category: "stabilité",
    description: "Renfort médial léger qui guide le pied sans le contraindre.",
    benefit: "Correction douce de la pronation.",
    detail: "Le LITETRUSS guide la foulée de manière progressive et confortable.",
  },
  "GuideRails": {
    name: "Brooks GuideRails",
    category: "stabilité",
    description: "Système de stabilité holistique qui guide le pied naturellement.",
    benefit: "Correction de la pronation sans rigidité, s'adapte à chaque coureur.",
    detail: "Contrairement aux systèmes medial post traditionnels, GuideRails guide le mouvement global du pied.",
  },
  "Medial Post": {
    name: "New Balance Medial Post",
    category: "stabilité",
    description: "Renfort de densité plus élevée sur le côté intérieur de la semelle.",
    benefit: "Correction de la surpronation fiable et éprouvée.",
    detail: "Technologie classique de stabilité, efficace pour les pronateurs modérés.",
  },
  "Crash Rail": {
    name: "Nike Crash Rail",
    category: "stabilité",
    description: "Système de guidage intégré à la semelle extérieure.",
    benefit: "Transition fluide du talon aux orteils avec support latéral.",
    detail: "Le Crash Rail guide la foulée naturellement sans forcer une correction excessive.",
  },

  // Semelles
  "ASICSGRIP": {
    name: "Asics ASICSGRIP",
    category: "semelle",
    description: "Gomme d'accroche haute performance pour les terrains techniques.",
    benefit: "Adhérence fiable sur surfaces humides, boueuses et rocheuses.",
    detail: "Le composé ASICSGRIP est conçu pour les conditions trail exigeantes.",
  },
  "Vibram Megagrip": {
    name: "Vibram Megagrip",
    category: "semelle",
    description: "Semelle extérieure Vibram haute adhérence pour tous les terrains.",
    benefit: "Accroche exceptionnelle sur roche, terre et boue.",
    detail: "Vibram est le leader mondial des semelles outdoor.",
  },
  "Contagrip MA": {
    name: "Salomon Contagrip MA",
    category: "semelle",
    description: "Gomme Salomon multi-terrains avec crampons agressifs.",
    benefit: "Polyvalence trail avec bonne accroche sur terrains variés.",
    detail: "Le Contagrip MA est optimisé pour les terrains mixtes.",
  },
  "Contagrip Premium": {
    name: "Salomon Contagrip Premium",
    category: "semelle",
    description: "Gomme Salomon haute densité avec crampons profonds pour boue.",
    benefit: "Accroche maximale sur terrains meubles et boueux.",
    detail: "Les crampons de 6mm offrent une traction agressive dans la boue profonde.",
  },
  "Continental": {
    name: "Continental Rubber",
    category: "semelle",
    description: "Gomme développée par Continental (pneus) pour Adidas.",
    benefit: "Adhérence exceptionnelle sur surfaces mouillées et sèches.",
    detail: "Le même savoir-faire que les pneus de voiture appliqué aux chaussures de course.",
  },
  "PWRTRAC": {
    name: "Saucony PWRTRAC",
    category: "semelle",
    description: "Gomme trail haute adhérence de Saucony.",
    benefit: "Accroche fiable sur terrains techniques et variés.",
    detail: "PWRTRAC offre une excellente durabilité tout en maintenant une bonne adhérence.",
  },
  "MaxTrac": {
    name: "Altra MaxTrac",
    category: "semelle",
    description: "Gomme trail collante pour une adhérence maximale.",
    benefit: "Contact au sol optimal avec le zero drop.",
    detail: "MaxTrac est conçu pour fonctionner avec la géométrie zero-drop d'Altra.",
  },

  // Tige
  "Hypoknit": {
    name: "New Balance Hypoknit",
    category: "tige",
    description: "Tige en maille technique offrant respirabilité et maintien ciblé.",
    benefit: "Pied au frais et bien maintenu, même sur longues distances.",
    detail: "Le Hypoknit combine zones de ventilation et zones de maintien.",
  },
  "Primeknit": {
    name: "Adidas Primeknit+",
    category: "tige",
    description: "Tige tricotée une pièce épousant la forme du pied.",
    benefit: "Maintien précis et respirabilité optimale.",
    detail: "Le Primeknit+ utilise différentes densités de tricot pour un maintien adaptatif.",
  },
  "Flyknit": {
    name: "Nike Flyknit",
    category: "tige",
    description: "Tige tricotée légère et respirante de Nike.",
    benefit: "Légèreté et respirabilité maximales.",
    detail: "Flyknit réduit les déchets de fabrication tout en offrant un ajustement précis.",
  },
  "FootShape": {
    name: "Altra FootShape",
    category: "tige",
    description: "Toe box large permettant aux orteils de s'étaler naturellement.",
    benefit: "Orteils libres pour un meilleur équilibre et une poussée naturelle.",
    detail: "La forme FootShape respecte l'anatomie naturelle du pied, contrairement aux chaussures pointues.",
  },
};

export const productTechMap: Record<string, string[]> = {
  "nike-pegasus-41": ["React"],
  "nike-vaporfly-3": ["ZoomX", "Plaque carbone"],
  "nike-invincible-3": ["ZoomX", "Flyknit"],
  "nike-structure-25": ["React", "Crash Rail"],
  "asics-gt-2000": ["Gel", "LITETRUSS"],
  "asics-gel-trabuco": ["Gel", "ASICSGRIP"],
  "asics-nimbus-26": ["FF BLAST PLUS", "Gel"],
  "asics-novablast-4": ["FF BLAST PLUS"],
  "brooks-ghost-16": ["DNA LOFT"],
  "brooks-adrenaline-gts-24": ["DNA LOFT", "GuideRails"],
  "brooks-glycerin-21": ["DNA LOFT"],
  "hoka-speedgoat-6": ["CMEVA", "Vibram Megagrip"],
  "hoka-clifton-9": ["CMEVA"],
  "hoka-bondi-8": ["CMEVA"],
  "hoka-mach-6": ["PROFLY+"],
  "saucony-endorphin-speed": ["PWRRUN PB", "Plaque nylon"],
  "saucony-ride-17": ["PWRRUN+"],
  "saucony-triumph-22": ["PWRRUN PB"],
  "saucony-peregrine-14": ["PWRTRAC"],
  "salomon-ultra-glide": ["Energy Surge", "Contagrip MA"],
  "salomon-speedcross-6": ["Contagrip Premium"],
  "salomon-aero-glide": ["Energy Surge"],
  "new-balance-fresh-foam": ["Fresh Foam", "Hypoknit"],
  "new-balance-fuelcell-rebel-4": ["FuelCell"],
  "new-balance-860-v14": ["Fresh Foam", "Medial Post"],
  "mizuno-wave-rider": ["ENERZY", "Wave"],
  "mizuno-wave-sky-7": ["ENERZY", "Wave"],
  "on-cloudmonster-2": ["CloudTec", "Speedboard"],
  "on-cloudsurfer-7": ["CloudTec"],
  "adidas-ultraboost-light": ["BOOST", "Primeknit", "Continental"],
  "adidas-adizero-boston-12": ["Lightstrike PRO", "EnergyRods"],
  "adidas-terrex-agravic-ultra": ["Lightstrike PRO", "Continental"],
  "altra-torin-7": ["Quantic", "FootShape"],
  "altra-lone-peak-8": ["Quantic", "MaxTrac", "FootShape"],
};

export function getProductTechnologies(productId: string): Technology[] {
  const keys = productTechMap[productId] || [];
  return keys.map((k) => technologies[k]).filter(Boolean);
}
