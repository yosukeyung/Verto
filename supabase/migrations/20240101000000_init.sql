-- ==========================================
-- VERTO DATABASE SCHEMA
-- ==========================================

-- 1. Custom Types (Enums)
CREATE TYPE public.user_role AS ENUM ('user', 'super_admin');
CREATE TYPE public.active_mode AS ENUM ('social', 'lost_and_found', 'event_hub');

-- 2. Users Table
-- Extends the built-in auth.users table provided by Supabase.
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role public.user_role NOT NULL DEFAULT 'user'::public.user_role,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tags Table
-- Pre-encoded by admin (owner_id = NULL). Users claim them to become the owner.
CREATE TABLE public.tags (
  tag_id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  active_mode public.active_mode NOT NULL DEFAULT 'social'::public.active_mode,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
-- Users can only read and update their own user profile.
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Tags Table Policies
-- 1. Users can view tags they own.
CREATE POLICY "Users can view own tags" 
  ON public.tags 
  FOR SELECT 
  USING (auth.uid() = owner_id);

-- 2. Users can update tags they own.
CREATE POLICY "Users can update own tags" 
  ON public.tags 
  FOR UPDATE 
  USING (auth.uid() = owner_id);

-- Note on claiming tags:
-- Claiming a tag (setting owner_id from NULL to auth.uid()) should be handled 
-- via a secure Server Action using the Service Role Key to prevent users from 
-- arbitrarily claiming unowned tags via client-side manipulation.

-- Note on public reads (/t/[id]):
-- The NFC tap intercept in the Edge Proxy uses the SUPABASE_SERVICE_ROLE_KEY,
-- which completely bypasses RLS. Therefore, no public read policy is needed here.

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update 'updated_at' timestamp on tags
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user'::public.user_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
