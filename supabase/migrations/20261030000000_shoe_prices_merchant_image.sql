-- Photo du marchand pour chaque offre (fournie par le flux produit).
-- Elle correspond exactement à la variante (couleur / genre) du lien affilié.
alter table public.shoe_prices
  add column if not exists merchant_image_url text;

comment on column public.shoe_prices.merchant_image_url is
  'URL de la photo produit fournie par le flux du marchand (variante liée à product_url).';
