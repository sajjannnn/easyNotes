import { YoutubeTranscript } from 'youtube-transcript';
import { state } from '../state.js';
import { formatTime } from '../utils.js';
import { render } from '../components/sidebar.js';
import { showToast } from '../components/toast.js';

export async function fetchTranscript() {
  state.status = 'loading';
  state.errorMessage = '';
  render();

  try {
    const data = await YoutubeTranscript.fetchTranscript(state.videoId);
    const maxOff = data.reduce((m, e) => Math.max(m, e.offset), 0);
    const isMs = maxOff > 10000;
    state.transcript = data.map((e, i) => ({
      text: e.text,
      duration: isMs ? e.duration / 1000 : e.duration,
      offset: isMs ? e.offset / 1000 : e.offset,
      lang: e.lang,
      _idx: i,
    }));
    state.status = 'success';
    render();
    setupAutoScroll();
    syncHighlight();
  } catch (err) {
    state.status = 'error';
    state.errorMessage = err.message || 'Failed to load transcript';
    render();
  }
}

export async function copyTranscript() {
  if (!state.transcript) return;
  const text = state.transcript.map(e =>
    `${formatTime(e.offset)}  ${e.text}`
  ).join('\n');
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied!');
  } catch {
    showToast('Failed to copy');
  }
}

export function toggleAutoScroll() {
  state.autoScroll = !state.autoScroll;
  const btn = state.shadow?.querySelector('[data-action="autoscroll"]');
  if (btn) btn.classList.toggle('active');
  if (state.autoScroll) {
    setupAutoScroll();
    syncHighlight();
  } else {
    cleanupAutoScroll();
  }
}

export function seekVideo(seconds) {
  const v = document.querySelector('video');
  if (v) v.currentTime = seconds;
}

export function getTranscriptText() {
  if (!state.transcript) return '';
  return state.transcript.map(e => e.text).join(' ');
}

function setupAutoScroll() {
  cleanupAutoScroll();
  const v = document.querySelector('video');
  if (!v) return;
  state.timeListener = () => onTimeUpdate(v);
  v.addEventListener('timeupdate', state.timeListener);
}

function cleanupAutoScroll() {
  if (state.timeListener) {
    const v = document.querySelector('video');
    if (v) v.removeEventListener('timeupdate', state.timeListener);
    state.timeListener = null;
  }
}

function onTimeUpdate(video) {
  if (!state.transcript || state.transcript.length === 0) return;
  if (state._pendingTick) return;
  state._pendingTick = true;
  requestAnimationFrame(() => {
    state._pendingTick = false;
    const t = video.currentTime;
    let idx = 0;
    for (let i = 0; i < state.transcript.length; i++) {
      if (t >= state.transcript[i].offset) {
        idx = i;
      } else {
        break;
      }
    }
    if (idx !== state.currentEntryIndex) {
      state.currentEntryIndex = idx;
      syncHighlight();
    }
  });
}

function syncHighlight() {
  const list = state.shadow?.querySelector('[data-el="list"]');
  if (!list) return;
  const entries = list.children;
  const prev = list.querySelector('.active');
  if (prev) prev.classList.remove('active');
  if (state.currentEntryIndex >= 0 && state.currentEntryIndex < entries.length) {
    entries[state.currentEntryIndex].classList.add('active');
    if (state.autoScroll) {
      const el = entries[state.currentEntryIndex];
      list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2;
    }
  }
}

export { cleanupAutoScroll };
