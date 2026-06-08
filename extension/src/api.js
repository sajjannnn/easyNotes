import { API_BASE, AUTH_TOKEN_KEY } from './constants.js';

export async function apiFetch(path, options = {}) {
  const token = await getAuthToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  return res;
}

export function getAuthToken() {
  return new Promise(resolve => {
    chrome.storage.local.get(AUTH_TOKEN_KEY, result => {
      resolve(result[AUTH_TOKEN_KEY] || null);
    });
  });
}

export function setAuthToken(token) {
  return new Promise(resolve => {
    chrome.storage.local.set({ [AUTH_TOKEN_KEY]: token }, resolve);
  });
}

export function clearAuthToken() {
  return new Promise(resolve => {
    chrome.storage.local.remove(AUTH_TOKEN_KEY, resolve);
  });
}
