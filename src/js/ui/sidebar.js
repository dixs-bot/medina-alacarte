import { storage } from '../utils/storage.js';
import { formatRupiah } from '../utils/currency.js';
import { updateNavCartCount } from './navbar.js';

let isOpen = false;

export function openCartSidebar() {
  isOpen = true;
  render();
  const overlay = document.getElementById('cart-overlay');
  const sidebar = document.getElementById('cart-sidebar');
  requestAnimationFrame(() => {
    overlay?.classList.add('open');
    sidebar?.classList.add('open');
  });
  document.body.style.overflow = 'hidden';
}

export function closeCartSidebar() {
  isOpen = false;
  const overlay = document.getElementById('cart-overlay');
  const sidebar = document.getElementById('cart-sidebar');
  overlay?.classList.remove('open');
  sidebar?.classList.remove('open');
  document.body.style.overflow = '';
}

export function toggleCartSidebar() {
  isOpen ? closeCartSidebar() : openCartSidebar();
}

function render() {
  if (document.getElementById('cart-overlay')) return;

  const html = `
    <div class="cart-overlay" id="cart-overlay"></div>
    <aside class="cart-sidebar" id="cart-sidebar">
      <div class="cart-header">
        <h2>Keranjang</h2>
        <button class="cart-close" id="cart-close-btn" aria-label="Tutup">✕</button>
      </div>
      <div class="cart-body" id="cart-body"></div>
      <div class="cart-footer" id="cart-footer"></div>
    </aside>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  document.getElementById('cart-overlay').addEventListener('click', closeCartSidebar);
  document.getElementById('cart-close-btn').addEventListener('click', closeCartSidebar);
  renderCartContent();
}

export function renderCartContent() {
  const cart = storage.get('cart', []);
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  if (!body || !footer) return;

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🛒</span>
        <p>Keranjang masih kosong</p>
      </div>
    `;
    footer.innerHTML = '';
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  body.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatRupiah(item.price * item.qty)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn cart-qty-minus" data-id="${item.id}">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn cart-qty-plus" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Hapus">✕</button>
    </div>
  `).join('');

  footer.innerHTML = `
    <div class="cart-total">
      <span class="cart-total-label">Total</span>
      <span class="cart-total-value">${formatRupiah(total)}</span>
    </div>
    <a href="/checkout.html" class="btn btn-primary btn-block" id="cart-checkout-btn">Checkout</a>
  `;

  /* Events */
  body.querySelectorAll('.cart-qty-minus').forEach(btn => {
    btn.addEventListener('click', () => updateQty(btn.dataset.id, -1));
  });
  body.querySelectorAll('.cart-qty-plus').forEach(btn => {
    btn.addEventListener('click', () => updateQty(btn.dataset.id, 1));
  });
  body.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeItem(btn.dataset.id));
  });
  document.getElementById('cart-checkout-btn')?.addEventListener('click', () => {
    closeCartSidebar();
  });
}

function updateQty(id, delta) {
  let cart = storage.get('cart', []);
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;

  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  storage.set('cart', cart);
  renderCartContent();
  updateNavCartCount();
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
}

function removeItem(id) {
  let cart = storage.get('cart', []).filter(i => i.id !== id);
  storage.set('cart', cart);
  renderCartContent();
  updateNavCartCount();
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
}

/* Listen for open event */
window.addEventListener('cart:open', openCartSidebar);
