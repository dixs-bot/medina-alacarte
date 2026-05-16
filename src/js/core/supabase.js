import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config.js';

let client = null;

function validateConfig() {
  if (!CONFIG.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL');
  }

  if (!CONFIG.SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_ANON_KEY');
  }
}

export function getSupabase() {
  if (client) {
    return client;
  }

  validateConfig();

  client = createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  return client;
}

export function isSupabaseReady() {
  try {
    return !!getSupabase();
  } catch {
    return false;
  }
}
