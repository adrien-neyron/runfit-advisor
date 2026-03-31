-- Mise à jour du tag Amazon Associates : runfit-21 → runmatch-21

-- Table shoe_prices : URLs affiliées Amazon
UPDATE public.shoe_prices
SET affiliate_url = REPLACE(affiliate_url, 'tag=runfit-21', 'tag=runmatch-21')
WHERE affiliate_url LIKE '%tag=runfit-21%';

