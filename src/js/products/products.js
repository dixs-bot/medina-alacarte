/**
 * Medina Alacarte — Products Module
 * Fetch, filter, search, dan render product cards
 *
 * PERHATIAN: showToast diimport dari ui/toast.js
 * (BUKAN dari home.js — untuk menghindari circular dependency)
 */
import { isSupabaseReady, getSupabase } from '../core/supabase.js';
import { MOCK_PRODUCTS } from '../data/mock.js';
import { formatRupiah } from '../utils/currency.js';
import { addToCart } from '../cart/cart.js';
import { showToast } from '../ui/toast.js';

let _allProducts = [];

/* ── Normalize product shape ──────────────────────────────── */

function normalizeProduct(raw) {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category || raw.category_id || '',
    categoryLabel: raw.category_name || mapCategoryLabel(raw.category || raw.category_id || ''),
    price: Number(raw.price) || 0,
    description: raw.description || '',
    image: raw.image || raw.image_url || '',
    best_seller: Boolean(raw.best_seller ?? raw.is_best_seller),
    rating: raw.rating ?? null
  };
}

function mapCategoryLabel(slug) {
  const map = {
    coffee: 'Coffee',
    'non-coffee': 'Non-Coffee',
    pastry: 'Pastry',
    'light-meal': 'Light Meal',
    dessert: 'Dessert',
    snack: 'Snack',
    signature: 'Signature'
  };
  return map[slug] || slug;
}

/* ── Public API ───────────────────────────────────────────── */

export async function fetchProducts() {
  if (isSupabaseReady()) {
    try {
      const { data, error } = await getSupabase()
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!error && data && data.length > 0) {
        _allProducts = data.map(normalizeProduct);
        return _allProducts;
      }
    } catch (err) {
      console.warn('[Products] Supabase fetch failed:', err.message);
    }
  }

  _allProducts = MOCK_PRODUCTS.map(normalizeProduct);
  return _allProducts;
}

export function filterByCategory(categoryId) {
  if (categoryId === 'all') return _allProducts;
  return _allProducts.filter(p => p.category === categoryId);
}

export function searchProducts(query) {
  if (!query || !query.trim()) return _allProducts;
  const q = query.toLowerCase().trim();
  return _allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.categoryLabel.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q))
  );
}

/* ── Rendering ────────────────────────────────────────────── */

export function renderProductGrid(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="product-empty">
        <span class="product-empty-icon">☕</span>
        <p>Tidak ada menu ditemukan</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map((product, idx) =>
    buildCardHTML(product, idx)
  ).join('');

  attachAddToCartEvents(container, products);
}

function buildCardHTML(product, index) {
  const delay = Math.min(index * 60, 400);

  const ratingHTML = product.rating
    ? `<span class="product-card-rating">
         <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
           <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
         </svg>
         ${product.rating}
       </span>`
    : '';

  const badgeHTML = product.best_seller
    ? '<span class="product-card-badge">Best Seller</span>'
    : '';

  return `
    <article class="product-card anim-fade-up" style="animation-delay:${delay}ms" data-id="${product.id}">
      <a href="/product.html?id=${product.id}" class="product-card-img-wrap">
        ${badgeHTML}
        <img class="product-card-img" src="${product.image}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="product-card-body">
        <span class="product-card-cat">${product.categoryLabel}</span>
        <a href="/product.html?id=${product.id}">
          <h3 class="product-card-name">${product.name}</h3>
        </a>
        ${ratingHTML}
        <div class="product-card-footer">
          <span class="product-card-price">${formatRupiah(product.price)}</span>
          <button
            class="product-card-add"
            data-product-id="${product.id}"
            aria-label="Tambah ${product.name} ke keranjang"
            type="button"
          >+</button>
        </div>
      </div>
    </article>
  `;
}

function attachAddToCartEvents(container, products) {
  container.querySelectorAll('.product-card-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const productId = btn.dataset.productId;
      const product = products.find(p => p.id === productId);
      if (!product) return;

      addToCart(product, 1);

      /* Animasi tombol */
      btn.classList.remove('added');
      void btn.offsetWidth;
      btn.classList.add('added');

      showToast(`${product.name} ditambahkan`);
    });
  });
}