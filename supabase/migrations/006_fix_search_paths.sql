-- =============================================
-- Datasurv Pro — Database Schema Migration
-- Fix search_paths on SECURITY DEFINER functions
-- =============================================
-- Run this in your Supabase SQL Editor or via supabase db push

-- 1. Fix log_audit
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, org_id, action, resource_type, resource_id, details, ip_address)
  VALUES (
    auth.uid(),
    public.get_user_org_id(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    -- inet_client_addr() is restricted in some contexts, so we'll leave it as is, but it should work
    inet_client_addr()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. Fix audit_role_change
CREATE OR REPLACE FUNCTION public.audit_role_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_audit(
    'role.assign',
    'user_role',
    NEW.id,
    jsonb_build_object(
      'user_id', NEW.user_id,
      'role', NEW.role
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. Fix audit_form_status_change
CREATE OR REPLACE FUNCTION public.audit_form_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.log_audit(
      'form.' || NEW.status,
      'form',
      NEW.id,
      jsonb_build_object(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'title', NEW.title
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 4. Fix audit_response_submit
CREATE OR REPLACE FUNCTION public.audit_response_submit()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_audit(
    'response.submit',
    'response',
    NEW.id,
    jsonb_build_object(
      'form_id', NEW.form_id,
      'is_complete', NEW.is_complete
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 5. Fix audit_response_approval
CREATE OR REPLACE FUNCTION public.audit_response_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
    PERFORM public.log_audit(
      'response.' || NEW.approval_status,
      'response',
      NEW.id,
      jsonb_build_object(
        'form_id', NEW.form_id,
        'from_status', OLD.approval_status,
        'to_status', NEW.approval_status,
        'editor_notes', NEW.editor_notes
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 6. Ensure handle_new_user has the correct search_path too
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id UUID;
BEGIN
  default_org_id := COALESCE(
    (NEW.raw_user_meta_data->>'org_id')::UUID,
    (SELECT id FROM public.organisations LIMIT 1)
  );

  INSERT INTO public.profiles (id, org_id, full_name)
  VALUES (
    NEW.id,
    default_org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES (
    NEW.id,
    default_org_id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'field_officer')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
