import { state } from '../state.js';
import { FILE_SEL_KEY, HEADERS_JSON } from '../constants.js';
import { apiFetch } from '../api.js';
import { render } from '../components/sidebar.js';
import { showToast } from '../components/toast.js';

function getSelectedFileId(videoId) {
  return new Promise(resolve => {
    chrome.storage.local.get(FILE_SEL_KEY, result => {
      const map = result[FILE_SEL_KEY] || {};
      resolve(map[videoId] || null);
    });
  });
}

function setSelectedFileId(videoId, fileId) {
  return new Promise(resolve => {
    chrome.storage.local.get(FILE_SEL_KEY, result => {
      const map = result[FILE_SEL_KEY] || {};
      map[videoId] = fileId;
      chrome.storage.local.set({ [FILE_SEL_KEY]: map }, resolve);
    });
  });
}

export async function ensureFileSelected() {
  if (!state.videoId) return false;
  const stored = await getSelectedFileId(state.videoId);
  if (stored) {
    state.selectedFileId = stored;
    return true;
  }
  state.showFileSelector = true;
  state.fsError = '';
  state.fsLoading = false;
  await loadFolders();
  render();
  return false;
}

export async function loadFolders() {
  try {
    const res = await apiFetch('/folders');
    if (!res.ok) throw new Error('Failed to load folders');
    const data = await res.json();
    state.folders = data.folders || [];
  } catch (err) {
    state.fsError = err.message;
  }
}

export async function loadFiles(folderId) {
  try {
    const res = await apiFetch(`/files?folderId=${encodeURIComponent(folderId)}`);
    if (!res.ok) throw new Error('Failed to load files');
    const data = await res.json();
    state.files = data.files || [];
  } catch (err) {
    state.fsError = err.message;
  }
}

export async function createNewFile() {
  if (!state.newFileName.trim()) {
    state.fsError = 'File name is required.';
    render();
    return;
  }
  state.fsLoading = true;
  state.fsError = '';
  render();
  try {
    const res = await apiFetch('/files', {
      method: 'POST',
      headers: HEADERS_JSON,
      body: JSON.stringify({ name: state.newFileName.trim(), folderId: state.newFileFolderId || null }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create file');
    const file = data.file;
    await setSelectedFileId(state.videoId, file.id);
    state.selectedFileId = file.id;
    state.showFileSelector = false;
    state.newFileName = '';
    showToast('File created');
  } catch (err) {
    state.fsError = err.message;
  }
  state.fsLoading = false;
  render();
}

export async function selectExistingFile(fileId) {
  await setSelectedFileId(state.videoId, fileId);
  state.selectedFileId = fileId;
  state.showFileSelector = false;
  render();
}
