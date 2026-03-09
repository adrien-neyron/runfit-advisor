ALTER TABLE public.shoe_prices
ADD COLUMN IF NOT EXISTS shoe_model_id text,
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS last_verified_at timestamp with time zone;

UPDATE public.shoe_prices
SET shoe_model_id = COALESCE(shoe_model_id, product_id),
    last_verified_at = COALESCE(last_verified_at, last_checked_at, now()),
    currency = COALESCE(currency, 'EUR')
WHERE shoe_model_id IS NULL OR last_verified_at IS NULL OR currency IS NULL;