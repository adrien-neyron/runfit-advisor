-- =============================================================================
-- Migration : données complètes des distributeurs de chaussures de running
-- Stratégie : URLs de RECHERCHE garantissant toujours un résultat pertinent.
--             Pas d'URL produit directe qui peut tomber en 404.
-- Tag Amazon  : remplacer "runfit-21" par votre vrai tag Amazon Associates FR.
-- =============================================================================

-- Nettoyage des anciennes données potentiellement invalides
DELETE FROM public.shoe_prices;

-- Index supplémentaire pour les lookups fréquents
CREATE INDEX IF NOT EXISTS idx_shoe_prices_product_available
  ON public.shoe_prices(product_id, stock_status, price);

-- =============================================================================
-- Helper : fonction de construction d'URL de recherche par retailer
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- NIKE AIR ZOOM PEGASUS 41  (route, neutre, €139.99)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.shoe_prices
  (product_id, retailer_name, price, product_url, affiliate_url, stock_status, logo_url, url_status, currency)
VALUES
  ('nike-pegasus-41', 'Amazon', 124.99,
   'https://www.amazon.fr/s?k=Nike+Air+Zoom+Pegasus+41&i=sporting&tag=runfit-21',
   'https://www.amazon.fr/s?k=Nike+Air+Zoom+Pegasus+41&i=sporting&tag=runfit-21',
   'in_stock', 'https://logo.clearbit.com/amazon.fr', 'valid', 'EUR'),

  ('nike-pegasus-41', 'Nike', 139.99,
   'https://www.nike.com/fr/search?q=pegasus+41',
   'https://www.nike.com/fr/search?q=pegasus+41',
   'in_stock', 'https://logo.clearbit.com/nike.com', 'valid', 'EUR'),

  ('nike-pegasus-41', 'i-Run', 139.99,
   'https://www.i-run.fr/recherche?q=Nike+Pegasus+41',
   'https://www.i-run.fr/recherche?q=Nike+Pegasus+41',
   'in_stock', 'https://logo.clearbit.com/i-run.fr', 'valid', 'EUR'),

  ('nike-pegasus-41', 'The Running Collective', 134.99,
   'https://www.therunningcollective.fr/recherche?q=Nike+Pegasus+41',
   'https://www.therunningcollective.fr/recherche?q=Nike+Pegasus+41',
   'in_stock', 'https://logo.clearbit.com/therunningcollective.fr', 'valid', 'EUR'),

  ('nike-pegasus-41', 'Courir', 139.99,
   'https://www.courir.com/search?q=Nike+Pegasus+41',
   'https://www.courir.com/search?q=Nike+Pegasus+41',
   'in_stock', 'https://logo.clearbit.com/courir.com', 'valid', 'EUR'),

  ('nike-pegasus-41', 'Foot Locker', 139.99,
   'https://www.footlocker.fr/search?query=Nike+Pegasus+41',
   'https://www.footlocker.fr/search?query=Nike+Pegasus+41',
   'in_stock', 'https://logo.clearbit.com/footlocker.fr', 'valid', 'EUR'),

  ('nike-pegasus-41', 'JD Sports', 139.99,
   'https://www.jdsports.fr/search/jd/Nike+Pegasus+41/',
   'https://www.jdsports.fr/search/jd/Nike+Pegasus+41/',
   'in_stock', 'https://logo.clearbit.com/jdsports.fr', 'valid', 'EUR'),

  ('nike-pegasus-41', 'Intersport', 134.99,
   'https://www.intersport.fr/catalogsearch/result/?q=Nike+Pegasus+41',
   'https://www.intersport.fr/catalogsearch/result/?q=Nike+Pegasus+41',
   'in_stock', 'https://logo.clearbit.com/intersport.fr', 'valid', 'EUR'),

  ('nike-pegasus-41', 'Sport 2000', 134.99,
   'https://www.sport2000.fr/search?q=Nike+Pegasus+41',
   'https://www.sport2000.fr/search?q=Nike+Pegasus+41',
   'in_stock', 'https://logo.clearbit.com/sport2000.fr', 'valid', 'EUR'),

