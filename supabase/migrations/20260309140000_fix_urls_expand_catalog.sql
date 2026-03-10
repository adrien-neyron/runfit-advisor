-- =============================================================================
-- Migration : correction URLs + extension catalogue (27 chaussures)
-- Stratégie : Amazon.fr en PREMIER (toujours fiable, affiliation)
--             Marques en direct en SECOND (elles maintiennent leur search)
--             Courir.com en TROISIÈME (confirmé fonctionnel)
-- ⚠️  Tag Amazon : remplacer "runfit-21" par votre tag Amazon Associates FR
-- =============================================================================

-- Nettoyage complet pour repartir propre
TRUNCATE TABLE public.shoe_prices CASCADE;

INSERT INTO public.shoe_prices
  (product_id, retailer_name, price, product_url, affiliate_url, stock_status, logo_url, url_status, currency)
VALUES

-- ════════════════════════════════════════════════════════════════════════════
-- ROUTE – NEUTRE
-- ════════════════════════════════════════════════════════════════════════════

-- ── Nike Air Zoom Pegasus 41 ─────────────────────────────────────────────
('nike-pegasus-41','Amazon',124.99,
 'https://www.amazon.fr/s?k=Nike+Air+Zoom+Pegasus+41&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Nike+Air+Zoom+Pegasus+41&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('nike-pegasus-41','Nike',139.99,
 'https://www.nike.com/fr/search?q=pegasus+41',
 'https://www.nike.com/fr/search?q=pegasus+41',
 'in_stock','https://logo.clearbit.com/nike.com','valid','EUR'),

