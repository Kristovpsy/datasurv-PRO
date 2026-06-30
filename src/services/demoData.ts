/**
 * Demo Data Service
 * --------------------------
 * Provides realistic mock data for development.
 * All service functions follow the same interface they'll have when connected to Supabase.
 */

import { v4 as uuid } from 'uuid';
import type {
  Project,
  Form,
  FormVersion,
  FormSchema,
  FormField,
  Response as FormResponse,
  ApprovalStatus,
} from '@/types';

// ---- Demo Organisation ID ----
const ORG_ID = 'demo-org-001';
// Demo User IDs
const EDITOR_ID = 'demo-editor-001';
const OFFICER_ID = 'demo-officer-001';

// ---- Demo Projects ----
export const demoProjects: Project[] = [
  {
    id: 'proj-001',
    org_id: ORG_ID,
    name: 'Community Health Survey 2025',
    description: 'Annual health assessment across rural communities in Lagos state.',
    created_by: EDITOR_ID,
    is_active: true,
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-05-10T14:30:00Z',
  },
  {
    id: 'proj-002',
    org_id: ORG_ID,
    name: 'Water Quality Assessment',
    description: 'Mapping water sources and quality indicators across 50 communities.',
    created_by: EDITOR_ID,
    is_active: true,
    created_at: '2025-03-01T08:00:00Z',
    updated_at: '2025-05-18T11:00:00Z',
  },
  {
    id: 'proj-003',
    org_id: ORG_ID,
    name: 'Education Access Study',
    description: 'Assessing primary education accessibility and enrollment barriers.',
    created_by: EDITOR_ID,
    is_active: true,
    created_at: '2025-04-10T10:00:00Z',
    updated_at: '2025-05-20T16:00:00Z',
  },
];

// ---- Demo Form Schemas ----
const healthSurveyFields: FormField[] = [
  {
    id: uuid(),
    type: 'section_header',
    label: 'Respondent Information',
    description: 'Basic demographic details of the respondent.',
    required: false,
    order: 0,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Full Name',
    placeholder: 'Enter respondent name',
    required: true,
    order: 1,
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Age',
    placeholder: 'Enter age',
    required: true,
    order: 2,
    validation: { min: 0, max: 120 },
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Gender',
    required: true,
    order: 3,
    options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  },
  {
    id: uuid(),
    type: 'section_header',
    label: 'Health Assessment',
    description: 'General health questions.',
    required: false,
    order: 4,
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'How would you rate your overall health?',
    required: true,
    order: 5,
    options: ['Excellent', 'Good', 'Fair', 'Poor'],
  },
  {
    id: uuid(),
    type: 'multi_choice',
    label: 'Which health services have you used in the last 12 months?',
    required: false,
    order: 6,
    options: ['Primary care clinic', 'Hospital', 'Pharmacy', 'Traditional healer', 'None'],
  },
  {
    id: uuid(),
    type: 'rating',
    label: 'How satisfied are you with local healthcare?',
    required: true,
    order: 7,
  },
  {
    id: uuid(),
    type: 'long_text',
    label: 'Additional comments about healthcare in your community',
    placeholder: 'Share any observations or concerns...',
    required: false,
    order: 8,
  },
  {
    id: uuid(),
    type: 'gps',
    label: 'Location',
    required: false,
    order: 9,
  },
];

const healthSchema: FormSchema = {
  fields: healthSurveyFields,
  settings: {
    show_progress_bar: true,
    allow_edit_after_submit: false,
    confirmation_message: 'Thank you for participating in the health survey!',
  },
};

