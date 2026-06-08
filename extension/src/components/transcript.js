import { state } from '../state.js';
import { TAB_TRANSCRIPT, TAB_SUMMARY } from '../constants.js';
import { escapeHtml, formatTime } from '../utils.js';

export function transcriptBody() {
  switch (state.status) {
    case 'empty':
      return `
        <div class="section empty-state">
          <div class="icon">📄</div>
          <p>No transcript loaded</p>
          <button class="btn-primary" data-action="fetch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
            </svg>
            Generate Transcript
          </button>
        </div>
      `;
    case 'loading':
      return `
        <div class="section loading-state">
          <div class="spinner"></div>
          <p>Fetching transcript…</p>
        </div>
      `;
    case 'error':
      return `
        <div class="section error-state">
          <div class="msg">${escapeHtml(state.errorMessage)}</div>
          <button class="btn-primary" data-action="fetch">Retry</button>
        </div>
      `;
    case 'success':
      return transcriptView();
    default:
      return '';
  }
}

function transcriptView() {
  const filtered = state.transcript.filter(e =>
    e.text.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  return `
    <div class="section">
      <input class="search-bar" data-action="search"
             placeholder="Search transcript…"
             value="${escapeHtml(state.searchQuery)}" />
    </div>
    <div class="section" style="padding-top:0">
      <div class="transcript-list" data-el="list">
        ${filtered.length === 0
          ? '<div class="no-results">No matching entries</div>'
          : filtered.map(e => `
              <div class="entry${e._idx === state.currentEntryIndex ? ' active' : ''}"
                   data-action="seek" data-seek="${e.offset}">
                <span class="ts">${formatTime(e.offset)}</span>
                <span class="text">${escapeHtml(e.text)}</span>
              </div>
            `).join('')
        }
      </div>
      <div class="actions">
        <button class="btn-secondary${state.autoScroll ? ' active' : ''}" data-action="autoscroll">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
            <polyline points="17,6 23,6 23,12"/>
          </svg>
          Auto Scroll
        </button>
        <button class="btn-secondary" data-action="refresh">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23,4 23,10 17,10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
        <button class="btn-secondary" data-action="copy">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </button>
      </div>
      <div class="badge">${filtered.length} lines</div>
    </div>
  `;
}
