import { state } from '../state.js';
import { API_BASE, HEADERS_JSON } from '../constants.js';
import { apiFetch, getAuthToken, setAuthToken, clearAuthToken } from '../api.js';
import { render } from '../components/sidebar.js';
import { showToast } from '../components/toast.js';

export async function ensureAuthenticated() {
  const token = await getAuthToken();
  if (!token) {
    state.showLoginForm = true;
    render();
    return false;
  }
  const res = await apiFetch('/auth/me');
  if (!res.ok) {
    await clearAuthToken();
    state.showLoginForm = true;
    render();
    return false;
  }
  const data = await res.json();
  state.authToken = token;
  state.isAuthenticated = true;
  return true;
}

export async function handleLogin() {
  if (!state.loginEmail || !state.loginPassword) {
    state.loginError = 'Email and password are required.';
    render();
    return;
  }
  state.loginLoading = true;
  state.loginError = '';
  render();
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: HEADERS_JSON,
      body: JSON.stringify({ email: state.loginEmail, password: state.loginPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      state.loginError = data.error || 'Login failed.';
      state.loginLoading = false;
      render();
      return;
    }
    await setAuthToken(data.token);
    state.authToken = data.token;
    state.isAuthenticated = true;
    state.showLoginForm = false;
    state.loginEmail = '';
    state.loginPassword = '';
    state.loginError = '';
    state.loginLoading = false;
  } catch (err) {
    state.loginError = err.message || 'Network error.';
  }
  state.loginLoading = false;
  render();
}

export function handleLogout() {
  clearAuthToken();
  state.authToken = null;
  state.isAuthenticated = false;
  state.selectedFileId = null;
  showToast('Logged out');
}
