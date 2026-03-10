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
    image: "https://img.therunningcollective.fr/hoka-one-one-speedgoat-6-m-1160x725-CFDR.webp",
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

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTE – AMORTI MAXIMAL
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "hoka-clifton-9",
    brand: "Hoka",
    model: "Clifton 9",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 5,
    stabilite: "moyenne",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 247,
    prix: 149.99,
    image: "https://img.therunningcollective.fr/hoka-one-one-clifton-9-m-1160x725-BCAN.webp",
    description: "L'amorti légendaire Hoka en version ultra-légère. La Clifton 9 offre un confort exceptionnel kilomètre après kilomètre avec sa mousse EVA haute-densité réformulée.",
    benefits: ["Mousse EVA ultra-légère", "Rocker geometry", "Confort premium", "Absorption des chocs"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },
  {
    id: "hoka-bondi-8",
    brand: "Hoka",
    model: "Bondi 8",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 4,
    stabilite: "faible",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 298,
    prix: 169.99,
    image: "https://img.therunningcollective.fr/hoka-one-one-bondi-8-m-1160x725-BWHT.webp",
    description: "L'amorti maximal Hoka pour les runners cherchant le confort absolu. La Bondi 8 absorbe tous les chocs pour protéger vos articulations sur de longues distances.",
    benefits: ["Amorti maximal", "Rocker geometry", "Protection articulations", "Confort ultra-distance"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },
  {
    id: "asics-gel-nimbus-26",
    brand: "Asics",
    model: "Gel-Nimbus 26",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 8,
    stabilite: "faible",
    dynamisme: "moyen",
    largeurDisponible: ["étroit", "standard", "large"],
    poids: 295,
    prix: 179.99,
    image: "https://images.asics.com/is/image/asics/1011B794_001_SR_RT_GLB?$sfPDP$",
    description: "Le fleuron du confort Asics. La Gel-Nimbus 26 associe gel multicouche et mousse FF BLAST+ pour une expérience de course ultra-confortable sur toutes distances.",
    benefits: ["FF BLAST+ Foam", "Gel multicouche", "Engineered Knit", "Amorti premium"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },
  {
    id: "brooks-glycerin-21",
    brand: "Brooks",
    model: "Glycerin 21",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 10,
    stabilite: "faible",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 285,
    prix: 149.99,
    image: "https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw5c4b4e97/images/110412/110412_012_l_Glycerin21.png",
    description: "La douceur à l'état pur. La mousse DNA LOFT v3 de la Glycerin 21 offre un amorti luxueux et une transition heel-to-toe parfaitement fluide.",
    benefits: ["DNA LOFT v3", "Transition ultra-fluide", "Upper souple", "Confort premium"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },
  {
    id: "nike-invincible-3",
    brand: "Nike",
    model: "Air Zoom Invincible 3",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 9,
    stabilite: "faible",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 301,
    prix: 179.99,
    image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/dc4e60e4-1769-44df-a184-b07f2ab11bab/NIKE+AIR+ZOOM+INVINCIBLE+3.png",
    description: "L'amorti maximal Nike pour les runners qui veulent le confort absolu. La double mousse ZoomX + React offre un rebond exceptionnel pour les longues distances.",
    benefits: ["Double mousse ZoomX + React", "Amorti maximal", "Confort longue distance", "Respirabilité"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTE – DYNAMISME & LÉGÈRETÉ
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "adidas-ultraboost-light",
    brand: "Adidas",
    model: "Ultraboost Light",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 10,
    stabilite: "faible",
    dynamisme: "élevé",
    largeurDisponible: ["standard", "large"],
    poids: 272,
    prix: 189.99,
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/4ccb32f14e134ccca2edaf8d017b6f0c_9366/Ultraboost_Light_Shoes_White_GY9350_01_standard.jpg",
    description: "La légèreté rencontre l'Boost. La mousse Boost ultra-légère de l'Ultraboost Light offre un retour d'énergie exceptionnel tout en pesant 25 % de moins.",
    benefits: ["Boost ultra-léger", "Primeknit+ respirant", "Continental Rubber", "Retour énergie maximal"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "performance"],
  },
  {
    id: "on-cloudmonster-2",
    brand: "On Running",
    model: "Cloudmonster 2",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 6,
    stabilite: "faible",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 260,
    prix: 179.99,
    image: "https://img.therunningcollective.fr/on-cloudmonster-2-m-1160x725-ALL.webp",
    description: "Les nuages géants On pour un amorti spectaculaire et un dynamisme exceptionnel. La Cloudmonster 2 redéfinit la catégorie max-cushion avec sa technologie CloudTec® Phase.",
    benefits: ["CloudTec® Phase", "Helion™ superfoam", "Amorti géant", "Dynamisme élevé"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["confort", "performance"],
  },
  {
    id: "saucony-kinvara-14",
    brand: "Saucony",
    model: "Kinvara 14",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "faible",
    drop: 4,
    stabilite: "faible",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 215,
    prix: 109.99,
    image: "https://img.therunningcollective.fr/saucony-kinvara-14-m-1160x725-VISC.webp",
    description: "La légèreté à l'état pur. La Kinvara 14 est la chaussure de tempo idéale pour les coureurs qui cherchent une sensation proche du pied nu avec un minimum de drop.",
    benefits: ["PWRRUN Foam", "Drop 4mm naturel", "Ultra-légère 215g", "Foulée naturelle"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTE – STABILITÉ (PRONATEURS)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "brooks-adrenaline-gts-23",
    brand: "Brooks",
    model: "Adrenaline GTS 23",
    foulee: ["pronateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 12,
    stabilite: "élevée",
    dynamisme: "moyen",
    largeurDisponible: ["étroit", "standard", "large"],
    poids: 299,
    prix: 129.99,
    image: "https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw1e8c5a92/images/120381/120381_416_l_AdrenalineGTS23.png",
    description: "La référence Brooks pour les pronateurs. Le système GuideRails® canalise les mouvements excessifs sans bloquer votre foulée naturelle pour une course longue durée protégée.",
    benefits: ["GuideRails®", "DNA LOFT Foam", "Stabilité guidée", "Confort longue distance"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },
  {
    id: "saucony-guide-17",
    brand: "Saucony",
    model: "Guide 17",
    foulee: ["pronateur"],
    terrain: ["route"],
    amorti: "moyen",
    drop: 8,
    stabilite: "élevée",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 278,
    prix: 139.99,
    image: "https://img.therunningcollective.fr/saucony-guide-17-m-1160x725-ORCH.webp",
    description: "La stabilité légère pour les pronateurs actifs. La Guide 17 offre un contrôle précis de la foulée grâce à sa plaque médiale PWRRUN+ sans sacrifier le confort.",
    benefits: ["PWRRUN+", "Stabilité médiale", "Légèreté", "Transition fluide"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },
  {
    id: "asics-gel-kayano-31",
    brand: "Asics",
    model: "Gel-Kayano 31",
    foulee: ["pronateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 10,
    stabilite: "élevée",
    dynamisme: "moyen",
    largeurDisponible: ["étroit", "standard", "large"],
    poids: 310,
    prix: 189.99,
    image: "https://images.asics.com/is/image/asics/1011B867_001_SR_RT_GLB?$sfPDP$",
    description: "La flagship Asics pour pronateurs exigeants. La Kayano 31 associe la technologie 4D Guidance System et FF BLAST+ Eco pour une stabilité dynamique et un confort maximum.",
    benefits: ["4D Guidance System", "FF BLAST+ Eco", "Stability Elite", "Amorti premium pronateurs"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },
  {
    id: "new-balance-860v14",
    brand: "New Balance",
    model: "Fresh Foam X 860v14",
    foulee: ["pronateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 10,
    stabilite: "élevée",
    dynamisme: "moyen",
    largeurDisponible: ["étroit", "standard", "large"],
    poids: 287,
    prix: 144.99,
    image: "https://nb.scene7.com/is/image/NB/m860v14_nb_02_i?$pdpflexF2$&qlt=80&fmt=webp&wid=440&hei=440",
    description: "La stabilité intelligente New Balance. La 860v14 guide les pronateurs avec son post médial discret tout en offrant le confort de la mousse Fresh Foam X.",
    benefits: ["Fresh Foam X", "Dual-density post", "Support médial", "Confort quotidien"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTE – COMPÉTITION
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "adidas-adizero-adios-pro-3",
    brand: "Adidas",
    model: "Adizero Adios Pro 3",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "faible",
    drop: 8,
    stabilite: "faible",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 220,
    prix: 249.99,
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/adizero-adios-pro-3-shoes/adidas-adizero-adios-pro-3-m-01-standard.jpg",
    description: "La machine à records d'Adidas. 5 tiges en carbone EnergyRods et la mousse LIGHTSTRIKE Pro pour des courses de compétition au sommet de votre potentiel.",
    benefits: ["EnergyRods carbone", "LIGHTSTRIKE Pro", "Légende marathon", "Retour énergie élite"],
    niveau: ["avancé"],
    objectif: ["performance"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TRAIL
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "salomon-speedcross-6",
    brand: "Salomon",
    model: "Speedcross 6",
    foulee: ["neutre", "pronateur"],
    terrain: ["trail"],
    amorti: "moyen",
    drop: 10,
    stabilite: "élevée",
    dynamisme: "moyen",
    largeurDisponible: ["standard"],
    poids: 305,
    prix: 129.99,
    image: "https://img.therunningcollective.fr/salomon-speedcross-6-m-1160x725-LC.webp",
    description: "L'icône du trail technique. Les crampons Chevron de la Speedcross 6 mordent dans tous les terrains mous pour une accroche imbattable sur terrain glissant.",
    benefits: ["Crampons Chevron", "Contagrip® XT", "Protection SensiFit", "Accroche terrain mou"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["performance", "prévention"],
  },
  {
    id: "hoka-challenger-7",
    brand: "Hoka",
    model: "Challenger ATR 7",
    foulee: ["neutre"],
    terrain: ["trail", "mixte"],
    amorti: "moyen",
    drop: 5,
    stabilite: "moyenne",
    dynamisme: "élevé",
    largeurDisponible: ["standard", "large"],
    poids: 262,
    prix: 129.99,
    image: "https://img.therunningcollective.fr/hoka-one-one-challenger-atr-7-m-1160x725-MMPB.webp",
    description: "La polyvalente trail/route par excellence. La Challenger ATR 7 passe du bitume aux sentiers sans compromis grâce à sa semelle durable et son amorti confortable.",
    benefits: ["Semelle durable", "Amorti polyvalent", "Accroche tout-terrain", "Légèreté trail"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "performance"],
  },
  {
    id: "brooks-cascadia-17",
    brand: "Brooks",
    model: "Cascadia 17",
    foulee: ["neutre", "pronateur"],
    terrain: ["trail"],
    amorti: "moyen",
    drop: 8,
    stabilite: "élevée",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 307,
    prix: 129.99,
    image: "https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw8c3af210/images/110393/110393_407_l_Cascadia17.png",
    description: "La robustesse trail Brooks. La Cascadia 17 offre une protection totale sur sentiers techniques avec sa semelle Ballistic Rock Shield et son upper renforcé.",
    benefits: ["Rock Shield", "TrailTack Rubber", "Stabilité trail", "Durabilité renforcée"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "prévention"],
  },
  {
    id: "saucony-peregrine-14",
    brand: "Saucony",
    model: "Peregrine 14",
    foulee: ["neutre"],
    terrain: ["trail", "mixte"],
    amorti: "moyen",
    drop: 4,
    stabilite: "moyenne",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 280,
    prix: 129.99,
    image: "https://img.therunningcollective.fr/saucony-peregrine-14-m-1160x725-VRTL.webp",
    description: "La flèche trail de Saucony. La Peregrine 14 est ultra-légère pour le trail avec des crampons PWRTRAC redoutables sur tous types de terrains.",
    benefits: ["PWRTRAC lugs", "PWRRUN Foam", "Légèreté trail", "Drop naturaliste 4mm"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance"],
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
