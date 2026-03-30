-- ============================================================
-- Seed — Catalogue complet des 27 chaussures RunFit
-- ============================================================
-- Les image_url pointent initialement vers les CDN officiels
-- des marques (légal pour un site affilié).
-- Après avoir exécuté scripts/upload-shoe-images.mjs, elles
-- seront remplacées par les URLs Supabase Storage.
-- ============================================================

INSERT INTO public.shoes
  (id, brand, model, description, prix,
   foulee, terrain, amorti, drop_mm, poids_g, stabilite, dynamisme,
   largeur_disponible, niveau, objectif, benefits,
   image_url, image_original_url)
VALUES

-- ──────────────────────────────────────────────────────────────
-- ROUTE — POLYVALENTES
-- ──────────────────────────────────────────────────────────────
(
  'nike-pegasus-41', 'Nike', 'Air Zoom Pegasus 41',
  'La chaussure polyvalente par excellence. Le Pegasus 41 offre un amorti React réactif pour vos courses quotidiennes, du fractionné au footing long.',
  139.99,
  ARRAY['neutre'], ARRAY['route'],
  'moyen', 10, 272, 'moyenne', 'moyen',
  ARRAY['standard', 'large'],
  ARRAY['débutant', 'intermédiaire', 'avancé'],
  ARRAY['confort', 'performance'],
  ARRAY['Amorti React', 'Polyvalence', 'Durabilité', 'Confort longue distance'],
  'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/0868a654-c3e9-4342-a64a-5b45df7a8ad8/NIKE+PEGASUS+41.png',
  'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/0868a654-c3e9-4342-a64a-5b45df7a8ad8/NIKE+PEGASUS+41.png'
),
(
  'asics-gt-2000', 'Asics', 'GT-2000 12',
  'Stabilité et confort pour les pronateurs. Le système de support LITETRUSS guide votre foulée naturellement sur de longues distances.',
  149.99,
  ARRAY['pronateur'], ARRAY['route'],
  'élevé', 8, 295, 'élevée', 'moyen',
  ARRAY['étroit', 'standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['Support pronation', 'Gel Cushioning', 'Stabilité renforcée', 'Respirabilité'],
  'https://images.asics.com/is/image/asics/1011B691_005_SR_RT_GLB?$sfPDP$',
  'https://images.asics.com/is/image/asics/1011B691_005_SR_RT_GLB?$sfPDP$'
),
(
  'brooks-ghost-16', 'Brooks', 'Ghost 16',
  'Un amorti moelleux DNA LOFT v2 et une transition fluide pour un confort maximal kilomètre après kilomètre.',
  139.99,
  ARRAY['neutre'], ARRAY['route'],
  'élevé', 12, 286, 'moyenne', 'moyen',
  ARRAY['standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['DNA LOFT v2', 'Transition fluide', 'Confort premium', 'Amorti doux'],
  'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw1e8c5a92/images/110418/110418_071_l_Ghost16.png',
  'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw1e8c5a92/images/110418/110418_071_l_Ghost16.png'
),
(
  'new-balance-fresh-foam', 'New Balance', 'Fresh Foam X 1080v13',
  'L''amorti ultime pour les supinateurs. Fresh Foam X offre un rebond naturel et un confort exceptionnels avec un upper Hypoknit respirant.',
  159.99,
  ARRAY['neutre', 'supinateur'], ARRAY['route'],
  'élevé', 6, 298, 'faible', 'moyen',
  ARRAY['étroit', 'standard', 'large'],
  ARRAY['débutant', 'intermédiaire', 'avancé'],
  ARRAY['confort', 'prévention'],
  ARRAY['Fresh Foam X', 'Hypoknit', 'Amorti premium', 'Respirabilité maximale'],
  'https://nb.scene7.com/is/image/NB/m1080v13_nb_02_i?$pdpflexF2$&qlt=80&fmt=webp&wid=440&hei=440',
  'https://nb.scene7.com/is/image/NB/m1080v13_nb_02_i?$pdpflexF2$&qlt=80&fmt=webp&wid=440&hei=440'
),
(
  'mizuno-wave-rider', 'Mizuno', 'Wave Rider 28',
  'Le confort dynamique par Mizuno. La plaque Wave ENERZY offre stabilité, transition fluide et un excellent retour d''énergie.',
  144.99,
  ARRAY['neutre', 'supinateur'], ARRAY['route', 'mixte'],
  'moyen', 12, 275, 'moyenne', 'moyen',
  ARRAY['standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['Mizuno Wave', 'ENERZY', 'Transition fluide', 'Confort dynamique'],
  'https://img.therunningcollective.fr/mizuno-wave-rider-28-m-1160x725-0A0101.webp',
  'https://img.therunningcollective.fr/mizuno-wave-rider-28-m-1160x725-0A0101.webp'
),

-- ──────────────────────────────────────────────────────────────
-- ROUTE — AMORTI MAXIMAL
-- ──────────────────────────────────────────────────────────────
(
  'hoka-clifton-9', 'Hoka', 'Clifton 9',
  'L''amorti légendaire Hoka en version ultra-légère. La Clifton 9 offre un confort exceptionnel kilomètre après kilomètre avec sa mousse EVA haute-densité réformulée.',
  149.99,
  ARRAY['neutre', 'supinateur'], ARRAY['route'],
  'élevé', 5, 247, 'moyenne', 'moyen',
  ARRAY['standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['Mousse EVA ultra-légère', 'Rocker geometry', 'Confort premium', 'Absorption des chocs'],
  'https://img.therunningcollective.fr/hoka-one-one-clifton-9-m-1160x725-BCAN.webp',
  'https://img.therunningcollective.fr/hoka-one-one-clifton-9-m-1160x725-BCAN.webp'
),
(
  'hoka-bondi-8', 'Hoka', 'Bondi 8',
  'L''amorti maximal Hoka pour les runners cherchant le confort absolu. La Bondi 8 absorbe tous les chocs pour protéger vos articulations sur de longues distances.',
  169.99,
  ARRAY['neutre', 'supinateur'], ARRAY['route'],
  'élevé', 4, 298, 'faible', 'moyen',
  ARRAY['standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['Amorti maximal', 'Rocker geometry', 'Protection articulations', 'Confort ultra-distance'],
  'https://img.therunningcollective.fr/hoka-one-one-bondi-8-m-1160x725-BWHT.webp',
  'https://img.therunningcollective.fr/hoka-one-one-bondi-8-m-1160x725-BWHT.webp'
),
(
  'asics-gel-nimbus-26', 'Asics', 'Gel-Nimbus 26',
  'Le fleuron du confort Asics. La Gel-Nimbus 26 associe gel multicouche et mousse FF BLAST+ pour une expérience de course ultra-confortable sur toutes distances.',
  179.99,
  ARRAY['neutre', 'supinateur'], ARRAY['route'],
  'élevé', 8, 295, 'faible', 'moyen',
  ARRAY['étroit', 'standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['FF BLAST+ Foam', 'Gel multicouche', 'Engineered Knit', 'Amorti premium'],
  'https://images.asics.com/is/image/asics/1011B794_001_SR_RT_GLB?$sfPDP$',
  'https://images.asics.com/is/image/asics/1011B794_001_SR_RT_GLB?$sfPDP$'
),
(
  'brooks-glycerin-21', 'Brooks', 'Glycerin 21',
  'La douceur à l''état pur. La mousse DNA LOFT v3 de la Glycerin 21 offre un amorti luxueux et une transition heel-to-toe parfaitement fluide.',
  149.99,
  ARRAY['neutre', 'supinateur'], ARRAY['route'],
  'élevé', 10, 285, 'faible', 'moyen',
  ARRAY['standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['DNA LOFT v3', 'Transition ultra-fluide', 'Upper souple', 'Confort premium'],
  'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw5c4b4e97/images/110412/110412_012_l_Glycerin21.png',
  'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw5c4b4e97/images/110412/110412_012_l_Glycerin21.png'
),
(
  'nike-invincible-3', 'Nike', 'Air Zoom Invincible 3',
  'L''amorti maximal Nike pour les runners qui veulent le confort absolu. La double mousse ZoomX + React offre un rebond exceptionnel pour les longues distances.',
  179.99,
  ARRAY['neutre'], ARRAY['route'],
  'élevé', 9, 301, 'faible', 'moyen',
  ARRAY['standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['Double mousse ZoomX + React', 'Amorti maximal', 'Confort longue distance', 'Respirabilité'],
  'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/dc4e60e4-1769-44df-a184-b07f2ab11bab/NIKE+AIR+ZOOM+INVINCIBLE+3.png',
  'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/dc4e60e4-1769-44df-a184-b07f2ab11bab/NIKE+AIR+ZOOM+INVINCIBLE+3.png'
),

-- ──────────────────────────────────────────────────────────────
-- ROUTE — DYNAMISME & LÉGÈRETÉ
-- ──────────────────────────────────────────────────────────────
(
  'adidas-ultraboost-light', 'Adidas', 'Ultraboost Light',
  'La légèreté rencontre l''Boost. La mousse Boost ultra-légère de l''Ultraboost Light offre un retour d''énergie exceptionnel tout en pesant 25 % de moins.',
  189.99,
  ARRAY['neutre', 'supinateur'], ARRAY['route'],
  'élevé', 10, 272, 'faible', 'élevé',
  ARRAY['standard', 'large'],
  ARRAY['débutant', 'intermédiaire', 'avancé'],
  ARRAY['confort', 'performance'],
  ARRAY['Boost ultra-léger', 'Primeknit+ respirant', 'Continental Rubber', 'Retour énergie maximal'],
  'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/4ccb32f14e134ccca2edaf8d017b6f0c_9366/Ultraboost_Light_Shoes_White_GY9350_01_standard.jpg',
  'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/4ccb32f14e134ccca2edaf8d017b6f0c_9366/Ultraboost_Light_Shoes_White_GY9350_01_standard.jpg'
),
(
  'on-cloudmonster-2', 'On Running', 'Cloudmonster 2',
  'Les nuages géants On pour un amorti spectaculaire et un dynamisme exceptionnel. La Cloudmonster 2 redéfinit la catégorie max-cushion avec sa technologie CloudTec® Phase.',
  179.99,
  ARRAY['neutre'], ARRAY['route'],
  'élevé', 6, 260, 'faible', 'élevé',
  ARRAY['standard'],
  ARRAY['intermédiaire', 'avancé'],
  ARRAY['confort', 'performance'],
  ARRAY['CloudTec® Phase', 'Helion™ superfoam', 'Amorti géant', 'Dynamisme élevé'],
  'https://img.therunningcollective.fr/on-cloudmonster-2-m-1160x725-ALL.webp',
  'https://img.therunningcollective.fr/on-cloudmonster-2-m-1160x725-ALL.webp'
),
(
  'saucony-endorphin-speed', 'Saucony', 'Endorphin Speed 4',
  'Vitesse et polyvalence. La plaque en nylon SPEEDROLL propulse chaque foulée pour des tempos explosifs et des courses rapides.',
  179.99,
  ARRAY['neutre'], ARRAY['route'],
  'moyen', 8, 218, 'faible', 'élevé',
  ARRAY['standard'],
  ARRAY['intermédiaire', 'avancé'],
  ARRAY['performance'],
  ARRAY['PWRRUN PB', 'Plaque nylon', 'Speedroll', 'Polyvalence tempo'],
  'https://img.therunningcollective.fr/saucony-endorphin-speed-4-m-1160x725-9A3E30.webp',
  'https://img.therunningcollective.fr/saucony-endorphin-speed-4-m-1160x725-9A3E30.webp'
),
(
  'saucony-kinvara-14', 'Saucony', 'Kinvara 14',
  'La légèreté à l''état pur. La Kinvara 14 est la chaussure de tempo idéale pour les coureurs qui cherchent une sensation proche du pied nu avec un minimum de drop.',
  109.99,
  ARRAY['neutre', 'supinateur'], ARRAY['route'],
  'faible', 4, 215, 'faible', 'élevé',
  ARRAY['standard'],
  ARRAY['intermédiaire', 'avancé'],
  ARRAY['performance'],
  ARRAY['PWRRUN Foam', 'Drop 4mm naturel', 'Ultra-légère 215g', 'Foulée naturelle'],
  'https://img.therunningcollective.fr/saucony-kinvara-14-m-1160x725-VISC.webp',
  'https://img.therunningcollective.fr/saucony-kinvara-14-m-1160x725-VISC.webp'
),

-- ──────────────────────────────────────────────────────────────
-- ROUTE — STABILITÉ (PRONATEURS)
-- ──────────────────────────────────────────────────────────────
(
  'brooks-adrenaline-gts-23', 'Brooks', 'Adrenaline GTS 23',
  'La référence Brooks pour les pronateurs. Le système GuideRails® canalise les mouvements excessifs sans bloquer votre foulée naturelle pour une course longue durée protégée.',
  129.99,
  ARRAY['pronateur'], ARRAY['route'],
  'élevé', 12, 299, 'élevée', 'moyen',
  ARRAY['étroit', 'standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['GuideRails®', 'DNA LOFT Foam', 'Stabilité guidée', 'Confort longue distance'],
  'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw1e8c5a92/images/120381/120381_416_l_AdrenalineGTS23.png',
  'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw1e8c5a92/images/120381/120381_416_l_AdrenalineGTS23.png'
),
(
  'saucony-guide-17', 'Saucony', 'Guide 17',
  'La stabilité légère pour les pronateurs actifs. La Guide 17 offre un contrôle précis de la foulée grâce à sa plaque médiale PWRRUN+ sans sacrifier le confort.',
  139.99,
  ARRAY['pronateur'], ARRAY['route'],
  'moyen', 8, 278, 'élevée', 'moyen',
  ARRAY['standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['PWRRUN+', 'Stabilité médiale', 'Légèreté', 'Transition fluide'],
  'https://img.therunningcollective.fr/saucony-guide-17-m-1160x725-ORCH.webp',
  'https://img.therunningcollective.fr/saucony-guide-17-m-1160x725-ORCH.webp'
),
(
  'asics-gel-kayano-31', 'Asics', 'Gel-Kayano 31',
  'La flagship Asics pour pronateurs exigeants. La Kayano 31 associe la technologie 4D Guidance System et FF BLAST+ Eco pour une stabilité dynamique et un confort maximum.',
  189.99,
  ARRAY['pronateur'], ARRAY['route'],
  'élevé', 10, 310, 'élevée', 'moyen',
  ARRAY['étroit', 'standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['4D Guidance System', 'FF BLAST+ Eco', 'Stability Elite', 'Amorti premium pronateurs'],
  'https://images.asics.com/is/image/asics/1011B867_001_SR_RT_GLB?$sfPDP$',
  'https://images.asics.com/is/image/asics/1011B867_001_SR_RT_GLB?$sfPDP$'
),
(
  'new-balance-860v14', 'New Balance', 'Fresh Foam X 860v14',
  'La stabilité intelligente New Balance. La 860v14 guide les pronateurs avec son post médial discret tout en offrant le confort de la mousse Fresh Foam X.',
  144.99,
  ARRAY['pronateur'], ARRAY['route'],
  'élevé', 10, 287, 'élevée', 'moyen',
  ARRAY['étroit', 'standard', 'large'],
  ARRAY['débutant', 'intermédiaire'],
  ARRAY['confort', 'prévention'],
  ARRAY['Fresh Foam X', 'Dual-density post', 'Support médial', 'Confort quotidien'],
  'https://nb.scene7.com/is/image/NB/m860v14_nb_02_i?$pdpflexF2$&qlt=80&fmt=webp&wid=440&hei=440',
  'https://nb.scene7.com/is/image/NB/m860v14_nb_02_i?$pdpflexF2$&qlt=80&fmt=webp&wid=440&hei=440'
),

-- ──────────────────────────────────────────────────────────────
-- ROUTE — COMPÉTITION
-- ──────────────────────────────────────────────────────────────
(
  'nike-vaporfly-3', 'Nike', 'ZoomX Vaporfly 3',
  'La chaussure de compétition la plus rapide. Plaque carbone intégrale et mousse ZoomX pour des records personnels.',
  259.99,
  ARRAY['neutre'], ARRAY['route'],
  'moyen', 8, 186, 'faible', 'élevé',
  ARRAY['étroit', 'standard'],
  ARRAY['avancé'],
  ARRAY['performance'],
  ARRAY['Plaque carbone', 'ZoomX Foam', 'Ultra-légère', 'Retour d''énergie maximal'],
  'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b1bcddbe-3024-4e5d-b756-fbb1e4763a2b/NIKE+ZOOMX+VAPORFLY+NEXT%25+3.png',
  'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b1bcddbe-3024-4e5d-b756-fbb1e4763a2b/NIKE+ZOOMX+VAPORFLY+NEXT%25+3.png'
),
(
  'adidas-adizero-adios-pro-3', 'Adidas', 'Adizero Adios Pro 3',
  'La machine à records d''Adidas. 5 tiges en carbone EnergyRods et la mousse LIGHTSTRIKE Pro pour des courses de compétition au sommet de votre potentiel.',
  249.99,
  ARRAY['neutre'], ARRAY['route'],
  'faible', 8, 220, 'faible', 'élevé',
  ARRAY['standard'],
  ARRAY['avancé'],
  ARRAY['performance'],
  ARRAY['EnergyRods carbone', 'LIGHTSTRIKE Pro', 'Légende marathon', 'Retour énergie élite'],
  'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/adizero-adios-pro-3-shoes/adidas-adizero-adios-pro-3-m-01-standard.jpg',
  'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/adizero-adios-pro-3-shoes/adidas-adizero-adios-pro-3-m-01-standard.jpg'
),

-- ──────────────────────────────────────────────────────────────
-- TRAIL
-- ──────────────────────────────────────────────────────────────
(
  'hoka-speedgoat-6', 'Hoka', 'Speedgoat 6',
  'La référence trail. Semelle Vibram Megagrip et amorti maximal CMEVA pour dévorer tous les sentiers techniques.',
  159.99,
  ARRAY['neutre', 'supinateur'], ARRAY['trail'],
  'élevé', 4, 310, 'moyenne', 'élevé',
  ARRAY['standard', 'large'],
  ARRAY['intermédiaire', 'avancé'],
  ARRAY['performance', 'confort'],
  ARRAY['Semelle Vibram', 'Amorti maximal', 'Protection pierres', 'Accroche tout-terrain'],
  'https://img.therunningcollective.fr/hoka-one-one-speedgoat-6-m-1160x725-CFDR.webp',
  'https://img.therunningcollective.fr/hoka-one-one-speedgoat-6-m-1160x725-CFDR.webp'
),
(
  'salomon-speedcross-6', 'Salomon', 'Speedcross 6',
  'L''icône du trail technique. Les crampons Chevron de la Speedcross 6 mordent dans tous les terrains mous pour une accroche imbattable sur terrain glissant.',
  129.99,
  ARRAY['neutre', 'pronateur'], ARRAY['trail'],
  'moyen', 10, 305, 'élevée', 'moyen',
  ARRAY['standard'],
  ARRAY['débutant', 'intermédiaire', 'avancé'],
  ARRAY['performance', 'prévention'],
  ARRAY['Crampons Chevron', 'Contagrip® XT', 'Protection SensiFit', 'Accroche terrain mou'],
  'https://img.therunningcollective.fr/salomon-speedcross-6-m-1160x725-LC.webp',
  'https://img.therunningcollective.fr/salomon-speedcross-6-m-1160x725-LC.webp'
),
(
  'salomon-ultra-glide', 'Salomon', 'Ultra Glide 2',
  'Polyvalence trail avec un confort longue distance remarquable grâce à la mousse Energy Surge. Idéale pour ultra et longues sorties.',
  149.99,
  ARRAY['neutre'], ARRAY['trail', 'mixte'],
  'moyen', 6, 280, 'moyenne', 'élevé',
  ARRAY['standard'],
  ARRAY['intermédiaire', 'avancé'],
  ARRAY['performance', 'confort'],
  ARRAY['Contagrip MA', 'Energy Surge', 'Confort ultra-distance', 'Légèreté'],
  'https://img.therunningcollective.fr/salomon-ultra-glide-2-m-1160x725-780B72.webp',
  'https://img.therunningcollective.fr/salomon-ultra-glide-2-m-1160x725-780B72.webp'
),
(
  'hoka-challenger-7', 'Hoka', 'Challenger ATR 7',
  'La polyvalente trail/route par excellence. La Challenger ATR 7 passe du bitume aux sentiers sans compromis grâce à sa semelle durable et son amorti confortable.',
  129.99,
  ARRAY['neutre'], ARRAY['trail', 'mixte'],
  'moyen', 5, 262, 'moyenne', 'élevé',
  ARRAY['standard', 'large'],
  ARRAY['débutant', 'intermédiaire', 'avancé'],
  ARRAY['confort', 'performance'],
  ARRAY['Semelle durable', 'Amorti polyvalent', 'Accroche tout-terrain', 'Légèreté trail'],
  'https://img.therunningcollective.fr/hoka-one-one-challenger-atr-7-m-1160x725-MMPB.webp',
  'https://img.therunningcollective.fr/hoka-one-one-challenger-atr-7-m-1160x725-MMPB.webp'
),
(
  'asics-gel-trabuco', 'Asics', 'Gel-Trabuco 12',
  'Trail robuste avec stabilité ASICSGRIP. Parfaite pour les pronateurs qui veulent attaquer les sentiers techniques en toute confiance.',
  139.99,
  ARRAY['pronateur', 'neutre'], ARRAY['trail'],
  'moyen', 8, 320, 'élevée', 'moyen',
  ARRAY['standard'],
  ARRAY['débutant', 'intermédiaire', 'avancé'],
  ARRAY['prévention', 'confort'],
  ARRAY['ASICSGRIP', 'Gel Technology', 'Rock Protection', 'Stabilité trail'],
  'https://images.asics.com/is/image/asics/1011B799_002_SR_RT_GLB?$sfPDP$',
  'https://images.asics.com/is/image/asics/1011B799_002_SR_RT_GLB?$sfPDP$'
),
(
  'brooks-cascadia-17', 'Brooks', 'Cascadia 17',
  'La robustesse trail Brooks. La Cascadia 17 offre une protection totale sur sentiers techniques avec sa semelle Ballistic Rock Shield et son upper renforcé.',
  129.99,
  ARRAY['neutre', 'pronateur'], ARRAY['trail'],
  'moyen', 8, 307, 'élevée', 'moyen',
  ARRAY['standard', 'large'],
  ARRAY['débutant', 'intermédiaire', 'avancé'],
  ARRAY['confort', 'prévention'],
  ARRAY['Rock Shield', 'TrailTack Rubber', 'Stabilité trail', 'Durabilité renforcée'],
  'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw8c3af210/images/110393/110393_407_l_Cascadia17.png',
  'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw8c3af210/images/110393/110393_407_l_Cascadia17.png'
),
(
  'saucony-peregrine-14', 'Saucony', 'Peregrine 14',
  'La flèche trail de Saucony. La Peregrine 14 est ultra-légère pour le trail avec des crampons PWRTRAC redoutables sur tous types de terrains.',
  129.99,
  ARRAY['neutre'], ARRAY['trail', 'mixte'],
  'moyen', 4, 280, 'moyenne', 'élevé',
  ARRAY['standard'],
  ARRAY['intermédiaire', 'avancé'],
  ARRAY['performance'],
  ARRAY['PWRTRAC lugs', 'PWRRUN Foam', 'Légèreté trail', 'Drop naturaliste 4mm'],
  'https://img.therunningcollective.fr/saucony-peregrine-14-m-1160x725-VRTL.webp',
  'https://img.therunningcollective.fr/saucony-peregrine-14-m-1160x725-VRTL.webp'
)

ON CONFLICT (id) DO UPDATE SET
  brand               = EXCLUDED.brand,
  model               = EXCLUDED.model,
  description         = EXCLUDED.description,
  prix                = EXCLUDED.prix,
  foulee              = EXCLUDED.foulee,
  terrain             = EXCLUDED.terrain,
  amorti              = EXCLUDED.amorti,
  drop_mm             = EXCLUDED.drop_mm,
  poids_g             = EXCLUDED.poids_g,
  stabilite           = EXCLUDED.stabilite,
  dynamisme           = EXCLUDED.dynamisme,
  largeur_disponible  = EXCLUDED.largeur_disponible,
  niveau              = EXCLUDED.niveau,
  objectif            = EXCLUDED.objectif,
  benefits            = EXCLUDED.benefits,
  image_url           = COALESCE(shoes.image_url, EXCLUDED.image_url),
  image_original_url  = EXCLUDED.image_original_url,
  updated_at          = NOW();