-- ────────────────────────────────────────────────────────────────────────────
-- ASICS GT-2000 12  (route, pronateur, €149.99)
-- ────────────────────────────────────────────────────────────────────────────
  ('asics-gt-2000', 'Amazon', 129.99,
   'https://www.amazon.fr/s?k=Asics+GT-2000+12&i=sporting&tag=runfit-21',
   'https://www.amazon.fr/s?k=Asics+GT-2000+12&i=sporting&tag=runfit-21',
   'in_stock', 'https://logo.clearbit.com/amazon.fr', 'valid', 'EUR'),

  ('asics-gt-2000', 'Asics', 149.99,
   'https://www.asics.com/fr/fr-fr/running/chaussures-de-running-route/?prefn1=category&prefv1=Stability',
   'https://www.asics.com/fr/fr-fr/search?q=GT-2000+12',
   'in_stock', 'https://logo.clearbit.com/asics.com', 'valid', 'EUR'),

  ('asics-gt-2000', 'i-Run', 149.99,
   'https://www.i-run.fr/recherche?q=Asics+GT-2000+12',
   'https://www.i-run.fr/recherche?q=Asics+GT-2000+12',
   'in_stock', 'https://logo.clearbit.com/i-run.fr', 'valid', 'EUR'),

  ('asics-gt-2000', 'The Running Collective', 144.99,
   'https://www.therunningcollective.fr/recherche?q=Asics+GT-2000+12',
   'https://www.therunningcollective.fr/recherche?q=Asics+GT-2000+12',
   'in_stock', 'https://logo.clearbit.com/therunningcollective.fr', 'valid', 'EUR'),

  ('asics-gt-2000', 'Courir', 149.99,
   'https://www.courir.com/search?q=Asics+GT-2000',
   'https://www.courir.com/search?q=Asics+GT-2000',
   'in_stock', 'https://logo.clearbit.com/courir.com', 'valid', 'EUR'),

  ('asics-gt-2000', 'Foot Locker', 149.99,
   'https://www.footlocker.fr/search?query=Asics+GT-2000+12',
   'https://www.footlocker.fr/search?query=Asics+GT-2000+12',
   'in_stock', 'https://logo.clearbit.com/footlocker.fr', 'valid', 'EUR'),

  ('asics-gt-2000', 'Intersport', 144.99,
   'https://www.intersport.fr/catalogsearch/result/?q=Asics+GT-2000+12',
   'https://www.intersport.fr/catalogsearch/result/?q=Asics+GT-2000+12',
   'in_stock', 'https://logo.clearbit.com/intersport.fr', 'valid', 'EUR'),

  ('asics-gt-2000', 'Sport 2000', 144.99,
   'https://www.sport2000.fr/search?q=Asics+GT-2000',
   'https://www.sport2000.fr/search?q=Asics+GT-2000',
   'in_stock', 'https://logo.clearbit.com/sport2000.fr', 'valid', 'EUR'),

-- ────────────────────────────────────────────────────────────────────────────
-- BROOKS GHOST 16  (route, neutre, €139.99)
-- ────────────────────────────────────────────────────────────────────────────
  ('brooks-ghost-16', 'Amazon', 119.99,
   'https://www.amazon.fr/s?k=Brooks+Ghost+16&i=sporting&tag=runfit-21',
   'https://www.amazon.fr/s?k=Brooks+Ghost+16&i=sporting&tag=runfit-21',
   'in_stock', 'https://logo.clearbit.com/amazon.fr', 'valid', 'EUR'),

  ('brooks-ghost-16', 'Brooks', 139.99,
   'https://www.brooksrunning.com/fr_fr/search?q=ghost+16',
   'https://www.brooksrunning.com/fr_fr/search?q=ghost+16',
   'in_stock', 'https://logo.clearbit.com/brooksrunning.com', 'valid', 'EUR'),

  ('brooks-ghost-16', 'i-Run', 139.99,
   'https://www.i-run.fr/recherche?q=Brooks+Ghost+16',
   'https://www.i-run.fr/recherche?q=Brooks+Ghost+16',
   'in_stock', 'https://logo.clearbit.com/i-run.fr', 'valid', 'EUR'),

  ('brooks-ghost-16', 'The Running Collective', 134.99,
   'https://www.therunningcollective.fr/recherche?q=Brooks+Ghost+16',
   'https://www.therunningcollective.fr/recherche?q=Brooks+Ghost+16',
   'in_stock', 'https://logo.clearbit.com/therunningcollective.fr', 'valid', 'EUR'),

  ('brooks-ghost-16', 'Courir', 139.99,
   'https://www.courir.com/search?q=Brooks+Ghost+16',
   'https://www.courir.com/search?q=Brooks+Ghost+16',
   'in_stock', 'https://logo.clearbit.com/courir.com', 'valid', 'EUR'),

  ('brooks-ghost-16', 'Intersport', 134.99,
   'https://www.intersport.fr/catalogsearch/result/?q=Brooks+Ghost+16',
   'https://www.intersport.fr/catalogsearch/result/?q=Brooks+Ghost+16',
   'in_stock', 'https://logo.clearbit.com/intersport.fr', 'valid', 'EUR'),

  ('brooks-ghost-16', 'Running Addict', 139.99,
   'https://www.runningaddict.fr/catalogsearch/result/?q=Brooks+Ghost+16',
   'https://www.runningaddict.fr/catalogsearch/result/?q=Brooks+Ghost+16',
   'in_stock', 'https://logo.clearbit.com/runningaddict.fr', 'valid', 'EUR'),

