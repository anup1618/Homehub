import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if we have valid, active live Supabase credentials
const isLiveConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('demo-homehub') && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('demo-anon-key') &&
  !supabaseAnonKey.includes('your_supabase_anon')
);

let supabaseClient = null;

if (isLiveConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    console.log('[HomeHub] Supabase initialized in LIVE cloud mode');
  } catch (err) {
    console.warn('[HomeHub] Failed to initialize Supabase client:', err);
    supabaseClient = null;
  }
} else {
  console.info('[HomeHub] Running in local demo mode with Supabase-compatible simulation. Set real keys in .env for live Supabase sync.');
}

export const supabase = supabaseClient;
export const isLiveMode = isLiveConfigured && !!supabaseClient;
