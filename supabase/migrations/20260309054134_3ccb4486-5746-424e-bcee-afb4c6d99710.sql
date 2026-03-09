ALTER TABLE public.shoe_prices
ADD COLUMN IF NOT EXISTS fallback_url text;

ALTER TABLE public.shoe_prices
ALTER COLUMN last_checked_at SET DEFAULT now();

CREATE TABLE IF NOT EXISTS public.link_validation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shoe_price_id uuid NOT NULL REFERENCES public.shoe_prices(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  retailer_name text NOT NULL,
  checked_url text NOT NULL,
  resolved_url text,
  status_code integer,
  result text NOT NULL,
  error_message text,
  checked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.link_validation_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_link_validation_logs_offer_checked
ON public.link_validation_logs(shoe_price_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_shoe_prices_url_health
ON public.shoe_prices(product_id, url_status, last_checked_at);