// ---- Demo Forms ----
export const demoForms: Form[] = [
  {
    id: 'form-001',
    project_id: 'proj-001',
    created_by: EDITOR_ID,
    title: 'Community Health Assessment Form',
    description: 'Comprehensive health survey for community members aged 18+',
    status: 'published',
    current_version: 1,
    public_id: 'hlth-survey-2025',
    allow_anonymous: true,
    max_responses: 5000,
    deadline: '2025-12-31T23:59:59Z',
    created_at: '2025-01-20T09:00:00Z',
    updated_at: '2025-05-10T14:30:00Z',
  },
  {
    id: 'form-002',
    project_id: 'proj-001',
    created_by: EDITOR_ID,
    title: 'Maternal Health Screening',
    description: 'Pre-natal and post-natal health screening questionnaire',
    status: 'draft',
    current_version: 1,
    public_id: null,
    allow_anonymous: false,
    max_responses: null,
    deadline: null,
    created_at: '2025-04-01T10:00:00Z',
    updated_at: '2025-05-15T08:00:00Z',
  },
  {
    id: 'form-003',
    project_id: 'proj-002',
    created_by: EDITOR_ID,
    title: 'Water Source Survey',
    description: 'Document and assess water sources in the target communities',
    status: 'published',
    current_version: 2,
    public_id: 'water-src-v2',
    allow_anonymous: true,
    max_responses: null,
    deadline: null,
    created_at: '2025-03-05T08:00:00Z',
    updated_at: '2025-05-18T11:00:00Z',
  },
  {
    id: 'form-004',
    project_id: 'proj-002',
    created_by: EDITOR_ID,
    title: 'Water Quality Lab Results',
    description: 'Record lab test results for collected water samples',
    status: 'closed',
    current_version: 1,
    public_id: 'water-lab-results',
    allow_anonymous: false,
    max_responses: 200,
    deadline: '2025-04-30T23:59:59Z',
    created_at: '2025-03-10T09:00:00Z',
    updated_at: '2025-05-01T12:00:00Z',
  },
  {
    id: 'form-005',
    project_id: 'proj-003',
    created_by: EDITOR_ID,
    title: 'School Enrollment Survey',
    description: 'Track enrollment numbers and barriers to education access',
    status: 'published',
    current_version: 1,
    public_id: 'school-enroll',
    allow_anonymous: true,
    max_responses: null,
    deadline: null,
    created_at: '2025-04-15T10:00:00Z',
    updated_at: '2025-05-20T16:00:00Z',
  },
];

// ---- Demo Form Versions ----
export const demoFormVersions: FormVersion[] = [
  {
    id: 'fv-001',
    form_id: 'form-001',
    version_number: 1,
    schema: healthSchema,
    created_by: EDITOR_ID,
    created_at: '2025-01-20T09:00:00Z',
    updated_at: '2025-05-10T14:30:00Z',
    is_current: true,
  },
];

// ---- Demo Responses with Approval Workflow ----
const fieldOfficerNames = [
  'James Officer',
  'Amina Bello',
  'Chidi Okafor',
  'Fatima Abubakar',
  'Emeka Nwachukwu',
];

const editorNotes = [
  'Data verified against field records.',
  'GPS coordinates corrected.',
  'Incomplete survey — missing health rating.',
  'Age value seems incorrect, please verify.',
  null,
  null,
];

function generateResponses(formVersionId: string, count: number): FormResponse[] {
  const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const healthRatings = ['Excellent', 'Good', 'Fair', 'Poor'];
  const services = ['Primary care clinic', 'Hospital', 'Pharmacy', 'Traditional healer', 'None'];
  const names = ['Amina Bello', 'Chidi Okafor', 'Fatima Abubakar', 'Emeka Nwachukwu', 'Blessing Adeyemi', 'Ibrahim Musa', 'Grace Okonkwo', 'Yusuf Abdullahi', 'Ngozi Eze', 'Taiwo Olayinka'];

  return Array.from({ length: count }, (_, i) => {
    const answersObj: Record<string, unknown> = {};
    const fields = healthSurveyFields.filter(f => f.type !== 'section_header');
    fields.forEach((field) => {
      switch (field.type) {
        case 'short_text':
          answersObj[field.id] = names[i % names.length];
          break;
        case 'number':
          answersObj[field.id] = 18 + Math.floor(Math.random() * 60);
          break;
        case 'single_choice':
          if (field.label.includes('Gender')) {
            answersObj[field.id] = genders[Math.floor(Math.random() * genders.length)];
          } else {
            answersObj[field.id] = healthRatings[Math.floor(Math.random() * healthRatings.length)];
          }
          break;
        case 'multi_choice': {
          const numSelections = 1 + Math.floor(Math.random() * 3);
          const shuffled = [...services].sort(() => Math.random() - 0.5);
          answersObj[field.id] = shuffled.slice(0, numSelections);
          break;
        }
        case 'rating':
          answersObj[field.id] = 1 + Math.floor(Math.random() * 5);
          break;
        case 'long_text':
          answersObj[field.id] = i % 3 === 0 ? 'The clinic is too far from our village. We need closer access.' : '';
          break;
        case 'gps':
          answersObj[field.id] = { lat: 6.45 + Math.random() * 0.3, lng: 3.38 + Math.random() * 0.3 };
          break;
      }
    });

    const submittedDate = new Date(2025, 4, 1 + Math.floor(Math.random() * 22));
    submittedDate.setHours(8 + Math.floor(Math.random() * 10));
    submittedDate.setMinutes(Math.floor(Math.random() * 60));

    // Distribute approval statuses: ~50% approved, ~30% pending, ~20% rejected
    const rand = Math.random();
    let approvalStatus: ApprovalStatus;
    if (rand < 0.5) {
      approvalStatus = 'approved';
    } else if (rand < 0.8) {
      approvalStatus = 'pending';
    } else {
      approvalStatus = 'rejected';
    }

    const isApprovedOrRejected = approvalStatus !== 'pending';
    const approvedDate = new Date(submittedDate);
    approvedDate.setDate(approvedDate.getDate() + 1 + Math.floor(Math.random() * 3));

    return {
      id: `resp-${i.toString().padStart(4, '0')}`,
      form_id: 'form-001',
      version_id: formVersionId,
      form_version_id: formVersionId,
      form_share_id: null,
      respondent_id: OFFICER_ID,
      respondent_identifier: null,
      answers: answersObj,
      metadata: {
        device: Math.random() > 0.6 ? 'desktop' : 'mobile',
        browser: Math.random() > 0.5 ? 'Chrome' : 'Safari',
        offline_submitted: Math.random() > 0.85,
        time_to_complete_seconds: 120 + Math.floor(Math.random() * 300),
      },
      submitted_at: submittedDate.toISOString(),
      is_complete: Math.random() > 0.1,
      gps_lat: 6.45 + Math.random() * 0.3,
      gps_lng: 3.38 + Math.random() * 0.3,
      device_info: null,
      // Approval workflow
      approval_status: approvalStatus,
      approved_by: isApprovedOrRejected ? EDITOR_ID : null,
      approved_at: isApprovedOrRejected ? approvedDate.toISOString() : null,
      editor_notes: isApprovedOrRejected
        ? editorNotes[Math.floor(Math.random() * editorNotes.length)]
        : null,
      submitted_by_name: fieldOfficerNames[i % fieldOfficerNames.length],
    };
  });
}

