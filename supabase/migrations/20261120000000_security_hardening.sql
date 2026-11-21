-- ==========================================
-- VERTO SECURITY HARDENING MIGRATION
-- Addresses Findings #3 and #5 from SECURITY_AUDIT.md
-- ==========================================

-- 1. Idempotently add profile columns used by application code
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_id TEXT DEFAULT 'love';

-- 2. Sync handle_new_user() trigger with profile columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name, avatar_id)
  VALUES (
    NEW.id,
    NEW.email,
    'user'::public.user_role,
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ''),
    COALESCE(NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'avatar_id', '')), ''), 'love')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Automatic PII/metadata cleanup when a tag becomes unclaimed (owner_id -> NULL)
CREATE OR REPLACE FUNCTION public.handle_unclaimed_tag_cleanup()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.owner_id IS NOT NULL AND NEW.owner_id IS NULL THEN
    NEW.active_mode := 'social'::public.active_mode;
    NEW.metadata := '{}'::jsonb;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_cleanup_unclaimed_tags ON public.tags;
CREATE TRIGGER trigger_cleanup_unclaimed_tags
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_unclaimed_tag_cleanup();

-- 4. Restrict updatable columns for authenticated/anon roles (Finding #5)
REVOKE UPDATE ON public.users FROM authenticated, anon;
GRANT UPDATE (full_name, avatar_id) ON public.users TO authenticated;

REVOKE UPDATE ON public.tags FROM authenticated, anon;
GRANT UPDATE (active_mode, metadata, updated_at) ON public.tags TO authenticated;

-- 5. Enforce explicit WITH CHECK on RLS UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own tags" ON public.tags;
CREATE POLICY "Users can update own tags"
  ON public.tags
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 6. Defense-in-depth BEFORE UPDATE triggers (SECURITY INVOKER so service_role and FK cascades bypass)
CREATE OR REPLACE FUNCTION public.protect_users_immutable_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Cannot modify protected profile columns';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_protect_users_immutable_columns ON public.users;
CREATE TRIGGER trigger_protect_users_immutable_columns
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_users_immutable_columns();

CREATE OR REPLACE FUNCTION public.protect_tags_immutable_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF NEW.tag_id IS DISTINCT FROM OLD.tag_id
       OR NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
      RAISE EXCEPTION 'Cannot modify protected tag columns';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_protect_tags_immutable_columns ON public.tags;
CREATE TRIGGER trigger_protect_tags_immutable_columns
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_tags_immutable_columns();
