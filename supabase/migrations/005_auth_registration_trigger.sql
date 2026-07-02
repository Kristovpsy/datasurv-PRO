-- =============================================
-- Datasurv Pro — Database Schema Migration
-- Update handle_new_user trigger for self-registration
-- =============================================
-- Run this in your Supabase SQL Editor or via supabase db push

-- Replace the existing handle_new_user function to also insert into user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Get the target organisation ID (from metadata or fallback to first available)
  default_org_id := COALESCE(
    (NEW.raw_user_meta_data->>'org_id')::UUID,
    (SELECT id FROM public.organisations LIMIT 1)
  );

  -- 1. Create Profile
  INSERT INTO public.profiles (id, org_id, full_name)
  VALUES (
    NEW.id,
    default_org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  -- 2. Assign User Role (defaults to field_officer if not provided)
  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES (
    NEW.id,
    default_org_id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'field_officer')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
