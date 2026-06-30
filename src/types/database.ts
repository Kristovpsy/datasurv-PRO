/* =============================================
   Datasurv Pro — Database Types
   Matches Section 4.2 of Architecture Document
   ============================================= */

// ---- Enums ----
export type UserRole = 'field_officer' | 'editor' | 'admin' | 'superadmin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type OrgPlan = 'free' | 'pro' | 'enterprise';
export type FormStatus = 'draft' | 'published' | 'closed' | 'archived';
export type ShareType = 'link' | 'qr' | 'embed';

export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multi_choice'
  | 'dropdown'
  | 'number'
  | 'date'
  | 'rating'
  | 'file'
  | 'gps'
  | 'section_header'
  | 'matrix';

export type LogicOperator = 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'is_empty' | 'is_not_empty';

// ---- Table Types ----
export interface Organisation {
  id: string;
  name: string;
  slug: string;
  plan: OrgPlan;
  created_at: string;
  settings: Record<string, unknown>;
  is_active: boolean;
}

export interface Profile {
  id: string;
  org_id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  org_id: string;
  role: UserRole;
  assigned_by: string | null;
  assigned_at: string;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Form {
  id: string;
  project_id: string;
  created_by: string;
  title: string;
  description: string | null;
  status: FormStatus;
  current_version: number;
  public_id: string | null;
  allow_anonymous: boolean;
  max_responses: number | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormVersion {
  id: string;
  form_id: string;
  version_number: number;
  schema: FormSchema;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_current: boolean;
}

export interface FormShare {
  id: string;
  form_id: string;
  public_id: string;
  share_type: ShareType;
  is_active: boolean;
  password_hash: string | null;
  max_uses: number | null;
  use_count: number;
  expires_at: string | null;
  created_by: string;
  created_at: string;
}

export interface Response {
  id: string;
  form_id: string;
  version_id: string;
  form_version_id?: string;
  form_share_id?: string | null;
  respondent_id: string | null;
  respondent_identifier?: string | null;
  answers: Record<string, unknown>;
  metadata: ResponseMetadata | null;
  submitted_at: string;
  is_complete: boolean;
  gps_lat?: number | null;
  gps_lng?: number | null;
  device_info?: Record<string, unknown> | null;
  // Approval workflow
  approval_status: ApprovalStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  editor_notes?: string | null;
  // Populated join field
  submitted_by_name?: string;
}

export interface ResponseFile {
  id: string;
  response_id: string;
  field_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AnalyticsSnapshot {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  refreshed_at: string;
  created_at: string;
}

// ---- Form Schema Types (JSONB) ----
export interface FormFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  min_selections?: number;
  max_selections?: number;
  file_types?: string[];
  max_file_size_mb?: number;
  accuracy_threshold_m?: number;
}

export interface FormFieldLogic {
  show_if?: {
    field_id: string;
    operator: LogicOperator;
    value: string | number | boolean;
  };
  logic_gate?: 'and' | 'or';
  conditions?: Array<{
    field_id: string;
    operator: LogicOperator;
    value: string | number | boolean;
  }>;
}

export interface MatrixConfig {
  rows: string[];
  columns: string[];
  required_per_row?: boolean;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
  validation?: FormFieldValidation;
  logic?: FormFieldLogic;
  matrix?: MatrixConfig;
  description?: string;
}

export interface FormSettings {
  show_progress_bar: boolean;
  allow_edit_after_submit: boolean;
  confirmation_message: string;
  redirect_url?: string;
}

export interface FormSchema {
  fields: FormField[];
  settings: FormSettings;
}

export interface ResponseMetadata {
  device?: string;
  browser?: string;
  offline_submitted?: boolean;
  time_to_complete_seconds?: number;
}

// ---- Auth / Session ----
export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
  role: UserRoleRecord | null;
  organisation: Organisation | null;
}

// ---- API Response Wrappers ----
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// ---- Form Builder State ----
export interface FormBuilderState {
  fields: FormField[];
  selectedFieldId: string | null;
  settings: FormSettings;
  isDirty: boolean;
  title: string;
  description: string;
}
