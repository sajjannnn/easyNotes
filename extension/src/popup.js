const btn = document.getElementById('getTranscript');
const output = document.getElementById('output');
const status = document.getElementById('status');

function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v');
    }
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('/')[0];
    }
    return null;
  } catch {
    return null;
  }
}

btn.addEventListener('click', async () => {
  btn.disabled = true;
  btn.textContent = 'Loading...';
  output.textContent = '';
  status.textContent = 'Fetching transcript...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      throw new Error('No active tab found');
    }

    const videoId = extractVideoId(tab.url);
    if (!videoId) {
      throw new Error('Not a YouTube video page.\nNavigate to a YouTube video and try again.');
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'getTranscript',
      videoId,
    });

    if (!response || !response.success) {
      throw new Error(response?.error || 'Failed to fetch transcript');
    }

    const text = response.transcript.map(item => item.text).join('\n');
    output.textContent = text;
    status.textContent = `Done — ${response.transcript.length} lines`;
  } catch (err) {
    output.textContent = err.message;
    output.className = 'error';
    status.textContent = 'Failed';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Get Transcript';
  }
});
