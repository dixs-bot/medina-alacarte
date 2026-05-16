/**
 * MEDINA ALACARTE — Home Page Controller
 * Orchestrator utama halaman home.
 *
 * TIDAK mengekspor showToast — sudah di ui/toast.js
 * TIDAK diimport oleh module lain — menghindari circular dependency
 */

import {
  fetchProducts,
  renderProductGrid,
  filterByCategory,
  searchProducts
} from '../products/products.js';

import {
  fetchCategories,
  renderCategories
} from '../products/categories.js';

import {
  getCart,
  getCartTotal,
  getCartCount,
  updateCartItemQty,
  removeCartItem
} from '../cart/cart.js';

import { formatRupiah } from '../utils/currency.js';
import { showToast } from '../ui/toast.js';
import { getUser, isAuthenticated } from '../auth/auth-guard.js';

/* ================================================================
   DOM HELPERS
   ================================================================ */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ================================================================
   DOM CACHE
   ================================================================ */

const dom = {
  navbar:            $('#navbar'),
  navSearchBtn:      $('#nav-search-btn'),
  navCartBtn:        $('#nav-cart-btn'),
  navCartBadge:      $('#nav-cart-badge'),
  navProfileBtn:     $('#nav-profile-btn'),
  searchInput:       $('#search-input'),
  searchClear:       $('#search-clear'),
  searchSection:     $('#search-section'),
  promoTrack:        $('#promo-track'),
  promoDots:         $('#promo-dots'),
  categoryList:      $('#category-list'),
  bestSellerGrid:    $('#best-seller-grid'),
  productGrid:       $('#product-grid'),
  productEmpty:      $('#product-empty'),
  productsTitle:     $('#products-section-title'),
  floatingCartBtn:   $('#floating-cart-btn'),
  floatingCartBadge: $('#floating-cart-badge'),
  bnavCartBtn:       $('#bnav-cart-btn'),
  bnavCartBadge:     $('#bnav-cart-badge'),
  bnavProfileBtn:    $('#bnav-profile-btn'),
  cartOverlay:       $('#cart-overlay'),
  cartSidebar:       $('#cart-sidebar'),
  cartCloseBtn:      $('#cart-close-btn'),
  cartBody:          $('#cart-body'),
  cartFooter:        $('#cart-footer'),
  toastStack:        $('#toast-stack')
};

/* ================================================================
   STATE
   ================================================================ */

let allProducts = [];
let allCategories = [];
let activeCategory = 'all';
let currentSearch = '';
let promoIndex = 0;
let promoTimer = null;
const PROMO_COUNT = 3;
const PROMO_INTERVAL = 4500;

/* ================================================================
   INIT
   ================================================================ */

document.addEventListener('DOMContentLoaded', init);

async function init() {
  initNavbarScroll();
  initPromoSlider();
  initSearch();
  initCartTriggers();
  initBottomNav();
  initScrollReveal();
  syncAllCartBadges();

  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories()
  ]);

  allProducts = products;
  allCategories = categories;

  renderCategories('category-list', categories, 'all');
  listenCategoryChange();

  const bestSellers = allProducts.filter(p => p.best_seller).slice(0, 4);
  renderProductGrid('best-seller-grid', bestSellers);

  renderProductGrid('product-grid', allProducts);

  window.addEventListener('cart:updated', syncAllCartBadges);
}

/* ================================================================
   NAVBAR
   ================================================================ */

function initNavbarScroll() {
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        dom.navbar?.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  dom.navSearchBtn?.addEventListener('click', () => {
    dom.searchSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => dom.searchInput?.focus(), 400);
  });

  dom.navCartBtn?.addEventListener('click', openCart);

  dom.navProfileBtn?.addEventListener('click', handleProfile);
}

function handleProfile() {
  if (isAuthenticated()) {
    showToast('Fitur profil segera hadir', 'info');
  } else {
    window.location.href = '/login.html';
  }
}

/* ================================================================
   PROMO SLIDER
   ================================================================ */

function initPromoSlider() {
  if (!dom.promoTrack || !dom.promoDots) return;

  for (let i = 0; i < PROMO_COUNT; i++) {
    const dot = document.createElement('button');
    dot.className = `promo-dot${i === 0 ? ' active' : ''}`;
    dot.type = 'button';
    dot.setAttribute('aria-label', `Promo ${i + 1}`);
    dot.addEventListener('click', () => goToPromo(i));
    dom.promoDots.appendChild(dot);
  }

  startPromoAutoPlay();

  const slider = dom.promoTrack.parentElement;
  slider?.addEventListener('mouseenter', stopPromoAutoPlay);
  slider?.addEventListener('mouseleave', startPromoAutoPlay);

  /* Touch swipe */
  let startX = 0;
  let isDragging = false;

  slider?.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    stopPromoAutoPlay();
  }, { passive: true });

  slider?.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      const next = diff > 0
        ? Math.min(promoIndex + 1, PROMO_COUNT - 1)
        : Math.max(promoIndex - 1, 0);
      goToPromo(next);
    }
    startPromoAutoPlay();
  }, { passive: true });
}

