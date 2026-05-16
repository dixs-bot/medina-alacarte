/**
 * MEDINA ALACARTE — WhatsApp Message Generator
 * Format pesan profesional untuk order via WhatsApp
 */
import { CONFIG } from '../core/config.js';
import { formatRupiah } from '../utils/currency.js';

/**
 * Generate dan buka link WhatsApp
 * @param {Object} params
 */
export function sendWhatsApp({ orderId, items, total, name, phone, address, notes, payment }) {
  const paymentLabels = {
    cash: 'Bayar di Tempat (Cash)',
    transfer: 'Transfer Bank',
    ewallet: 'E-Wallet'
  };

  let message = `Halo Medina Alacarte ☕\nSaya ingin memesan:\n\n`;
  message += `=================\n\n`;

  items.forEach(item => {
    message += `${item.name}\n`;
    message += `Qty: ${item.qty}\n`;
    message += `Harga: ${formatRupiah(item.price * item.qty)}\n\n`;
  });

  message += `=================\n\n`;
  message += `Total: ${formatRupiah(total)}\n`;
  message += `Order ID: ${orderId}\n`;
  message += `Pembayaran: ${paymentLabels[payment] || payment}\n\n`;
  message += `Nama: ${name}\n`;
  message += `No. HP: +62${phone}\n`;
  message += `Alamat: ${address}\n`;

  if (notes) {
    message += `Catatan: ${notes}\n`;
  }

  message += `\nTerima kasih.`;

  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encoded}`;

  window.open(url, '_blank');
}