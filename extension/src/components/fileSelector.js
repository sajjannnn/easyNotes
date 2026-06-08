import { state } from '../state.js';
import { escapeHtml } from '../utils.js';

export function fileSelectorHtml() {

  if (state.fsError && !state.folders.length && !state.files.length) {
    return `
      <div class="overlay-backdrop">
        <div class="overlay-panel">
          <div class="overlay-title">Select File</div>
          <div class="overlay-error">${escapeHtml(state.fsError)}</div>
          <button class="btn-primary" data-action="retryLoadFolders">Retry</button>
        </div>
      </div>
    `;
  }
  const folderOptions = state.folders.map(f => `<option value="${f.id}"${f.id === state.newFileFolderId ? ' selected' : ''}>${escapeHtml(f.name)}</option>`).join('');
  const fileButtons = state.files.map(f => `<button class="fs-file-item" data-action="pickFile" data-fileid="${f.id}">
       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
         <polyline points="14 2 14 8 20 8"/>
       </svg>
       ${escapeHtml(f.name)}
     </button>`).join('');
  return `
    <div class="overlay-backdrop">
      <div class="overlay-panel file-selector">
        <div class="overlay-title">Select or create a file</div>
        <label class="overlay-label">Pick folder</label>
        <select class="overlay-select" data-action="pickFolder">
          <option value="">No folder</option>
          ${folderOptions}
        </select>
        <label class="overlay-label">Existing files</label>
        <div class="fs-file-list">
          ${state.fsLoading ? '<div class="loading-spinner"></div>' : fileButtons || '<p class="overlay-muted">No files in this folder</p>'}
        </div>
        <div class="fs-divider"><span>or create new</span></div>
        <div class="fs-new-row">
          <input class="overlay-input" data-action="newFileName" placeholder="File name…"
                 value="${escapeHtml(state.newFileName)}" />
          <button class="btn-primary" data-action="createFile" ${state.fsLoading ? 'disabled' : ''}>
            ${state.fsLoading ? 'Creating…' : 'Create'}
          </button>
        </div>
        ${state.fsError ? `<div class="overlay-error">${escapeHtml(state.fsError)}</div>` : ''}
      </div>
    </div>
  `;
}
