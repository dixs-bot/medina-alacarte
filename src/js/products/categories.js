/**
 * Medina Alacarte — Categories Module
 * Fetch dan render kategori produk
 */
import { isSupabaseReady, getSupabase } from '../core/supabase.js';
import { MOCK_CATEGORIES } from '../data/mock.js';

export async function fetchCategories() {
  if (isSupabaseReady()) {
    try {
      const { data, error } = await getSupabase()
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (!error && data && data.length > 0) {
        return [{ id: 'all', name: 'Semua', icon: '☕' }, ...data];
      }
    } catch (err) {
      console.warn('[Categories] Supabase fetch failed:', err.message);
    }
  }

  return MOCK_CATEGORIES;
}

/**
 * Render category chips ke container
 * @param {string} containerId - ID elemen container
 * @param {Array} categories - Array objek kategori
 * @param {string} activeId - ID kategori yang aktif
 */
export function renderCategories(containerId, categories, activeId = 'all') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = categories.map(cat => `
    <button
      class="category-chip ${cat.id === activeId ? 'active' : ''}"
      data-id="${cat.id}"
      type="button"
    >
      <span class="category-chip-icon">${cat.icon || '☕'}</span>
      ${cat.name}
    </button>
  `).join('');

  container.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.category-chip').forEach(c => {
        c.classList.remove('active');
      });
      chip.classList.add('active');

      window.dispatchEvent(
        new CustomEvent('category:change', {
          detail: { id: chip.dataset.id }
        })
      );
    });
  });
}