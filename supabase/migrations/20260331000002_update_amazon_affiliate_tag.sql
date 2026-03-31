-- Mise à jour du tag Amazon Associates : runfit-21 → runmatch-21

-- Table merchant_offers : URLs affiliées Amazon
UPDATE public.merchant_offers
SET affiliate_url = REPLACE(affiliate_url, 'tag=runfit-21', 'tag=runmatch-21')
WHERE affiliate_url LIKE '%tag=runfit-21%';

-- Table affiliate_feeds : tag de tracking Amazon
UPDATE public.affiliate_feeds
SET affiliate_tag = 'runmatch-21'
WHERE network = 'amazon' AND affiliate_tag = 'runfit-21';
