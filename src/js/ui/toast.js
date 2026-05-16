/**
 * Medina Alacarte — Toast Notification System
 * File terpisah untuk menghindari circular dependency
 * antara home.js dan products.js
 */

const TOAST_DURATION = 2800;

function getContainer() {
  let el = document.getElementById('toast-stack');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast-stack';
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  return el;
}

export function showToast(message, type = 'success') {
  const container = getContainer();

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
  `;

  container.appendChild(toast);

  setTimeout(() => {
    removeToast(toast);
  }, TOAST_DURATION);
}

export function removeToast(toast) {
  if (!toast || toast._removed) return;
  toast._removed = true;
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => {
    toast.remove();
  }, { once: true });
}