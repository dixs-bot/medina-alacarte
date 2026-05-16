/**
 * MEDINA ALACARTE — App Entry Point
 * File ini adalah module pertama yang di-load oleh index.html
 *
 * Tugasnya:
 * 1. Menjalankan progress bar animation
 * 2. Mengecek auth state (Supabase atau localStorage)
 * 3. Redirect ke halaman yang tepat
 * 4. Menyembunyikan loader dengan smooth transition
 *
 * Dependency chain:
 *   config.js (ROOT)
 *     ↑
 *   supabase.js ← @supabase/supabase-js
 *     ↑
 *   app.js
 *
 *   storage.js (ROOT)
 *     ↑
 *   app.js
 */

import { getSupabase, isSupabaseReady } from './supabase.js';
import { storage } from '../utils/storage.js';
import '../../styles/loading.css';
import '../../styles/skeleton.css';
/* ================================================================
   CONSTANTS
   ================================================================ */

const AUTH_KEY = 'auth_user';
const MIN_LOADER_TIME = 1800; /* Minimum waktu loader ditampilkan (ms) */
const REDIRECT_DELAY = 600;   /* Delay setelah redirect diputuskan (ms) */

/* ================================================================
   DOM
   ================================================================ */

const loader = document.getElementById('app-loader');
const barFill = document.getElementById('loader-bar-fill');
const appRoot = document.getElementById('app-root');

/* ================================================================
   INIT
   ================================================================ */

document.addEventListener('DOMContentLoaded', init);

async function init() {
  /* Mulai progress bar animation */
  startProgressBar();

  /* Catat waktu mulai */
  const startTime = performance.now();

  try {
    /* Cek auth state */
    const targetUrl = await resolveEntryPoint();

    /* Tunggu minimum loader time biar tidak terlalu cepat */
    const elapsed = performance.now() - startTime;
    const remainingTime = Math.max(0, MIN_LOADER_TIME - elapsed);

    if (remainingTime > 0) {
      await delay(remainingTime);
    }

    /* Complete progress bar */
    completeProgressBar();

    /* Delay sebentar sebelum redirect */
    await delay(REDIRECT_DELAY);

    /* Redirect */
    window.location.href = targetUrl;

  } catch (error) {
    console.error('[App] Init error:', error);

    /* Fallback: tetap redirect ke login */
    completeProgressBar();
    await delay(REDIRECT_DELAY);
    window.location.href = '/login.html';
  }
}

/* ================================================================
   AUTH RESOLUTION
   ================================================================ */

/**
 * Tentukan user harus diarahkan ke mana.
 * Priority:
 *   1. Supabase session (jika Supabase terkonfigurasi)
 *   2. localStorage fallback
 *   3. Default ke login
 */
async function resolveEntryPoint() {
  /* Cek Supabase */
  if (isSupabaseReady()) {
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        /* Simpan user info ke localStorage untuk akses cepat */
        storage.set(AUTH_KEY, {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || ''
        });
        return '/home.html';
      }
    } catch (err) {
      console.warn('[App] Supabase session check failed:', err.message);
    }

    /* Supabase ada tapi belum login */
    return '/login.html';
  }

  /* Fallback: cek localStorage */
  const cachedUser = storage.get(AUTH_KEY, null);

  if (cachedUser && cachedUser.id) {
    return '/home.html';
  }

  /* Default: belum login */
  return '/login.html';
}

/* ================================================================
   PROGRESS BAR
   ================================================================ */

function startProgressBar() {
  if (barFill) {
    /* Delay sedikit biar CSS transition terlihat */
    requestAnimationFrame(() => {
      barFill.classList.add('active');
    });
  }
}

function completeProgressBar() {
  if (barFill) {
    barFill.style.width = '100%';
  }
}

/* ================================================================
   HIDE LOADER (tidak dipakai di sini karena langsung redirect,
   tapi disediakan kalau suatu saat index.html jadi shell) 
   ================================================================ */

export function hideLoader() {
  if (loader) {
    loader.classList.add('hidden');
  }
  if (appRoot) {
    appRoot.style.display = '';
  }
}

/* ================================================================
   UTILITY
   ================================================================ */

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
