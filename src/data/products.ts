export interface Product {
  id: string;
  brand: string;
  model: string;
  foulee: ("pronateur" | "supinateur" | "neutre")[];
  terrain: ("route" | "trail" | "mixte")[];
  amorti: "faible" | "moyen" | "élevé";
  drop: number;
  stabilite: "faible" | "moyenne" | "élevée";
  dynamisme: "faible" | "moyen" | "élevé";
  largeurDisponible: ("étroit" | "standard" | "large")[];
  poids: number;
  prix: number;
  image: string;
  description: string;
  benefits: string[];
  niveau: ("débutant" | "intermédiaire" | "avancé")[];
  objectif: ("performance" | "confort" | "prévention")[];
  releaseYear?: number;
  stackHeight?: { talon: number; avantPied: number };
  seoDescription?: string;
}

export const products: Product[] = [
  // ─── NIKE ───
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
    description: "La chaussure polyvalente par excellence. Le Pegasus 41 offre un amorti React réactif pour vos courses quotidiennes.",
    benefits: ["Amorti React", "Polyvalence", "Durabilité", "Confort longue distance"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "performance"],
    releaseYear: 2024,
    stackHeight: { talon: 33, avantPied: 23 },
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
    description: "La chaussure de compétition la plus rapide. Plaque carbone et mousse ZoomX pour des records personnels.",
    benefits: ["Plaque carbone", "ZoomX Foam", "Ultra-légère", "Retour d'énergie maximal"],
    niveau: ["avancé"],
    objectif: ["performance"],
    releaseYear: 2023,
    stackHeight: { talon: 40, avantPied: 32 },
  },
  {
    id: "nike-invincible-3",
    brand: "Nike",
    model: "ZoomX Invincible Run 3",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 9,
    stabilite: "moyenne",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 299,
    prix: 189.99,
    image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/60f1c04a-bbe5-4591-b45f-48e498e80a22/NIKE+ZOOMX+INVINCIBLE+RUN+3.png",
    description: "Amorti ZoomX maximal pour les sorties longues. Confort exceptionnel kilomètre après kilomètre.",
    benefits: ["ZoomX maximal", "Confort longue distance", "Amorti rebondissant", "Flyknit respirant"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "prévention"],
    releaseYear: 2023,
    stackHeight: { talon: 40, avantPied: 31 },
  },
  {
    id: "nike-structure-25",
    brand: "Nike",
    model: "Air Zoom Structure 25",
    foulee: ["pronateur"],
    terrain: ["route"],
    amorti: "moyen",
    drop: 10,
    stabilite: "élevée",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 280,
    prix: 129.99,
    image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/929a05e3-e8aa-42a3-9a1c-6b55ed9b10b0/AIR+ZOOM+STRUCTURE+25.png",
    description: "Stabilité et confort pour les pronateurs. Support dynamique pour les entraînements quotidiens.",
    benefits: ["Support pronation", "React Foam", "Crash Rail", "Durabilité"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["prévention", "confort"],
    releaseYear: 2023,
  },

  // ─── ASICS ───
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
    description: "Stabilité et confort pour les pronateurs. Le système LITETRUSS guide votre foulée naturellement.",
    benefits: ["Support pronation", "Gel Cushioning", "Stabilité renforcée", "Respirabilité"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
    releaseYear: 2024,
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
    description: "Trail robuste avec stabilité ASICSGRIP pour les sentiers techniques en toute confiance.",
    benefits: ["ASICSGRIP", "Gel Technology", "Rock Protection", "Stabilité trail"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["prévention", "confort"],
    releaseYear: 2024,
  },
  {
    id: "asics-nimbus-26",
    brand: "Asics",
    model: "Gel-Nimbus 26",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 8,
    stabilite: "faible",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 290,
    prix: 189.99,
    image: "https://images.asics.com/is/image/asics/1011B794_020_SR_RT_GLB?$sfPDP$",
    description: "L'amorti premium FF BLAST PLUS pour un confort exceptionnel sur route. Idéale pour les longues sorties.",
    benefits: ["FF BLAST PLUS ECO", "PureGEL", "Knit supérieur", "Amorti premium"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "prévention"],
    releaseYear: 2024,
  },
  {
    id: "asics-novablast-4",
    brand: "Asics",
    model: "Novablast 4",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 8,
    stabilite: "faible",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 264,
    prix: 149.99,
    image: "https://images.asics.com/is/image/asics/1011B693_004_SR_RT_GLB?$sfPDP$",
    description: "Rebond explosif et amorti moelleux FF BLAST PLUS. La chaussure fun par excellence.",
    benefits: ["FF BLAST PLUS", "Rebond élevé", "Trampoline Effect", "Légèreté"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance", "confort"],
    releaseYear: 2024,
  },

  // ─── BROOKS ───
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
    description: "Amorti DNA LOFT v2 et transition fluide pour un confort maximal kilomètre après kilomètre.",
    benefits: ["DNA LOFT v2", "Transition fluide", "Confort premium", "Amorti doux"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
    releaseYear: 2024,
  },
  {
    id: "brooks-adrenaline-gts-24",
    brand: "Brooks",
    model: "Adrenaline GTS 24",
    foulee: ["pronateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 12,
    stabilite: "élevée",
    dynamisme: "moyen",
    largeurDisponible: ["étroit", "standard", "large"],
    poids: 290,
    prix: 149.99,
    image: "https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dwc8b2b5e0/images/110418/110418_046_l_AdrenalineGTS24.png",
    description: "Le guide de stabilité GuideRails corrige la surpronation en douceur pour un confort maximal.",
    benefits: ["GuideRails", "DNA LOFT v2", "Support pronation", "Confort quotidien"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["prévention", "confort"],
    releaseYear: 2024,
  },
  {
    id: "brooks-glycerin-21",
    brand: "Brooks",
    model: "Glycerin 21",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 10,
    stabilite: "faible",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 290,
    prix: 169.99,
    image: "https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw1f5f87f0/images/110419/110419_028_l_Glycerin21.png",
    description: "L'amorti le plus moelleux de Brooks avec la mousse DNA LOFT v3. Confort luxueux à chaque foulée.",
    benefits: ["DNA LOFT v3", "Amorti premium", "Confort luxueux", "Transition douce"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort"],
    releaseYear: 2024,
  },

  // ─── HOKA ───
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
    description: "La référence trail. Semelle Vibram Megagrip et amorti maximal pour les sentiers techniques.",
    benefits: ["Semelle Vibram", "Amorti maximal", "Protection pierres", "Accroche tout-terrain"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance", "confort"],
    releaseYear: 2024,
  },
  {
    id: "hoka-clifton-9",
    brand: "Hoka",
    model: "Clifton 9",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 5,
    stabilite: "moyenne",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 248,
    prix: 144.99,
    image: "https://img.therunningcollective.fr/hoka-one-one-clifton-9-m-1160x725-B1C3EB.webp",
    description: "Amorti maximal dans un format léger. La Clifton 9 est la chaussure route la plus populaire de Hoka.",
    benefits: ["Amorti léger", "Rocker geometry", "Confort premium", "Polyvalence"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "prévention"],
    releaseYear: 2023,
  },
  {
    id: "hoka-bondi-8",
    brand: "Hoka",
    model: "Bondi 8",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 4,
    stabilite: "moyenne",
    dynamisme: "faible",
    largeurDisponible: ["standard", "large"],
    poids: 307,
    prix: 159.99,
    image: "https://img.therunningcollective.fr/hoka-one-one-bondi-8-m-1160x725-2A5E00.webp",
    description: "L'amorti le plus maximaliste de Hoka. Confort ultime pour les coureurs recherchant un coussin généreux.",
    benefits: ["Amorti ultra-maximal", "Meta-Rocker", "Confort premium", "Compression EVA"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
    releaseYear: 2023,
  },
  {
    id: "hoka-mach-6",
    brand: "Hoka",
    model: "Mach 6",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "moyen",
    drop: 5,
    stabilite: "faible",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 232,
    prix: 149.99,
    image: "https://img.therunningcollective.fr/hoka-one-one-mach-6-m-1160x725-3E44A0.webp",
    description: "Tempo rapide et légèreté. La Mach 6 excelle pour les séances de vitesse et les compétitions courtes.",
    benefits: ["PROFLY+", "Légèreté", "Réactivité", "Polyvalence tempo"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance"],
    releaseYear: 2024,
  },

  // ─── SAUCONY ───
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
    description: "Plaque nylon SPEEDROLL pour des tempos explosifs et des courses rapides.",
    benefits: ["PWRRUN PB", "Plaque nylon", "Speedroll", "Polyvalence tempo"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance"],
    releaseYear: 2024,
  },
  {
    id: "saucony-ride-17",
    brand: "Saucony",
    model: "Ride 17",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "moyen",
    drop: 8,
    stabilite: "moyenne",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 272,
    prix: 139.99,
    image: "https://img.therunningcollective.fr/saucony-ride-17-m-1160x725-AA1F14.webp",
    description: "Polyvalence quotidienne avec la mousse PWRRUN+ pour un confort réactif sur toutes les distances.",
    benefits: ["PWRRUN+", "Polyvalence", "Confort quotidien", "Transition fluide"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "performance"],
    releaseYear: 2024,
  },
  {
    id: "saucony-triumph-22",
    brand: "Saucony",
    model: "Triumph 22",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 10,
    stabilite: "faible",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 291,
    prix: 169.99,
    image: "https://img.therunningcollective.fr/saucony-triumph-22-m-1160x725-0B2741.webp",
    description: "Amorti premium PWRRUN PB pour un confort exceptionnel sur les longues distances.",
    benefits: ["PWRRUN PB", "Amorti premium", "Confort longue distance", "Rebond élevé"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "prévention"],
    releaseYear: 2024,
  },
  {
    id: "saucony-peregrine-14",
    brand: "Saucony",
    model: "Peregrine 14",
    foulee: ["neutre"],
    terrain: ["trail"],
    amorti: "moyen",
    drop: 4,
    stabilite: "moyenne",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 280,
    prix: 139.99,
    image: "https://img.therunningcollective.fr/saucony-peregrine-14-m-1160x725-5C2FA8.webp",
    description: "Trail agile et réactif avec la semelle PWRTRAC pour une accroche fiable sur tous les terrains.",
    benefits: ["PWRTRAC", "Rock Plate", "Légèreté trail", "Accroche multi-terrain"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance"],
    releaseYear: 2024,
  },

  // ─── SALOMON ───
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
    description: "Polyvalence trail avec confort longue distance grâce à la mousse Energy Surge.",
    benefits: ["Contagrip MA", "Energy Surge", "Confort ultra-distance", "Légèreté"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance", "confort"],
    releaseYear: 2024,
  },
  {
    id: "salomon-speedcross-6",
    brand: "Salomon",
    model: "Speedcross 6",
    foulee: ["neutre", "pronateur"],
    terrain: ["trail"],
    amorti: "moyen",
    drop: 10,
    stabilite: "élevée",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 310,
    prix: 139.99,
    image: "https://img.therunningcollective.fr/salomon-speedcross-6-m-1160x725-AA2E0C.webp",
    description: "La référence trail boue. Crampons agressifs et maintien exceptionnel pour les terrains meubles.",
    benefits: ["Contagrip Premium", "Crampons agressifs", "Quicklace", "Maintien précis"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance"],
    releaseYear: 2023,
  },
  {
    id: "salomon-aero-glide",
    brand: "Salomon",
    model: "Aero Glide",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "moyen",
    drop: 8,
    stabilite: "moyenne",
    dynamisme: "moyen",
    largeurDisponible: ["standard"],
    poids: 260,
    prix: 129.99,
    image: "https://img.therunningcollective.fr/salomon-aero-glide-m-1160x725-5E1C1E.webp",
    description: "Transition route légère de Salomon. Energy Foam réactif pour les sorties quotidiennes.",
    benefits: ["Energy Foam", "Contagrip", "Polyvalence", "Légèreté"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort"],
    releaseYear: 2024,
  },

  // ─── NEW BALANCE ───
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
    description: "Amorti ultime Fresh Foam X pour les supinateurs. Rebond naturel et confort exceptionnel.",
    benefits: ["Fresh Foam X", "Hypoknit", "Amorti premium", "Respirabilité maximale"],
    niveau: ["débutant", "intermédiaire", "avancé"],
    objectif: ["confort", "prévention"],
    releaseYear: 2023,
  },
  {
    id: "new-balance-fuelcell-rebel-4",
    brand: "New Balance",
    model: "FuelCell Rebel v4",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "moyen",
    drop: 6,
    stabilite: "faible",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 224,
    prix: 149.99,
    image: "https://nb.scene7.com/is/image/NB/mfcxlb4_nb_02_i?$pdpflexF2$&qlt=80&fmt=webp&wid=440&hei=440",
    description: "Légèreté explosive avec la mousse FuelCell. Parfaite pour les tempos et les compétitions.",
    benefits: ["FuelCell", "Ultra-légère", "Rebond explosif", "Polyvalence tempo"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance"],
    releaseYear: 2024,
  },
  {
    id: "new-balance-860-v14",
    brand: "New Balance",
    model: "860 v14",
    foulee: ["pronateur"],
    terrain: ["route"],
    amorti: "moyen",
    drop: 10,
    stabilite: "élevée",
    dynamisme: "moyen",
    largeurDisponible: ["étroit", "standard", "large"],
    poids: 300,
    prix: 139.99,
    image: "https://nb.scene7.com/is/image/NB/m860v14_nb_02_i?$pdpflexF2$&qlt=80&fmt=webp&wid=440&hei=440",
    description: "Stabilité et confort pour les pronateurs avec le système medial post. Fiable et durable.",
    benefits: ["Medial Post", "Fresh Foam X", "Stabilité", "Durabilité"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["prévention", "confort"],
    releaseYear: 2024,
  },

  // ─── MIZUNO ───
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
    description: "Confort dynamique par Mizuno. La plaque Wave ENERZY offre stabilité et retour d'énergie.",
    benefits: ["Mizuno Wave", "ENERZY", "Transition fluide", "Confort dynamique"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort", "prévention"],
    releaseYear: 2024,
  },
  {
    id: "mizuno-wave-sky-7",
    brand: "Mizuno",
    model: "Wave Sky 7",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 10,
    stabilite: "moyenne",
    dynamisme: "moyen",
    largeurDisponible: ["standard"],
    poids: 310,
    prix: 169.99,
    image: "https://img.therunningcollective.fr/mizuno-wave-sky-7-m-1160x725-2B4556.webp",
    description: "L'amorti premium de Mizuno avec ENERZY CORE. Moelleux et réactif pour les longues distances.",
    benefits: ["ENERZY CORE", "Wave Plate", "Amorti premium", "Confort longue distance"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort"],
    releaseYear: 2023,
  },

  // ─── ON RUNNING ───
  {
    id: "on-cloudmonster-2",
    brand: "On",
    model: "Cloudmonster 2",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 6,
    stabilite: "moyenne",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 260,
    prix: 169.99,
    image: "https://img.therunningcollective.fr/on-running-cloudmonster-2-m-1160x725-DAEEF5.webp",
    description: "Amorti CloudTec maximal et rebond explosif. La Cloudmonster 2 excelle sur les longues distances.",
    benefits: ["CloudTec", "Speedboard", "Rebond maximal", "Amorti volumique"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["confort", "performance"],
    releaseYear: 2024,
  },
  {
    id: "on-cloudsurfer-7",
    brand: "On",
    model: "Cloudsurfer 7",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "moyen",
    drop: 8,
    stabilite: "moyenne",
    dynamisme: "moyen",
    largeurDisponible: ["standard"],
    poids: 280,
    prix: 149.99,
    image: "https://img.therunningcollective.fr/on-running-cloudsurfer-7-m-1160x725-272727.webp",
    description: "Polyvalente au quotidien avec CloudTec Phase. Transition fluide et confort équilibré.",
    benefits: ["CloudTec Phase", "Helion HF", "Polyvalence", "Confort quotidien"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort"],
    releaseYear: 2024,
  },

  // ─── ADIDAS ───
  {
    id: "adidas-ultraboost-light",
    brand: "Adidas",
    model: "Ultraboost Light",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 10,
    stabilite: "faible",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 280,
    prix: 189.99,
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/68ae7ea7849b43eca70daf1601151b1c_9366/Chaussure_Ultraboost_Light_Blanc_GY9352_01_standard.jpg",
    description: "Amorti Boost Light emblématique dans un format plus léger. Icône de confort route.",
    benefits: ["Light BOOST", "Primeknit+", "Continental", "Confort iconique"],
    niveau: ["débutant", "intermédiaire"],
    objectif: ["confort"],
    releaseYear: 2023,
  },
  {
    id: "adidas-adizero-boston-12",
    brand: "Adidas",
    model: "Adizero Boston 12",
    foulee: ["neutre"],
    terrain: ["route"],
    amorti: "moyen",
    drop: 7,
    stabilite: "faible",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 230,
    prix: 159.99,
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/98a6d0e6f9a547c39dd5b048008e91be_9366/Chaussure_Adizero_Boston_12_Noir_ID4234_01_standard.jpg",
    description: "Tempo et compétition avec double mousse Lightstrike PRO et tiges EnergyRods 2.0.",
    benefits: ["Lightstrike PRO", "EnergyRods 2.0", "Tempo rapide", "Légèreté"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["performance"],
    releaseYear: 2024,
  },
  {
    id: "adidas-terrex-agravic-ultra",
    brand: "Adidas",
    model: "Terrex Agravic Ultra",
    foulee: ["neutre"],
    terrain: ["trail"],
    amorti: "moyen",
    drop: 6,
    stabilite: "moyenne",
    dynamisme: "élevé",
    largeurDisponible: ["standard"],
    poids: 290,
    prix: 169.99,
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c7741f3d0a754b34aebeaf5800e7a95c_9366/Chaussure_de_trail_running_Terrex_Agravic_Ultra_Bleu_ID7545_01_standard.jpg",
    description: "Ultra-trail technique avec Lightstrike PRO et Continental. Confort prolongé sur les grandes distances.",
    benefits: ["Lightstrike PRO", "Continental", "Ultra-distance", "Protection"],
    niveau: ["avancé"],
    objectif: ["performance", "confort"],
    releaseYear: 2024,
  },

  // ─── ALTRA ───
  {
    id: "altra-torin-7",
    brand: "Altra",
    model: "Torin 7",
    foulee: ["neutre", "supinateur"],
    terrain: ["route"],
    amorti: "élevé",
    drop: 0,
    stabilite: "faible",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 268,
    prix: 149.99,
    image: "https://img.therunningcollective.fr/altra-torin-7-m-1160x725-0B3C6E.webp",
    description: "Zero drop et FootShape toe box pour une foulée naturelle. Amorti Quantic pour le confort.",
    benefits: ["Zero Drop", "FootShape", "Quantic", "Foulée naturelle"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["prévention", "confort"],
    releaseYear: 2024,
  },
  {
    id: "altra-lone-peak-8",
    brand: "Altra",
    model: "Lone Peak 8",
    foulee: ["neutre"],
    terrain: ["trail"],
    amorti: "moyen",
    drop: 0,
    stabilite: "moyenne",
    dynamisme: "moyen",
    largeurDisponible: ["standard", "large"],
    poids: 303,
    prix: 139.99,
    image: "https://img.therunningcollective.fr/altra-lone-peak-8-m-1160x725-403F3E.webp",
    description: "Zero drop trail polyvalent. MaxTrac et StoneGuard pour tous les sentiers.",
    benefits: ["Zero Drop", "MaxTrac", "StoneGuard", "Trail polyvalent"],
    niveau: ["intermédiaire", "avancé"],
    objectif: ["prévention", "performance"],
    releaseYear: 2024,
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

    if (product.foulee.includes(profile.foulee as any)) {
      score += 30;
      const fouleeLabel = profile.foulee === "pronateur" ? "stabilité" : profile.foulee === "supinateur" ? "amorti renforcé" : "universalité";
      reasons.push(`Adaptée à votre foulée ${profile.foulee} — ${fouleeLabel}`);
    }

    if (product.terrain.includes(profile.terrain as any)) {
      score += 20;
      reasons.push(`Conçue pour le ${profile.terrain}`);
    } else if (product.terrain.includes("mixte")) {
      score += 8;
      reasons.push("Polyvalente tous terrains");
    }

    if (product.niveau.includes(profile.niveau as any)) {
      score += 12;
      reasons.push(`Adaptée au niveau ${profile.niveau}`);
    }

    if (product.objectif.includes(profile.objectif as any)) {
      score += 12;
      reasons.push(`Optimisée pour : ${profile.objectif}`);
    }

    if (product.largeurDisponible.includes(profile.largeurPied as any)) {
      score += 8;
      reasons.push(`Disponible en largeur ${profile.largeurPied}`);
    }

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

    if (profile.amortPreference && product.amorti === profile.amortPreference) {
      score += 8;
      reasons.push(`Niveau d'amorti ${product.amorti} correspondant`);
    }

    if (profile.blessures === "oui" && product.objectif.includes("prévention")) {
      score += 10;
      reasons.push("Recommandée pour la prévention des blessures");
    }
    if (profile.blessures === "oui" && product.stabilite === "élevée") {
      score += 5;
      reasons.push("Stabilité renforcée pour protéger vos articulations");
    }

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
    .slice(0, 15);
}

/** Get related products (same terrain/brand, excluding self) */
export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];

  return products
    .filter((p) => p.id !== productId)
    .map((p) => {
      let relevance = 0;
      if (p.terrain.some((t) => product.terrain.includes(t))) relevance += 3;
      if (p.foulee.some((f) => product.foulee.includes(f))) relevance += 2;
      if (p.amorti === product.amorti) relevance += 1;
      if (p.brand === product.brand) relevance += 1;
      return { product: p, relevance };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit)
    .map((r) => r.product);
}
