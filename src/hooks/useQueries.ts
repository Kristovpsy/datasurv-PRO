/**
 * React Query Hooks — Data fetching layer
 * --------------------------
 * Per Section 6: TanStack Query is the client-side cache layer.
 * All hooks wrap the service layer functions.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores';
import {
  fetchProjects, createProject,
  fetchForms, fetchFormById, fetchFormByPublicId,
  createForm, updateForm, publishForm,
  fetchCurrentVersion, saveFormVersion,
  fetchResponses, submitResponse,
  fetchFormAnalytics,
} from '@/services/formService';
import type { Form, Project, FormVersion } from '@/types';

// ---- Projects ----

export function useProjects() {
  const { user } = useAuthStore();
  const orgId = user?.organisation?.id || 'org-001';

  return useQuery({
    queryKey: queryKeys.projects(orgId),
    queryFn: () => fetchProjects(orgId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const orgId = user?.organisation?.id || 'org-001';

  return useMutation({
    mutationFn: (project: Partial<Project>) =>
      createProject({
        ...project,
        org_id: orgId,
        created_by: user?.profile?.id || 'user-001',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects(orgId) });
    },
  });
}

// ---- Forms ----

export function useForms(projectId?: string) {
  const { user } = useAuthStore();
  const orgId = user?.organisation?.id || 'org-001';

  return useQuery({
    queryKey: projectId ? queryKeys.forms(projectId) : queryKeys.forms(orgId),
    queryFn: () => fetchForms(orgId, projectId),
  });
}

export function useForm(formId: string) {
  return useQuery({
    queryKey: queryKeys.form(formId),
    queryFn: () => fetchFormById(formId),
    enabled: !!formId && formId !== 'new',
  });
}

export function useFormByPublicId(publicId: string) {
  return useQuery({
    queryKey: queryKeys.publicForm(publicId),
    queryFn: () => fetchFormByPublicId(publicId),
    enabled: !!publicId,
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const orgId = user?.organisation?.id || 'org-001';

  return useMutation({
    mutationFn: (form: Partial<Form>) =>
      createForm({
        ...form,
        created_by: user?.profile?.id || 'user-001',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms(orgId) });
    },
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const orgId = user?.organisation?.id || 'org-001';

  return useMutation({
    mutationFn: ({ formId, updates }: { formId: string; updates: Partial<Form> }) =>
      updateForm(formId, updates),
    onSuccess: (_, { formId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.form(formId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.forms(orgId) });
    },
  });
}

export function usePublishForm() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const orgId = user?.organisation?.id || 'org-001';

  return useMutation({
    mutationFn: (formId: string) => publishForm(formId),
    onSuccess: (_, formId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.form(formId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.forms(orgId) });
    },
  });
}

// ---- Form Versions ----

export function useCurrentVersion(formId: string) {
  return useQuery({
    queryKey: queryKeys.formVersionCurrent(formId),
    queryFn: () => fetchCurrentVersion(formId),
    enabled: !!formId && formId !== 'new',
  });
}

export function useSaveFormVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formId, schema }: { formId: string; schema: FormVersion['schema'] }) =>
      saveFormVersion(formId, schema),
    onSuccess: (_, { formId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.formVersionCurrent(formId) });
    },
  });
}

// ---- Responses ----

export function useResponses(formId: string) {
  return useQuery({
    queryKey: queryKeys.responses(formId),
    queryFn: () => fetchResponses(formId),
    enabled: !!formId,
  });
}

export function useSubmitResponse() {
  return useMutation({
    mutationFn: ({
      formId, versionId, answers, metadata,
    }: {
      formId: string;
      versionId: string;
      answers: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }) => submitResponse(formId, versionId, answers, metadata),
  });
}

// ---- Analytics ----

export function useFormAnalytics(formId: string) {
  return useQuery({
    queryKey: queryKeys.analytics(formId),
    queryFn: () => fetchFormAnalytics(formId),
    enabled: !!formId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