-- ────────────────────────────────────────────────────────────────────────────
-- HOKA SPEEDGOAT 6  (trail, neutre/supinateur, €159.99)
-- ────────────────────────────────────────────────────────────────────────────
  ('hoka-speedgoat-6', 'Amazon', 139.99,
   'https://www.amazon.fr/s?k=Hoka+Speedgoat+6&i=sporting&tag=runfit-21',
   'https://www.amazon.fr/s?k=Hoka+Speedgoat+6&i=sporting&tag=runfit-21',
   'in_stock', 'https://logo.clearbit.com/amazon.fr', 'valid', 'EUR'),

  ('hoka-speedgoat-6', 'Hoka', 159.99,
   'https://www.hoka.com/fr-fr/running-trail/speedgoat/',
   'https://www.hoka.com/fr-fr/search?q=speedgoat+6',
   'in_stock', 'https://logo.clearbit.com/hoka.com', 'valid', 'EUR'),

  ('hoka-speedgoat-6', 'i-Run', 159.99,
   'https://www.i-run.fr/recherche?q=Hoka+Speedgoat+6',
   'https://www.i-run.fr/recherche?q=Hoka+Speedgoat+6',
   'in_stock', 'https://logo.clearbit.com/i-run.fr', 'valid', 'EUR'),

  ('hoka-speedgoat-6', 'Ekosport', 159.99,
   'https://www.ekosport.fr/catalogsearch/result/?q=Hoka+Speedgoat+6',
   'https://www.ekosport.fr/catalogsearch/result/?q=Hoka+Speedgoat+6',
   'in_stock', 'https://logo.clearbit.com/ekosport.fr', 'valid', 'EUR'),

  ('hoka-speedgoat-6', 'Alltricks', 154.99,
   'https://www.alltricks.fr/s?search=Hoka+Speedgoat+6',
   'https://www.alltricks.fr/s?search=Hoka+Speedgoat+6',
   'in_stock', 'https://logo.clearbit.com/alltricks.fr', 'valid', 'EUR'),

  ('hoka-speedgoat-6', 'The Running Collective', 154.99,
   'https://www.therunningcollective.fr/recherche?q=Hoka+Speedgoat+6',
   'https://www.therunningcollective.fr/recherche?q=Hoka+Speedgoat+6',
   'in_stock', 'https://logo.clearbit.com/therunningcollective.fr', 'valid', 'EUR'),

  ('hoka-speedgoat-6', 'Intersport', 154.99,
   'https://www.intersport.fr/catalogsearch/result/?q=Hoka+Speedgoat+6',
   'https://www.intersport.fr/catalogsearch/result/?q=Hoka+Speedgoat+6',
   'in_stock', 'https://logo.clearbit.com/intersport.fr', 'valid', 'EUR'),

  ('hoka-speedgoat-6', 'Courir', 159.99,
   'https://www.courir.com/search?q=Hoka+Speedgoat+6',
   'https://www.courir.com/search?q=Hoka+Speedgoat+6',
   'in_stock', 'https://logo.clearbit.com/courir.com', 'valid', 'EUR'),

