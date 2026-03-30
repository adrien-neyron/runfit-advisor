-- ============================================================
-- BUCKET "shoes" pour le pipeline admin
-- Structure : shoes/{brand-slug}/{shoe-slug}/thumb.webp
--                                            card.webp
--                                            full.webp
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shoes',
  'shoes',
  true,
  10485760, -- 10 MB par image
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Lecture publique (CDN)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'shoes_bucket_public_read'
  ) THEN
    CREATE POLICY "shoes_bucket_public_read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'shoes');
  END IF;
END $$;

-- Insert via service role uniquement
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'shoes_bucket_service_insert'
  ) THEN
    CREATE POLICY "shoes_bucket_service_insert"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'shoes');
  END IF;
END $$;

-- Update via service role
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'shoes_bucket_service_update'
  ) THEN
    CREATE POLICY "shoes_bucket_service_update"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'shoes');
  END IF;
END $$;

-- Delete via service role
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'shoes_bucket_service_delete'
  ) THEN
    CREATE POLICY "shoes_bucket_service_delete"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'shoes');
  END IF;
END $$;
