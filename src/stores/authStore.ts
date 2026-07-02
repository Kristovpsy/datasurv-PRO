/**
 * Auth Store — Zustand + Supabase Auth
 * --------------------------
 * Manages authentication state, user profile, and role.
 * Connects to real Supabase Auth and fetches profile/role/org from the DB.
 *
 * RBAC Tiers:
 *   Level 1 — Field Officer (data collection)
 *   Level 2 — Editor (review, edit, approve)
 *   Level 3 — Admin (read-only analytics & reports, can delete responses)
 *   Hidden  — Superadmin (system-level)
 */

import { create } from 'zustand';
import { supabase, USE_DEMO } from '@/lib/supabase';
import type { AuthUser, Profile, Organisation, UserRoleRecord, UserRole } from '@/types';
import { hasMinRole } from '@/lib/utils';

// ---- Demo Accounts ----
interface DemoAccount {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  avatar_color: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-admin-001',
    email: 'admin@datasurv.io',
    password: 'Admin@2025!',
    full_name: 'Chris Admin',
    role: 'admin',
    avatar_color: '#6366f1',
  },
  {
    id: 'demo-editor-001',
    email: 'editor@datasurv.io',
    password: 'Editor@2025!',
    full_name: 'Sarah Editor',
    role: 'editor',
    avatar_color: '#10b981',
  },
  {
    id: 'demo-officer-001',
    email: 'officer@datasurv.io',
    password: 'Field@2025!',
    full_name: 'James Officer',
    role: 'field_officer',
    avatar_color: '#f59e0b',
  },
];

const DEMO_ORG: Organisation = {
  id: 'demo-org-001',
  name: 'Datasurv Research Lab',
  slug: 'datasurv-research',
  plan: 'pro',
  created_at: '2025-01-01T00:00:00Z',
  settings: {},
  is_active: true,
};

function buildDemoAuthUser(account: DemoAccount): AuthUser {
  return {
    id: account.id,
    email: account.email,
    profile: {
      id: account.id,
      org_id: DEMO_ORG.id,
      full_name: account.full_name,
      avatar_url: null,
      phone: null,
      is_active: true,
      last_login: new Date().toISOString(),
      created_at: '2025-01-01T00:00:00Z',
    },
    role: {
      id: `role-${account.id}`,
      user_id: account.id,
      org_id: DEMO_ORG.id,
      role: account.role,
      assigned_by: null,
      assigned_at: '2025-01-01T00:00:00Z',
    },
    organisation: DEMO_ORG,
  };
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Role helpers
  userRole: UserRole;
  canEdit: boolean;        // editor or superadmin
  canApprove: boolean;     // editor or superadmin
  isReadOnly: boolean;     // admin (view analytics, reports — no data edits)
  canDelete: boolean;      // admin+ can delete responses
  canManageTeam: boolean;  // editor+ (editors can invite field officers)
  isFieldOfficer: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

function computeRoleState(user: AuthUser | null) {
  const role = user?.role?.role || 'field_officer';
  return {
    userRole: role as UserRole,
    canEdit: role === 'editor' || role === 'superadmin',
    canApprove: role === 'editor' || role === 'superadmin',
    isReadOnly: role === 'admin',
    canDelete: hasMinRole(role as UserRole, 'admin'),
    canManageTeam: hasMinRole(role as UserRole, 'editor'),
    isFieldOfficer: role === 'field_officer',
  };
}

// ---- Fetch full user context from Supabase ----
async function buildAuthUser(supabaseUserId: string, email: string): Promise<AuthUser | null> {
  // Fetch profile + org + role in parallel
  const [profileRes, roleRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*, organisations(*)')
      .eq('id', supabaseUserId)
      .single(),
    supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', supabaseUserId)
      .single(),
  ]);

  if (profileRes.error || !profileRes.data) {
    console.error('Profile fetch error:', profileRes.error);
    return null;
  }

  const profileData = profileRes.data as Profile & { organisations: Organisation };
  const org: Organisation = profileData.organisations;

  const profile: Profile = {
    id: profileData.id,
    org_id: profileData.org_id,
    full_name: profileData.full_name,
    avatar_url: profileData.avatar_url,
    phone: profileData.phone,
    is_active: profileData.is_active,
    last_login: profileData.last_login,
    created_at: profileData.created_at,
  };

  const roleRecord: UserRoleRecord | null = roleRes.data
    ? {
        id: roleRes.data.id,
        user_id: roleRes.data.user_id,
        org_id: roleRes.data.org_id,
        role: roleRes.data.role as UserRole,
        assigned_by: roleRes.data.assigned_by,
        assigned_at: roleRes.data.assigned_at,
      }
    : null;

  // Update last_login timestamp
  await supabase
    .from('profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', supabaseUserId);

  return {
    id: supabaseUserId,
    email,
    profile,
    role: roleRecord,
    organisation: org,
  };
}

