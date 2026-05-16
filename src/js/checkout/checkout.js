/**
 * MEDINA ALACARTE — Checkout Page Controller
 * Menangani validasi form, render order summary,
 * payment selection, dan kirim pesanan via WhatsApp
 *
 * Dependency chain (no circular):
 *   config.js → supabase.js → cart.js
 *   storage.js → cart.js, auth-guard.js
 *   currency.js ← config.js
 *   toast.js (standalone)
 *   formatter.js (standalone)
 *   whatsapp.js ← config.js, currency.js
 *   checkout.js ← cart.js, currency.js, toast.js, auth-guard.js, formatter.js, whatsapp.js
 */

import { getCart, getCartTotal, getCartCount, updateCartItemQty, removeCartItem, clearCart } from '../cart/cart.js';
import { formatRupiah } from '../utils/currency.js';
import { getUser, isAuthenticated } from '../auth/auth-guard.js';
import { showToast } from '../ui/toast.js';
import { generateOrderId } from '../utils/formatter.js';
import { sendWhatsApp } from './whatsapp.js';

/* ================================================================
   DOM CACHE
   ================================================================ */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  /* Sections */
  checkoutEmpty:    $('#checkout-empty'),
  checkoutContent:  $('#checkout-content'),

  /* Form */
  checkoutForm:     $('#checkout-form'),
  nameInput:        $('#co-name'),
  phoneInput:       $('#co-phone'),
  addressInput:     $('#co-address'),
  notesInput:       $('#co-notes'),
  hintName:         $('#hint-name'),
  hintPhone:        $('#hint-phone'),
  hintAddress:      $('#hint-address'),

  /* Payment */
  paymentOptions:   $('#payment-options'),

  /* Order Summary */
  orderItems:       $('#order-items'),
  summarySubtotal:  $('#summary-subtotal'),
  summaryShipping:  $('#summary-shipping'),
  orderTotalValue:  $('#order-total-value'),

  /* Button */
  submitBtn:        $('#checkout-submit-btn'),

  /* Nav */
  navCartBtn:       $('#nav-cart-btn'),
  navCartBadge:     $('#nav-cart-badge'),
  navProfileBtn:    $('#nav-profile-btn'),
  bnavCartBtn:      $('#bnav-cart-btn'),
  bnavCartBadge:    $('#bnav-cart-badge'),
  bnavProfileBtn:   $('#bnav-profile-btn'),

  /* Cart Sidebar */
  cartOverlay:      $('#cart-overlay'),
  cartSidebar:      $('#cart-sidebar'),
  cartCloseBtn:     $('#cart-close-btn'),
  cartBody:         $('#cart-body'),
  cartFooter:       $('#cart-footer')
};

/* ================================================================
   STATE
   ================================================================ */

let selectedPayment = 'cash';
let isSubmitting = false;

/* ================================================================
   INIT
   ================================================================ */

document.addEventListener('DOMContentLoaded', init);

function init() {
  const cart = getCart();

  /* Redirect if empty */
  if (cart.length === 0) {
    showEmptyState();
    return;
  }

  showCheckoutContent(cart);
  prefillUser();
  initPaymentOptions();
  initFormEvents();
  initCartSidebar();
  syncBadges();

  window.addEventListener('cart:updated', () => {
    syncBadges();
    const updatedCart = getCart();
    if (updatedCart.length === 0) {
      showEmptyState();
    } else {
      renderOrderItems(updatedCart);
      renderOrderTotal(updatedCart);
    }
  });
}

/* ================================================================
   STATE DISPLAY
   ================================================================ */

function showEmptyState() {
  if (dom.checkoutEmpty) dom.checkoutEmpty.style.display = 'block';
  if (dom.checkoutContent) dom.checkoutContent.style.display = 'none';
}

function showCheckoutContent(cart) {
  if (dom.checkoutEmpty) dom.checkoutEmpty.style.display = 'none';
  if (dom.checkoutContent) dom.checkoutContent.style.display = '';

  renderOrderItems(cart);
  renderOrderTotal(cart);
}

/* ================================================================
   PREFILL USER DATA
   ================================================================ */

function prefillUser() {
  const user = getUser();
  if (!user) return;

  if (dom.nameInput && !dom.nameInput.value) {
    dom.nameInput.value = user.name || user.user_metadata?.name || '';
  }
  if (dom.phoneInput && !dom.phoneInput.value) {
    dom.phoneInput.value = user.phone || user.user_metadata?.phone || '';
  }
}

/* ================================================================
   RENDER ORDER ITEMS
   ================================================================ */

function renderOrderItems(cart) {
  if (!dom.orderItems) return;

  dom.orderItems.innerHTML = cart.map(item => `
    <div class="order-item">
      <img class="order-item-img" src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="order-item-info">
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-meta">
          <span class="order-item-qty">×${item.qty}</span>
        </div>
      </div>
      <span class="order-item-price">${formatRupiah(item.price * item.qty)}</span>
    </div>
  `).join('');
}

