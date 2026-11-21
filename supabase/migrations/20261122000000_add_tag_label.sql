-- ==========================================
-- VERTO TAG DISPLAY LABEL MIGRATION
-- Adds human-friendly display label on public.tags.
-- Keeps tag_id untouched for routing (/t/[tag_id]) and ownership.
-- ==========================================

-- 1. Idempotently add nullable display label column
ALTER TABLE public.tags
  ADD COLUMN IF NOT EXISTS label TEXT;

-- 2. Enforce trimmed length bounds at DB layer (matches 50-char app cap)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tags_label_length_check'
      AND conrelid = 'public.tags'::regclass
  ) THEN
    ALTER TABLE public.tags
      ADD CONSTRAINT tags_label_length_check
      CHECK (label IS NULL OR (char_length(btrim(label)) BETWEEN 1 AND 50));
  END IF;
END $$;

-- 3. Grant authenticated role column-level UPDATE for label
--    (Preserves REVOKE UPDATE hardening from 20261120000000_security_hardening.sql)
GRANT UPDATE (label) ON public.tags TO authenticated;

-- 4. Wipe private label automatically when a tag becomes unclaimed (owner_id -> NULL)
CREATE OR REPLACE FUNCTION public.handle_unclaimed_tag_cleanup()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.owner_id IS NOT NULL AND NEW.owner_id IS NULL THEN
    NEW.active_mode := 'social'::public.active_mode;
    NEW.metadata := '{}'::jsonb;
    NEW.label := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
