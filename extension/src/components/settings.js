import { state } from '../state.js';
import { escapeHtml } from '../utils.js';

export function settingsContent() {

  if (!state.apiKeyExists) {
    return `
      <div class="settings-title">⚙️ Settings</div>
      <label class="settings-label">Groq API Key</label>
      <input class="settings-input" data-action="apiKeyInput" type="password"
             placeholder="gsk_..." value="${escapeHtml(state.apiKeyInputValue)}" />
      <div class="settings-actions">
        <button class="btn-primary" data-action="saveApiKey">Save</button>
      </div>
      <div class="settings-status disconnected">
        <span>●</span> Not connected
      </div>
      <div class="settings-hint">
        Get your API key from
        <span data-action="openGroqKeys" style="color:#3ea6ff;cursor:pointer">console.groq.com/keys</span>
      </div>
    `;
  }

  const masked = state.apiKey.length > 12
    ? state.apiKey.slice(0, 4) + '…' + state.apiKey.slice(-4)
    : '********';

  return `
    <div class="settings-title">⚙️ Settings</div>
    <label class="settings-label">Groq API Key</label>
    <input class="settings-input" data-action="apiKeyInput" type="password"
           placeholder="gsk_..." value="${escapeHtml(state.apiKeyInputValue || state.apiKey)}" />
    <div class="settings-actions">
      <button class="btn-secondary" data-action="saveApiKey">Update</button>
      <button class="btn-secondary btn-danger" data-action="deleteApiKey">Delete</button>
    </div>
    <div class="settings-status connected">
      <span>●</span> Connected — ${escapeHtml(masked)}
    </div>
    <div class="settings-hint">
      Your key is stored locally and never sent anywhere except Groq API.
    </div>
  `;
}
