-- =============================================
-- Datasurv Pro — RBAC Restructure Migration
-- 3-Tier Role System with Approval Workflow
-- =============================================
-- Run AFTER 003_storage_and_audit.sql
--
-- Roles:
--   Level 1: field_officer  (Data Collector)
--   Level 2: editor         (Data Editor — reviews & approves)
--   Level 3: admin          (Read-only analytics & reports)
--   Hidden:  superadmin     (System-level, retained for internal use)

-- ============================================
-- 1. RENAME team_lead → editor IN user_roles
-- ============================================
UPDATE user_roles SET role = 'editor' WHERE role = 'team_lead';

-- Update CHECK constraint on user_roles
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('field_officer', 'editor', 'admin', 'superadmin'));

-- Update CHECK constraint on invites
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;
ALTER TABLE invites ADD CONSTRAINT invites_role_check
  CHECK (role IN ('field_officer', 'editor', 'admin'));

-- ============================================
-- 2. ADD APPROVAL WORKFLOW COLUMNS TO RESPONSES
-- ============================================
ALTER TABLE responses
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS editor_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_responses_approval ON responses(approval_status);
CREATE INDEX IF NOT EXISTS idx_responses_approved_by ON responses(approved_by);

-- ============================================
-- 3. UPDATE has_role() FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION has_role(min_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  role_level INTEGER;
  min_level INTEGER;
BEGIN
  user_role := get_user_role();

  CASE user_role
    WHEN 'superadmin' THEN role_level := 4;
    WHEN 'admin' THEN role_level := 3;
    WHEN 'editor' THEN role_level := 2;
    WHEN 'field_officer' THEN role_level := 1;
    ELSE role_level := 0;
  END CASE;

  CASE min_role
    WHEN 'superadmin' THEN min_level := 4;
    WHEN 'admin' THEN min_level := 3;
    WHEN 'editor' THEN min_level := 2;
    WHEN 'field_officer' THEN min_level := 1;
    ELSE min_level := 0;
  END CASE;

  RETURN role_level >= min_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 4. UPDATE RLS POLICIES
-- ============================================

-- ---- PROJECTS ----
-- Editor+ can create projects (replaces team_lead)
DROP POLICY IF EXISTS "projects_insert_lead" ON projects;
CREATE POLICY "projects_insert_editor" ON projects
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND has_role('editor'));

-- Editor+ can update projects
DROP POLICY IF EXISTS "projects_update_lead" ON projects;
CREATE POLICY "projects_update_editor" ON projects
  FOR UPDATE USING (org_id = get_user_org_id() AND has_role('editor'));

-- ---- FORMS ----
-- Editor+ can create forms (replaces team_lead)
DROP POLICY IF EXISTS "forms_insert_lead" ON forms;
CREATE POLICY "forms_insert_editor" ON forms
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND has_role('editor'));

-- Editor can update forms; admin cannot (read-only)
DROP POLICY IF EXISTS "forms_update_lead" ON forms;
CREATE POLICY "forms_update_editor" ON forms
  FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() = 'editor');

-- ---- FORM VERSIONS ----
-- Editor can create versions
DROP POLICY IF EXISTS "versions_insert_lead" ON form_versions;
CREATE POLICY "versions_insert_editor" ON form_versions
  FOR INSERT WITH CHECK (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
    AND get_user_role() = 'editor'
  );

-- Editor can update versions
DROP POLICY IF EXISTS "versions_update_lead" ON form_versions;
CREATE POLICY "versions_update_editor" ON form_versions
  FOR UPDATE USING (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
    AND get_user_role() = 'editor'
  );

-- ---- FORM SHARES ----
DROP POLICY IF EXISTS "shares_insert_lead" ON form_shares;
CREATE POLICY "shares_insert_editor" ON form_shares
  FOR INSERT WITH CHECK (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
    AND get_user_role() = 'editor'
  );

DROP POLICY IF EXISTS "shares_update_lead" ON form_shares;
CREATE POLICY "shares_update_editor" ON form_shares
  FOR UPDATE USING (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
    AND get_user_role() = 'editor'
  );

-- ---- RESPONSES: Editor approval ----
-- Editor can update responses (edit + approve/reject)
CREATE POLICY "responses_update_editor" ON responses
  FOR UPDATE USING (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
    AND get_user_role() = 'editor'
  );

-- ---- INVITES: Editor+ can manage invites ----
DROP POLICY IF EXISTS "invites_select_admin" ON invites;
CREATE POLICY "invites_select_editor" ON invites
  FOR SELECT USING (org_id = get_user_org_id() AND has_role('editor'));

DROP POLICY IF EXISTS "invites_insert_admin" ON invites;
CREATE POLICY "invites_insert_editor" ON invites
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND has_role('editor'));

DROP POLICY IF EXISTS "invites_update_admin" ON invites;
CREATE POLICY "invites_update_editor" ON invites
  FOR UPDATE USING (org_id = get_user_org_id() AND has_role('editor'));

-- ============================================
-- 5. APPROVAL AUDIT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION audit_response_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
    PERFORM log_audit(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_response_approval_change
  AFTER UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION audit_response_approval();
