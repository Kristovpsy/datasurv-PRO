/**
 * Supabase Client Singleton
 * --------------------------
 * Single instance of the Supabase client used throughout the app.
 * NEVER import the service role key here — that is Edge Functions only.
 *
 * When demo mode is enabled (VITE_USE_DEMO=true), the Supabase client
 * is still created (for type compatibility) but never used for auth.
 */

import { createClient } from '@supabase/supabase-js';

/** Whether the app is running in demo mode (local mock accounts) */
export const USE_DEMO = import.meta.env.VITE_USE_DEMO === 'true';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
