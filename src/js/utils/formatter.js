/**
 * Medina AlacARTE — Text Formatting Utilities
 * Standalone, tanpa dependency
 */

export function truncate(str, maxLen = 60) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate order ID format: MA-YYMMDD-HHMM-XXXX
 * Contoh: MA-250614-1430-4821
 */
export function generateOrderId() {
  const now = new Date();
  const datePart = String(now.getFullYear()).slice(2)
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0')
    + String(now.getHours()).padStart(2, '0')
    + String(now.getMinutes()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 9000 + 1000));
  return `MA-${datePart}-${rand}`;
}