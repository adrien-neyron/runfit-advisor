-- =============================================================================
-- Mise à jour des URLs Amazon avec ASINs directs
-- Remplace les URLs de recherche (?k=...) par des liens produit directs (/dp/ASIN/)
-- Source : curation manuelle via Amazon.fr — Mars 2026
-- =============================================================================

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0DP37H16X/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0DP37H16X/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'nike-pegasus-41' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CYTJDZ1C/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CYTJDZ1C/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'asics-gt-2000' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CW6LR1CD/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CW6LR1CD/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'brooks-ghost-16' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CTRK79VG/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CTRK79VG/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'hoka-speedgoat-6' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CFG8Z5XK/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CFG8Z5XK/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'salomon-ultra-glide' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CL7QTDTM/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CL7QTDTM/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'new-balance-fresh-foam' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CJK2T9S2/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CJK2T9S2/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'nike-vaporfly-3' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CYTJGRP2/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CYTJGRP2/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'asics-gel-trabuco' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0D8RKVLVR/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0D8RKVLVR/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'saucony-endorphin-speed' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0DPVPVLDW/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0DPVPVLDW/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'mizuno-wave-rider' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0D8V3WCR2/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0D8V3WCR2/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'hoka-clifton-9' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CG82F31T/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CG82F31T/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'hoka-bondi-8' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CFP9RFVZ/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CFP9RFVZ/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'asics-gel-nimbus-26' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CL7B5T3B/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CL7B5T3B/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'brooks-glycerin-21' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CL7WTDNJ/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CL7WTDNJ/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'nike-invincible-3' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0C91QS3Z6/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0C91QS3Z6/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'adidas-ultraboost-light' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0D18DFXYT/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0D18DFXYT/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'on-cloudmonster-2' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0C3XH2LP2/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0C3XH2LP2/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'saucony-kinvara-14' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0C66KF7DD/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0C66KF7DD/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'brooks-adrenaline-gts-23' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CTY25F5X/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CTY25F5X/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'saucony-guide-17' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0D9BPT8D9/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0D9BPT8D9/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'asics-gel-kayano-31' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CR7HYGZK/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CR7HYGZK/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'new-balance-860v14' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CCK6HGFW/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CCK6HGFW/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'adidas-adizero-adios-pro-3' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0BNJDRJTS/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0BNJDRJTS/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'salomon-speedcross-6' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0BQ76D75K/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0BQ76D75K/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'hoka-challenger-7' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0C66LGJB7/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0C66LGJB7/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'brooks-cascadia-17' AND retailer_name = 'Amazon';

UPDATE public.shoe_prices SET
  product_url   = 'https://www.amazon.fr/dp/B0CTVHKH9D/?tag=runmatch-21',
  affiliate_url = 'https://www.amazon.fr/dp/B0CTVHKH9D/?tag=runmatch-21',
  url_status    = 'valid',
  updated_at    = now()
WHERE product_id = 'saucony-peregrine-14' AND retailer_name = 'Amazon';
