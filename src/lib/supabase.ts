/**
 * Supabase Client Singleton
 * --------------------------
 * Single instance of the Supabase client used throughout the app.
 * NEVER import the service role key here — that is Edge Functions only.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * @deprecated Demo mode has been removed. All users must authenticate via
 * Supabase Auth. This constant is kept as `false` for backward compatibility
 * and will be removed in a future cleanup.
 */
export const USE_DEMO = false;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