export const demoResponses = generateResponses('fv-001', 127);

// ---- Service Functions (Mock) ----
export async function fetchProjects(_orgId: string): Promise<Project[]> {
  await new Promise((r) => setTimeout(r, 300));
  return demoProjects;
}

export async function fetchForms(projectId?: string): Promise<Form[]> {
  await new Promise((r) => setTimeout(r, 300));
  if (projectId) {
    return demoForms.filter((f) => f.project_id === projectId);
  }
  return demoForms;
}

export async function fetchForm(formId: string): Promise<Form | null> {
  await new Promise((r) => setTimeout(r, 200));
  return demoForms.find((f) => f.id === formId) || null;
}

export async function fetchFormVersion(formId: string): Promise<FormVersion | null> {
  await new Promise((r) => setTimeout(r, 200));
  return demoFormVersions.find((fv) => fv.form_id === formId && fv.is_current) || null;
}

export async function fetchResponses(formVersionId: string): Promise<FormResponse[]> {
  await new Promise((r) => setTimeout(r, 400));
  return demoResponses.filter((r) => r.form_version_id === formVersionId);
}

export async function fetchResponseCount(formId: string): Promise<number> {
  await new Promise((r) => setTimeout(r, 100));
  const form = demoForms.find((f) => f.id === formId);
  if (!form) return 0;
  const version = demoFormVersions.find((fv) => fv.form_id === formId && fv.is_current);
  if (!version) return 0;
  return demoResponses.filter((r) => r.form_version_id === version.id).length;
}

/** Fetch responses by approval status */
export async function fetchResponsesByStatus(status: ApprovalStatus): Promise<FormResponse[]> {
  await new Promise((r) => setTimeout(r, 300));
  return demoResponses.filter((r) => r.approval_status === status);
}

/** Fetch responses submitted by a specific user */
export async function fetchMySubmissions(userId: string): Promise<FormResponse[]> {
  await new Promise((r) => setTimeout(r, 300));
  return demoResponses.filter((r) => r.respondent_id === userId);
}

/** Update response approval status (editor action) */
export async function updateResponseApproval(
  responseId: string,
  status: ApprovalStatus,
  editorId: string,
  notes?: string
): Promise<FormResponse | null> {
  await new Promise((r) => setTimeout(r, 200));
  const response = demoResponses.find((r) => r.id === responseId);
  if (!response) return null;
  response.approval_status = status;
  response.approved_by = editorId;
  response.approved_at = new Date().toISOString();
  if (notes !== undefined) response.editor_notes = notes;
  return { ...response };
}
