import { state } from '../state.js';
import { escapeHtml } from '../utils.js';

export function commentInputHtml() {

  return `
    <div class="overlay-backdrop">
      <div class="overlay-panel">
        <div class="overlay-title">Add Comment</div>
        <textarea class="overlay-textarea" data-action="commentText" placeholder="Type your comment…">${escapeHtml(state.commentText)}</textarea>
        <div class="overlay-actions">
          <button class="btn-secondary" data-action="cancelComment">Cancel</button>
          <button class="btn-primary" data-action="saveComment" ${state.commentSaving || !state.commentText.trim() ? 'disabled' : ''}>
            ${state.commentSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  `;
}
