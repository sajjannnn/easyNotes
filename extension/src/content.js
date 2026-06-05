import { YoutubeTranscript } from 'youtube-transcript';

const ID = 'yt-transcript-sidebar';
const TAB_TRANSCRIPT = 'transcript';
const TAB_SUMMARY = 'summary';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const STORAGE_KEY = 'groqApiKey';

const SUMMARY_PROMPT = `You are an expert study assistant.

Analyze the following YouTube transcript and create a concise, well-structured summary.

Return only bullet points.

Requirements:
* Capture the most important ideas.
* Remove repetition.
* Keep the information accurate.
* Use clear language.
* Generate 10-20 bullet points depending on transcript length.`;

const API_BASE = typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:5000/api';
const AUTH_TOKEN_KEY = 'authJwt';
const FILE_SEL_KEY = 'selectedFiles';
const HEADERS_JSON = { 'Content-Type': 'application/json' };
const MIN_TRANSCRIPT_LEN = 20;

let instance = null;

function qs(selector, ctx = document) {
  return ctx.querySelector(selector);
}

function qsa(selector, ctx = document) {
  return Array.from(ctx.querySelectorAll(selector));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

class TranscriptSidebar {
  constructor() {
    if (instance) return instance;
    instance = this;

    this.videoId = null;
    this.transcript = null;
    this.searchQuery = '';
    this.activeTab = TAB_TRANSCRIPT;
    this.autoScroll = false;
    this.root = null;
    this.shadow = null;
    this.state = 'empty';
    this.errorMessage = '';
    this.timeListener = null;
    this.currentEntryIndex = -1;

    this.apiKey = null;
    this.apiKeyExists = false;
    this.showSettings = false;
    this.apiKeyInputValue = '';

    this.summaryState = 'empty';
    this.summary = '';
    this.summaryError = '';

    this.authToken = null;
    this.isAuthenticated = false;
    this.showLoginForm = false;
    this.loginEmail = '';
    this.loginPassword = '';
    this.loginError = '';
    this.loginLoading = false;
    this.showFileSelector = false;
    this.folders = [];
    this.files = [];
    this.selectedFileId = null;
    this.fsLoading = false;
    this.fsError = '';
    this.newFileName = '';
    this.newFileFolderId = '';
    this.showCommentInput = false;
    this.commentText = '';
    this.commentSaving = false;

    this.onNavigate = this.onNavigate.bind(this);

    document.addEventListener('yt-navigate-finish', this.onNavigate);
    window.addEventListener('popstate', this.onNavigate);

    if (document.readyState === 'complete') {
      this.onNavigate();
    } else {
      window.addEventListener('load', this.onNavigate);
    }
  }

  get videoEl() {
    return qs('video');
  }


  onNavigate() {
    if (!location.pathname.startsWith('/watch')) {
      this.destroy();
      this.removePlayerButtons();
      if (this._playerObserver) this._playerObserver.disconnect();
      return;
    }

    const id = new URLSearchParams(location.search).get('v');
    if (!id) {
      this.destroy();
      this.removePlayerButtons();
      if (this._playerObserver) this._playerObserver.disconnect();
      return;
    }

    if (id !== this.videoId) {
      this.videoId = id;
      this.transcript = null;
      this.searchQuery = '';
      this.autoScroll = false;
      this.state = 'empty';
      this.errorMessage = '';
      this.currentEntryIndex = -1;
      this.summaryState = 'empty';
      this.summary = '';
      this.summaryError = '';
      this.showLoginForm = false;
      this.showFileSelector = false;
      this.showCommentInput = false;
      this.isAuthenticated = false;
      this.authToken = null;
      this.selectedFileId = null;
      this.cleanupAutoScroll();
      this.waitForReady().then(() => this.inject());
    }
  }

  waitForReady() {
    return new Promise(resolve => {
      const check = () => {
        if (qs('#secondary') && qs('#secondary').offsetParent !== null) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }

  destroy() {
    this.cleanupAutoScroll();
    if (this.root && this.root.parentNode) {
      this.root.remove();
    }
    this.root = null;
    this.shadow = null;
  }

  async inject() {
    this.destroy();

    const parent = qs('#secondary');
    if (!parent) return;

    await this.loadApiKey();

    this.root = document.createElement('div');
    this.root.id = ID;
    this.shadow = this.root.attachShadow({ mode: 'open' });

    this.render();
    this.bindEvents();
    parent.insertBefore(this.root, parent.firstChild);

    this.injectPlayerStyles();
    this.injectPlayerButtons();
    this.observePlayer();

    if (this.state === 'empty') {
      this.fetchTranscript();
    }
  }


  loadApiKey() {
    return new Promise(resolve => {
      chrome.storage.local.get(STORAGE_KEY, result => {
        this.apiKey = result[STORAGE_KEY] || null;
        this.apiKeyExists = !!this.apiKey;
        resolve();
      });
    });
  }

  saveApiKey(key) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [STORAGE_KEY]: key }, () => {
        this.apiKey = key;
        this.apiKeyExists = true;
        this.showSettings = false;
        this.render();
        resolve();
      });
    });
  }

  deleteApiKey() {
    return new Promise(resolve => {
      chrome.storage.local.remove(STORAGE_KEY, () => {
        this.apiKey = null;
        this.apiKeyExists = false;
        this.showSettings = false;
        this.render();
        resolve();
      });
    });
  }


  render() {
    if (!this.shadow) return;
    this.shadow.innerHTML = `
      <style>${this.styles()}</style>
      <div class="sidebar" role="region" aria-label="Transcript sidebar">
        ${this.header()}
        ${this.tabs()}
        ${this.body()}
      </div>
      <div class="settings-backdrop${this.showSettings ? ' visible' : ''}" data-action="closeSettings"></div>
      <div class="settings-dropdown${this.showSettings ? ' visible' : ''}">
        ${this.settingsContent()}
      </div>
      ${this.overlaysHtml()}
    `;
  }

  styles() {
    return `
      :host { all: initial; display: block; position: relative; }
      .sidebar {
        font-family: 'Roboto', 'Arial', sans-serif;
        background: #212121;
        border-radius: 12px;
        margin-bottom: 16px;
        overflow: hidden;
        border: 1px solid #303030;
      }

      .header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 16px; border-bottom: 1px solid #303030;
      }
      .header-left { display: flex; align-items: center; gap: 8px; }
      .logo { flex-shrink: 0; }
      .title { font-size: 16px; font-weight: 500; color: #f1f1f1; }

      .settings-btn {
        background: none; border: none; cursor: pointer;
        width: 32px; height: 32px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: #aaa; transition: all 0.15s;
      }
      .settings-btn:hover { background: #303030; color: #f1f1f1; }

      .tabs {
        display: flex; border-bottom: 1px solid #303030;
      }
      .tab {
        flex: 1; padding: 10px; text-align: center;
        background: none; border: none; color: #aaa;
        font-size: 13px; font-weight: 500; cursor: pointer;
        transition: all 0.15s;
        border-bottom: 2px solid transparent;
      }
      .tab:hover { color: #f1f1f1; background: #2a2a2a; }
      .tab.active { color: #f1f1f1; border-bottom-color: #3ea6ff; }

      .body { }
      .section { padding: 12px 16px; }

      .btn-primary {
        display: inline-flex; align-items: center; gap: 6px;
        background: #3ea6ff; color: #0f0f0f;
        border: none; padding: 8px 20px; border-radius: 20px;
        font-size: 14px; font-weight: 500; cursor: pointer;
        transition: background 0.15s;
      }
      .btn-primary:hover { background: #65b8ff; }
      .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

      .btn-secondary {
        display: inline-flex; align-items: center; gap: 6px;
        background: transparent; color: #f1f1f1;
        border: 1px solid #555; padding: 6px 14px; border-radius: 20px;
        font-size: 13px; cursor: pointer; transition: all 0.15s;
      }
      .btn-secondary:hover { background: #303030; border-color: #777; }
      .btn-secondary.active { background: #263850; border-color: #3ea6ff; color: #3ea6ff; }
      .btn-danger {
        border-color: #ff4444; color: #ff4444;
      }
      .btn-danger:hover { background: #3a1515; border-color: #ff6666; }

      .empty-state {
        text-align: center; padding: 32px 16px;
      }
      .empty-state .icon { font-size: 32px; margin-bottom: 8px; }
      .empty-state p { color: #aaa; font-size: 13px; margin: 6px 0; }
      .empty-state .btn-primary { margin-top: 12px; }

      .loading-state {
        text-align: center; padding: 32px 16px;
      }
      .spinner {
        display: inline-block; width: 28px; height: 28px;
        border: 3px solid #303030; border-top-color: #3ea6ff;
        border-radius: 50%; animation: spin 0.7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .loading-state p { color: #aaa; font-size: 13px; margin-top: 12px; }

      .error-state { text-align: center; padding: 24px 16px; }
      .error-state .msg { color: #ff6b6b; font-size: 13px; margin-bottom: 12px; line-height: 1.5; }

      .search-bar {
        width: 100%; padding: 8px 12px;
        background: #121212; border: 1px solid #303030;
        border-radius: 8px; color: #f1f1f1; font-size: 13px;
        outline: none; box-sizing: border-box;
      }
      .search-bar:focus { border-color: #3ea6ff; }
      .search-bar::placeholder { color: #717171; }

      .transcript-list {
        max-height: 420px; overflow-y: auto;
        scroll-behavior: smooth;
      }
      .transcript-list::-webkit-scrollbar { width: 6px; }
      .transcript-list::-webkit-scrollbar-track { background: transparent; }
      .transcript-list::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }

      .entry {
        display: flex; gap: 12px; padding: 8px 0;
        cursor: pointer; border-radius: 4px; transition: background 0.15s;
        border-bottom: 1px solid #2a2a2a;
      }
      .entry:last-child { border-bottom: none; }
      .entry:hover { background: #2a2a2a; }
      .entry.active { background: #1a3a5c; }
      .entry .ts {
        color: #3ea6ff; font-size: 13px;
        min-width: 45px; flex-shrink: 0;
        font-family: 'Roboto Mono', monospace; padding-top: 1px;
      }
      .entry .text { color: #e0e0e0; font-size: 13px; line-height: 1.5; }
      .entry.active .text { color: #fff; }

      .actions {
        display: flex; gap: 8px; flex-wrap: wrap;
        margin-top: 12px;
      }

      .badge {
        font-size: 11px; color: #aaa; padding: 8px 0 0;
        text-align: right;
      }

      .no-results {
        text-align: center; padding: 24px 0;
        color: #717171; font-size: 13px;
      }

      /* ---- Summary ---- */

      .summary-content {
        max-height: 400px; overflow-y: auto;
        padding: 4px 0;
      }
      .summary-content::-webkit-scrollbar { width: 6px; }
      .summary-content::-webkit-scrollbar-track { background: transparent; }
      .summary-content::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }

      .summary-line {
        padding: 4px 0;
        font-size: 13px;
        line-height: 1.6;
        color: #e0e0e0;
        display: flex;
        gap: 8px;
      }
      .summary-line::before {
        content: "\\2022";
        color: #3ea6ff;
        flex-shrink: 0;
      }
      .warning-state {
        text-align: center; padding: 24px 16px;
      }
      .warning-state .icon { font-size: 28px; margin-bottom: 8px; }
      .warning-state p { color: #ffa726; font-size: 13px; margin: 6px 0; line-height: 1.5; }

      /* ---- Settings ---- */

      .settings-backdrop {
        display: none; position: fixed; inset: 0;
        z-index: 99999;
      }
      .settings-backdrop.visible { display: block; }

      .settings-dropdown {
        display: none;
        position: absolute; top: 48px; left: 8px; right: 8px;
        background: #1a1a1a; border: 1px solid #303030;
        border-radius: 12px; padding: 16px;
        z-index: 100000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      }
      .settings-dropdown.visible { display: block; }

      .settings-title {
        font-size: 14px; font-weight: 500; color: #f1f1f1;
        margin-bottom: 12px;
      }
      .settings-label {
        font-size: 12px; color: #aaa; margin-bottom: 6px;
        display: block;
      }
      .settings-input {
        width: 100%; padding: 10px 12px;
        background: #121212; border: 1px solid #303030;
        border-radius: 8px; color: #f1f1f1; font-size: 13px;
        outline: none; box-sizing: border-box;
        font-family: monospace;
      }
      .settings-input:focus { border-color: #3ea6ff; }
      .settings-actions {
        display: flex; gap: 8px; margin-top: 12px;
      }
      .settings-status {
        display: flex; align-items: center; gap: 6px;
        font-size: 13px; margin-top: 12px;
      }
      .settings-status.connected { color: #4caf50; }
      .settings-status.disconnected { color: #ffa726; }
      .settings-hint {
        font-size: 11px; color: #717171;
        margin-top: 8px; line-height: 1.4;
      }

      /* Overlays */
      .overlay-backdrop {
        position: fixed; inset: 0; z-index: 200000;
        background: rgba(0,0,0,0.6);
        display: flex; align-items: center; justify-content: center;
        padding: 24px;
      }
      .overlay-panel {
        background: #1a1a1a; border: 1px solid #303030;
        border-radius: 12px; padding: 20px;
        width: 100%; max-width: 380px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      }
      .overlay-title {
        font-size: 16px; font-weight: 600; color: #f1f1f1;
        margin-bottom: 4px;
      }
      .overlay-subtitle {
        font-size: 13px; color: #aaa;
        margin: 4px 0 16px;
      }
      .overlay-error {
        font-size: 12px; color: #ff6b6b;
        margin-bottom: 12px; padding: 8px 10px;
        background: #2a1515; border-radius: 6px;
      }
      .overlay-muted {
        font-size: 12px; color: #717171;
        margin: 8px 0;
      }
      .overlay-input {
        width: 100%; padding: 10px 12px;
        background: #121212; border: 1px solid #303030;
        border-radius: 8px; color: #f1f1f1; font-size: 13px;
        outline: none; box-sizing: border-box;
        margin-bottom: 8px;
      }
      .overlay-input:focus { border-color: #3ea6ff; }
      .overlay-input::placeholder { color: #555; }
      .overlay-select {
        width: 100%; padding: 10px 12px;
        background: #121212; border: 1px solid #303030;
        border-radius: 8px; color: #f1f1f1; font-size: 13px;
        outline: none; box-sizing: border-box;
        margin-bottom: 12px;
      }
      .overlay-textarea {
        width: 100%; min-height: 80px; padding: 10px 12px;
        background: #121212; border: 1px solid #303030;
        border-radius: 8px; color: #f1f1f1; font-size: 13px;
        outline: none; box-sizing: border-box;
        resize: vertical; font-family: inherit;
        margin: 12px 0;
      }
      .overlay-textarea:focus { border-color: #3ea6ff; }
      .overlay-textarea::placeholder { color: #555; }
      .overlay-label {
        font-size: 12px; color: #aaa; margin-bottom: 4px;
        display: block;
      }
      .overlay-actions {
        display: flex; gap: 8px; margin-top: 12px;
      }
      .overlay-hint {
        font-size: 12px; color: #717171;
        margin-top: 12px; text-align: center;
      }
      .overlay-hint .link {
        color: #3ea6ff; cursor: pointer;
      }
      .overlay-hint .link:hover { text-decoration: underline; }

      /* File selector */
      .file-selector { max-width: 420px; }
      .fs-file-list {
        max-height: 160px; overflow-y: auto;
        margin-bottom: 8px;
      }
      .fs-file-list::-webkit-scrollbar { width: 4px; }
      .fs-file-list::-webkit-scrollbar-thumb { background: #555; border-radius: 2px; }
      .fs-file-item {
        display: flex; align-items: center; gap: 8px;
        width: 100%; padding: 8px 10px;
        background: none; border: 1px solid transparent;
        border-radius: 6px; color: #e0e0e0; font-size: 13px;
        cursor: pointer; text-align: left;
        transition: all 0.15s;
      }
      .fs-file-item:hover { background: #2a2a2a; border-color: #303030; }
      .fs-file-item svg { flex-shrink: 0; }
      .fs-divider {
        display: flex; align-items: center; gap: 8px;
        margin: 12px 0; color: #555; font-size: 12px;
      }
      .fs-divider::before, .fs-divider::after {
        content: ''; flex: 1; height: 1px; background: #303030;
      }
      .fs-new-row {
        display: flex; gap: 8px; align-items: flex-start;
      }
      .fs-new-row .overlay-input { flex: 1; margin-bottom: 0; }
      .loading-spinner {
        width: 20px; height: 20px;
        border: 2px solid #303030; border-top-color: #3ea6ff;
        border-radius: 50%; animation: spin 0.7s linear infinite;
        margin: 12px auto;
      }
    `;
  }

  header() {
    return `
      <div class="header">
        <div class="header-left">
          <svg class="logo" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="3" width="20" height="14" rx="3" stroke="#3ea6ff" stroke-width="1.5"/>
            <polygon points="10,6 16,10 10,14" fill="#3ea6ff"/>
          </svg>
          <span class="title">AI Transcript</span>
        </div>
        <button class="settings-btn" data-action="screenshot" aria-label="Screenshot" title="Save Screenshot">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
        <button class="settings-btn" data-action="comment" aria-label="Comment" title="Add Comment">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <button class="settings-btn" data-action="toggleSettings" aria-label="Settings" title="Settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    `;
  }

  tabs() {
    return `
      <div class="tabs">
        <button class="tab${this.activeTab === TAB_TRANSCRIPT ? ' active' : ''}"
                data-action="switchTab" data-tab="${TAB_TRANSCRIPT}">Transcript</button>
        <button class="tab${this.activeTab === TAB_SUMMARY ? ' active' : ''}"
                data-action="switchTab" data-tab="${TAB_SUMMARY}">Summary</button>
      </div>
    `;
  }

  body() {
    if (this.activeTab === TAB_TRANSCRIPT) return this.transcriptBody();
    return this.summaryBody();
  }


  transcriptBody() {
    switch (this.state) {
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
            <div class="msg">${escapeHtml(this.errorMessage)}</div>
            <button class="btn-primary" data-action="fetch">Retry</button>
          </div>
        `;
      case 'success':
        return this.transcriptView();
      default:
        return '';
    }
  }

  transcriptView() {
    const filtered = this.transcript.filter(e =>
      e.text.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    return `
      <div class="section">
        <input class="search-bar" data-action="search"
               placeholder="Search transcript…"
               value="${escapeHtml(this.searchQuery)}" />
      </div>
      <div class="section" style="padding-top:0">
        <div class="transcript-list" data-el="list">
          ${filtered.length === 0
            ? '<div class="no-results">No matching entries</div>'
            : filtered.map(e => `
                <div class="entry${e._idx === this.currentEntryIndex ? ' active' : ''}"
                     data-action="seek" data-seek="${e.offset}">
                  <span class="ts">${formatTime(e.offset)}</span>
                  <span class="text">${escapeHtml(e.text)}</span>
                </div>
              `).join('')
          }
        </div>
        <div class="actions">
          <button class="btn-secondary${this.autoScroll ? ' active' : ''}" data-action="autoscroll">
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


  summaryBody() {
    if (this.summaryState === 'success') return this.summaryView();

    if (!this.apiKeyExists) {
      return `
        <div class="section warning-state">
          <div class="icon">🔑</div>
          <p>Add your Groq API key in settings to generate summaries</p>
          <button class="btn-secondary" data-action="toggleSettings" style="margin-top:8px">
            Open Settings
          </button>
        </div>
      `;
    }

    if (this.state !== 'success' || !this.transcript) {
      return `
        <div class="section warning-state">
          <div class="icon">📄</div>
          <p>No transcript available. Generate a transcript first.</p>
          <button class="btn-primary" data-action="switchTab" data-tab="${TAB_TRANSCRIPT}" style="margin-top:8px">
            Go to Transcript
          </button>
        </div>
      `;
    }

    switch (this.summaryState) {
      case 'empty':
        return `
          <div class="section empty-state">
            <div class="icon">📝</div>
            <p>Generate an AI summary of this video</p>
            <button class="btn-primary" data-action="generateSummary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Generate Summary
            </button>
          </div>
        `;
      case 'loading':
        return `
          <div class="section loading-state">
            <div class="spinner"></div>
            <p>Generating summary…</p>
          </div>
        `;
      case 'error':
        return `
          <div class="section error-state">
            <div class="msg">${escapeHtml(this.summaryError)}</div>
            <button class="btn-primary" data-action="generateSummary">Retry</button>
          </div>
        `;
      default:
        return '';
    }
  }

  summaryView() {
    const lines = this.summary.split('\n').filter(l => l.trim());

    return `
      <div class="section" style="padding-bottom:4px">
        <div class="summary-content">
          ${lines.map(l => `
            <div class="summary-line">${escapeHtml(l.replace(/^[-*•]\s*/, ''))}</div>
          `).join('')}
        </div>
        <div class="actions">
          <button class="btn-secondary" data-action="generateSummary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23,4 23,10 17,10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Regenerate
          </button>
          <button class="btn-secondary" data-action="copySummary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </button>
        </div>
        <div class="badge">${lines.length} points</div>
      </div>
    `;
  }


  settingsContent() {
    if (!this.apiKeyExists) {
      return `
        <div class="settings-title">⚙️ Settings</div>
        <label class="settings-label">Groq API Key</label>
        <input class="settings-input" data-action="apiKeyInput" type="password"
               placeholder="gsk_..." value="${escapeHtml(this.apiKeyInputValue)}" />
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

    const masked = this.apiKey.length > 12
      ? this.apiKey.slice(0, 4) + '…' + this.apiKey.slice(-4)
      : '********';

    return `
      <div class="settings-title">⚙️ Settings</div>
      <label class="settings-label">Groq API Key</label>
      <input class="settings-input" data-action="apiKeyInput" type="password"
             placeholder="gsk_..." value="${escapeHtml(this.apiKeyInputValue || this.apiKey)}" />
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


  bindEvents() {
    if (!this.shadow) return;
    this.shadow.addEventListener('click', this.onClick.bind(this));
    this.shadow.addEventListener('input', this.onInput.bind(this));
    this.shadow.addEventListener('keydown', (e) => {
      if (e.target.closest('[data-action="commentText"], [data-action="loginEmail"], [data-action="loginPassword"]')) {
        e.stopPropagation();
      }
    });
  }

  onClick(e) {
    try {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    switch (action) {
      case 'fetch':
        this.fetchTranscript();
        break;
      case 'refresh':
        this.transcript = null;
        this.fetchTranscript();
        break;
      case 'copy':
        this.copyTranscript();
        break;
      case 'autoscroll':
        this.toggleAutoScroll();
        break;
      case 'seek':
        this.seekVideo(parseFloat(btn.dataset.seek));
        break;
      case 'switchTab':
        this.activeTab = btn.dataset.tab;
        this.render();
        break;
      case 'toggleSettings':
        this.showSettings = !this.showSettings;
        if (this.showSettings) this.apiKeyInputValue = '';
        this.render();
        break;
      case 'closeSettings':
        this.showSettings = false;
        this.render();
        break;
      case 'saveApiKey':
        this.handleSaveKey();
        break;
      case 'deleteApiKey':
        this.handleDeleteKey();
        break;
      case 'generateSummary':
        this.generateSummary();
        break;
      case 'copySummary':
        this.copySummary();
        break;
      case 'screenshot':
        this.handleScreenshot();
        break;
      case 'comment':
        this.handleComment();
        break;
      case 'openGroqKeys':
        window.open('https://console.groq.com/keys', '_blank');
        break;
      case 'doLogin':
        this.handleLogin();
        break;
      case 'openRegister':
        window.open('http://localhost:5173/register', '_blank');
        break;
      case 'pickFile':
        this.selectExistingFile(btn.dataset.fileid);
        break;
      case 'createFile':
        this.createNewFile();
        break;
      case 'retryLoadFolders':
        this.loadFolders();
        this.render();
        break;
      case 'cancelComment':
        this.showCommentInput = false;
        this.commentText = '';
        this.render();
        break;
      case 'saveComment':
        this.saveComment();
        break;
    }
    } catch (err) { console.error('onClick error:', err); }
  }

  onInput(e) {
    const input = e.target.closest('[data-action]');
    if (!input) return;
    const action = input.dataset.action;

    switch (action) {
      case 'search':
        this.searchQuery = input.value;
        this.render();
        break;
      case 'apiKeyInput':
        this.apiKeyInputValue = input.value;
        break;
      case 'loginEmail':
        this.loginEmail = input.value;
        break;
      case 'loginPassword':
        this.loginPassword = input.value;
        break;
      case 'newFileName':
        this.newFileName = input.value;
        break;
      case 'commentText':
        this.commentText = input.value;
        break;
    }
  }

  async fetchTranscript() {
    this.state = 'loading';
    this.errorMessage = '';
    this.render();

    try {
      const data = await YoutubeTranscript.fetchTranscript(this.videoId);
      const maxOff = data.reduce((m, e) => Math.max(m, e.offset), 0);
      const isMs = maxOff > 10000;
      this.transcript = data.map((e, i) => ({
        text: e.text,
        duration: isMs ? e.duration / 1000 : e.duration,
        offset: isMs ? e.offset / 1000 : e.offset,
        lang: e.lang,
        _idx: i,
      }));
      this.state = 'success';
      this.render();
      this.setupAutoScroll();
      this._syncHighlight();
    } catch (err) {
      this.state = 'error';
      this.errorMessage = err.message || 'Failed to load transcript';
      this.render();
    }
  }

  async copyTranscript() {
    if (!this.transcript) return;
    const text = this.transcript.map(e =>
      `${formatTime(e.offset)}  ${e.text}`
    ).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied!');
    } catch {
      this.showToast('Failed to copy');
    }
  }

  toggleAutoScroll() {
    this.autoScroll = !this.autoScroll;
    const btn = this.shadow?.querySelector('[data-action="autoscroll"]');
    if (btn) btn.classList.toggle('active');
    if (this.autoScroll) {
      this.setupAutoScroll();
      this._syncHighlight();
    } else {
      this.cleanupAutoScroll();
    }
  }

  seekVideo(seconds) {
    const v = this.videoEl;
    if (v) v.currentTime = seconds;
  }


  getTranscriptText() {
    if (!this.transcript) return '';
    return this.transcript.map(e => e.text).join(' ');
  }

  async generateSummary() {
    if (!this.apiKeyExists || !this.apiKey) {
      this.summaryState = 'error';
      this.summaryError = 'No API key configured. Add your Groq API key in settings.';
      this.render();
      return;
    }

    if (!this.transcript || this.state !== 'success') {
      this.summaryState = 'error';
      this.summaryError = 'No transcript available. Please generate a transcript first.';
      this.render();
      return;
    }

    this.summaryState = 'loading';
    this.render();

    const transcriptText = this.getTranscriptText();

    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: SUMMARY_PROMPT },
            { role: 'user', content: transcriptText },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        let detail = '';
        try {
          const errBody = await response.json();
          detail = errBody.error?.message || JSON.stringify(errBody);
        } catch { detail = response.statusText; }
        throw new Error(`Groq API error (${response.status}): ${detail}`);
      }

      const data = await response.json();
      this.summary = data.choices[0].message.content.trim();
      this.summaryState = 'success';
      this.render();
    } catch (err) {
      this.summaryState = 'error';
      this.summaryError = err.message || 'Failed to generate summary';
      this.render();
    }
  }

  async copySummary() {
    if (!this.summary) return;
    try {
      await navigator.clipboard.writeText(this.summary);
      this.showToast('Copied!');
    } catch {
      this.showToast('Failed to copy');
    }
  }


  async handleSaveKey() {
    const input = this.shadow?.querySelector('[data-action="apiKeyInput"]');
    const value = (input?.value || this.apiKeyInputValue).trim();
    if (!value) {
      this.showToast('Please enter an API key');
      return;
    }
    await this.saveApiKey(value);
    this.showToast('API key saved');
  }

  async handleDeleteKey() {
    await this.deleteApiKey();
    this.showToast('API key removed');
  }


  setupAutoScroll() {
    this.cleanupAutoScroll();
    const v = this.videoEl;
    if (!v) return;
    this.timeListener = () => this.onTimeUpdate(v);
    v.addEventListener('timeupdate', this.timeListener);
  }

  cleanupAutoScroll() {
    if (this.timeListener) {
      const v = this.videoEl;
      if (v) v.removeEventListener('timeupdate', this.timeListener);
      this.timeListener = null;
    }
  }

  onTimeUpdate(video) {
    if (!this.transcript || this.transcript.length === 0) return;
    if (this._pendingTick) return;
    this._pendingTick = true;
    requestAnimationFrame(() => {
      this._pendingTick = false;
      const t = video.currentTime;
      let idx = 0;
      for (let i = 0; i < this.transcript.length; i++) {
        if (t >= this.transcript[i].offset) {
          idx = i;
        } else {
          break;
        }
      }
      if (idx !== this.currentEntryIndex) {
        this.currentEntryIndex = idx;
        this._syncHighlight();
      }
    });
  }

  _syncHighlight() {
    const list = this.shadow?.querySelector('[data-el="list"]');
    if (!list) return;
    const entries = list.children;
    const prev = list.querySelector('.active');
    if (prev) prev.classList.remove('active');
    if (this.currentEntryIndex >= 0 && this.currentEntryIndex < entries.length) {
      entries[this.currentEntryIndex].classList.add('active');
      if (this.autoScroll) {
        const el = entries[this.currentEntryIndex];
        list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2;
      }
    }
  }


  showToast(msg, duration = 2000) {
    const existing = document.getElementById('yt-toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.id = 'yt-toast';
    el.textContent = msg;
    Object.assign(el.style, {
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      background: '#3ea6ff', color: '#0f0f0f', padding: '8px 20px',
      borderRadius: '20px', fontSize: '14px', fontWeight: '500',
      zIndex: '999999', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transition: 'opacity 0.2s',
    });
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 200);
    }, duration);
  }


  async apiFetch(path, options = {}) {
    const token = await this.getAuthToken();
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    return res;
  }

  getAuthToken() {
    return new Promise(resolve => {
      chrome.storage.local.get(AUTH_TOKEN_KEY, result => {
        resolve(result[AUTH_TOKEN_KEY] || null);
      });
    });
  }

  setAuthToken(token) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [AUTH_TOKEN_KEY]: token }, resolve);
    });
  }

  clearAuthToken() {
    return new Promise(resolve => {
      chrome.storage.local.remove(AUTH_TOKEN_KEY, resolve);
    });
  }

  async ensureAuthenticated() {
    const token = await this.getAuthToken();
    if (!token) {
      this.showLoginForm = true;
      this.render();
      return false;
    }
    const res = await this.apiFetch('/auth/me');
    if (!res.ok) {
      await this.clearAuthToken();
      this.showLoginForm = true;
      this.render();
      return false;
    }
    const data = await res.json();
    this.authToken = token;
    this.isAuthenticated = true;
    return true;
  }

  async handleLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Email and password are required.';
      this.render();
      return;
    }
    this.loginLoading = true;
    this.loginError = '';
    this.render();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: HEADERS_JSON,
        body: JSON.stringify({ email: this.loginEmail, password: this.loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        this.loginError = data.error || 'Login failed.';
        this.loginLoading = false;
        this.render();
        return;
      }
      await this.setAuthToken(data.token);
      this.authToken = data.token;
      this.isAuthenticated = true;
      this.showLoginForm = false;
      this.loginEmail = '';
      this.loginPassword = '';
      this.loginError = '';
      this.loginLoading = false;
    } catch (err) {
      this.loginError = err.message || 'Network error.';
    }
    this.loginLoading = false;
    this.render();
  }

  handleLogout() {
    this.clearAuthToken();
    this.authToken = null;
    this.isAuthenticated = false;
    this.selectedFileId = null;
    this.showToast('Logged out');
  }

  loginFormHtml() {
    return `
      <div class="overlay-backdrop">
        <div class="overlay-panel">
          <div class="overlay-title">Sign In</div>
          <p class="overlay-subtitle">Sign in to save screenshots & comments</p>
          ${this.loginError ? `<div class="overlay-error">${escapeHtml(this.loginError)}</div>` : ''}
          <input class="overlay-input" data-action="loginEmail" type="email" placeholder="Email"
                 value="${escapeHtml(this.loginEmail)}" />
          <input class="overlay-input" data-action="loginPassword" type="password" placeholder="Password"
                 value="${escapeHtml(this.loginPassword)}" />
          <div class="overlay-actions">
            <button class="btn-primary" data-action="doLogin" ${this.loginLoading ? 'disabled' : ''}>
              ${this.loginLoading ? 'Signing in…' : 'Sign In'}
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


  getSelectedFileId(videoId) {
    return new Promise(resolve => {
      chrome.storage.local.get(FILE_SEL_KEY, result => {
        const map = result[FILE_SEL_KEY] || {};
        resolve(map[videoId] || null);
      });
    });
  }

  setSelectedFileId(videoId, fileId) {
    return new Promise(resolve => {
      chrome.storage.local.get(FILE_SEL_KEY, result => {
        const map = result[FILE_SEL_KEY] || {};
        map[videoId] = fileId;
        chrome.storage.local.set({ [FILE_SEL_KEY]: map }, resolve);
      });
    });
  }

  async ensureFileSelected() {
    if (!this.videoId) return false;
    const stored = await this.getSelectedFileId(this.videoId);
    if (stored) {
      this.selectedFileId = stored;
      return true;
    }
    this.showFileSelector = true;
    this.fsError = '';
    this.fsLoading = false;
    await this.loadFolders();
    this.render();
    return false;
  }

  async loadFolders() {
    try {
      const res = await this.apiFetch('/folders');
      if (!res.ok) throw new Error('Failed to load folders');
      const data = await res.json();
      this.folders = data.folders || [];
    } catch (err) {
      this.fsError = err.message;
    }
  }

  async loadFiles(folderId) {
    try {
      const res = await this.apiFetch(`/files?folderId=${encodeURIComponent(folderId)}`);
      if (!res.ok) throw new Error('Failed to load files');
      const data = await res.json();
      this.files = data.files || [];
    } catch (err) {
      this.fsError = err.message;
    }
  }

  async createNewFile() {
    if (!this.newFileName.trim()) {
      this.fsError = 'File name is required.';
      this.render();
      return;
    }
    this.fsLoading = true;
    this.fsError = '';
    this.render();
    try {
      const res = await this.apiFetch('/files', {
        method: 'POST',
        headers: HEADERS_JSON,
        body: JSON.stringify({ name: this.newFileName.trim(), folderId: this.newFileFolderId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create file');
      const file = data.file;
      await this.setSelectedFileId(this.videoId, file.id);
      this.selectedFileId = file.id;
      this.showFileSelector = false;
      this.newFileName = '';
      this.showToast('File created');
    } catch (err) {
      this.fsError = err.message;
    }
    this.fsLoading = false;
    this.render();
  }

  async selectExistingFile(fileId) {
    await this.setSelectedFileId(this.videoId, fileId);
    this.selectedFileId = fileId;
    this.showFileSelector = false;
    this.render();
  }

  fileSelectorHtml() {
    if (this.fsError && !this.folders.length && !this.files.length) {
      return `
        <div class="overlay-backdrop">
          <div class="overlay-panel">
            <div class="overlay-title">Select File</div>
            <div class="overlay-error">${escapeHtml(this.fsError)}</div>
            <button class="btn-primary" data-action="retryLoadFolders">Retry</button>
          </div>
        </div>
      `;
    }
    const folderOptions = this.folders.map(f => `<option value="${f.id}"${f.id === this.newFileFolderId ? ' selected' : ''}>${escapeHtml(f.name)}</option>`).join('');
    const fileButtons = this.files.map(f => `<button class="fs-file-item" data-action="pickFile" data-fileid="${f.id}">
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
            ${this.fsLoading ? '<div class="loading-spinner"></div>' : fileButtons || '<p class="overlay-muted">No files in this folder</p>'}
          </div>
          <div class="fs-divider"><span>or create new</span></div>
          <div class="fs-new-row">
            <input class="overlay-input" data-action="newFileName" placeholder="File name…"
                   value="${escapeHtml(this.newFileName)}" />
            <button class="btn-primary" data-action="createFile" ${this.fsLoading ? 'disabled' : ''}>
              ${this.fsLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
          ${this.fsError ? `<div class="overlay-error">${escapeHtml(this.fsError)}</div>` : ''}
        </div>
      </div>
    `;
  }

  async handleScreenshot() {
    const authed = await this.ensureAuthenticated();
    if (!authed) return;
    const fileOk = await this.ensureFileSelected();
    if (!fileOk) return;
    const video = this.videoEl;
    if (!video) { this.showToast('No video element found'); return; }
    if (video.readyState < 2) { this.showToast('Video not loaded yet'); return; }
    try {
      const blob = await this.captureFrame(video);
      const videoTitle = document.title.replace(' - YouTube', '');
      const timestamp = Math.floor(video.currentTime);
      const youtubeUrl = `https://youtube.com/watch?v=${this.videoId}&t=${timestamp}`;
      await this.ensureSummary(videoTitle, timestamp);
      await this.uploadScreenshot(blob, videoTitle, timestamp, youtubeUrl);
    } catch (err) {
      this.showToast('Screenshot failed: ' + (err.message || ''));
    }
  }

  async captureFrame(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) reject(new Error('Canvas tainted by cross-origin video - cannot capture screenshot'));
        else resolve(blob);
      }, 'image/png');
    });
  }

  async uploadScreenshot(blob, videoTitle, timestamp, youtubeUrl) {
    const fd = new FormData();
    fd.append('image', blob, `ss-${this.videoId}-${Date.now()}.png`);
    fd.append('videoId', this.videoId);
    fd.append('videoTitle', videoTitle);
    fd.append('timestamp', String(timestamp));
    fd.append('youtubeUrl', youtubeUrl);
    fd.append('fileId', this.selectedFileId);
    const token = await this.getAuthToken();
    const res = await fetch(`${API_BASE}/screenshots`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) {
      let msg = 'Upload failed';
      try { const d = await res.json(); msg = d.error || msg; } catch {}
      throw new Error(msg);
    }
    this.showToast('Screenshot saved!');
  }


  async handleComment() {

    const authed = await this.ensureAuthenticated();
    if (!authed) return;
    const fileOk = await this.ensureFileSelected();
    if (!fileOk) return;
    this.showCommentInput = true;
    this.commentText = '';
    this.commentSaving = false;
    this.render();
  }

  async saveComment() {
    if (!this.commentText.trim()) return;
    this.commentSaving = true;
    this.render();
    try {
      const video = this.videoEl;
      const timestamp = video ? Math.floor(video.currentTime) : 0;
      const videoTitle = document.title.replace(' - YouTube', '');
      const youtubeUrl = `https://youtube.com/watch?v=${this.videoId}&t=${timestamp}`;
      await this.ensureSummary(videoTitle, timestamp);
      const res = await this.apiFetch('/comments', {
        method: 'POST',
        headers: HEADERS_JSON,
        body: JSON.stringify({
          text: this.commentText.trim(),
          videoId: this.videoId,
          videoTitle,
          timestamp,
          youtubeUrl,
          fileId: this.selectedFileId,
        }),
      });
      if (!res.ok) {
        let msg = 'Failed to save comment';
        try { const d = await res.json(); msg = d.error || msg; } catch {}
        throw new Error(msg);
      }
      this.showCommentInput = false;
      this.commentText = '';
      this.showToast('Comment saved!');
    } catch (err) {
      this.showToast(err.message || 'Failed to save comment');
    }
    this.commentSaving = false;
    this.render();
  }

  commentInputHtml() {
    return `
      <div class="overlay-backdrop">
        <div class="overlay-panel">
          <div class="overlay-title">Add Comment</div>
          <textarea class="overlay-textarea" data-action="commentText" placeholder="Type your comment…">${escapeHtml(this.commentText)}</textarea>
          <div class="overlay-actions">
            <button class="btn-secondary" data-action="cancelComment">Cancel</button>
            <button class="btn-primary" data-action="saveComment" ${this.commentSaving || !this.commentText.trim() ? 'disabled' : ''}>
              ${this.commentSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    `;
  }


  async ensureSummary(videoTitle, timestamp) {
    const checkRes = await this.apiFetch(`/summaries/video/${this.videoId}`);
    if (checkRes.ok) return;
    if (checkRes.status !== 404) return;
    let content = '';
    if (this.summaryState === 'success' && this.summary) {
      content = this.summary;
    } else {
      if (!this.apiKeyExists) { this.showToast('No Groq key - summary skipped'); return; }
      if (!this.transcript || this.state !== 'success') {
        await this.fetchTranscript();
      }
      if (!this.transcript || this.transcript.length < MIN_TRANSCRIPT_LEN) {
        this.showToast('Transcript too short for summary');
        return;
      }
      this.showToast('Generating summary…');
      const transcriptText = this.getTranscriptText();
      try {
        const response = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: 'system', content: SUMMARY_PROMPT },
              { role: 'user', content: transcriptText },
            ],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });
        if (!response.ok) {
          let detail = '';
          try { const eb = await response.json(); detail = eb.error?.message || JSON.stringify(eb); } catch { detail = response.statusText; }
          throw new Error(`Groq error (${response.status}): ${detail}`);
        }
        const data = await response.json();
        content = data.choices[0].message.content.trim();
        this.summary = content;
        this.summaryState = 'success';
      } catch (err) {
        console.error('Auto-summary Groq error:', err);
        this.showToast('Summary generation failed, saving without summary');
        return;
      }
    }
    try {
      const saveRes = await this.apiFetch('/summaries', {
        method: 'POST',
        headers: HEADERS_JSON,
        body: JSON.stringify({
          content,
          videoId: this.videoId,
          videoTitle: videoTitle || '',
          fileId: this.selectedFileId,
        }),
      });
      if (!saveRes.ok) await saveRes.text();
    } catch (err) {
      console.error('Auto-summary save error:', err);
    }
  }


  playerBtnId(marker) { return `yt-study-${marker}`; }

  injectPlayerStyles() {
    if (document.getElementById('yt-study-styles')) return;
    const style = document.createElement('style');
    style.id = 'yt-study-styles';
    style.textContent = `
      .ytp-study-btn {
        background: none !important;
        border: none !important;
        cursor: pointer !important;
        width: 48px !important;
        height: 48px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        opacity: 0.85 !important;
        color: #fff !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }
      .ytp-study-btn:hover { opacity: 1 !important; }
      .ytp-study-btn svg { pointer-events: none; display: block; }
    `;
    document.head.appendChild(style);
  }

  injectPlayerButtons() {
    if (document.getElementById(this.playerBtnId('ss'))) return;
    const rightControls = document.querySelector('.ytp-right-controls');
    if (!rightControls) {
      setTimeout(() => this.injectPlayerButtons(), 400);
      return;
    }
    const settingsBtn = rightControls.querySelector('.ytp-settings-button');
    const insertRef = settingsBtn || rightControls.firstChild;
    const ssBtn = document.createElement('button');
    ssBtn.id = this.playerBtnId('ss');
    ssBtn.className = 'ytp-study-btn';
    ssBtn.title = 'Save Screenshot';
    ssBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>`;
    ssBtn.addEventListener('click', (e) => { e.stopPropagation(); this.handleScreenshot(); });
    rightControls.insertBefore(ssBtn, insertRef);
    const cmtBtn = document.createElement('button');
    cmtBtn.id = this.playerBtnId('comment');
    cmtBtn.className = 'ytp-study-btn';
    cmtBtn.title = 'Add Comment';
    cmtBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`;
    cmtBtn.addEventListener('click', (e) => { e.stopPropagation(); this.handleComment(); });
    rightControls.insertBefore(cmtBtn, insertRef);
  }

  removePlayerButtons() {
    [this.playerBtnId('ss'), this.playerBtnId('comment')].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  observePlayer() {
    if (this._playerObserver) this._playerObserver.disconnect();
    const target = document.querySelector('#movie_player') || document.querySelector('#player-container') || document.querySelector('.html5-video-player');
    if (!target) {
      setTimeout(() => this.observePlayer(), 500);
      return;
    }
    this._playerObserver = new MutationObserver(() => {
      if (!document.getElementById(this.playerBtnId('ss'))) {
        this.injectPlayerButtons();
      }
    });
    this._playerObserver.observe(target, { childList: true, subtree: true });
    this.injectPlayerButtons();
  }


  overlaysHtml() {
    if (this.showLoginForm) return this.loginFormHtml();
    if (this.showFileSelector) return this.fileSelectorHtml();
    if (this.showCommentInput) return this.commentInputHtml();
    return '';
  }
}

new TranscriptSidebar();
