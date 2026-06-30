-- =============================================
-- Datasurv Pro — Storage & Audit Functions
-- =============================================

-- ============================================
-- STORAGE BUCKET for form response files
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'response-files',
  'response-files',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "response_files_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'response-files');

CREATE POLICY "response_files_read_org" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'response-files'
    AND (
      auth.uid() IS NOT NULL
      OR (storage.foldername(name))[1] = 'public'
    )
  );

-- ============================================
-- AUDIT LOG HELPER
-- ============================================
CREATE OR REPLACE FUNCTION log_audit(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (user_id, org_id, action, resource_type, resource_id, details, ip_address)
  VALUES (
    auth.uid(),
    get_user_org_id(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    inet_client_addr()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUTO-AUDIT TRIGGERS
-- ============================================

-- Audit form status changes
CREATE OR REPLACE FUNCTION audit_form_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM log_audit(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_form_status
  AFTER UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION audit_form_status_change();

-- Audit new responses
CREATE OR REPLACE FUNCTION audit_response_submit()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_response_created
  AFTER INSERT ON responses
  FOR EACH ROW EXECUTE FUNCTION audit_response_submit();

-- Audit role changes
CREATE OR REPLACE FUNCTION audit_role_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_role_assigned
  AFTER INSERT OR UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_role_change();

-- ============================================
-- RESPONSE COUNT VIEW (for dashboard stats)
-- ============================================
CREATE OR REPLACE VIEW form_response_counts AS
SELECT
  f.id AS form_id,
  f.title,
  f.status,
  COUNT(r.id) AS total_responses,
  COUNT(r.id) FILTER (WHERE r.is_complete = true) AS completed_responses,
  COUNT(r.id) FILTER (WHERE r.submitted_at > now() - INTERVAL '24 hours') AS responses_today,
  AVG((r.metadata->>'time_to_complete_seconds')::numeric) AS avg_completion_time_seconds
FROM forms f
LEFT JOIN responses r ON r.form_id = f.id
GROUP BY f.id, f.title, f.status;