function goToPromo(index) {
  promoIndex = index;
  dom.promoTrack.style.transform = `translateX(-${index * 100}%)`;
  dom.promoDots?.querySelectorAll('.promo-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function startPromoAutoPlay() {
  stopPromoAutoPlay();
  promoTimer = setInterval(() => {
    goToPromo((promoIndex + 1) % PROMO_COUNT);
  }, PROMO_INTERVAL);
}

function stopPromoAutoPlay() {
  if (promoTimer) {
    clearInterval(promoTimer);
    promoTimer = null;
  }
}

/* ================================================================
   SEARCH
   ================================================================ */

function initSearch() {
  if (!dom.searchInput) return;

  let debounceTimer;

  dom.searchInput.addEventListener('input', () => {
    const val = dom.searchInput.value.trim();
    if (dom.searchClear) {
      dom.searchClear.style.display = val ? 'flex' : 'none';
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = val;
      applyFilters();
    }, 300);
  });

  dom.searchClear?.addEventListener('click', () => {
    dom.searchInput.value = '';
    dom.searchClear.style.display = 'none';
    currentSearch = '';
    applyFilters();
    dom.searchInput.focus();
  });
}

/* ================================================================
   CATEGORY FILTER
   ================================================================ */

function listenCategoryChange() {
  window.addEventListener('category:change', (e) => {
    activeCategory = e.detail.id;
    applyFilters();
  });
}

function applyFilters() {
  let products = allProducts;

  if (activeCategory !== 'all') {
    const catFiltered = filterByCategory(activeCategory);
    products = catFiltered;
  }

  if (currentSearch) {
    const searchFiltered = searchProducts(currentSearch);
    const searchIds = new Set(searchFiltered.map(p => p.id));
    products = products.filter(p => searchIds.has(p.id));
  }

  if (dom.productsTitle) {
    if (currentSearch) {
      dom.productsTitle.textContent = `Hasil untuk "${currentSearch}"`;
    } else if (activeCategory !== 'all') {
      const cat = allCategories.find(c => c.id === activeCategory);
      dom.productsTitle.textContent = cat ? cat.name : 'Menu';
    } else {
      dom.productsTitle.textContent = 'Semua Menu';
    }
  }

  renderProductGrid('product-grid', products);

  if (dom.productEmpty) {
    dom.productEmpty.style.display = products.length === 0 ? 'flex' : 'none';
  }
}

/* ================================================================
   CART SIDEBAR
   ================================================================ */

function initCartTriggers() {
  dom.floatingCartBtn?.addEventListener('click', openCart);
  dom.bnavCartBtn?.addEventListener('click', openCart);
  dom.cartOverlay?.addEventListener('click', closeCart);
  dom.cartCloseBtn?.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });
}

function openCart() {
  dom.cartOverlay?.classList.add('open');
  dom.cartSidebar?.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartContent();
}

function closeCart() {
  dom.cartOverlay?.classList.remove('open');
  dom.cartSidebar?.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartContent() {
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

  dom.cartBody.innerHTML = cart.map((item, idx) => `
    <div class="cart-item" style="animation-delay:${idx * 50}ms">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatRupiah(item.price * item.qty)}</div>
        <div class="cart-item-actions">
          <div class="cart-qty">
            <button class="cart-qty-btn" data-action="minus" data-id="${item.id}" type="button">−</button>
            <span class="cart-qty-val">${item.qty}</span>
            <button class="cart-qty-btn" data-action="plus" data-id="${item.id}" type="button">+</button>
          </div>
          <button class="cart-item-remove" data-id="${item.id}" aria-label="Hapus ${item.name}" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  const total = getCartTotal();
  dom.cartFooter.innerHTML = `
    <div class="cart-total">
      <span class="cart-total-label">Total</span>
      <span class="cart-total-value">${formatRupiah(total)}</span>
    </div>
    <a href="/checkout.html" class="btn btn-primary btn-block">Checkout</a>
  `;

  dom.cartBody.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const delta = btn.dataset.action === 'plus' ? 1 : -1;
      updateCartItemQty(id, delta);
      renderCartContent();
    });
  });

  dom.cartBody.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeCartItem(btn.dataset.id);
      renderCartContent();
    });
  });
}

/* ================================================================
   CART BADGES SYNC
   ================================================================ */

function syncAllCartBadges() {
  const count = getCartCount();
  const text = count > 0 ? String(count) : '';

  if (dom.navCartBadge) dom.navCartBadge.textContent = text;
  if (dom.floatingCartBadge) dom.floatingCartBadge.textContent = text;
  if (dom.bnavCartBadge) dom.bnavCartBadge.textContent = text;
}

/* ================================================================
   BOTTOM NAVIGATION
   ================================================================ */

function initBottomNav() {
  dom.bnavProfileBtn?.addEventListener('click', handleProfile);

  const path = window.location.pathname;
  $$('.bnav-item[data-page]').forEach(item => {
    const page = item.dataset.page;
    if (page === 'home' && (path === '/home.html' || path === '/')) {
      item.classList.add('active');
    }
  });
}

/* ================================================================
   SCROLL REVEAL
   ================================================================ */

function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal-section').forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  $$('.reveal-section').forEach(el => observer.observe(el));
}