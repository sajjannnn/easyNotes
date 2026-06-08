import { state } from '../state.js';
import { styles } from './styles.js';
import { transcriptBody } from './transcript.js';
import { summaryBody } from './summary.js';
import { settingsContent } from './settings.js';
import { loginFormHtml } from './auth.js';
import { fileSelectorHtml } from './fileSelector.js';
import { commentInputHtml } from './comment.js';

export function render() {
  if (!state.shadow) return;
  state.shadow.innerHTML = `
    <style>${styles}</style>
    <div class="sidebar" role="region" aria-label="Transcript sidebar">
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
      <div class="tabs">
        <button class="tab${state.activeTab === 'transcript' ? ' active' : ''}"
                data-action="switchTab" data-tab="transcript">Transcript</button>
        <button class="tab${state.activeTab === 'summary' ? ' active' : ''}"
                data-action="switchTab" data-tab="summary">Summary</button>
      </div>
      <div class="body">
        ${state.activeTab === 'transcript' ? transcriptBody() : summaryBody()}
      </div>
    </div>
    <div class="settings-backdrop${state.showSettings ? ' visible' : ''}" data-action="closeSettings"></div>
    <div class="settings-dropdown${state.showSettings ? ' visible' : ''}">
      ${settingsContent()}
    </div>
    ${overlaysHtml()}
  `;
}

function overlaysHtml() {
  if (state.showLoginForm) return loginFormHtml();
  if (state.showFileSelector) return fileSelectorHtml();
  if (state.showCommentInput) return commentInputHtml();
  return '';
}
