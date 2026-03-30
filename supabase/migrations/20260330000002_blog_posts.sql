-- ============================================================
-- Table blog_posts — articles du blog RunMatch
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT    NOT NULL,
  slug         TEXT    NOT NULL UNIQUE,
  excerpt      TEXT    NOT NULL DEFAULT '',
  content      TEXT    NOT NULL DEFAULT '',
  cover_url    TEXT,
  published    BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  author_name  TEXT    NOT NULL DEFAULT 'RunMatch',
  tags         TEXT[]  NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_posts_slug_idx        ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx   ON public.blog_posts (published);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON public.blog_posts (published_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.blog_posts_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.blog_posts_set_updated_at();

-- RLS : lecture publique pour les articles publiés
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_posts_public_read"
  ON public.blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "blog_posts_service_write"
  ON public.blog_posts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
