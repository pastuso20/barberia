import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let isValidUrl = false;
try {
  const u = new URL(supabaseUrl);
  isValidUrl = u.hostname.endsWith('.supabase.co');
} catch (_) {
  isValidUrl = false;
}

export const supabase = isValidUrl && !!supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
