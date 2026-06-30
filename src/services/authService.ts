/**
 * Auth Service — Supabase Auth + Demo Fallback
 * --------------------------
 * Per Section 5: auth is Supabase-native with magic links + passwords.
 * Demo mode uses localStorage mock accounts.
 */

import { supabase } from '@/lib/supabase';

const USE_DEMO = !import.meta.env.VITE_SUPABASE_URL;

// ---- Auth Methods ----

export async function signInWithEmail(email: string, password: string) {
  if (USE_DEMO) {
    // Demo mode handled by authStore directly
    return { user: null, session: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  if (USE_DEMO) {
    return { user: null, session: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (USE_DEMO) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  if (USE_DEMO) return;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
}

export async function inviteUser(email: string, orgId: string, role: string) {
  if (USE_DEMO) {
    return { invite_token: `demo-invite-${Date.now()}` };
  }

  // This would typically be an Edge Function to avoid exposing service_role
  const { data, error } = await supabase.functions.invoke('invite-user', {
    body: { email, org_id: orgId, role },
  });
  if (error) throw error;
  return data;
}

export async function acceptInvite(token: string, password: string) {
  if (USE_DEMO) return;

  const { data, error } = await supabase.functions.invoke('accept-invite', {
    body: { token, password },
  });
  if (error) throw error;
  return data;
}

// ---- Session Helpers ----

export async function getSession() {
  if (USE_DEMO) return null;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getCurrentUser() {
  if (USE_DEMO) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  if (USE_DEMO) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback as Parameters<typeof supabase.auth.onAuthStateChange>[0]);
}

// ---- Profile Fetchers ----

export async function fetchUserProfile(userId: string) {
  if (USE_DEMO) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function fetchUserRole(userId: string) {
  if (USE_DEMO) return null;

  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function fetchOrganisation(orgId: string) {
  if (USE_DEMO) return null;

  const { data, error } = await supabase
    .from('organisations')
    .select('*')
    .eq('id', orgId)
    .single();

  if (error) return null;
  return data;
}
