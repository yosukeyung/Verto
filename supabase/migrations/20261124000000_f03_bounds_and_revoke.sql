-- ==========================================
-- VERTO F-03 SECURITY HARDENING MIGRATION
-- 1. Revoke unused direct PostgREST UPDATE on public.users (updates go via /api/profile)
-- 2. Enforce JSONB size bound on tags.metadata and untrimmed length bound on tags.label
-- ==========================================

-- 1. Revoke direct UPDATE on public.users from client roles
REVOKE UPDATE ON public.users FROM authenticated, anon;

-- 2. Normalize any legacy oversized untrimmed tag labels before adding constraint
UPDATE public.tags
SET label = left(btrim(label), 50)
WHERE label IS NOT NULL
  AND char_length(label) > 50;

-- 3. Add size/length CHECK constraints on public.tags idempotently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tags_metadata_size_check'
      AND conrelid = 'public.tags'::regclass
  ) THEN
    ALTER TABLE public.tags
      ADD CONSTRAINT tags_metadata_size_check
      CHECK (pg_column_size(metadata) <= 16384);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tags_label_raw_length_check'
      AND conrelid = 'public.tags'::regclass
  ) THEN
    ALTER TABLE public.tags
      ADD CONSTRAINT tags_label_raw_length_check
      CHECK (label IS NULL OR char_length(label) <= 50);
  END IF;
END $$;
