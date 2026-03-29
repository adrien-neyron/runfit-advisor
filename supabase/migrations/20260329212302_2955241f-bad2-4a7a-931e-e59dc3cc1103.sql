INSERT INTO storage.buckets (id, name, public) VALUES ('shoe-images', 'shoe-images', true);

CREATE POLICY "Public read shoe images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'shoe-images');
CREATE POLICY "Authenticated users upload shoe images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shoe-images');
CREATE POLICY "Authenticated users update shoe images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'shoe-images');
CREATE POLICY "Authenticated users delete shoe images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'shoe-images');

CREATE TABLE public.shoe_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shoe_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shoe images" ON public.shoe_images FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can manage shoe images" ON public.shoe_images FOR ALL TO authenticated USING (true) WITH CHECK (true);