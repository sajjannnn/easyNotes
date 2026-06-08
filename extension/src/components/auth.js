import { state } from '../state.js';
import { escapeHtml } from '../utils.js';

export function loginFormHtml() {

  return `
    <div class="overlay-backdrop">
      <div class="overlay-panel">
        <div class="overlay-title">Sign In</div>
        <p class="overlay-subtitle">Sign in to save screenshots & comments</p>
        ${state.loginError ? `<div class="overlay-error">${escapeHtml(state.loginError)}</div>` : ''}
        <input class="overlay-input" data-action="loginEmail" type="email" placeholder="Email"
               value="${escapeHtml(state.loginEmail)}" />
        <input class="overlay-input" data-action="loginPassword" type="password" placeholder="Password"
               value="${escapeHtml(state.loginPassword)}" />
        <div class="overlay-actions">
          <button class="btn-primary" data-action="doLogin" ${state.loginLoading ? 'disabled' : ''}>
            ${state.loginLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
        <div class="overlay-hint">
          Don't have an account?
          <span data-action="openRegister" class="link">Register</span>
        </div>
      </div>
    </div>
  `;
}
