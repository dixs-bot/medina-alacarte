/**
 * MEDINA ALACARTE — Register Module
 * Modular, clean, production-ready registration logic
 *
 * Dependencies:
 *   - @supabase/supabase-js (optional, graceful fallback)
 *   - /src/styles/variables.css (CSS custom properties)
 */

import { getSupabase, isSupabaseReady } from '../core/supabase.js';
import { storage } from '../utils/storage.js';

/* ================================================================
   CONFIGURATION
   ================================================================ */

const REDIRECT_SUCCESS = '/login.html';
const TOAST_DURATION = 3200;

const STRENGTH_LABELS = ['', 'Lemah', 'Cukup', 'Bagus', 'Kuat'];
const STRENGTH_CLASSES = ['level-0', 'level-1', 'level-2', 'level-3', 'level-4'];

/* ================================================================
   DOM REFERENCES
   ================================================================ */

const dom = {
  form: null,
  nameInput: null,
  emailInput: null,
  passwordInput: null,
  confirmInput: null,
  nameHint: null,
  emailHint: null,
  passwordHint: null,
  confirmHint: null,
  togglePasswordBtn: null,
  toggleConfirmBtn: null,
  registerBtn: null,
  googleBtn: null,
  strengthWrap: null,
  strengthBar: null,
  strengthLabel: null,
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
  adjustPageLayout();
});

function cacheDom() {
  dom.form            = document.getElementById('register-form');
  dom.nameInput       = document.getElementById('reg-name');
  dom.emailInput      = document.getElementById('reg-email');
  dom.passwordInput   = document.getElementById('reg-password');
  dom.confirmInput    = document.getElementById('reg-confirm');
  dom.nameHint        = document.getElementById('name-hint');
  dom.emailHint       = document.getElementById('email-hint');
  dom.passwordHint    = document.getElementById('password-hint');
  dom.confirmHint     = document.getElementById('confirm-hint');
  dom.togglePasswordBtn  = document.getElementById('toggle-password');
  dom.toggleConfirmBtn   = document.getElementById('toggle-confirm');
  dom.registerBtn     = document.getElementById('register-btn');
  dom.googleBtn       = document.getElementById('google-btn');
  dom.strengthWrap    = document.getElementById('pw-strength');
  dom.strengthBar     = document.getElementById('pw-strength-bar');
  dom.strengthLabel   = document.getElementById('pw-strength-label');
  dom.alertBox        = document.getElementById('auth-alert');
  dom.alertText       = document.getElementById('auth-alert-text');
  dom.alertClose      = document.getElementById('auth-alert-close');
  dom.toastStack      = document.getElementById('toast-stack');
}

function bindEvents() {
  if (!dom.form) return;

  dom.form.addEventListener('submit', handleRegister);

  dom.togglePasswordBtn?.addEventListener('click', () => {
    togglePasswordVisibility(dom.passwordInput, dom.togglePasswordBtn);
  });

  dom.toggleConfirmBtn?.addEventListener('click', () => {
    togglePasswordVisibility(dom.confirmInput, dom.toggleConfirmBtn);
  });

  dom.alertClose?.addEventListener('click', hideAlert);

  /* Realtime validation on input */
  dom.nameInput?.addEventListener('input', () => {
    clearFieldState(dom.nameInput, dom.nameHint);
    hideAlert();
  });

  dom.emailInput?.addEventListener('input', () => {
    clearFieldState(dom.emailInput, dom.emailHint);
    hideAlert();
  });

  dom.passwordInput?.addEventListener('input', () => {
    clearFieldState(dom.passwordInput, dom.passwordHint);
    updatePasswordStrength(dom.passwordInput.value);
    validateConfirmMatch();
    hideAlert();
  });

  dom.confirmInput?.addEventListener('input', () => {
    clearFieldState(dom.confirmInput, dom.confirmHint);
    validateConfirmMatch();
    hideAlert();
  });

  /* Blur validation for clearer UX */
  dom.nameInput?.addEventListener('blur', () => {
    if (dom.nameInput.value.trim()) validateName();
  });

  dom.emailInput?.addEventListener('blur', () => {
    if (dom.emailInput.value.trim()) validateEmail();
  });

  dom.passwordInput?.addEventListener('blur', () => {
    if (dom.passwordInput.value) validatePassword();
  });

  dom.confirmInput?.addEventListener('blur', () => {
    if (dom.confirmInput.value) validateConfirm();
  });

  dom.googleBtn?.addEventListener('click', handleGoogleRegister);
}

/**
 * Add modifier class to auth-page for register-specific vertical layout
 */
