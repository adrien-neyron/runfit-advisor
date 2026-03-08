
-- Shoe prices table with direct product URLs
CREATE TABLE public.shoe_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  retailer_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  product_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  stock_status TEXT NOT NULL DEFAULT 'in_stock',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, retailer_name)
);

-- Click analytics table
CREATE TABLE public.click_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id TEXT NOT NULL,
  retailer_name TEXT NOT NULL,
  shoe_model TEXT NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies - shoe_prices readable by all, click_analytics insertable by authenticated
ALTER TABLE public.shoe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shoe prices" ON public.shoe_prices FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert click analytics" ON public.click_analytics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can read click analytics" ON public.click_analytics FOR SELECT USING (true);
