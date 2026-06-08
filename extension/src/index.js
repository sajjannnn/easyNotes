import { state, resetForNewVideo } from './state.js';
import { ID } from './constants.js';
import { qs } from './utils.js';
import { render } from './components/sidebar.js';
import { injectPlayerStyles, injectPlayerButtons, removePlayerButtons, observePlayer } from './components/player.js';
import { fetchTranscript, cleanupAutoScroll } from './services/transcript.js';
import { loadApiKey } from './services/settings.js';
import { bindEvents } from './events.js';

function onNavigate() {
  if (!location.pathname.startsWith('/watch')) {
    destroy();
    removePlayerButtons();
    if (state._playerObserver) state._playerObserver.disconnect();
    return;
  }

  const id = new URLSearchParams(location.search).get('v');
  if (!id) {
    destroy();
    removePlayerButtons();
    if (state._playerObserver) state._playerObserver.disconnect();
    return;
  }

  if (id !== state.videoId) {
    state.videoId = id;
    resetForNewVideo();
    waitForReady().then(() => inject());
  }
}

function waitForReady() {
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

function destroy() {
  cleanupAutoScroll();
  if (state.root && state.root.parentNode) {
    state.root.remove();
  }
  state.root = null;
  state.shadow = null;
}

async function inject() {
  destroy();

  const parent = qs('#secondary');
  if (!parent) return;

  await loadApiKey();

  state.root = document.createElement('div');
  state.root.id = ID;
  state.shadow = state.root.attachShadow({ mode: 'open' });

  render();
  bindEvents();
  parent.insertBefore(state.root, parent.firstChild);

  injectPlayerStyles();
  injectPlayerButtons();
  observePlayer();

  if (state.status === 'empty') {
    fetchTranscript();
  }
}

document.addEventListener('yt-navigate-finish', onNavigate);
window.addEventListener('popstate', onNavigate);

if (document.readyState === 'complete') {
  onNavigate();
} else {
  window.addEventListener('load', onNavigate);
}
