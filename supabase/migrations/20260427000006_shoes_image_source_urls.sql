-- =============================================================================
-- Migration : image_source_url pour toutes les chaussures du catalogue
-- À appliquer via : Supabase Dashboard → SQL Editor
-- =============================================================================
-- Après application, lancer le script d'upload :
--   SUPABASE_SERVICE_ROLE_KEY=<clé> node scripts/upload-shoe-images.mjs
-- Ce script télécharge chaque image, génère 3 tailles WebP et
-- stocke dans le bucket "shoes", puis met à jour image_url_cdn.
-- =============================================================================

UPDATE public.shoes SET image_source_url = src.url, image_url = src.url
FROM (VALUES
  -- ── ROUTE – POLYVALENTES ───────────────────────────────────────────────────
  ('nike-pegasus-41',           'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/0868a654-c3e9-4342-a64a-5b45df7a8ad8/NIKE+PEGASUS+41.png'),
  ('asics-gt-2000',             'https://images.asics.com/is/image/asics/1011B691_005_SR_RT_GLB?$sfPDP$'),
  ('brooks-ghost-16',           'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw1e8c5a92/images/110418/110418_071_l_Ghost16.png'),
  ('mizuno-wave-rider',         'https://img.therunningcollective.fr/mizuno-wave-rider-28-m-1160x725-0A0101.webp'),
  ('saucony-endorphin-speed',   'https://img.therunningcollective.fr/saucony-endorphin-speed-4-m-1160x725-9A3E30.webp'),
  ('asics-gel-cumulus-26',      'https://img.therunningcollective.fr/asics-gel-cumulus-26-m-1160x725.webp'),
  ('saucony-triumph-22',        'https://img.therunningcollective.fr/saucony-triumph-22-m-1160x725.webp'),
  ('brooks-launch-10',          'https://img.therunningcollective.fr/brooks-launch-10-m-1160x725.webp'),
  ('new-balance-880v13',        'https://img.therunningcollective.fr/new-balance-880v13-m-1160x725.webp'),
  ('hoka-mach-6',               'https://img.therunningcollective.fr/hoka-one-one-mach-6-m-1160x725.webp'),
  ('puma-velocity-nitro-3',     'https://img.therunningcollective.fr/puma-velocity-nitro-3-m-1160x725.webp'),
  ('on-cloud-5',                'https://img.therunningcollective.fr/on-cloud-5-m-1160x725.webp'),
  ('nike-air-winflo-11',        'https://img.therunningcollective.fr/nike-air-winflo-11-m-1160x725.webp'),
  ('nike-zoom-fly-6',           'https://img.therunningcollective.fr/nike-zoom-fly-6-m-1160x725.webp'),
  ('on-cloudflow-4',            'https://img.therunningcollective.fr/on-cloudflow-4-m-1160x725.webp'),
  ('nike-react-miler-3',        'https://img.therunningcollective.fr/nike-react-miler-3-m-1160x725.webp'),

  -- ── ROUTE – AMORTI MAXIMAL ─────────────────────────────────────────────────
  ('hoka-clifton-9',            'https://img.therunningcollective.fr/hoka-one-one-clifton-9-m-1160x725-BCAN.webp'),
  ('hoka-bondi-8',              'https://img.therunningcollective.fr/hoka-one-one-bondi-8-m-1160x725-BWHT.webp'),
  ('asics-gel-nimbus-26',       'https://images.asics.com/is/image/asics/1011B794_001_SR_RT_GLB?$sfPDP$'),
  ('brooks-glycerin-21',        'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw5c4b4e97/images/110412/110412_012_l_Glycerin21.png'),
  ('nike-invincible-3',         'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/dc4e60e4-1769-44df-a184-b07f2ab11bab/NIKE+AIR+ZOOM+INVINCIBLE+3.png'),
  ('hoka-bondi-9',              'https://img.therunningcollective.fr/hoka-one-one-bondi-9-m-1160x725.webp'),
  ('asics-gel-nimbus-27',       'https://img.therunningcollective.fr/asics-gel-nimbus-27-m-1160x725.webp'),
  ('new-balance-fresh-foam-more-v4', 'https://img.therunningcollective.fr/new-balance-fresh-foam-more-v4-m-1160x725.webp'),
  ('new-balance-1080v14',       'https://img.therunningcollective.fr/new-balance-1080v14-m-1160x725.webp'),
  ('adidas-solar-glide-6',      'https://img.therunningcollective.fr/adidas-solar-glide-6-m-1160x725.webp'),
  ('brooks-levitate-6',         'https://img.therunningcollective.fr/brooks-levitate-6-m-1160x725.webp'),
  ('mizuno-wave-sky-8',         'https://img.therunningcollective.fr/mizuno-wave-sky-8-m-1160x725.webp'),
  ('puma-magnify-nitro-2',      'https://img.therunningcollective.fr/puma-magnify-nitro-2-m-1160x725.webp'),
  ('reebok-floatride-energy-5', 'https://img.therunningcollective.fr/reebok-floatride-energy-5-m-1160x725.webp'),
  ('saucony-triumph-21',        'https://img.therunningcollective.fr/saucony-triumph-21-m-1160x725.webp'),

  -- ── ROUTE – DYNAMISME & LÉGÈRETÉ ──────────────────────────────────────────
  ('adidas-ultraboost-light',   'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/4ccb32f14e134ccca2edaf8d017b6f0c_9366/Ultraboost_Light_Shoes_White_GY9350_01_standard.jpg'),
  ('on-cloudmonster-2',         'https://img.therunningcollective.fr/on-cloudmonster-2-m-1160x725-ALL.webp'),
  ('saucony-kinvara-14',        'https://img.therunningcollective.fr/saucony-kinvara-14-m-1160x725-VISC.webp'),
  ('new-balance-fresh-foam',    'https://nb.scene7.com/is/image/NB/m1080v13_nb_02_i?$pdpflexF2$&qlt=80&fmt=webp&wid=440&hei=440'),

  -- ── ROUTE – STABILITÉ PRONATEURS ──────────────────────────────────────────
  ('asics-gt-2000',             'https://images.asics.com/is/image/asics/1011B691_005_SR_RT_GLB?$sfPDP$'),
  ('asics-gt-1000-13',          'https://img.therunningcollective.fr/asics-gt-1000-13-m-1160x725.webp'),
  ('brooks-adrenaline-gts-23',  'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw1e8c5a92/images/120381/120381_416_l_AdrenalineGTS23.png'),
  ('saucony-guide-17',          'https://img.therunningcollective.fr/saucony-guide-17-m-1160x725-ORCH.webp'),
  ('asics-gel-kayano-31',       'https://images.asics.com/is/image/asics/1011B867_001_SR_RT_GLB?$sfPDP$'),
  ('new-balance-860v14',        'https://nb.scene7.com/is/image/NB/m860v14_nb_02_i?$pdpflexF2$&qlt=80&fmt=webp&wid=440&hei=440'),
  ('mizuno-wave-inspire-21',    'https://img.therunningcollective.fr/mizuno-wave-inspire-21-m-1160x725.webp'),
  ('brooks-adrenaline-gts-24',  'https://img.therunningcollective.fr/brooks-adrenaline-gts-24-m-1160x725.webp'),
  ('nike-air-zoom-structure-25','https://img.therunningcollective.fr/nike-air-zoom-structure-25-m-1160x725.webp'),
  ('saucony-hurricane-24',      'https://img.therunningcollective.fr/saucony-hurricane-24-m-1160x725.webp'),
  ('asics-gel-kayano-32',       'https://img.therunningcollective.fr/asics-gel-kayano-32-m-1160x725.webp'),

  -- ── ROUTE – COMPÉTITION ───────────────────────────────────────────────────
  ('nike-vaporfly-3',           'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b1bcddbe-3024-4e5d-b756-fbb1e4763a2b/NIKE+ZOOMX+VAPORFLY+NEXT%25+3.png'),
  ('adidas-adizero-adios-pro-3','https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/adizero-adios-pro-3-shoes/adidas-adizero-adios-pro-3-m-01-standard.jpg'),
  ('nike-alphafly-3',           'https://img.therunningcollective.fr/nike-alphafly-3-m-1160x725.webp'),
  ('saucony-endorphin-pro-4',   'https://img.therunningcollective.fr/saucony-endorphin-pro-4-m-1160x725.webp'),
  ('adidas-adizero-boston-12',  'https://img.therunningcollective.fr/adidas-adizero-boston-12-m-1160x725.webp'),
  ('hoka-rocket-x-2',           'https://img.therunningcollective.fr/hoka-one-one-rocket-x-2-m-1160x725.webp'),
  ('brooks-hyperion-2',         'https://img.therunningcollective.fr/brooks-hyperion-2-m-1160x725.webp'),
  ('new-balance-fuelcell-rebel-v4', 'https://img.therunningcollective.fr/new-balance-fuelcell-rebel-v4-m-1160x725.webp'),
  ('hoka-mach-x-2',             'https://img.therunningcollective.fr/hoka-one-one-mach-x-2-m-1160x725.webp'),

  -- ── TRAIL ─────────────────────────────────────────────────────────────────
  ('hoka-speedgoat-6',          'https://img.therunningcollective.fr/hoka-one-one-speedgoat-6-m-1160x725-CFDR.webp'),
  ('salomon-ultra-glide',       'https://img.therunningcollective.fr/salomon-ultra-glide-2-m-1160x725-780B72.webp'),
  ('asics-gel-trabuco',         'https://images.asics.com/is/image/asics/1011B799_002_SR_RT_GLB?$sfPDP$'),
  ('salomon-speedcross-6',      'https://img.therunningcollective.fr/salomon-speedcross-6-m-1160x725-LC.webp'),
  ('hoka-challenger-7',         'https://img.therunningcollective.fr/hoka-one-one-challenger-atr-7-m-1160x725-MMPB.webp'),
  ('brooks-cascadia-17',        'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw8c3af210/images/110393/110393_407_l_Cascadia17.png'),
  ('saucony-peregrine-14',      'https://img.therunningcollective.fr/saucony-peregrine-14-m-1160x725-VRTL.webp'),
  ('salomon-sense-ride-5',      'https://img.therunningcollective.fr/salomon-sense-ride-5-m-1160x725.webp'),
  ('hoka-zinal-2',              'https://img.therunningcollective.fr/hoka-one-one-zinal-2-m-1160x725.webp'),
  ('adidas-terrex-speed-ultra', 'https://img.therunningcollective.fr/adidas-terrex-speed-ultra-m-1160x725.webp'),
  ('la-sportiva-jackal-2',      'https://img.therunningcollective.fr/la-sportiva-jackal-2-m-1160x725.webp'),
  ('scott-kinabalu-3',          'https://img.therunningcollective.fr/scott-kinabalu-3-m-1160x725.webp'),
  ('saucony-xodus-ultra-3',     'https://img.therunningcollective.fr/saucony-xodus-ultra-3-m-1160x725.webp'),
  ('hoka-torrent-3',            'https://img.therunningcollective.fr/hoka-one-one-torrent-3-m-1160x725.webp'),
  ('nike-wildhorse-8',          'https://img.therunningcollective.fr/nike-wildhorse-8-m-1160x725.webp'),
  ('brooks-caldera-7',          'https://img.therunningcollective.fr/brooks-caldera-7-m-1160x725.webp'),
  ('inov8-trailfly-ultra-g-300-max', 'https://img.therunningcollective.fr/inov-8-trailfly-ultra-g-300-max-m-1160x725.webp'),
  ('merrell-agility-peak-5',    'https://img.therunningcollective.fr/merrell-agility-peak-5-m-1160x725.webp'),
  ('new-balance-fresh-foam-hierro-v7', 'https://img.therunningcollective.fr/new-balance-fresh-foam-hierro-v7-m-1160x725.webp'),
  ('on-cloudventure-peak-3',    'https://img.therunningcollective.fr/on-cloudventure-peak-3-m-1160x725.webp'),
  ('salomon-xa-pro-3d-v9',      'https://img.therunningcollective.fr/salomon-xa-pro-3d-v9-m-1160x725.webp'),
  ('altra-lone-peak-8',         'https://img.therunningcollective.fr/altra-lone-peak-8-m-1160x725.webp')
) AS src(id, url)
WHERE public.shoes.id = src.id;

-- =============================================================================
-- Vérification
-- =============================================================================
-- SELECT id, brand, model, image_source_url IS NOT NULL AS has_source
-- FROM shoes ORDER BY brand, model;
--
-- Résultat attendu : toutes les lignes has_source = true
-- Chaussures sans source (has_source = false) = modèles hors catalogue products.ts
-- → à renseigner manuellement via le backoffice admin