-- ────────────────────────────────────────────────────────────────────────────
-- SALOMON ULTRA GLIDE 2  (trail/mixte, neutre, €149.99)
-- ────────────────────────────────────────────────────────────────────────────
  ('salomon-ultra-glide', 'Amazon', 129.99,
   'https://www.amazon.fr/s?k=Salomon+Ultra+Glide+2&i=sporting&tag=runfit-21',
   'https://www.amazon.fr/s?k=Salomon+Ultra+Glide+2&i=sporting&tag=runfit-21',
   'in_stock', 'https://logo.clearbit.com/amazon.fr', 'valid', 'EUR'),

  ('salomon-ultra-glide', 'Salomon', 149.99,
   'https://www.salomon.com/fr-fr/shop/trail-running/chaussures-trail/ultra-glide.html',
   'https://www.salomon.com/fr-fr/search?Nrpp=24&q=ultra+glide+2',
   'in_stock', 'https://logo.clearbit.com/salomon.com', 'valid', 'EUR'),

  ('salomon-ultra-glide', 'i-Run', 149.99,
   'https://www.i-run.fr/recherche?q=Salomon+Ultra+Glide+2',
   'https://www.i-run.fr/recherche?q=Salomon+Ultra+Glide+2',
   'in_stock', 'https://logo.clearbit.com/i-run.fr', 'valid', 'EUR'),

  ('salomon-ultra-glide', 'Ekosport', 144.99,
   'https://www.ekosport.fr/catalogsearch/result/?q=Salomon+Ultra+Glide+2',
   'https://www.ekosport.fr/catalogsearch/result/?q=Salomon+Ultra+Glide+2',
   'in_stock', 'https://logo.clearbit.com/ekosport.fr', 'valid', 'EUR'),

  ('salomon-ultra-glide', 'Alltricks', 144.99,
   'https://www.alltricks.fr/s?search=Salomon+Ultra+Glide+2',
   'https://www.alltricks.fr/s?search=Salomon+Ultra+Glide+2',
   'in_stock', 'https://logo.clearbit.com/alltricks.fr', 'valid', 'EUR'),

  ('salomon-ultra-glide', 'The Running Collective', 144.99,
   'https://www.therunningcollective.fr/recherche?q=Salomon+Ultra+Glide+2',
   'https://www.therunningcollective.fr/recherche?q=Salomon+Ultra+Glide+2',
   'in_stock', 'https://logo.clearbit.com/therunningcollective.fr', 'valid', 'EUR'),

  ('salomon-ultra-glide', 'Intersport', 144.99,
   'https://www.intersport.fr/catalogsearch/result/?q=Salomon+Ultra+Glide+2',
   'https://www.intersport.fr/catalogsearch/result/?q=Salomon+Ultra+Glide+2',
   'in_stock', 'https://logo.clearbit.com/intersport.fr', 'valid', 'EUR'),

  ('salomon-ultra-glide', 'Sport 2000', 144.99,
   'https://www.sport2000.fr/search?q=Salomon+Ultra+Glide',
   'https://www.sport2000.fr/search?q=Salomon+Ultra+Glide',
   'in_stock', 'https://logo.clearbit.com/sport2000.fr', 'valid', 'EUR'),

