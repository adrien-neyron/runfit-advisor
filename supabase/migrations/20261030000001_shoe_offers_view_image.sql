-- Expose la photo du marchand dans v_shoe_offers (colonne ajoutée à la fin : les droits existants sont conservés).
create or replace view public.v_shoe_offers
with (security_invoker = true) as
select
  sp.product_id                                   as shoe_id,
  m.slug                                          as merchant_slug,
  m.name                                          as merchant_name,
  m.affiliate_network                             as network,
  substring(sp.product_url from '/(?:dp|gp/product)/([A-Z0-9]{10})') as asin,
  sp.product_url,
  case when sp.price > 0 and sp.last_checked_at > now() - interval '7 days' then sp.price else null end as price,
  sp.last_checked_at                              as price_checked_at,
  sp.stock_status,
  coalesce(sp.priority_rank::integer, 50)         as priority_rank,
  sp.merchant_image_url
from public.shoe_prices sp
join public.shoes s on s.id = sp.product_id
join public.merchants m
  on m.is_active and public.norm_merchant_key(m.slug) = public.norm_merchant_key(sp.retailer_name)
where coalesce(sp.url_status, 'unknown') <> 'broken'
  and coalesce(sp.stock_status, 'in_stock') <> 'out_of_stock'
  and public.is_direct_product_url(sp.product_url, sp.retailer_name)
  and (m.affiliate_network = 'amazon'
       or (m.affiliate_network = 'awin' and coalesce(m.affiliate_tag, '') <> ''));
