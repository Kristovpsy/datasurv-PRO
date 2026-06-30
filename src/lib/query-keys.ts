/**
 * React Query Key Constants
 * --------------------------
 * Centralised query key definitions for cache management.
 */

export const queryKeys = {
  // Auth
  session: ['session'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  
  // Organisations
  organisation: (orgId: string) => ['organisation', orgId] as const,
  
  // Projects
  projects: (orgId: string) => ['projects', orgId] as const,
  project: (projectId: string) => ['project', projectId] as const,
  
  // Forms
  forms: (projectId: string) => ['forms', projectId] as const,
  form: (formId: string) => ['form', formId] as const,
  formVersion: (formId: string, version: number) => ['form-version', formId, version] as const,
  formVersionCurrent: (formId: string) => ['form-version-current', formId] as const,
  
  // Form Shares
  formShares: (formId: string) => ['form-shares', formId] as const,
  publicForm: (publicId: string) => ['public-form', publicId] as const,
  
  // Responses
  responses: (formId: string) => ['responses', formId] as const,
  response: (responseId: string) => ['response', responseId] as const,
  responseCount: (formId: string) => ['response-count', formId] as const,
  
  // Analytics
  analytics: (formId: string) => ['analytics', formId] as const,
  analyticsField: (formId: string, fieldId: string) => ['analytics-field', formId, fieldId] as const,
  
  // Team
  teamMembers: (orgId: string) => ['team-members', orgId] as const,
  userRole: (userId: string, orgId: string) => ['user-role', userId, orgId] as const,
  
  // Audit
  auditLogs: (orgId: string) => ['audit-logs', orgId] as const,
} as const;
