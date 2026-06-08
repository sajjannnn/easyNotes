import { state } from '../state.js';
import { handleScreenshot } from '../services/screenshot.js';
import { handleComment } from '../services/comment.js';

function playerBtnId(marker) { return `yt-study-${marker}`; }

export function injectPlayerStyles() {
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

export function injectPlayerButtons() {
  if (document.getElementById(playerBtnId('ss'))) return;
  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls) {
    setTimeout(() => injectPlayerButtons(), 400);
    return;
  }
  const settingsBtn = rightControls.querySelector('.ytp-settings-button');
  const insertRef = settingsBtn || rightControls.firstChild;
  const ssBtn = document.createElement('button');
  ssBtn.id = playerBtnId('ss');
  ssBtn.className = 'ytp-study-btn';
  ssBtn.title = 'Save Screenshot';
  ssBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>`;
  ssBtn.addEventListener('click', (e) => { e.stopPropagation(); handleScreenshot(); });
  rightControls.insertBefore(ssBtn, insertRef);
  const cmtBtn = document.createElement('button');
  cmtBtn.id = playerBtnId('comment');
  cmtBtn.className = 'ytp-study-btn';
  cmtBtn.title = 'Add Comment';
  cmtBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>`;
  cmtBtn.addEventListener('click', (e) => { e.stopPropagation(); handleComment(); });
  rightControls.insertBefore(cmtBtn, insertRef);
}

export function removePlayerButtons() {
  ['ss', 'comment'].forEach(marker => {
    const el = document.getElementById(playerBtnId(marker));
    if (el) el.remove();
  });
}

export function observePlayer() {
  if (state._playerObserver) state._playerObserver.disconnect();
  const target = document.querySelector('#movie_player') || document.querySelector('#player-container') || document.querySelector('.html5-video-player');
  if (!target) {
    setTimeout(() => observePlayer(), 500);
    return;
  }
  state._playerObserver = new MutationObserver(() => {
    if (!document.getElementById(playerBtnId('ss'))) {
      injectPlayerButtons();
    }
  });
  state._playerObserver.observe(target, { childList: true, subtree: true });
  injectPlayerButtons();
}
