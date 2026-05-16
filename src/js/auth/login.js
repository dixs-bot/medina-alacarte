/**
 * MEDINA ALACARTE — Login Module
 * Modular, clean, production-ready login logic
 *
 * Dependencies:
 *   - @supabase/supabase-js (optional, graceful fallback)
 *   - /src/styles/variables.css (CSS custom properties used in JS)
 */

import { getSupabase, isSupabaseReady } from '../core/supabase.js';
import { storage } from '../utils/storage.js';

/* ================================================================
   CONFIGURATION
   ================================================================ */

const REDIRECT_SUCCESS = './pages/home.html';
const TOAST_DURATION = 3200;

/* ================================================================
   DOM REFERENCES
   ================================================================ */

const dom = {
  form: null,
  emailInput: null,
  passwordInput: null,
  emailHint: null,
  passwordHint: null,
  togglePasswordBtn: null,
  rememberCheckbox: null,
  loginBtn: null,
  googleBtn: null,
  forgotLink: null,
  alertBox: null,
  alertText: null,
  alertClose: null,
  toastStack: null
};

/* ================================================================
   STATE
   ================================================================ */

let isSubmitting = false;

/* ================================================================
   INITIALIZATION
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  bindEvents();
  loadSavedCredentials();
});

function cacheDom() {
  dom.form = document.getElementById('login-form');
  dom.emailInput = document.getElementById('login-email');
  dom.passwordInput = document.getElementById('login-password');
  dom.emailHint = document.getElementById('email-hint');
  dom.passwordHint = document.getElementById('password-hint');
  dom.togglePasswordBtn = document.getElementById('toggle-password');
  dom.rememberCheckbox = document.getElementById('remember-me');
  dom.loginBtn = document.getElementById('login-btn');
  dom.googleBtn = document.getElementById('google-btn');
  dom.forgotLink = document.getElementById('forgot-link');
  dom.alertBox = document.getElementById('auth-alert');
  dom.alertText = document.getElementById('auth-alert-text');
  dom.alertClose = document.getElementById('auth-alert-close');
  dom.toastStack = document.getElementById('toast-stack');
}

function bindEvents() {
  if (!dom.form) return;

  dom.form.addEventListener('submit', handleLogin);
  dom.togglePasswordBtn?.addEventListener('click', togglePasswordVisibility);
  dom.alertClose?.addEventListener('click', hideAlert);

  dom.emailInput?.addEventListener('input', () => {
    clearFieldState(dom.emailInput, dom.emailHint);
  });

  dom.passwordInput?.addEventListener('input', () => {
    clearFieldState(dom.passwordInput, dom.passwordHint);
  });

  dom.forgotLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Fitur reset password segera hadir.', 'info');
  });

  dom.googleBtn?.addEventListener('click', handleGoogleLogin);
}

/* ================================================================
   CREDENTIAL PERSISTENCE
   ================================================================ */

function loadSavedCredentials() {
  const saved = storage.get('remembered_email');
  if (saved && dom.emailInput) {
    dom.emailInput.value = saved;
    if (dom.rememberCheckbox) dom.rememberCheckbox.checked = true;
  }
}

function saveCredential(email) {
  if (dom.rememberCheckbox?.checked) {
    storage.set('remembered_email', email);
  } else {
    storage.remove('remembered_email');
  }
}

/* ================================================================
   VALIDATION
   ================================================================ */