function renderOrderTotal(cart) {
  const total = getCartTotal();
  if (dom.summarySubtotal) dom.summarySubtotal.textContent = formatRupiah(total);
  if (dom.orderTotalValue) dom.orderTotalValue.textContent = formatRupiah(total);
}

/* ================================================================
   PAYMENT OPTIONS
   ================================================================ */

function initPaymentOptions() {
  if (!dom.paymentOptions) return;

  dom.paymentOptions.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', () => {
      dom.paymentOptions.querySelectorAll('.payment-option').forEach(o => {
        o.classList.remove('selected');
      });
      option.classList.add('selected');
      selectedPayment = option.dataset.method;

      /* Also check the hidden radio */
      const radio = option.querySelector('.payment-radio-input');
      if (radio) radio.checked = true;
    });
  });
}

/* ================================================================
   FORM VALIDATION
   ================================================================ */

function initFormEvents() {
  /* Clear hints on input */
  dom.nameInput?.addEventListener('input', () => clearHint(dom.nameInput, dom.hintName));
  dom.phoneInput?.addEventListener('input', () => clearHint(dom.phoneInput, dom.hintPhone));
  dom.addressInput?.addEventListener('input', () => clearHint(dom.addressInput, dom.hintAddress));

  /* Submit */
  dom.submitBtn?.addEventListener('click', handleSubmit);
}

function validateForm() {
  let valid = true;

  /* Name */
  const name = dom.nameInput?.value.trim() || '';
  if (!name) {
    setHintError(dom.nameInput, dom.hintName, 'Nama wajib diisi');
    valid = false;
  } else if (name.length < 2) {
    setHintError(dom.nameInput, dom.hintName, 'Nama terlalu pendek');
    valid = false;
  } else {
    setHintSuccess(dom.nameInput, dom.hintName);
  }

  /* Phone */
  const phone = dom.phoneInput?.value.trim() || '';
  if (!phone) {
    setHintError(dom.phoneInput, dom.hintPhone, 'No. HP wajib diisi');
    valid = false;
  } else if (!/^[0-9]{9,13}$/.test(phone)) {
    setHintError(dom.phoneInput, dom.hintPhone, 'Format nomor HP tidak valid');
    valid = false;
  } else {
    setHintSuccess(dom.phoneInput, dom.hintPhone);
  }

  /* Address */
  const address = dom.addressInput?.value.trim() || '';
  if (!address) {
    setHintError(dom.addressInput, dom.hintAddress, 'Alamat wajib diisi');
    valid = false;
  } else if (address.length < 10) {
    setHintError(dom.addressInput, dom.hintAddress, 'Alamat terlalu singkat');
    valid = false;
  } else {
    setHintSuccess(dom.addressInput, dom.hintAddress);
  }

  return valid;
}

function setHintError(input, hintEl, msg) {
  if (!input) return;
  input.classList.remove('input-success');
  input.classList.add('input-error');
  if (hintEl) {
    hintEl.textContent = msg;
    hintEl.className = 'form-hint form-hint--error';
  }
}

function setHintSuccess(input, hintEl) {
  if (!input) return;
  input.classList.remove('input-error');
  input.classList.add('input-success');
  if (hintEl) {
    hintEl.textContent = '';
    hintEl.className = 'form-hint form-hint--success';
  }
}

function clearHint(input, hintEl) {
  if (!input) return;
  input.classList.remove('input-error', 'input-success');
  if (hintEl) {
    hintEl.textContent = '';
    hintEl.className = 'form-hint';
  }
}

/* ================================================================
   SUBMIT HANDLER
   ================================================================ */

async function handleSubmit() {
  if (isSubmitting) return;

  if (!validateForm()) {
    showToast('Lengkapi semua data yang wajib diisi', 'error');
    /* Scroll to first error */
    const firstError = document.querySelector('.form-input.input-error');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstError?.focus();
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showToast('Keranjang kosong', 'error');
    return;
  }

  isSubmitting = true;
  setSubmitLoading(true);

  const name = dom.nameInput.value.trim();
  const phone = dom.phoneInput.value.trim();
  const address = dom.addressInput.value.trim();
  const notes = dom.notesInput?.value.trim() || '';
  const total = getCartTotal();
  const orderId = generateOrderId();

  try {
    /* Save to Supabase if available */
    await saveOrderToSupabase({
      orderId,
      cart,
      total,
      name,
      phone,
      address,
      notes,
      payment: selectedPayment
    });

    /* Send WhatsApp */
    sendWhatsApp({
      orderId,
      items: cart,
      total,
      name,
      phone,
      address,
      notes,
      payment: selectedPayment
    });

    /* Clear cart and redirect */
    clearCart();

    /* Small delay so WhatsApp tab opens first */
    setTimeout(() => {
      window.location.href = '/order-success.html';
    }, 600);

  } catch (err) {
    console.error('[Checkout] Error:', err);
    showToast('Terjadi kesalahan. Coba lagi.', 'error');
  } finally {
    isSubmitting = false;
    setSubmitLoading(false);
  }
}

