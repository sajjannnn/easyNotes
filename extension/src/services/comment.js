import { state } from '../state.js';
import { HEADERS_JSON } from '../constants.js';
import { apiFetch } from '../api.js';
import { render } from '../components/sidebar.js';
import { showToast } from '../components/toast.js';
import { ensureAuthenticated } from './auth.js';
import { ensureFileSelected } from './files.js';
import { ensureSummary } from './ensureSummary.js';

export async function handleComment() {
  const authed = await ensureAuthenticated();
  if (!authed) return;
  const fileOk = await ensureFileSelected();
  if (!fileOk) return;
  state.showCommentInput = true;
  state.commentText = '';
  state.commentSaving = false;
  render();
}

export async function saveComment() {
  if (!state.commentText.trim()) return;
  state.commentSaving = true;
  render();
  try {
    const video = document.querySelector('video');
    const timestamp = video ? Math.floor(video.currentTime) : 0;
    const videoTitle = document.title.replace(' - YouTube', '');
    const youtubeUrl = `https://youtube.com/watch?v=${state.videoId}&t=${timestamp}`;
    await ensureSummary(videoTitle, timestamp);
    const res = await apiFetch('/comments', {
      method: 'POST',
      headers: HEADERS_JSON,
      body: JSON.stringify({
        text: state.commentText.trim(),
        videoId: state.videoId,
        videoTitle,
        timestamp,
        youtubeUrl,
        fileId: state.selectedFileId,
      }),
    });
    if (!res.ok) {
      let msg = 'Failed to save comment';
      try { const d = await res.json(); msg = d.error || msg; } catch {}
      throw new Error(msg);
    }
    state.showCommentInput = false;
    state.commentText = '';
    showToast('Comment saved!');
  } catch (err) {
    showToast(err.message || 'Failed to save comment');
  }
  state.commentSaving = false;
  render();
}
