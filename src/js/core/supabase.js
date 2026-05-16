/**
 * Medina Alacarte — Supabase Client Singleton
 * Menghindari multiple instance, handle ketika belum dikonfigurasi
 */
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config.js';

let _client = null;

export function getSupabase() {
  if (_client) return _client;

  if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('YOUR_PROJECT')) {
    return null;
  }

  _client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  return _client;
}

export function isSupabaseReady() {
  return getSupabase() !== null;
}