async function saveOrderToSupabase(data) {
  const { getSupabase, isSupabaseReady } = await import('../core/supabase.js');

  if (!isSupabaseReady()) return;

  const supabase = getSupabase();
  const user = getUser();

  const { error: orderErr } = await supabase.from('orders').insert({
    id: data.orderId,
    user_id: user?.id || null,
    customer_name: data.name,
    customer_phone: data.phone,
    address: data.address,
    notes: data.notes,
    payment_method: data.payment,
    total: data.total,
    status: 'pending'
  });

  if (orderErr) console.warn('[Checkout] Order save error:', orderErr.message);

  const items = data.cart.map(item => ({
    order_id: data.orderId,
    product_id: item.id,
    product_name: item.name,
    qty: item.qty,
    price: item.price,
    subtotal: item.price * item.qty
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(items);
  if (itemsErr) console.warn('[Checkout] Order items save error:', itemsErr.message);
}

/* ================================================================
   BUTTON LOADING
   ================================================================ */

function setSubmitLoading(loading) {
  if (!dom.submitBtn) return;
  dom.submitBtn.classList.toggle('loading', loading);
  dom.submitBtn.disabled = loading;
}

/* ================================================================
   CART SIDEBAR
   ================================================================ */

function initCartSidebar() {
  dom.navCartBtn?.addEventListener('click', openCart);
  dom.bnavCartBtn?.addEventListener('click', openCart);
  dom.cartOverlay?.addEventListener('click', closeCart);
  dom.cartCloseBtn?.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  dom.navProfileBtn?.addEventListener('click', handleProfile);
  dom.bnavProfileBtn?.addEventListener('click', handleProfile);
}

function openCart() {
  dom.cartOverlay?.classList.add('open');
  dom.cartSidebar?.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartSidebar();
}

function closeCart() {
  dom.cartOverlay?.classList.remove('open');
  dom.cartSidebar?.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartSidebar() {
  const cart = getCart();

  if (!dom.cartBody || !dom.cartFooter) return;

  if (cart.length === 0) {
    dom.cartBody.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🛒</span>
        <p>Keranjang masih kosong</p>
      </div>
    `;
    dom.cartFooter.innerHTML = '';
    return;
  }

  dom.cartBody.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatRupiah(item.price * item.qty)}</div>
        <div class="cart-qty">
          <button class="cart-qty-btn" data-action="minus" data-id="${item.id}" type="button">−</button>
          <span class="cart-qty-val">${item.qty}</span>
          <button class="cart-qty-btn" data-action="plus" data-id="${item.id}" type="button">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" type="button" aria-label="Hapus">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      </button>
    </div>
  `).join('');

  dom.cartFooter.innerHTML = `
    <div class="cart-total">
      <span class="cart-total-label">Total</span>
      <span class="cart-total-value">${formatRupiah(getCartTotal())}</span>
    </div>
    <a href="/checkout.html" class="btn btn-primary btn-block" onclick="document.querySelector('.cart-sidebar')?.classList.remove('open');document.querySelector('.cart-overlay')?.classList.remove('open');document.body.style.overflow='';">Checkout</a>
  `;

  dom.cartBody.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      updateCartItemQty(btn.dataset.id, btn.dataset.action === 'plus' ? 1 : -1);
      renderCartSidebar();
      const updatedCart = getCart();
      renderOrderItems(updatedCart);
      renderOrderTotal(updatedCart);
    });
  });

  dom.cartBody.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeCartItem(btn.dataset.id);
      renderCartSidebar();
      const updatedCart = getCart();
      if (updatedCart.length === 0) {
        closeCart();
        showEmptyState();
      } else {
        renderOrderItems(updatedCart);
        renderOrderTotal(updatedCart);
      }
    });
  });
}

/* ================================================================
   BADGES
   ================================================================ */

function syncBadges() {
  const count = getCartCount();
  const text = count > 0 ? String(count) : '';
  if (dom.navCartBadge) dom.navCartBadge.textContent = text;
  if (dom.bnavCartBadge) dom.bnavCartBadge.textContent = text;
}

/* ================================================================
   PROFILE
   ================================================================ */

function handleProfile() {
  if (isAuthenticated()) {
    showToast('Fitur profil segera hadir', 'info');
  } else {
    window.location.href = '/login.html';
  }
}