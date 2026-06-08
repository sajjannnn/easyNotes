import { state } from './state.js';
import { render } from './components/sidebar.js';
import { fetchTranscript, copyTranscript, toggleAutoScroll, seekVideo } from './services/transcript.js';
import { generateSummary, copySummary } from './services/summary.js';
import { handleSaveKey, handleDeleteKey } from './services/settings.js';
import { handleLogin } from './services/auth.js';
import { selectExistingFile, createNewFile, loadFolders } from './services/files.js';
import { handleScreenshot } from './services/screenshot.js';
import { handleComment, saveComment } from './services/comment.js';

export function bindEvents() {
  if (!state.shadow) return;
  state.shadow.addEventListener('click', onClick);
  state.shadow.addEventListener('input', onInput);
  state.shadow.addEventListener('keydown', (e) => {
    if (e.target.closest('[data-action="commentText"], [data-action="loginEmail"], [data-action="loginPassword"]')) {
      e.stopPropagation();
    }
  });
}

function onClick(e) {
  try {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    switch (action) {
      case 'fetch':
        fetchTranscript();
        break;
      case 'refresh':
        state.transcript = null;
        fetchTranscript();
        break;
      case 'copy':
        copyTranscript();
        break;
      case 'autoscroll':
        toggleAutoScroll();
        break;
      case 'seek':
        seekVideo(parseFloat(btn.dataset.seek));
        break;
      case 'switchTab':
        state.activeTab = btn.dataset.tab;
        render();
        break;
      case 'toggleSettings':
        state.showSettings = !state.showSettings;
        if (state.showSettings) state.apiKeyInputValue = '';
        render();
        break;
      case 'closeSettings':
        state.showSettings = false;
        render();
        break;
      case 'saveApiKey':
        handleSaveKey();
        break;
      case 'deleteApiKey':
        handleDeleteKey();
        break;
      case 'generateSummary':
        generateSummary();
        break;
      case 'copySummary':
        copySummary();
        break;
      case 'screenshot':
        handleScreenshot();
        break;
      case 'comment':
        handleComment();
        break;
      case 'openGroqKeys':
        window.open('https://console.groq.com/keys', '_blank');
        break;
      case 'doLogin':
        handleLogin();
        break;
      case 'openRegister':
        window.open('http://localhost:5173/register', '_blank');
        break;
      case 'pickFile':
        selectExistingFile(btn.dataset.fileid);
        break;
      case 'createFile':
        createNewFile();
        break;
      case 'retryLoadFolders':
        loadFolders();
        render();
        break;
      case 'cancelComment':
        state.showCommentInput = false;
        state.commentText = '';
        render();
        break;
      case 'saveComment':
        saveComment();
        break;
    }
  } catch (err) { console.error('onClick error:', err); }
}

function onInput(e) {
  const input = e.target.closest('[data-action]');
  if (!input) return;
  const action = input.dataset.action;

  switch (action) {
    case 'search':
      state.searchQuery = input.value;
      render();
      break;
    case 'apiKeyInput':
      state.apiKeyInputValue = input.value;
      break;
    case 'loginEmail':
      state.loginEmail = input.value;
      break;
    case 'loginPassword':
      state.loginPassword = input.value;
      break;
    case 'newFileName':
      state.newFileName = input.value;
      break;
    case 'commentText':
      state.commentText = input.value;
      break;
  }
}