function adjustPageLayout() {
  const page = document.querySelector('.auth-page');
  if (page) page.classList.add('auth-page--register');
}


/* ================================================================
   VALIDATION — Individual Fields
   ================================================================ */

function validateName() {
  const value = dom.nameInput?.value.trim() || '';
  if (!value) {
    return setFieldError(dom.nameInput, dom.nameHint, 'Nama lengkap wajib diisi.');
  }
  if (value.length < 2) {
    return setFieldError(dom.nameInput, dom.nameHint, 'Nama minimal 2 karakter.');
  }
  if (value.length > 80) {
    return setFieldError(dom.nameInput, dom.nameHint, 'Nama terlalu panjang.');
  }
  setFieldSuccess(dom.nameInput, dom.nameHint);
  return true;
}

function validateEmail() {
  const value = dom.emailInput?.value.trim() || '';
  if (!value) {
    return setFieldError(dom.emailInput, dom.emailHint, 'Email wajib diisi.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return setFieldError(dom.emailInput, dom.emailHint, 'Format email tidak valid.');
  }
  setFieldSuccess(dom.emailInput, dom.emailHint);
  return true;
}

function validatePassword() {
  const value = dom.passwordInput?.value || '';
  if (!value) {
    return setFieldError(dom.passwordInput, dom.passwordHint, 'Password wajib diisi.');
  }
  if (value.length < 6) {
    return setFieldError(dom.passwordInput, dom.passwordHint, 'Password minimal 6 karakter.');
  }
  setFieldSuccess(dom.passwordInput, dom.passwordHint);
  return true;
}

function validateConfirm() {
  const password = dom.passwordInput?.value || '';
  const confirm  = dom.confirmInput?.value || '';

  if (!confirm) {
    return setFieldError(dom.confirmInput, dom.confirmHint, 'Konfirmasi password wajib diisi.');
  }
  if (confirm !== password) {
    return setFieldError(dom.confirmInput, dom.confirmHint, 'Password tidak cocok.');
  }
  setFieldSuccess(dom.confirmInput, dom.confirmHint);
  return true;
}

/**
 * Live check confirm match while typing (no error if confirm is empty)
 */
function validateConfirmMatch() {
  const password = dom.passwordInput?.value || '';
  const confirm  = dom.confirmInput?.value || '';

  if (!confirm || !password) {
    clearFieldState(dom.confirmInput, dom.confirmHint);
    return;
  }

  if (confirm !== password) {
    setFieldError(dom.confirmInput, dom.confirmHint, 'Password tidak cocok.');
  } else {
    setFieldSuccess(dom.confirmInput, dom.confirmHint);
  }
}


/* ================================================================
   VALIDATION — Full Form
   ================================================================ */

function validateForm() {
  const nameOk    = validateName();
  const emailOk   = validateEmail();
  const passOk    = validatePassword();
  const confirmOk = validateConfirm();

  return nameOk && emailOk && passOk && confirmOk;
}


/* ================================================================
   PASSWORD STRENGTH CALCULATOR
   ================================================================ */

function calculateStrength(password) {
  if (!password) return 0;

  let score = 0;

  /* Length checks */
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;

  /* Character variety */
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  /* Penalize very short */
  if (password.length < 6) score = Math.max(0, score - 1);

  /* Clamp 0–4 */
  return Math.min(4, Math.max(0, score));
}

function updatePasswordStrength(password) {
  if (!dom.strengthWrap || !dom.strengthBar || !dom.strengthLabel) return;

  const level = calculateStrength(password);

  /* Remove all level classes then add current */
  STRENGTH_CLASSES.forEach(cls => {
    dom.strengthBar.classList.remove(cls);
    dom.strengthLabel.classList.remove(cls);
  });
  dom.strengthBar.classList.add(STRENGTH_CLASSES[level]);
  dom.strengthLabel.classList.add(STRENGTH_CLASSES[level]);

  dom.strengthLabel.textContent = password ? STRENGTH_LABELS[level] : '';

  /* Show/hide the entire indicator */
  if (password.length > 0) {
    dom.strengthWrap.classList.add('visible');
  } else {
    dom.strengthWrap.classList.remove('visible');
  }
}


/* ================================================================
   FIELD STATE MANAGEMENT
   ================================================================ */

function setFieldError(input, hintEl, message) {
  if (!input) return false;
  input.classList.remove('input-success');
  input.classList.add('input-error');
  if (hintEl) {
    hintEl.textContent = message;
    hintEl.className = 'form-hint form-hint--error';
  }
  return false;
}

function setFieldSuccess(input, hintEl) {
  if (!input) return true;
  input.classList.remove('input-error');
  input.classList.add('input-success');
  if (hintEl) {
    hintEl.textContent = '';
    hintEl.className = 'form-hint form-hint--success';
  }
  return true;
}

function clearFieldState(input, hintEl) {
  if (!input) return;
  input.classList.remove('input-error', 'input-success');
  if (hintEl) {
    hintEl.textContent = '';
    hintEl.className = 'form-hint';
  }
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
    error:   '&#10005;',
    info:    'i'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-dismiss" aria-label="Tutup notifikasi">&times;</button>
  `;

  dom.toastStack.appendChild(toast);

  toast.querySelector('.toast-dismiss')
    .addEventListener('click', () => removeToast(toast));

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

function setRegisterLoading(loading) {
  if (!dom.registerBtn) return;
  isSubmitting = loading;
  dom.registerBtn.classList.toggle('loading', loading);
  dom.registerBtn.disabled = loading;
}

function setGoogleLoading(loading) {
  if (!dom.googleBtn) return;
  dom.googleBtn.classList.toggle('loading', loading);
  dom.googleBtn.disabled = loading;
}


/* ================================================================
   PASSWORD TOGGLE
   ================================================================ */

function togglePasswordVisibility(input, btn) {
  if (!input || !btn) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  btn.classList.toggle('password-visible', isPassword);
  input.focus();
}


/* ================================================================
   REGISTER HANDLER — SUPABASE AUTH
   ================================================================ */

async function handleRegister(event) {
  event.preventDefault();
  if (isSubmitting) return;

  hideAlert();

  if (!validateForm()) return;

  const name     = dom.nameInput.value.trim();
  const email    = dom.emailInput.value.trim();
  const password = dom.passwordInput.value;

  setRegisterLoading(true);

  try {
    /* ── Supabase Auth Path ── */
    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        handleRegisterError(error);
        return;
      }

      /*
       * Supabase may return user without session
       * if email confirmation is enabled.
       * Either way, redirect to login with a message.
       */
      const needsConfirmation = data.user && !data.session;

      if (needsConfirmation) {
        showToast('Cek email untuk verifikasi akun Anda.', 'info');
        redirectWithDelay(REDIRECT_SUCCESS, 1200);
      } else {
        showToast('Akun berhasil dibuat!', 'success');
        redirectWithDelay(REDIRECT_SUCCESS, 800);
      }
      return;
    }

    /* ── Fallback: Demo Mode ── */
    await simulateNetworkDelay();

    storage.set('auth_user', {
      id: 'demo-reg-' + Date.now(),
      email: email,
      name: name
    });

    showToast('Akun berhasil dibuat (demo mode)', 'success');
    redirectWithDelay(REDIRECT_SUCCESS, 800);

  } catch (err) {
    console.error('[Auth] Register error:', err);
    showAlert('Terjadi kesalahan jaringan. Silakan coba lagi.');
    showToast('Koneksi bermasalah.', 'error');
  } finally {
    setRegisterLoading(false);
  }
}


/* ================================================================
   GOOGLE REGISTER HANDLER
   ================================================================ */

async function handleGoogleRegister() {
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

    await simulateNetworkDelay();
    showToast('Login Google memerlukan konfigurasi Supabase.', 'info');

  } catch (err) {
    console.error('[Auth] Google register error:', err);
    showToast('Terjadi kesalahan.', 'error');
  } finally {
    setGoogleLoading(false);
  }
}


/* ================================================================
   ERROR HANDLING — Register-specific messages
   ================================================================ */

function handleRegisterError(error) {
  const message = mapRegisterError(error.message);
  showAlert(message);
  showToast(message, 'error');

  /* Focus the problematic field */
  if (error.message.includes('already registered') ||
      error.message.includes('already in use')) {
    dom.emailInput?.focus();
  }
}

function mapRegisterError(message) {
  const map = {
    'already registered':        'Email sudah terdaftar. Silakan login.',
    'already in use':            'Email sudah digunakan akun lain.',
    'User already registered':   'Email sudah terdaftar. Silakan login.',
    'Password should be':        'Password tidak memenuhi syarat. Minimal 6 karakter.',
    'password':                  'Password terlalu lemah. Gunakan minimal 6 karakter.',
    'Network request failed':    'Koneksi internet bermasalah.',
    'Too many requests':         'Terlalu banyak percobaan. Tunggu sebentar.',
    'Invalid email':             'Format email tidak valid.'
  };

  for (const [key, val] of Object.entries(map)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return val;
  }

  return 'Registrasi gagal. Silakan coba lagi.';
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