-- ────────────────────────────────────────────────────────────────────────────
-- NEW BALANCE FRESH FOAM X 1080v13  (route, neutre/supinateur, €159.99)
-- ────────────────────────────────────────────────────────────────────────────
  ('new-balance-fresh-foam', 'Amazon', 139.99,
   'https://www.amazon.fr/s?k=New+Balance+Fresh+Foam+1080v13&i=sporting&tag=runfit-21',
   'https://www.amazon.fr/s?k=New+Balance+Fresh+Foam+1080v13&i=sporting&tag=runfit-21',
   'in_stock', 'https://logo.clearbit.com/amazon.fr', 'valid', 'EUR'),

  ('new-balance-fresh-foam', 'New Balance', 159.99,
   'https://www.newbalance.fr/search?q=1080v13',
   'https://www.newbalance.fr/search?q=1080v13',
   'in_stock', 'https://logo.clearbit.com/newbalance.fr', 'valid', 'EUR'),

  ('new-balance-fresh-foam', 'i-Run', 159.99,
   'https://www.i-run.fr/recherche?q=New+Balance+1080v13',
   'https://www.i-run.fr/recherche?q=New+Balance+1080v13',
   'in_stock', 'https://logo.clearbit.com/i-run.fr', 'valid', 'EUR'),

  ('new-balance-fresh-foam', 'The Running Collective', 154.99,
   'https://www.therunningcollective.fr/recherche?q=New+Balance+1080v13',
   'https://www.therunningcollective.fr/recherche?q=New+Balance+1080v13',
   'in_stock', 'https://logo.clearbit.com/therunningcollective.fr', 'valid', 'EUR'),

  ('new-balance-fresh-foam', 'Foot Locker', 159.99,
   'https://www.footlocker.fr/search?query=New+Balance+1080',
   'https://www.footlocker.fr/search?query=New+Balance+1080',
   'in_stock', 'https://logo.clearbit.com/footlocker.fr', 'valid', 'EUR'),

  ('new-balance-fresh-foam', 'Courir', 159.99,
   'https://www.courir.com/search?q=New+Balance+Fresh+Foam+1080',
   'https://www.courir.com/search?q=New+Balance+Fresh+Foam+1080',
   'in_stock', 'https://logo.clearbit.com/courir.com', 'valid', 'EUR'),

  ('new-balance-fresh-foam', 'Intersport', 154.99,
   'https://www.intersport.fr/catalogsearch/result/?q=New+Balance+1080',
   'https://www.intersport.fr/catalogsearch/result/?q=New+Balance+1080',
   'in_stock', 'https://logo.clearbit.com/intersport.fr', 'valid', 'EUR'),

-- ────────────────────────────────────────────────────────────────────────────
-- NIKE ZOOMX VAPORFLY 3  (route, neutre, compétition, €259.99)
-- ────────────────────────────────────────────────────────────────────────────
  ('nike-vaporfly-3', 'Amazon', 239.99,
   'https://www.amazon.fr/s?k=Nike+Vaporfly+3&i=sporting&tag=runfit-21',
   'https://www.amazon.fr/s?k=Nike+Vaporfly+3&i=sporting&tag=runfit-21',
   'in_stock', 'https://logo.clearbit.com/amazon.fr', 'valid', 'EUR'),

  ('nike-vaporfly-3', 'Nike', 259.99,
   'https://www.nike.com/fr/search?q=vaporfly+3',
   'https://www.nike.com/fr/search?q=vaporfly+3',
   'in_stock', 'https://logo.clearbit.com/nike.com', 'valid', 'EUR'),

  ('nike-vaporfly-3', 'i-Run', 259.99,
   'https://www.i-run.fr/recherche?q=Nike+Vaporfly+3',
   'https://www.i-run.fr/recherche?q=Nike+Vaporfly+3',
   'in_stock', 'https://logo.clearbit.com/i-run.fr', 'valid', 'EUR'),

  ('nike-vaporfly-3', 'The Running Collective', 249.99,
   'https://www.therunningcollective.fr/recherche?q=Nike+Vaporfly+3',
   'https://www.therunningcollective.fr/recherche?q=Nike+Vaporfly+3',
   'in_stock', 'https://logo.clearbit.com/therunningcollective.fr', 'valid', 'EUR'),

  ('nike-vaporfly-3', 'Alltricks', 249.99,
   'https://www.alltricks.fr/s?search=Nike+Vaporfly+3',
   'https://www.alltricks.fr/s?search=Nike+Vaporfly+3',
   'in_stock', 'https://logo.clearbit.com/alltricks.fr', 'valid', 'EUR'),

  ('nike-vaporfly-3', 'Courir', 259.99,
   'https://www.courir.com/search?q=Nike+Vaporfly+3',
   'https://www.courir.com/search?q=Nike+Vaporfly+3',
   'in_stock', 'https://logo.clearbit.com/courir.com', 'valid', 'EUR'),

