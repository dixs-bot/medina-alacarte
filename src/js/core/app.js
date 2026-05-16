/**
 * Medina Alacarte — App Entry (index.html)
 * Men redirect ke home atau login berdasarkan auth state
 */
import { getSupabase } from './supabase.js';
import { navigateTo } from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = getSupabase();
  const loader = document.getElementById('app-loader');

  try {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigateTo('/home.html');
        return;
      }
    }
    navigateTo('/login.html');
  } catch (err) {
    console.error('[App] Init error:', err);
    navigateTo('/login.html');
  } finally {
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }
  }
});
