/**
 * Medina Alacarte — Auth Guard
 * Menangani session user di localStorage
 */
import { storage } from '../utils/storage.js';

const AUTH_KEY = 'auth_user';

export function getUser() {
  return storage.get(AUTH_KEY, null);
}

export function setUser(user) {
  storage.set(AUTH_KEY, user);
}

export function isAuthenticated() {
  return getUser() !== null;
}

export function requireAuth() {
  const user = getUser();
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }
  return user;
}

export function logout() {
  storage.remove(AUTH_KEY);
  window.location.href = '/login.html';
}