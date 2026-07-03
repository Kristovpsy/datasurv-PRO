-- =============================================
-- Datasurv Pro — Fix audit_logs NULL user_id during signup
-- =============================================
-- Problem: When a new user registers, the handle_new_user trigger
-- inserts into user_roles, which fires audit_role_change, which
-- calls log_audit(). But auth.uid() is NULL during signup because
-- the user isn't authenticated yet. This causes a NOT NULL violation
-- on audit_logs.user_id and rolls back the ENTIRE signup transaction.
--
-- Fix: Make log_audit() silently skip when auth.uid() is NULL.

CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Skip audit logging if there is no authenticated user
  -- (e.g. during signup triggers fired by Supabase Auth)
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.audit_logs (user_id, org_id, action, resource_type, resource_id, details, ip_address)
  VALUES (
    auth.uid(),
    public.get_user_org_id(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    inet_client_addr()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
