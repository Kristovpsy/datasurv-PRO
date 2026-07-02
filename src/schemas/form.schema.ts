/**
 * Form Zod Schemas
 * --------------------------
 * Shared validation schemas for form fields and submissions.
 * Used in both frontend and (future) Edge Functions.
 */

import { z } from 'zod';

// ---- Field Types ----
export const fieldTypeSchema = z.enum([
  'short_text',
  'long_text',
  'single_choice',
  'multi_choice',
  'dropdown',
  'number',
  'date',
  'rating',
  'file',
  'gps',
  'section_header',
  'matrix',
]);

export const logicOperatorSchema = z.enum([
  'eq', 'ne', 'gt', 'lt', 'contains', 'is_empty', 'is_not_empty',
]);

// ---- Field Validation ----
export const fieldValidationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  min_selections: z.number().optional(),
  max_selections: z.number().optional(),
  file_types: z.array(z.string()).optional(),
  max_file_size_mb: z.number().optional(),
  accuracy_threshold_m: z.number().optional(),
}).optional();

// ---- Conditional Logic ----
export const fieldLogicSchema = z.object({
  show_if: z.object({
    field_id: z.string().uuid(),
    operator: logicOperatorSchema,
    value: z.union([z.string(), z.number(), z.boolean()]),
  }).optional(),
  logic_gate: z.enum(['and', 'or']).optional(),
  conditions: z.array(z.object({
    field_id: z.string().uuid(),
    operator: logicOperatorSchema,
    value: z.union([z.string(), z.number(), z.boolean()]),
  })).optional(),
}).optional();

// ---- Matrix Config ----
export const matrixConfigSchema = z.object({
  rows: z.array(z.string()).min(1),
  columns: z.array(z.string()).min(1),
  required_per_row: z.boolean().optional(),
}).optional();

// ---- Form Field ----
export const formFieldSchema = z.object({
  id: z.string().uuid(),
  type: fieldTypeSchema,
  label: z.string().min(1, 'Field label is required'),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  order: z.number().int().min(0),
  options: z.array(z.string()).optional(),
  validation: fieldValidationSchema,
  logic: fieldLogicSchema,
  matrix: matrixConfigSchema,
  description: z.string().optional(),
});

// ---- Form Settings ----
export const formSettingsSchema = z.object({
  show_progress_bar: z.boolean().default(true),
  allow_edit_after_submit: z.boolean().default(false),
  confirmation_message: z.string().default('Thank you for your response!'),
  redirect_url: z.string().url().optional().or(z.literal('')),
});

// ---- Full Form Schema ----
export const formSchemaSchema = z.object({
  fields: z.array(formFieldSchema),
  settings: formSettingsSchema,
});

// ---- Form Metadata (for create/edit) ----
export const formMetadataSchema = z.object({
  title: z.string().min(1, 'Form title is required').max(200),
  description: z.string().max(1000).optional(),
  allow_anonymous: z.boolean().default(true),
  max_responses: z.number().int().positive().optional().nullable(),
  deadline: z.string().optional().nullable(),
});

// ---- Response Submission ----
export const responseSubmissionSchema = z.object({
  form_version_id: z.string().uuid(),
  answers: z.record(z.string(), z.unknown()),
  respondent_identifier: z.string().optional(),
  gps_lat: z.number().optional(),
  gps_lng: z.number().optional(),
  metadata: z.object({
    device: z.string().optional(),
    browser: z.string().optional(),
    offline_submitted: z.boolean().optional(),
    time_to_complete_seconds: z.number().optional(),
  }).optional(),
});

// ---- Auth Schemas ----
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['field_officer', 'editor', 'admin']),
  full_name: z.string().min(1, 'Full name is required'),
});

/** The hardcoded passphrase required to self-register as Admin */
export const ADMIN_REGISTER_KEY = 'ADMINONLY@2025';

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirm_password: z.string(),
    role: z.enum(['admin', 'editor', 'field_officer'], {
      message: 'Please select a role',
    }),
    admin_key: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
  .refine(
    (data) => {
      if (data.role === 'admin') {
        return data.admin_key === ADMIN_REGISTER_KEY;
      }
      return true;
    },
    {
      message: 'Invalid admin secret key',
      path: ['admin_key'],
    }
  );

// ---- Inferred Types ----
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type InviteFormData = z.infer<typeof inviteSchema>;
export type FormFieldData = z.infer<typeof formFieldSchema>;
export type FormSettingsData = z.infer<typeof formSettingsSchema>;
export type FormSchemaData = z.infer<typeof formSchemaSchema>;
export type FormMetadataData = z.infer<typeof formMetadataSchema>;
export type ResponseSubmissionData = z.infer<typeof responseSubmissionSchema>;
