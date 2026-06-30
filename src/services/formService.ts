/**
 * Form Service — Supabase-ready service layer
 * --------------------------
 * Per Section 6.1: All client-side Supabase calls go through this service.
 * Currently uses demoData; swap with real Supabase queries when backend is ready.
 */

import { supabase } from '@/lib/supabase';
import {
  demoForms, demoProjects, demoResponses, demoFormVersions,
} from '@/services/demoData';
import type {
  Form, Project, Response, FormVersion, FormStatus,
} from '@/types';

const USE_DEMO = !import.meta.env.VITE_SUPABASE_URL;

// ---- Projects ----

export async function fetchProjects(orgId: string): Promise<Project[]> {
  if (USE_DEMO) return demoProjects;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as Project[];
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  if (USE_DEMO) {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: project.name || 'New Project',
      description: project.description || '',
      org_id: project.org_id || 'org-001',
      created_by: project.created_by || 'user-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Project;
    demoProjects.push(newProject);
    return newProject;
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

// ---- Forms ----

export async function fetchForms(orgId: string, projectId?: string): Promise<Form[]> {
  if (USE_DEMO) {
    return projectId
      ? demoForms.filter((f) => f.project_id === projectId)
      : demoForms;
  }

  let query = supabase
    .from('forms')
    .select('*')
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Form[];
}

export async function fetchFormById(formId: string): Promise<Form | null> {
  if (USE_DEMO) return demoForms.find((f) => f.id === formId) || null;

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (error) throw error;
  return data as Form;
}

export async function fetchFormByPublicId(publicId: string): Promise<Form | null> {
  if (USE_DEMO) return demoForms.find((f) => f.public_id === publicId) || null;

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('public_id', publicId)
    .single();

  if (error) return null;
  return data as Form;
}

export async function createForm(form: Partial<Form>): Promise<Form> {
  if (USE_DEMO) {
    const newForm: Form = {
      id: `form-${Date.now()}`,
      title: form.title || 'Untitled Form',
      description: form.description || '',
      status: 'draft' as FormStatus,
      project_id: form.project_id || 'proj-001',
      created_by: form.created_by || 'user-001',
      current_version: 1,
      public_id: null,
      allow_anonymous: true,
      max_responses: null,
      deadline: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoForms.push(newForm);
    return newForm;
  }

  const { data, error } = await supabase
    .from('forms')
    .insert(form)
    .select()
    .single();

  if (error) throw error;
  return data as Form;
}

export async function updateForm(formId: string, updates: Partial<Form>): Promise<Form> {
  if (USE_DEMO) {
    const idx = demoForms.findIndex((f) => f.id === formId);
    if (idx === -1) throw new Error('Form not found');
    demoForms[idx] = { ...demoForms[idx], ...updates, updated_at: new Date().toISOString() };
    return demoForms[idx];
  }

  const { data, error } = await supabase
    .from('forms')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', formId)
    .select()
    .single();

  if (error) throw error;
  return data as Form;
}

export async function publishForm(formId: string): Promise<Form> {
  const publicId = `srv-${Math.random().toString(36).substring(2, 10)}`;
  return updateForm(formId, { status: 'published' as FormStatus, public_id: publicId });
}

// ---- Form Versions ----

export async function fetchCurrentVersion(formId: string): Promise<FormVersion | null> {
  if (USE_DEMO) return demoFormVersions.find((fv) => fv.form_id === formId && fv.is_current) || null;

  const { data, error } = await supabase
    .from('form_versions')
    .select('*')
    .eq('form_id', formId)
    .eq('is_current', true)
    .single();

  if (error) return null;
  return data as FormVersion;
}

export async function saveFormVersion(formId: string, schema: FormVersion['schema']): Promise<FormVersion> {
  if (USE_DEMO) {
    const existing = demoFormVersions.find((fv) => fv.form_id === formId && fv.is_current);
    if (existing) {
      existing.schema = schema;
      existing.updated_at = new Date().toISOString();
      return existing;
    }
    const newVersion: FormVersion = {
      id: `fv-${Date.now()}`,
      form_id: formId,
      version_number: 1,
      schema,
      is_current: true,
      created_by: 'user-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoFormVersions.push(newVersion);
    return newVersion;
  }

  // In real Supabase, this would be an Edge Function that:
  // 1. Sets is_current=false on old version
  // 2. Inserts new version with is_current=true
  // 3. Updates form.current_version
  const currentVersion = await fetchCurrentVersion(formId);
  const nextVersionNum = currentVersion ? currentVersion.version_number + 1 : 1;

  if (currentVersion) {
    await supabase
      .from('form_versions')
      .update({ is_current: false })
      .eq('id', currentVersion.id);
  }

  const { data, error } = await supabase
    .from('form_versions')
    .insert({
      form_id: formId,
      version_number: nextVersionNum,
      schema,
      is_current: true,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('forms')
    .update({ current_version: nextVersionNum })
    .eq('id', formId);

  return data as FormVersion;
}

// ---- Responses ----

export async function fetchResponses(formId: string): Promise<Response[]> {
  if (USE_DEMO) return demoResponses.filter((r) => r.form_id === formId);

  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data as Response[];
}

export async function submitResponse(
  formId: string,
  versionId: string,
  answers: Record<string, unknown>,
  metadata?: Record<string, unknown>
): Promise<Response> {
  if (USE_DEMO) {
    const newResponse: Response = {
      id: `resp-${Date.now()}`,
      form_id: formId,
      version_id: versionId,
      respondent_id: null,
      answers,
      is_complete: true,
      submitted_at: new Date().toISOString(),
      approval_status: 'pending',
      metadata: {
        device: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        time_to_complete_seconds: Math.round(((metadata?.startTime as number) || Date.now() - Date.now()) / 1000),
        ...metadata,
      },
    };
    demoResponses.push(newResponse);
    return newResponse;
  }

  const { data, error } = await supabase
    .from('responses')
    .insert({
      form_id: formId,
      version_id: versionId,
      answers,
      is_complete: true,
      metadata: {
        device: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        ...metadata,
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data as Response;
}

// ---- Analytics Helpers ----

export async function fetchFormAnalytics(formId: string) {
  const [form, version, responses] = await Promise.all([
    fetchFormById(formId),
    fetchCurrentVersion(formId),
    fetchResponses(formId),
  ]);

  if (!form || !version) return null;

  const fields = version.schema.fields.filter((f) => f.type !== 'section_header');
  const totalResponses = responses.length;
  const completedResponses = responses.filter((r) => r.is_complete).length;
  const avgTime = totalResponses > 0
    ? Math.round(responses.reduce((sum, r) => sum + ((r.metadata?.time_to_complete_seconds as number) || 0), 0) / totalResponses)
    : 0;

  // Per-field analytics
  const fieldAnalytics = fields.map((field) => {
    const values = responses.map((r) => (r.answers as Record<string, unknown>)[field.id]).filter((v) => v !== undefined && v !== null);

    if (['single_choice', 'dropdown'].includes(field.type)) {
      const counts: Record<string, number> = {};
      values.forEach((v) => { counts[v as string] = (counts[v as string] || 0) + 1; });
      return { field, type: 'pie' as const, data: Object.entries(counts).map(([name, value]) => ({ name, value })) };
    }

    if (field.type === 'multi_choice') {
      const counts: Record<string, number> = {};
      values.forEach((v) => {
        (v as string[]).forEach((opt) => { counts[opt] = (counts[opt] || 0) + 1; });
      });
      return { field, type: 'bar' as const, data: Object.entries(counts).map(([name, value]) => ({ name, value })) };
    }

    if (field.type === 'number' || field.type === 'rating') {
      const nums = values as number[];
      const avg = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      const distribution: Record<number, number> = {};
      nums.forEach((n) => { distribution[n] = (distribution[n] || 0) + 1; });
      return {
        field, type: 'bar' as const, avg,
        data: Object.entries(distribution).map(([name, value]) => ({ name, value })).sort((a, b) => Number(a.name) - Number(b.name)),
      };
    }

    return { field, type: 'text' as const, data: values.slice(0, 20) };
  });

  // Timeline
  const timelineMap = new Map<string, number>();
  responses.forEach((r) => {
    const day = new Date(r.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    timelineMap.set(day, (timelineMap.get(day) || 0) + 1);
  });
  const timeline = Array.from(timelineMap.entries()).map(([date, count]) => ({ date, responses: count }));

  return {
    form, version, responses, fields, fieldAnalytics, timeline,
    totalResponses, completedResponses, avgTime,
    completionRate: totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0,
  };
}
