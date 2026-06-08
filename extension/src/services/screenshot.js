import { state } from '../state.js';
import { API_BASE } from '../constants.js';
import { getAuthToken } from '../api.js';
import { showToast } from '../components/toast.js';
import { ensureAuthenticated } from './auth.js';
import { ensureFileSelected } from './files.js';
import { ensureSummary } from './ensureSummary.js';

export async function handleScreenshot() {
  const authed = await ensureAuthenticated();
  if (!authed) return;
  const fileOk = await ensureFileSelected();
  if (!fileOk) return;
  const video = document.querySelector('video');
  if (!video) { showToast('No video element found'); return; }
  if (video.readyState < 2) { showToast('Video not loaded yet'); return; }
  try {
    const blob = await captureFrame(video);
    const videoTitle = document.title.replace(' - YouTube', '');
    const timestamp = Math.floor(video.currentTime);
    const youtubeUrl = `https://youtube.com/watch?v=${state.videoId}&t=${timestamp}`;
    await ensureSummary(videoTitle, timestamp);
    await uploadScreenshot(blob, videoTitle, timestamp, youtubeUrl);
  } catch (err) {
    showToast('Screenshot failed: ' + (err.message || ''));
  }
}

export async function captureFrame(video) {
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

async function uploadScreenshot(blob, videoTitle, timestamp, youtubeUrl) {
  const fd = new FormData();
  fd.append('image', blob, `ss-${state.videoId}-${Date.now()}.png`);
  fd.append('videoId', state.videoId);
  fd.append('videoTitle', videoTitle);
  fd.append('timestamp', String(timestamp));
  fd.append('youtubeUrl', youtubeUrl);
  fd.append('fileId', state.selectedFileId);
  const token = await getAuthToken();
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
  showToast('Screenshot saved!');
}