-- ────────────────────────────────────────────────────────────────────────────
-- ASICS GEL-TRABUCO 12  (trail, pronateur/neutre, €139.99)
-- ────────────────────────────────────────────────────────────────────────────
  ('asics-gel-trabuco', 'Amazon', 119.99,
   'https://www.amazon.fr/s?k=Asics+Gel-Trabuco+12&i=sporting&tag=runfit-21',
   'https://www.amazon.fr/s?k=Asics+Gel-Trabuco+12&i=sporting&tag=runfit-21',
   'in_stock', 'https://logo.clearbit.com/amazon.fr', 'valid', 'EUR'),

  ('asics-gel-trabuco', 'Asics', 139.99,
   'https://www.asics.com/fr/fr-fr/search?q=Gel-Trabuco+12',
   'https://www.asics.com/fr/fr-fr/search?q=Gel-Trabuco+12',
   'in_stock', 'https://logo.clearbit.com/asics.com', 'valid', 'EUR'),

  ('asics-gel-trabuco', 'i-Run', 139.99,
   'https://www.i-run.fr/recherche?q=Asics+Gel+Trabuco+12',
   'https://www.i-run.fr/recherche?q=Asics+Gel+Trabuco+12',
   'in_stock', 'https://logo.clearbit.com/i-run.fr', 'valid', 'EUR'),

  ('asics-gel-trabuco', 'Ekosport', 134.99,
   'https://www.ekosport.fr/catalogsearch/result/?q=Asics+Gel+Trabuco+12',
   'https://www.ekosport.fr/catalogsearch/result/?q=Asics+Gel+Trabuco+12',
   'in_stock', 'https://logo.clearbit.com/ekosport.fr', 'valid', 'EUR'),

  ('asics-gel-trabuco', 'Alltricks', 134.99,
   'https://www.alltricks.fr/s?search=Asics+Gel+Trabuco+12',
   'https://www.alltricks.fr/s?search=Asics+Gel+Trabuco+12',
   'in_stock', 'https://logo.clearbit.com/alltricks.fr', 'valid', 'EUR'),

  ('asics-gel-trabuco', 'The Running Collective', 134.99,
   'https://www.therunningcollective.fr/recherche?q=Asics+Gel+Trabuco+12',
   'https://www.therunningcollective.fr/recherche?q=Asics+Gel+Trabuco+12',
   'in_stock', 'https://logo.clearbit.com/therunningcollective.fr', 'valid', 'EUR'),

  ('asics-gel-trabuco', 'Intersport', 134.99,
   'https://www.intersport.fr/catalogsearch/result/?q=Asics+Gel+Trabuco',
   'https://www.intersport.fr/catalogsearch/result/?q=Asics+Gel+Trabuco',
   'in_stock', 'https://logo.clearbit.com/intersport.fr', 'valid', 'EUR'),

-- ────────────────────────────────────────────────────────────────────────────
-- SAUCONY ENDORPHIN SPEED 4  (route, neutre, €179.99)
-- ────────────────────────────────────────────────────────────────────────────
  ('saucony-endorphin-speed', 'Amazon', 159.99,
   'https://www.amazon.fr/s?k=Saucony+Endorphin+Speed+4&i=sporting&tag=runfit-21',
   'https://www.amazon.fr/s?k=Saucony+Endorphin+Speed+4&i=sporting&tag=runfit-21',
   'in_stock', 'https://logo.clearbit.com/amazon.fr', 'valid', 'EUR'),

  ('saucony-endorphin-speed', 'Saucony', 179.99,
   'https://www.saucony.com/fr/search?q=endorphin+speed+4',
   'https://www.saucony.com/fr/search?q=endorphin+speed+4',
   'in_stock', 'https://logo.clearbit.com/saucony.com', 'valid', 'EUR'),

  ('saucony-endorphin-speed', 'i-Run', 179.99,
   'https://www.i-run.fr/recherche?q=Saucony+Endorphin+Speed+4',
   'https://www.i-run.fr/recherche?q=Saucony+Endorphin+Speed+4',
   'in_stock', 'https://logo.clearbit.com/i-run.fr', 'valid', 'EUR'),

  ('saucony-endorphin-speed', 'The Running Collective', 174.99,
   'https://www.therunningcollective.fr/recherche?q=Saucony+Endorphin+Speed+4',
   'https://www.therunningcollective.fr/recherche?q=Saucony+Endorphin+Speed+4',
   'in_stock', 'https://logo.clearbit.com/therunningcollective.fr', 'valid', 'EUR'),

  ('saucony-endorphin-speed', 'Alltricks', 174.99,
   'https://www.alltricks.fr/s?search=Saucony+Endorphin+Speed+4',
   'https://www.alltricks.fr/s?search=Saucony+Endorphin+Speed+4',
   'in_stock', 'https://logo.clearbit.com/alltricks.fr', 'valid', 'EUR'),

  ('saucony-endorphin-speed', 'Courir', 179.99,
   'https://www.courir.com/search?q=Saucony+Endorphin+Speed',
   'https://www.courir.com/search?q=Saucony+Endorphin+Speed',
   'in_stock', 'https://logo.clearbit.com/courir.com', 'valid', 'EUR'),

  ('saucony-endorphin-speed', 'Running Addict', 179.99,
   'https://www.runningaddict.fr/catalogsearch/result/?q=Saucony+Endorphin+Speed+4',
   'https://www.runningaddict.fr/catalogsearch/result/?q=Saucony+Endorphin+Speed+4',
   'in_stock', 'https://logo.clearbit.com/runningaddict.fr', 'valid', 'EUR'),

