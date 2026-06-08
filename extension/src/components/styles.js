export const styles = `
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
