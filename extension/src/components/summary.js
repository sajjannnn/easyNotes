import { state } from '../state.js';
import { escapeHtml } from '../utils.js';

export function summaryBody() {
  if (state.summaryState === 'success') return summaryView();

  if (!state.apiKeyExists) {
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

  if (state.status !== 'success' || !state.transcript) {
    return `
      <div class="section warning-state">
        <div class="icon">📄</div>
        <p>No transcript available. Generate a transcript first.</p>
        <button class="btn-primary" data-action="switchTab" data-tab="transcript" style="margin-top:8px">
          Go to Transcript
        </button>
      </div>
    `;
  }

  switch (state.summaryState) {
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
          <div class="msg">${state.summaryError}</div>
          <button class="btn-primary" data-action="generateSummary">Retry</button>
        </div>
      `;
    default:
      return '';
  }
}

function summaryView() {
  const lines = state.summary.split('\n').filter(l => l.trim());

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