function validateEmail(value) {
  if (!value || !value.trim()) {
    return { valid: false, message: 'Email wajib diisi.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return { valid: false, message: 'Format email tidak valid.' };
  }
  return { valid: true, message: '' };
}

function validatePassword(value) {
  if (!value) {
    return { valid: false, message: 'Password wajib diisi.' };
  }
  if (value.length < 6) {
    return { valid: false, message: 'Password minimal 6 karakter.' };
  }
  return { valid: true, message: '' };
}

function validateForm() {
  const emailResult = validateEmail(dom.emailInput.value);
  const passwordResult = validatePassword(dom.passwordInput.value);

  setFieldState(dom.emailInput, dom.emailHint, emailResult);
  setFieldState(dom.passwordInput, dom.passwordHint, passwordResult);

  return emailResult.valid && passwordResult.valid;
}

/* ================================================================
   FIELD STATE MANAGEMENT
   ================================================================ */

function setFieldState(input, hintEl, result) {
  if (!input) return;

  input.classList.remove('input-error', 'input-success');
  if (hintEl) {
    hintEl.classList.remove('form-hint--error', 'form-hint--success');
    hintEl.textContent = '';
  }

  if (!result.valid) {
    input.classList.add('input-error');
    if (hintEl) {
      hintEl.textContent = result.message;
      hintEl.classList.add('form-hint--error');
    }
  } else if (input.value.trim()) {
    input.classList.add('input-success');
  }
}

function clearFieldState(input, hintEl) {
  if (!input) return;
  input.classList.remove('input-error', 'input-success');
  if (hintEl) {
    hintEl.classList.remove('form-hint--error', 'form-hint--success');
    hintEl.textContent = '';
  }
  hideAlert();
}

/* ================================================================
   ALERT BOX
   ================================================================ */

function showAlert(message) {
  if (!dom.alertBox || !dom.alertText) return;
  dom.alertText.textContent = message;
  dom.alertBox.classList.add('show');
}

function hideAlert() {
  if (!dom.alertBox) return;
  dom.alertBox.classList.remove('show');
}

/* ================================================================
   TOAST NOTIFICATIONS
   ================================================================ */

function showToast(message, type = 'success') {
  if (!dom.toastStack) return;

  const icons = {
    success: '&#10003;',
    error: '&#10005;',
    info: 'i'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-dismiss" aria-label="Tutup notifikasi">&times;</button>
  `;

  dom.toastStack.appendChild(toast);

  const dismissBtn = toast.querySelector('.toast-dismiss');
  dismissBtn.addEventListener('click', () => removeToast(toast));

  const timer = setTimeout(() => removeToast(toast), TOAST_DURATION);
  toast._timer = timer;
}

function removeToast(toast) {
  if (!toast || toast._removed) return;
  toast._removed = true;
  clearTimeout(toast._timer);
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

/* ================================================================
   BUTTON LOADING STATE
   ================================================================ */

function setLoginLoading(loading) {
  if (!dom.loginBtn) return;
  isSubmitting = loading;
  dom.loginBtn.classList.toggle('loading', loading);
  dom.loginBtn.disabled = loading;
}

function setGoogleLoading(loading) {
  if (!dom.googleBtn) return;
  dom.googleBtn.classList.toggle('loading', loading);
  dom.googleBtn.disabled = loading;
}

/* ================================================================
   PASSWORD TOGGLE
   ================================================================ */

function togglePasswordVisibility() {
  if (!dom.passwordInput || !dom.togglePasswordBtn) return;

  const isPassword = dom.passwordInput.type === 'password';
  dom.passwordInput.type = isPassword ? 'text' : 'password';
  dom.togglePasswordBtn.classList.toggle('password-visible', isPassword);

  /* Refocus input for better UX */
  dom.passwordInput.focus();
}

/* ================================================================
   LOGIN HANDLER — SUPABASE AUTH
   ================================================================ */

async function handleLogin(event) {
  event.preventDefault();
  if (isSubmitting) return;

  hideAlert();

  if (!validateForm()) return;

  const email = dom.emailInput.value.trim();
  const password = dom.passwordInput.value;

  setLoginLoading(true);
  saveCredential(email);

  try {
    /* ── Supabase Auth Path ── */
    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        handleAuthError(error);
        return;
      }

      /* Persist user info */
      storage.set('auth_user', {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split('@')[0]
      });

      showToast('Berhasil masuk! Mengalihkan...', 'success');
      redirectWithDelay(REDIRECT_SUCCESS);
      return;
    }

    /* ── Fallback: Demo Mode ── */
    await simulateNetworkDelay();

    if (email === 'demo@medina.com' && password === 'demo123') {
      storage.set('auth_user', {
        id: 'demo-user-001',
        email: email,
        name: 'Demo User'
      });
      showToast('Berhasil masuk (demo mode)', 'success');
      redirectWithDelay(REDIRECT_SUCCESS);
    } else {
      showAlert('Email atau password salah. Coba: demo@medina.com / demo123');
      showToast('Login gagal. Periksa kredensial Anda.', 'error');
    }

  } catch (err) {
    console.error('[Auth] Login error:', err);
    showAlert('Terjadi kesalahan jaringan. Silakan coba lagi.');
    showToast('Koneksi bermasalah.', 'error');
  } finally {
    setLoginLoading(false);
  }
}

/* ================================================================
   GOOGLE LOGIN HANDLER
   ================================================================ */

async function handleGoogleLogin() {
  setGoogleLoading(true);

  try {
    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${REDIRECT_SUCCESS}`
        }
      });

      if (error) {
        showAlert(error.message);
        showToast('Login Google gagal.', 'error');
      }
      return;
    }

    /* Fallback */
    await simulateNetworkDelay();
    showToast('Login Google memerlukan konfigurasi Supabase.', 'info');

  } catch (err) {
    console.error('[Auth] Google login error:', err);
    showToast('Terjadi kesalahan.', 'error');
  } finally {
    setGoogleLoading(false);
  }
}

/* ================================================================
   ERROR HANDLING
   ================================================================ */

function handleAuthError(error) {
  const message = mapSupabaseError(error.message);
  showAlert(message);
  showToast(message, 'error');

  /* Focus problematic field */
  if (error.message.includes('Email not confirmed')) {
    showToast('Silakan cek email untuk verifikasi akun.', 'info');
  }
}

function mapSupabaseError(message) {
  const map = {
    'Invalid login credentials': 'Email atau password salah.',
    'Email not confirmed': 'Akun belum diverifikasi. Cek email Anda.',
    'Too many requests': 'Terlalu banyak percobaan. Tunggu sebentar.',
    'User not found': 'Akun tidak ditemukan.',
    'Network request failed': 'Koneksi internet bermasalah.'
  };

  for (const [key, val] of Object.entries(map)) {
    if (message.includes(key)) return val;
  }

  return 'Login gagal. Silakan coba lagi.';
}

/* ================================================================
   UTILITIES
   ================================================================ */

function redirectWithDelay(url, delay = 800) {
  setTimeout(() => {
    window.location.href = url;
  }, delay);
}

function simulateNetworkDelay(min = 600, max = 1400) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
}
