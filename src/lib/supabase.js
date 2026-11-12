import { createClient } from '@supabase/supabase-js';

// Only the PUBLIC anon key is ever used in the browser. Security comes from
// Row Level Security in the database (see supabase/migrations). Never put the
// service_role key in any VITE_ variable.
const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isLive = Boolean(url && anon);

export const supabase = isLive
  ? createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = anon;

export function publicUrl(bucket, path) {
  if (!supabase || !path) return '';
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
