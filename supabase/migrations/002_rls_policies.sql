-- =============================================
-- Datasurv Pro — Row Level Security Policies
-- Section 5.3 of Architecture Document
-- =============================================
-- Run AFTER 001_schema.sql

-- Enable RLS on all tables
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER: Get user's org_id
-- ============================================
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- HELPER: Get user's role in their org
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid() AND org_id = get_user_org_id()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- HELPER: Check if user has minimum role
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
    WHEN 'team_lead' THEN role_level := 2;
    WHEN 'field_officer' THEN role_level := 1;
    ELSE role_level := 0;
  END CASE;
  
  CASE min_role
    WHEN 'superadmin' THEN min_level := 4;
    WHEN 'admin' THEN min_level := 3;
    WHEN 'team_lead' THEN min_level := 2;
    WHEN 'field_officer' THEN min_level := 1;
    ELSE min_level := 0;
  END CASE;
  
  RETURN role_level >= min_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- ORGANISATIONS
-- ============================================
-- Users can see their own organisation
CREATE POLICY "org_select_own" ON organisations
  FOR SELECT USING (id = get_user_org_id());

-- Only superadmin can update org settings
CREATE POLICY "org_update_superadmin" ON organisations
  FOR UPDATE USING (id = get_user_org_id() AND has_role('superadmin'));

-- ============================================
-- PROFILES
-- ============================================
-- Users can see profiles in their org
CREATE POLICY "profiles_select_org" ON profiles
  FOR SELECT USING (org_id = get_user_org_id());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Auto-insert handled by trigger (SECURITY DEFINER)

-- ============================================
-- USER ROLES
-- ============================================
-- Users can see roles in their org
CREATE POLICY "roles_select_org" ON user_roles
  FOR SELECT USING (org_id = get_user_org_id());

-- Only admin+ can assign roles
CREATE POLICY "roles_insert_admin" ON user_roles
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND has_role('admin'));

-- Only admin+ can update roles
CREATE POLICY "roles_update_admin" ON user_roles
  FOR UPDATE USING (org_id = get_user_org_id() AND has_role('admin'));

-- Only superadmin can delete roles
CREATE POLICY "roles_delete_superadmin" ON user_roles
  FOR DELETE USING (org_id = get_user_org_id() AND has_role('superadmin'));

-- ============================================
-- PROJECTS
-- ============================================
-- All org members can view projects
CREATE POLICY "projects_select_org" ON projects
  FOR SELECT USING (org_id = get_user_org_id());

-- Team lead+ can create projects
CREATE POLICY "projects_insert_lead" ON projects
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND has_role('team_lead'));

-- Team lead+ can update projects
CREATE POLICY "projects_update_lead" ON projects
  FOR UPDATE USING (org_id = get_user_org_id() AND has_role('team_lead'));

-- Admin+ can delete projects
CREATE POLICY "projects_delete_admin" ON projects
  FOR DELETE USING (org_id = get_user_org_id() AND has_role('admin'));

-- ============================================
-- FORMS
-- ============================================
-- All org members can view forms
CREATE POLICY "forms_select_org" ON forms
  FOR SELECT USING (org_id = get_user_org_id());

-- Team lead+ can create forms
CREATE POLICY "forms_insert_lead" ON forms
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND has_role('team_lead'));

-- Team lead+ can update forms
CREATE POLICY "forms_update_lead" ON forms
  FOR UPDATE USING (org_id = get_user_org_id() AND has_role('team_lead'));

-- Admin+ can delete forms
CREATE POLICY "forms_delete_admin" ON forms
  FOR DELETE USING (org_id = get_user_org_id() AND has_role('admin'));

-- ============================================
-- FORM VERSIONS
-- ============================================
-- Org members can view versions
CREATE POLICY "versions_select_org" ON form_versions
  FOR SELECT USING (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
  );

-- Team lead+ can create versions (save form)
CREATE POLICY "versions_insert_lead" ON form_versions
  FOR INSERT WITH CHECK (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
    AND has_role('team_lead')
  );

-- Team lead+ can update versions (mark is_current)
CREATE POLICY "versions_update_lead" ON form_versions
  FOR UPDATE USING (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
    AND has_role('team_lead')
  );

-- ============================================
-- FORM SHARES
-- ============================================
CREATE POLICY "shares_select_org" ON form_shares
  FOR SELECT USING (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
  );

CREATE POLICY "shares_insert_lead" ON form_shares
  FOR INSERT WITH CHECK (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
    AND has_role('team_lead')
  );

CREATE POLICY "shares_update_lead" ON form_shares
  FOR UPDATE USING (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
    AND has_role('team_lead')
  );

-- ============================================
-- RESPONSES
-- ============================================
-- Org members can view responses for their forms
CREATE POLICY "responses_select_org" ON responses
  FOR SELECT USING (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
  );

-- ANYONE can insert responses (anonymous submissions)
-- Validated by Edge Function, not RLS
CREATE POLICY "responses_insert_anon" ON responses
  FOR INSERT WITH CHECK (true);

-- Admin+ can delete responses
CREATE POLICY "responses_delete_admin" ON responses
  FOR DELETE USING (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
    AND has_role('admin')
  );

-- ============================================
-- RESPONSE FILES
-- ============================================
CREATE POLICY "files_select_org" ON response_files
  FOR SELECT USING (
    response_id IN (
      SELECT r.id FROM responses r
      JOIN forms f ON r.form_id = f.id
      WHERE f.org_id = get_user_org_id()
    )
  );

-- Anyone can insert files (during response submission)
CREATE POLICY "files_insert_anon" ON response_files
  FOR INSERT WITH CHECK (true);

-- ============================================
-- AUDIT LOGS
-- ============================================
-- Admin+ can view audit logs
CREATE POLICY "audit_select_admin" ON audit_logs
  FOR SELECT USING (org_id = get_user_org_id() AND has_role('admin'));

-- System inserts via SECURITY DEFINER functions
CREATE POLICY "audit_insert_system" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- ANALYTICS SNAPSHOTS
-- ============================================
CREATE POLICY "analytics_select_org" ON analytics_snapshots
  FOR SELECT USING (
    form_id IN (SELECT id FROM forms WHERE org_id = get_user_org_id())
  );

-- ============================================
-- INVITES
-- ============================================
-- Admin+ can see invites for their org
CREATE POLICY "invites_select_admin" ON invites
  FOR SELECT USING (org_id = get_user_org_id() AND has_role('admin'));

-- Admin+ can create invites
CREATE POLICY "invites_insert_admin" ON invites
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND has_role('admin'));

-- Admin+ can update (mark accepted)
CREATE POLICY "invites_update_admin" ON invites
  FOR UPDATE USING (org_id = get_user_org_id() AND has_role('admin'));

-- ============================================
-- PUBLIC ACCESS: Forms by public_id (for respondents)
-- ============================================
-- Allow anonymous users to read published forms by public_id
CREATE POLICY "forms_select_public" ON forms
  FOR SELECT USING (status = 'published' AND public_id IS NOT NULL);

-- Allow anonymous to read current form versions for published forms
CREATE POLICY "versions_select_public" ON form_versions
  FOR SELECT USING (
    is_current = true
    AND form_id IN (SELECT id FROM forms WHERE status = 'published' AND public_id IS NOT NULL)
  );
