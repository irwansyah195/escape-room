import { createClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && import.meta?.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
const supabaseUrl = env?.VITE_SUPABASE_URL || 'https://wkhsvwkzgioaduunnbyj.supabase.co';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MHhHSZvRBuBmDkb82h1U7g_c3pSrTz-';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseAnonKey.trim().length > 10);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase Anon Key belum diisi di file .env (VITE_SUPABASE_ANON_KEY).\n" +
    "Buka Supabase Dashboard > Settings > API, lalu salin 'anon public' key ke file .env."
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

