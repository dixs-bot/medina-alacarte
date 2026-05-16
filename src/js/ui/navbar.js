import { storage } from '../utils/storage.js';
import { getSupabase } from '../core/supabase.js';

/**
 * Render navbar dan inject ke container
 */
export function renderNavbar(containerId = 'navbar-root') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cartCount = storage.get('cart', []).reduce((s, i) => s + i.qty, 0);
  const isLoggedIn = !!storage.get('auth_user');

  container.innerHTML = `
    <nav class="navbar">
      <div class="navbar-inner container">
        <a href="/home.html" class="navbar-brand">
          <span class="navbar-logo">☕</span>
          <span class="navbar-name">Medina</span>
        </a>
        <div class="navbar-actions">
          <button class="navbar-cart-btn" id="nav-cart-btn" aria-label="Cart">
            🛒
            <span class="nav-cart-count" id="nav-cart-count">${cartCount || ''}</span>
          </button>
          ${isLoggedIn
            ? `<button class="btn btn-sm btn-outline" id="nav-logout-btn">Keluar</button>`
            : `<a href="/login.html" class="btn btn-sm btn-outline">Masuk</a>`
          }
        </div>
      </div>
    </nav>
  `;

  /* Inject navbar styles if not yet */
  if (!document.getElementById('navbar-styles')) {
    const style = document.createElement('style');
    style.id = 'navbar-styles';
    style.textContent = `
      .navbar {
        position: fixed; top: 0; left: 0; right: 0; z-index: 80;
        height: var(--nav-h);
        background: rgba(255,255,255,0.92);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(230,211,179,0.5);
      }
      .navbar-inner {
        height: 100%;
        display: flex; align-items: center; justify-content: space-between;
      }
      .navbar-brand {
        display: flex; align-items: center; gap: var(--sp-2);
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        font-size: var(--fs-md);
        color: var(--c-primary);
      }
      .navbar-logo { font-size: 1.3rem; }
      .navbar-actions { display: flex; align-items: center; gap: var(--sp-3); }
      .navbar-cart-btn {
        position: relative;
        width: 40px; height: 40px;
        border-radius: var(--r-full);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.2rem;
        transition: background var(--dur-fast) var(--ease);
      }
      .navbar-cart-btn:hover { background: var(--c-bg); }
      .nav-cart-count {
        position: absolute; top: 2px; right: 2px;
        min-width: 18px; height: 18px;
        border-radius: var(--r-full);
        background: var(--c-primary);
        color: var(--c-white);
        font-size: 0.6rem;
        font-weight: var(--fw-bold);
        display: flex; align-items: center; justify-content: center;
        padding: 0 4px;
      }
      .nav-cart-count:empty { display: none; }
    `;
    document.head.appendChild(style);
  }

  /* Events */
  document.getElementById('nav-cart-btn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('cart:open'));
  });

  document.getElementById('nav-logout-btn')?.addEventListener('click', async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    storage.remove('auth_user');
    window.location.href = '/login.html';
  });
}

/**
 * Update cart count badge di navbar
 */
export function updateNavCartCount() {
  const el = document.getElementById('nav-cart-count');
  if (!el) return;
  const count = storage.get('cart', []).reduce((s, i) => s + i.qty, 0);
  el.textContent = count || '';
}
