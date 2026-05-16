/**
 * Medina Alacarte — Cart State Manager
 * Semua operasi cart terpusat di sini
 */
import { storage } from '../utils/storage.js';

const CART_KEY = 'cart';

export function getCart() {
  return storage.get(CART_KEY, []);
}

function saveCart(cart) {
  storage.set(CART_KEY, cart);
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: qty
    });
  }

  saveCart(cart);
  return cart;
}

export function updateCartItemQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);

  if (!item) return cart;

  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  return cart;
}

export function removeCartItem(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}