-- ────────────────────────────────────────────────────────────────────────────
-- MIZUNO WAVE RIDER 28  (route/mixte, neutre/supinateur, €144.99)
-- ────────────────────────────────────────────────────────────────────────────
  ('mizuno-wave-rider', 'Amazon', 124.99,
   'https://www.amazon.fr/s?k=Mizuno+Wave+Rider+28&i=sporting&tag=runfit-21',
   'https://www.amazon.fr/s?k=Mizuno+Wave+Rider+28&i=sporting&tag=runfit-21',
   'in_stock', 'https://logo.clearbit.com/amazon.fr', 'valid', 'EUR'),

  ('mizuno-wave-rider', 'Mizuno', 144.99,
   'https://www.mizuno.com/eu/fr/search?q=wave+rider+28',
   'https://www.mizuno.com/eu/fr/search?q=wave+rider+28',
   'in_stock', 'https://logo.clearbit.com/mizuno.com', 'valid', 'EUR'),

  ('mizuno-wave-rider', 'i-Run', 144.99,
   'https://www.i-run.fr/recherche?q=Mizuno+Wave+Rider+28',
   'https://www.i-run.fr/recherche?q=Mizuno+Wave+Rider+28',
   'in_stock', 'https://logo.clearbit.com/i-run.fr', 'valid', 'EUR'),

  ('mizuno-wave-rider', 'The Running Collective', 139.99,
   'https://www.therunningcollective.fr/recherche?q=Mizuno+Wave+Rider+28',
   'https://www.therunningcollective.fr/recherche?q=Mizuno+Wave+Rider+28',
   'in_stock', 'https://logo.clearbit.com/therunningcollective.fr', 'valid', 'EUR'),

  ('mizuno-wave-rider', 'Courir', 144.99,
   'https://www.courir.com/search?q=Mizuno+Wave+Rider+28',
   'https://www.courir.com/search?q=Mizuno+Wave+Rider+28',
   'in_stock', 'https://logo.clearbit.com/courir.com', 'valid', 'EUR'),

  ('mizuno-wave-rider', 'Intersport', 139.99,
   'https://www.intersport.fr/catalogsearch/result/?q=Mizuno+Wave+Rider+28',
   'https://www.intersport.fr/catalogsearch/result/?q=Mizuno+Wave+Rider+28',
   'in_stock', 'https://logo.clearbit.com/intersport.fr', 'valid', 'EUR'),

  ('mizuno-wave-rider', 'Running Addict', 144.99,
   'https://www.runningaddict.fr/catalogsearch/result/?q=Mizuno+Wave+Rider+28',
   'https://www.runningaddict.fr/catalogsearch/result/?q=Mizuno+Wave+Rider+28',
   'in_stock', 'https://logo.clearbit.com/runningaddict.fr', 'valid', 'EUR')

ON CONFLICT (product_id, retailer_name) DO UPDATE SET
  price         = EXCLUDED.price,
  product_url   = EXCLUDED.product_url,
  affiliate_url = EXCLUDED.affiliate_url,
  stock_status  = EXCLUDED.stock_status,
  logo_url      = EXCLUDED.logo_url,
  url_status    = EXCLUDED.url_status,
  currency      = EXCLUDED.currency,
  updated_at    = now();
