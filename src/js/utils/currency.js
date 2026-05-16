/**
 * Medina Alacarte — Currency Formatter
 * Menggunakan Intl.NumberFormat untuk format Rupiah
 */
import { CONFIG } from '../core/config.js';

export function formatRupiah(amount) {
  if (amount == null || isNaN(amount)) {
    return `${CONFIG.CURRENCY} 0`;
  }
  return new Intl.NumberFormat(CONFIG.LOCALE, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}