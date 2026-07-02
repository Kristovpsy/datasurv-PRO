/**
 * Auth Service — Supabase Auth
 * --------------------------
 * Handles all Supabase authentication operations.
 * Demo mode has been removed — all auth is real Supabase.
 */

import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types';

// ---- Registration ----

export async function registerWithEmail(
  email: string,
  password: string,
  fullName: string,
  role: UserRole
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });
  if (error) throw error;
  return data;
}

// ---- Auth Methods ----

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
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
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
}

export async function inviteUser(email: string, orgId: string, role: string) {
  // This would typically be an Edge Function to avoid exposing service_role
  const { data, error } = await supabase.functions.invoke('invite-user', {
    body: { email, org_id: orgId, role },
  });
  if (error) throw error;
  return data;
}

export async function acceptInvite(token: string, password: string) {
  const { data, error } = await supabase.functions.invoke('accept-invite', {
    body: { token, password },
  });
  if (error) throw error;
  return data;
}

// ---- Session Helpers ----

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback as Parameters<typeof supabase.auth.onAuthStateChange>[0]);
}

// ---- Profile Fetchers ----

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function fetchUserRole(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function fetchOrganisation(orgId: string) {
  const { data, error } = await supabase
    .from('organisations')
    .select('*')
    .eq('id', orgId)
    .single();

  if (error) return null;
  return data;
}
