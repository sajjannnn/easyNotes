import { STORAGE_KEY } from '../constants.js';
import { render } from '../components/sidebar.js';
import { showToast } from '../components/toast.js';
import { state } from '../state.js';

export function loadApiKey() {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEY, result => {
      state.apiKey = result[STORAGE_KEY] || null;
      state.apiKeyExists = !!state.apiKey;
      resolve();
    });
  });
}

function saveApiKey(key) {
  return new Promise(resolve => {
    chrome.storage.local.set({ [STORAGE_KEY]: key }, () => {
      state.apiKey = key;
      state.apiKeyExists = true;
      state.showSettings = false;
      render();
      resolve();
    });
  });
}

function deleteApiKey() {
  return new Promise(resolve => {
    chrome.storage.local.remove(STORAGE_KEY, () => {
      state.apiKey = null;
      state.apiKeyExists = false;
      state.showSettings = false;
      render();
      resolve();
    });
  });
}

export async function handleSaveKey() {
  const input = state.shadow?.querySelector('[data-action="apiKeyInput"]');
  const value = (input?.value || state.apiKeyInputValue).trim();
  if (!value) {
    showToast('Please enter an API key');
    return;
  }
  await saveApiKey(value);
  showToast('API key saved');
}

export async function handleDeleteKey() {
  await deleteApiKey();
  showToast('API key removed');
}