('nike-pegasus-41','Courir',139.99,
 'https://www.courir.com/search?q=Nike+Pegasus+41',
 'https://www.courir.com/search?q=Nike+Pegasus+41',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('nike-pegasus-41','Foot Locker',139.99,
 'https://www.footlocker.fr/search?query=Nike+Pegasus+41',
 'https://www.footlocker.fr/search?query=Nike+Pegasus+41',
 'in_stock','https://logo.clearbit.com/footlocker.fr','valid','EUR'),

('nike-pegasus-41','JD Sports',134.99,
 'https://www.jdsports.fr/search/jd/Nike+Pegasus+41/',
 'https://www.jdsports.fr/search/jd/Nike+Pegasus+41/',
 'in_stock','https://logo.clearbit.com/jdsports.fr','valid','EUR'),

-- ── Brooks Ghost 16 ──────────────────────────────────────────────────────
('brooks-ghost-16','Amazon',119.99,
 'https://www.amazon.fr/s?k=Brooks+Ghost+16&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Brooks+Ghost+16&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('brooks-ghost-16','Brooks',139.99,
 'https://www.brooksrunning.com/fr_fr/search?q=ghost+16',
 'https://www.brooksrunning.com/fr_fr/search?q=ghost+16',
 'in_stock','https://logo.clearbit.com/brooksrunning.com','valid','EUR'),

('brooks-ghost-16','Courir',139.99,
 'https://www.courir.com/search?q=Brooks+Ghost+16',
 'https://www.courir.com/search?q=Brooks+Ghost+16',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('brooks-ghost-16','Intersport',134.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Brooks+Ghost+16',
 'https://www.intersport.fr/catalogsearch/result/?q=Brooks+Ghost+16',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

-- ── New Balance Fresh Foam X 1080v13 ─────────────────────────────────────
('new-balance-fresh-foam','Amazon',139.99,
 'https://www.amazon.fr/s?k=New+Balance+Fresh+Foam+1080v13&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=New+Balance+Fresh+Foam+1080v13&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('new-balance-fresh-foam','New Balance',159.99,
 'https://www.newbalance.fr/search?q=1080v13',
 'https://www.newbalance.fr/search?q=1080v13',
 'in_stock','https://logo.clearbit.com/newbalance.fr','valid','EUR'),

('new-balance-fresh-foam','Courir',159.99,
 'https://www.courir.com/search?q=New+Balance+Fresh+Foam+1080',
 'https://www.courir.com/search?q=New+Balance+Fresh+Foam+1080',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('new-balance-fresh-foam','Foot Locker',159.99,
 'https://www.footlocker.fr/search?query=New+Balance+1080',
 'https://www.footlocker.fr/search?query=New+Balance+1080',
 'in_stock','https://logo.clearbit.com/footlocker.fr','valid','EUR'),

-- ── Saucony Endorphin Speed 4 ────────────────────────────────────────────
('saucony-endorphin-speed','Amazon',159.99,
 'https://www.amazon.fr/s?k=Saucony+Endorphin+Speed+4&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Saucony+Endorphin+Speed+4&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('saucony-endorphin-speed','Saucony',179.99,
 'https://www.saucony.com/fr/search?q=endorphin+speed+4',
 'https://www.saucony.com/fr/search?q=endorphin+speed+4',
 'in_stock','https://logo.clearbit.com/saucony.com','valid','EUR'),

('saucony-endorphin-speed','Courir',179.99,
 'https://www.courir.com/search?q=Saucony+Endorphin+Speed',
 'https://www.courir.com/search?q=Saucony+Endorphin+Speed',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

-- ── Mizuno Wave Rider 28 ─────────────────────────────────────────────────
('mizuno-wave-rider','Amazon',124.99,
 'https://www.amazon.fr/s?k=Mizuno+Wave+Rider+28&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Mizuno+Wave+Rider+28&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('mizuno-wave-rider','Mizuno',144.99,
 'https://www.mizuno.com/eu/fr/search?q=wave+rider+28',
 'https://www.mizuno.com/eu/fr/search?q=wave+rider+28',
 'in_stock','https://logo.clearbit.com/mizuno.com','valid','EUR'),

('mizuno-wave-rider','Courir',144.99,
 'https://www.courir.com/search?q=Mizuno+Wave+Rider+28',
 'https://www.courir.com/search?q=Mizuno+Wave+Rider+28',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

-- ── Hoka Clifton 9 ───────────────────────────────────────────────────────
('hoka-clifton-9','Amazon',129.99,
 'https://www.amazon.fr/s?k=Hoka+Clifton+9&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Hoka+Clifton+9&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('hoka-clifton-9','Hoka',149.99,
 'https://www.hoka.com/fr-fr/search?q=clifton+9',
 'https://www.hoka.com/fr-fr/search?q=clifton+9',
 'in_stock','https://logo.clearbit.com/hoka.com','valid','EUR'),

('hoka-clifton-9','Courir',149.99,
 'https://www.courir.com/search?q=Hoka+Clifton+9',
 'https://www.courir.com/search?q=Hoka+Clifton+9',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('hoka-clifton-9','Intersport',144.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Hoka+Clifton+9',
 'https://www.intersport.fr/catalogsearch/result/?q=Hoka+Clifton+9',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

-- ── Hoka Bondi 8 ─────────────────────────────────────────────────────────
('hoka-bondi-8','Amazon',149.99,
 'https://www.amazon.fr/s?k=Hoka+Bondi+8&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Hoka+Bondi+8&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('hoka-bondi-8','Hoka',169.99,
 'https://www.hoka.com/fr-fr/search?q=bondi+8',
 'https://www.hoka.com/fr-fr/search?q=bondi+8',
 'in_stock','https://logo.clearbit.com/hoka.com','valid','EUR'),

('hoka-bondi-8','Courir',169.99,
 'https://www.courir.com/search?q=Hoka+Bondi+8',
 'https://www.courir.com/search?q=Hoka+Bondi+8',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

-- ── Asics Gel-Nimbus 26 ──────────────────────────────────────────────────
('asics-gel-nimbus-26','Amazon',154.99,
 'https://www.amazon.fr/s?k=Asics+Gel+Nimbus+26&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Asics+Gel+Nimbus+26&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('asics-gel-nimbus-26','Asics',179.99,
 'https://www.asics.com/fr/fr-fr/search?q=Gel-Nimbus+26',
 'https://www.asics.com/fr/fr-fr/search?q=Gel-Nimbus+26',
 'in_stock','https://logo.clearbit.com/asics.com','valid','EUR'),

('asics-gel-nimbus-26','Courir',179.99,
 'https://www.courir.com/search?q=Asics+Nimbus+26',
 'https://www.courir.com/search?q=Asics+Nimbus+26',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('asics-gel-nimbus-26','Intersport',174.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Asics+Gel+Nimbus+26',
 'https://www.intersport.fr/catalogsearch/result/?q=Asics+Gel+Nimbus+26',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

-- ── Brooks Glycerin 21 ───────────────────────────────────────────────────
('brooks-glycerin-21','Amazon',124.99,
 'https://www.amazon.fr/s?k=Brooks+Glycerin+21&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Brooks+Glycerin+21&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('brooks-glycerin-21','Brooks',149.99,
 'https://www.brooksrunning.com/fr_fr/search?q=glycerin+21',
 'https://www.brooksrunning.com/fr_fr/search?q=glycerin+21',
 'in_stock','https://logo.clearbit.com/brooksrunning.com','valid','EUR'),

('brooks-glycerin-21','Courir',149.99,
 'https://www.courir.com/search?q=Brooks+Glycerin+21',
 'https://www.courir.com/search?q=Brooks+Glycerin+21',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

-- ── Nike Air Zoom Invincible 3 ───────────────────────────────────────────
('nike-invincible-3','Amazon',154.99,
 'https://www.amazon.fr/s?k=Nike+Air+Zoom+Invincible+3&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Nike+Air+Zoom+Invincible+3&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('nike-invincible-3','Nike',179.99,
 'https://www.nike.com/fr/search?q=invincible+3',
 'https://www.nike.com/fr/search?q=invincible+3',
 'in_stock','https://logo.clearbit.com/nike.com','valid','EUR'),

('nike-invincible-3','Courir',179.99,
 'https://www.courir.com/search?q=Nike+Invincible+3',
 'https://www.courir.com/search?q=Nike+Invincible+3',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('nike-invincible-3','Foot Locker',179.99,
 'https://www.footlocker.fr/search?query=Nike+Invincible+3',
 'https://www.footlocker.fr/search?query=Nike+Invincible+3',
 'in_stock','https://logo.clearbit.com/footlocker.fr','valid','EUR'),

-- ── Adidas Ultraboost Light ──────────────────────────────────────────────
('adidas-ultraboost-light','Amazon',164.99,
 'https://www.amazon.fr/s?k=Adidas+Ultraboost+Light&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Adidas+Ultraboost+Light&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('adidas-ultraboost-light','Adidas',189.99,
 'https://www.adidas.fr/search?q=ultraboost+light',
 'https://www.adidas.fr/search?q=ultraboost+light',
 'in_stock','https://logo.clearbit.com/adidas.fr','valid','EUR'),

('adidas-ultraboost-light','Courir',189.99,
 'https://www.courir.com/search?q=Adidas+Ultraboost+Light',
 'https://www.courir.com/search?q=Adidas+Ultraboost+Light',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('adidas-ultraboost-light','Foot Locker',189.99,
 'https://www.footlocker.fr/search?query=Adidas+Ultraboost+Light',
 'https://www.footlocker.fr/search?query=Adidas+Ultraboost+Light',
 'in_stock','https://logo.clearbit.com/footlocker.fr','valid','EUR'),

-- ── On Cloudmonster 2 ────────────────────────────────────────────────────
('on-cloudmonster-2','Amazon',154.99,
 'https://www.amazon.fr/s?k=On+Cloudmonster+2&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=On+Cloudmonster+2&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('on-cloudmonster-2','On Running',179.99,
 'https://www.on-running.com/fr-fr/sport/running/search/cloudmonster+2',
 'https://www.on-running.com/fr-fr/sport/running/search/cloudmonster+2',
 'in_stock','https://logo.clearbit.com/on-running.com','valid','EUR'),

('on-cloudmonster-2','Courir',179.99,
 'https://www.courir.com/search?q=On+Cloudmonster+2',
 'https://www.courir.com/search?q=On+Cloudmonster+2',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

-- ── Saucony Kinvara 14 ───────────────────────────────────────────────────
('saucony-kinvara-14','Amazon',89.99,
 'https://www.amazon.fr/s?k=Saucony+Kinvara+14&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Saucony+Kinvara+14&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('saucony-kinvara-14','Saucony',109.99,
 'https://www.saucony.com/fr/search?q=kinvara+14',
 'https://www.saucony.com/fr/search?q=kinvara+14',
 'in_stock','https://logo.clearbit.com/saucony.com','valid','EUR'),

('saucony-kinvara-14','Courir',109.99,
 'https://www.courir.com/search?q=Saucony+Kinvara+14',
 'https://www.courir.com/search?q=Saucony+Kinvara+14',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

-- ════════════════════════════════════════════════════════════════════════════
-- ROUTE – STABILITÉ (PRONATEURS)
-- ════════════════════════════════════════════════════════════════════════════

-- ── Asics GT-2000 12 ─────────────────────────────────────────────────────
('asics-gt-2000','Amazon',129.99,
 'https://www.amazon.fr/s?k=Asics+GT-2000+12&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Asics+GT-2000+12&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('asics-gt-2000','Asics',149.99,
 'https://www.asics.com/fr/fr-fr/search?q=GT-2000+12',
 'https://www.asics.com/fr/fr-fr/search?q=GT-2000+12',
 'in_stock','https://logo.clearbit.com/asics.com','valid','EUR'),

('asics-gt-2000','Courir',149.99,
 'https://www.courir.com/search?q=Asics+GT-2000+12',
 'https://www.courir.com/search?q=Asics+GT-2000+12',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('asics-gt-2000','Foot Locker',149.99,
 'https://www.footlocker.fr/search?query=Asics+GT-2000+12',
 'https://www.footlocker.fr/search?query=Asics+GT-2000+12',
 'in_stock','https://logo.clearbit.com/footlocker.fr','valid','EUR'),

('asics-gt-2000','Intersport',144.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Asics+GT-2000+12',
 'https://www.intersport.fr/catalogsearch/result/?q=Asics+GT-2000+12',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

-- ── Brooks Adrenaline GTS 23 ─────────────────────────────────────────────
('brooks-adrenaline-gts-23','Amazon',109.99,
 'https://www.amazon.fr/s?k=Brooks+Adrenaline+GTS+23&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Brooks+Adrenaline+GTS+23&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('brooks-adrenaline-gts-23','Brooks',129.99,
 'https://www.brooksrunning.com/fr_fr/search?q=adrenaline+gts+23',
 'https://www.brooksrunning.com/fr_fr/search?q=adrenaline+gts+23',
 'in_stock','https://logo.clearbit.com/brooksrunning.com','valid','EUR'),

('brooks-adrenaline-gts-23','Courir',129.99,
 'https://www.courir.com/search?q=Brooks+Adrenaline+GTS+23',
 'https://www.courir.com/search?q=Brooks+Adrenaline+GTS+23',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('brooks-adrenaline-gts-23','Intersport',124.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Brooks+Adrenaline+GTS+23',
 'https://www.intersport.fr/catalogsearch/result/?q=Brooks+Adrenaline+GTS+23',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

-- ── Saucony Guide 17 ─────────────────────────────────────────────────────
('saucony-guide-17','Amazon',114.99,
 'https://www.amazon.fr/s?k=Saucony+Guide+17&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Saucony+Guide+17&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('saucony-guide-17','Saucony',139.99,
 'https://www.saucony.com/fr/search?q=guide+17',
 'https://www.saucony.com/fr/search?q=guide+17',
 'in_stock','https://logo.clearbit.com/saucony.com','valid','EUR'),

('saucony-guide-17','Courir',139.99,
 'https://www.courir.com/search?q=Saucony+Guide+17',
 'https://www.courir.com/search?q=Saucony+Guide+17',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

-- ── Asics Gel-Kayano 31 ──────────────────────────────────────────────────
('asics-gel-kayano-31','Amazon',164.99,
 'https://www.amazon.fr/s?k=Asics+Gel+Kayano+31&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Asics+Gel+Kayano+31&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('asics-gel-kayano-31','Asics',189.99,
 'https://www.asics.com/fr/fr-fr/search?q=Gel-Kayano+31',
 'https://www.asics.com/fr/fr-fr/search?q=Gel-Kayano+31',
 'in_stock','https://logo.clearbit.com/asics.com','valid','EUR'),

('asics-gel-kayano-31','Courir',189.99,
 'https://www.courir.com/search?q=Asics+Kayano+31',
 'https://www.courir.com/search?q=Asics+Kayano+31',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('asics-gel-kayano-31','Intersport',184.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Asics+Gel+Kayano+31',
 'https://www.intersport.fr/catalogsearch/result/?q=Asics+Gel+Kayano+31',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

-- ── New Balance Fresh Foam X 860v14 ──────────────────────────────────────
('new-balance-860v14','Amazon',119.99,
 'https://www.amazon.fr/s?k=New+Balance+860v14&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=New+Balance+860v14&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('new-balance-860v14','New Balance',144.99,
 'https://www.newbalance.fr/search?q=860v14',
 'https://www.newbalance.fr/search?q=860v14',
 'in_stock','https://logo.clearbit.com/newbalance.fr','valid','EUR'),

('new-balance-860v14','Courir',144.99,
 'https://www.courir.com/search?q=New+Balance+860v14',
 'https://www.courir.com/search?q=New+Balance+860v14',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('new-balance-860v14','Foot Locker',144.99,
 'https://www.footlocker.fr/search?query=New+Balance+860v14',
 'https://www.footlocker.fr/search?query=New+Balance+860v14',
 'in_stock','https://logo.clearbit.com/footlocker.fr','valid','EUR'),

-- ════════════════════════════════════════════════════════════════════════════
-- ROUTE – COMPÉTITION
-- ════════════════════════════════════════════════════════════════════════════

-- ── Nike ZoomX Vaporfly 3 ────────────────────────────────────────────────
('nike-vaporfly-3','Amazon',239.99,
 'https://www.amazon.fr/s?k=Nike+Vaporfly+3&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Nike+Vaporfly+3&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('nike-vaporfly-3','Nike',259.99,
 'https://www.nike.com/fr/search?q=vaporfly+3',
 'https://www.nike.com/fr/search?q=vaporfly+3',
 'in_stock','https://logo.clearbit.com/nike.com','valid','EUR'),

('nike-vaporfly-3','Courir',259.99,
 'https://www.courir.com/search?q=Nike+Vaporfly+3',
 'https://www.courir.com/search?q=Nike+Vaporfly+3',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

-- ── Adidas Adizero Adios Pro 3 ───────────────────────────────────────────
('adidas-adizero-adios-pro-3','Amazon',219.99,
 'https://www.amazon.fr/s?k=Adidas+Adizero+Adios+Pro+3&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Adidas+Adizero+Adios+Pro+3&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('adidas-adizero-adios-pro-3','Adidas',249.99,
 'https://www.adidas.fr/search?q=adizero+adios+pro+3',
 'https://www.adidas.fr/search?q=adizero+adios+pro+3',
 'in_stock','https://logo.clearbit.com/adidas.fr','valid','EUR'),

('adidas-adizero-adios-pro-3','Courir',249.99,
 'https://www.courir.com/search?q=Adidas+Adizero+Adios+Pro+3',
 'https://www.courir.com/search?q=Adidas+Adizero+Adios+Pro+3',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

-- ════════════════════════════════════════════════════════════════════════════
-- TRAIL
-- ════════════════════════════════════════════════════════════════════════════

-- ── Hoka Speedgoat 6 ─────────────────────────────────────────────────────
('hoka-speedgoat-6','Amazon',139.99,
 'https://www.amazon.fr/s?k=Hoka+Speedgoat+6&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Hoka+Speedgoat+6&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('hoka-speedgoat-6','Hoka',159.99,
 'https://www.hoka.com/fr-fr/search?q=speedgoat+6',
 'https://www.hoka.com/fr-fr/search?q=speedgoat+6',
 'in_stock','https://logo.clearbit.com/hoka.com','valid','EUR'),

('hoka-speedgoat-6','Courir',159.99,
 'https://www.courir.com/search?q=Hoka+Speedgoat+6',
 'https://www.courir.com/search?q=Hoka+Speedgoat+6',
 'in_stock','https://logo.clearbit.com/courir.com','valid','EUR'),

('hoka-speedgoat-6','Intersport',154.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Hoka+Speedgoat+6',
 'https://www.intersport.fr/catalogsearch/result/?q=Hoka+Speedgoat+6',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

('hoka-speedgoat-6','Sport 2000',154.99,
 'https://www.sport2000.fr/search?q=Hoka+Speedgoat+6',
 'https://www.sport2000.fr/search?q=Hoka+Speedgoat+6',
 'in_stock','https://logo.clearbit.com/sport2000.fr','valid','EUR'),

-- ── Salomon Ultra Glide 2 ────────────────────────────────────────────────
('salomon-ultra-glide','Amazon',129.99,
 'https://www.amazon.fr/s?k=Salomon+Ultra+Glide+2&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Salomon+Ultra+Glide+2&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('salomon-ultra-glide','Salomon',149.99,
 'https://www.salomon.com/fr-fr/search?q=ultra+glide+2',
 'https://www.salomon.com/fr-fr/search?q=ultra+glide+2',
 'in_stock','https://logo.clearbit.com/salomon.com','valid','EUR'),

('salomon-ultra-glide','Intersport',144.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Salomon+Ultra+Glide+2',
 'https://www.intersport.fr/catalogsearch/result/?q=Salomon+Ultra+Glide+2',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

('salomon-ultra-glide','Sport 2000',144.99,
 'https://www.sport2000.fr/search?q=Salomon+Ultra+Glide+2',
 'https://www.sport2000.fr/search?q=Salomon+Ultra+Glide+2',
 'in_stock','https://logo.clearbit.com/sport2000.fr','valid','EUR'),

-- ── Asics Gel-Trabuco 12 ─────────────────────────────────────────────────
('asics-gel-trabuco','Amazon',119.99,
 'https://www.amazon.fr/s?k=Asics+Gel+Trabuco+12&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Asics+Gel+Trabuco+12&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('asics-gel-trabuco','Asics',139.99,
 'https://www.asics.com/fr/fr-fr/search?q=Gel-Trabuco+12',
 'https://www.asics.com/fr/fr-fr/search?q=Gel-Trabuco+12',
 'in_stock','https://logo.clearbit.com/asics.com','valid','EUR'),

('asics-gel-trabuco','Intersport',134.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Asics+Gel+Trabuco+12',
 'https://www.intersport.fr/catalogsearch/result/?q=Asics+Gel+Trabuco+12',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

-- ── Salomon Speedcross 6 ─────────────────────────────────────────────────
('salomon-speedcross-6','Amazon',109.99,
 'https://www.amazon.fr/s?k=Salomon+Speedcross+6&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Salomon+Speedcross+6&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('salomon-speedcross-6','Salomon',129.99,
 'https://www.salomon.com/fr-fr/search?q=speedcross+6',
 'https://www.salomon.com/fr-fr/search?q=speedcross+6',
 'in_stock','https://logo.clearbit.com/salomon.com','valid','EUR'),

('salomon-speedcross-6','Intersport',124.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Salomon+Speedcross+6',
 'https://www.intersport.fr/catalogsearch/result/?q=Salomon+Speedcross+6',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

('salomon-speedcross-6','Sport 2000',124.99,
 'https://www.sport2000.fr/search?q=Salomon+Speedcross+6',
 'https://www.sport2000.fr/search?q=Salomon+Speedcross+6',
 'in_stock','https://logo.clearbit.com/sport2000.fr','valid','EUR'),

-- ── Hoka Challenger ATR 7 ────────────────────────────────────────────────
('hoka-challenger-7','Amazon',109.99,
 'https://www.amazon.fr/s?k=Hoka+Challenger+ATR+7&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Hoka+Challenger+ATR+7&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('hoka-challenger-7','Hoka',129.99,
 'https://www.hoka.com/fr-fr/search?q=challenger+atr+7',
 'https://www.hoka.com/fr-fr/search?q=challenger+atr+7',
 'in_stock','https://logo.clearbit.com/hoka.com','valid','EUR'),

('hoka-challenger-7','Intersport',124.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Hoka+Challenger+7',
 'https://www.intersport.fr/catalogsearch/result/?q=Hoka+Challenger+7',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

-- ── Brooks Cascadia 17 ───────────────────────────────────────────────────
('brooks-cascadia-17','Amazon',109.99,
 'https://www.amazon.fr/s?k=Brooks+Cascadia+17&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Brooks+Cascadia+17&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('brooks-cascadia-17','Brooks',129.99,
 'https://www.brooksrunning.com/fr_fr/search?q=cascadia+17',
 'https://www.brooksrunning.com/fr_fr/search?q=cascadia+17',
 'in_stock','https://logo.clearbit.com/brooksrunning.com','valid','EUR'),

('brooks-cascadia-17','Intersport',124.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Brooks+Cascadia+17',
 'https://www.intersport.fr/catalogsearch/result/?q=Brooks+Cascadia+17',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

('brooks-cascadia-17','Sport 2000',124.99,
 'https://www.sport2000.fr/search?q=Brooks+Cascadia+17',
 'https://www.sport2000.fr/search?q=Brooks+Cascadia+17',
 'in_stock','https://logo.clearbit.com/sport2000.fr','valid','EUR'),

-- ── Saucony Peregrine 14 ─────────────────────────────────────────────────
('saucony-peregrine-14','Amazon',109.99,
 'https://www.amazon.fr/s?k=Saucony+Peregrine+14&i=sporting&tag=runfit-21',
 'https://www.amazon.fr/s?k=Saucony+Peregrine+14&i=sporting&tag=runfit-21',
 'in_stock','https://logo.clearbit.com/amazon.fr','valid','EUR'),

('saucony-peregrine-14','Saucony',129.99,
 'https://www.saucony.com/fr/search?q=peregrine+14',
 'https://www.saucony.com/fr/search?q=peregrine+14',
 'in_stock','https://logo.clearbit.com/saucony.com','valid','EUR'),

('saucony-peregrine-14','Intersport',124.99,
 'https://www.intersport.fr/catalogsearch/result/?q=Saucony+Peregrine+14',
 'https://www.intersport.fr/catalogsearch/result/?q=Saucony+Peregrine+14',
 'in_stock','https://logo.clearbit.com/intersport.fr','valid','EUR'),

('saucony-peregrine-14','Sport 2000',124.99,
 'https://www.sport2000.fr/search?q=Saucony+Peregrine+14',
 'https://www.sport2000.fr/search?q=Saucony+Peregrine+14',
 'in_stock','https://logo.clearbit.com/sport2000.fr','valid','EUR')

ON CONFLICT (product_id, retailer_name) DO UPDATE SET
  price         = EXCLUDED.price,
  product_url   = EXCLUDED.product_url,
  affiliate_url = EXCLUDED.affiliate_url,
  stock_status  = EXCLUDED.stock_status,
  logo_url      = EXCLUDED.logo_url,
  url_status    = EXCLUDED.url_status,
  currency      = EXCLUDED.currency,
  updated_at    = now();
