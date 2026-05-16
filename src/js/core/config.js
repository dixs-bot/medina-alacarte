/**
 * Medina Alacarte — App Configuration
 * Ganti nilai di bawah dengan credential Supabase kamu
 */
export const CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY',
  WHATSAPP_NUMBER: '085189976233',
  APP_NAME: 'Medina Alacarte',
  CURRENCY: 'Rp',
  LOCALE: 'id-ID',
  IS_DEV: import.meta.env?.DEV ?? true
};