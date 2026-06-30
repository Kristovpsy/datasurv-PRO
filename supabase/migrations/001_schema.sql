-- =============================================
-- Datasurv Pro — Database Schema Migration
-- Section 4.2 of Architecture Document
-- =============================================
-- Run this in your Supabase SQL Editor or via supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ORGANISATIONS
-- ============================================
CREATE TABLE organisations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings    JSONB NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organisations_slug ON organisations(slug);

-- ============================================
-- 2. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  avatar_url  TEXT,
  phone       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_org ON profiles(org_id);

-- ============================================
-- 3. USER ROLES (RBAC)
-- ============================================
CREATE TABLE user_roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('field_officer', 'team_lead', 'admin', 'superadmin')),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_org ON user_roles(org_id);

-- ============================================
-- 4. PROJECTS
-- ============================================
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_org ON projects(org_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- ============================================
-- 5. FORMS
-- ============================================
CREATE TABLE forms (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  current_version INTEGER NOT NULL DEFAULT 1,
  public_id       TEXT UNIQUE,
  allow_anonymous BOOLEAN NOT NULL DEFAULT true,
  max_responses   INTEGER,
  deadline        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_forms_project ON forms(project_id);
CREATE INDEX idx_forms_org ON forms(org_id);
CREATE INDEX idx_forms_public_id ON forms(public_id);
CREATE INDEX idx_forms_status ON forms(status);

-- ============================================
-- 6. FORM VERSIONS (immutable schema snapshots)
-- ============================================
CREATE TABLE form_versions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id         UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  schema          JSONB NOT NULL,
  is_current      BOOLEAN NOT NULL DEFAULT false,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(form_id, version_number)
);

CREATE INDEX idx_form_versions_form ON form_versions(form_id);
CREATE INDEX idx_form_versions_current ON form_versions(form_id, is_current) WHERE is_current = true;

-- ============================================
-- 7. FORM SHARES (distribution channels)
-- ============================================
CREATE TABLE form_shares (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id       UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  public_id     TEXT NOT NULL UNIQUE,
  share_type    TEXT NOT NULL CHECK (share_type IN ('link', 'qr', 'embed')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  password_hash TEXT,
  max_uses      INTEGER,
  use_count     INTEGER NOT NULL DEFAULT 0,
  expires_at    TIMESTAMPTZ,
  created_by    UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_form_shares_form ON form_shares(form_id);
CREATE INDEX idx_form_shares_public_id ON form_shares(public_id);

-- ============================================
-- 8. RESPONSES
-- ============================================
CREATE TABLE responses (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id               UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  version_id            UUID NOT NULL REFERENCES form_versions(id),
  form_share_id         UUID REFERENCES form_shares(id),
  respondent_id         UUID REFERENCES auth.users(id),
  respondent_identifier TEXT,
  answers               JSONB NOT NULL DEFAULT '{}',
  metadata              JSONB,
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_complete           BOOLEAN NOT NULL DEFAULT false,
  gps_lat               DOUBLE PRECISION,
  gps_lng               DOUBLE PRECISION,
  device_info           JSONB
);

CREATE INDEX idx_responses_form ON responses(form_id);
CREATE INDEX idx_responses_version ON responses(version_id);
CREATE INDEX idx_responses_submitted ON responses(submitted_at);
CREATE INDEX idx_responses_complete ON responses(form_id, is_complete);

-- ============================================
-- 9. RESPONSE FILES (Supabase Storage refs)
-- ============================================
CREATE TABLE response_files (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id   UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  field_id      TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  file_type     TEXT NOT NULL,
  file_size     BIGINT NOT NULL,
  storage_path  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_response_files_response ON response_files(response_id);

-- ============================================
-- 10. AUDIT LOGS
-- ============================================
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  org_id        UUID NOT NULL REFERENCES organisations(id),
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  details       JSONB,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- 11. ANALYTICS SNAPSHOTS (cached rollups)
-- ============================================
CREATE TABLE analytics_snapshots (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id       UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data          JSONB NOT NULL DEFAULT '{}',
  refreshed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_form ON analytics_snapshots(form_id);

-- ============================================
-- 12. INVITES (pending team invitations)
-- ============================================
CREATE TABLE invites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('field_officer', 'team_lead', 'admin')),
  token       TEXT NOT NULL UNIQUE,
  invited_by  UUID NOT NULL REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_email ON invites(email);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER set_updated_at_projects
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_forms
  BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_form_versions
  BEFORE UPDATE ON form_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, org_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'org_id')::UUID,
      (SELECT id FROM organisations LIMIT 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SEED: Default organisation
-- ============================================
INSERT INTO organisations (id, name, slug, plan)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Datasurv Research Lab',
  'datasurv-research',
  'pro'
)
ON CONFLICT (slug) DO NOTHING;
