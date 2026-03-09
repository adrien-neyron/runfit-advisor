DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'link_validation_logs'
      AND policyname = 'No client access to link validation logs'
  ) THEN
    CREATE POLICY "No client access to link validation logs"
    ON public.link_validation_logs
    FOR ALL
    TO public
    USING (false)
    WITH CHECK (false);
  END IF;
END $$;