// Track auth listener subscription for cleanup
let authListenerUnsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading so app waits for session rehydration
  error: null,
  ...computeRoleState(null),

  // ---- Initialise — called once on app mount ----
  initAuth: async () => {
    set({ isLoading: true });

    if (USE_DEMO) {
      // In demo mode, no session to restore — go straight to login
      set({ user: null, isAuthenticated: false, isLoading: false, ...computeRoleState(null) });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const authUser = await buildAuthUser(session.user.id, session.user.email || '');
        if (authUser) {
          set({ user: authUser, isAuthenticated: true, isLoading: false, ...computeRoleState(authUser) });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false, ...computeRoleState(null) });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false, ...computeRoleState(null) });
      }
    } catch (err) {
      console.error('Auth init error:', err);
      set({ user: null, isAuthenticated: false, isLoading: false, ...computeRoleState(null) });
    }

    // Clean up any previous listener before setting up a new one
    if (authListenerUnsubscribe) {
      authListenerUnsubscribe();
      authListenerUnsubscribe = null;
    }

    // Listen for auth state changes (e.g. token refresh, sign-out from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        set({ user: null, isAuthenticated: false, ...computeRoleState(null) });
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const currentUser = get().user;
        // Only re-fetch if user changed
        if (!currentUser || currentUser.id !== session.user.id) {
          const authUser = await buildAuthUser(session.user.id, session.user.email || '');
          if (authUser) {
            set({ user: authUser, isAuthenticated: true, ...computeRoleState(authUser) });
          }
        }
      }
    });

    authListenerUnsubscribe = () => subscription.unsubscribe();
  },

  // ---- Login (returns true on success, false on failure) ----
  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    // Demo mode: match against demo accounts
    if (USE_DEMO) {
      const account = DEMO_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
      );
      if (!account) {
        set({ isLoading: false, error: 'Invalid email or password. Use one of the demo account credentials.' });
        return false;
      }
      const authUser = buildDemoAuthUser(account);
      set({ user: authUser, isAuthenticated: true, isLoading: false, error: null, ...computeRoleState(authUser) });
      return true;
    }

    // Production: Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        set({ isLoading: false, error: error.message });
        return false;
      }

      if (!data.user) {
        set({ isLoading: false, error: 'Login failed. Please try again.' });
        return false;
      }

      const authUser = await buildAuthUser(data.user.id, data.user.email || email);
      if (!authUser) {
        set({ isLoading: false, error: 'Your account profile could not be loaded. Contact your administrator.' });
        return false;
      }

      set({ user: authUser, isAuthenticated: true, isLoading: false, error: null, ...computeRoleState(authUser) });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  // ---- Logout ----
  logout: async () => {
    if (!USE_DEMO) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    set({ user: null, isAuthenticated: false, error: null, ...computeRoleState(null) });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  clearError: () => set({ error: null }),
}));
