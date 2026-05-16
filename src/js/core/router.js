/**
 * Simple page navigator — tidak menggunakan hash routing
 * Karena ini MPA (multi-page app), navigasi langsung via href
 */

export function navigateTo(path) {
  window.location.href = path;
}

export function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

export function getCurrentPath() {
  return window.location.pathname;
}
