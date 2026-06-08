import { state } from '../state.js';
import { GROQ_ENDPOINT, GROQ_MODEL, SUMMARY_PROMPT, MIN_TRANSCRIPT_LEN, HEADERS_JSON } from '../constants.js';
import { apiFetch } from '../api.js';
import { showToast } from '../components/toast.js';
import { fetchTranscript, getTranscriptText } from './transcript.js';

export async function ensureSummary(videoTitle, timestamp) {
  const checkRes = await apiFetch(`/summaries/video/${state.videoId}`);
  if (checkRes.ok) return;
  if (checkRes.status !== 404) return;

  let content = '';
  if (state.summaryState === 'success' && state.summary) {
    content = state.summary;
  } else {
    if (!state.apiKeyExists) { showToast('No Groq key - summary skipped'); return; }
    if (!state.transcript || state.status !== 'success') {
      await fetchTranscript();
    }
    if (!state.transcript || state.transcript.length < MIN_TRANSCRIPT_LEN) {
      showToast('Transcript too short for summary');
      return;
    }
    showToast('Generating summary…');
    const transcriptText = getTranscriptText();
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: SUMMARY_PROMPT },
            { role: 'user', content: transcriptText },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });
      if (!response.ok) {
        let detail = '';
        try { const eb = await response.json(); detail = eb.error?.message || JSON.stringify(eb); } catch { detail = response.statusText; }
        throw new Error(`Groq error (${response.status}): ${detail}`);
      }
      const data = await response.json();
      content = data.choices[0].message.content.trim();
      state.summary = content;
      state.summaryState = 'success';
    } catch (err) {
      console.error('Auto-summary Groq error:', err);
      showToast('Summary generation failed, saving without summary');
      return;
    }
  }

  try {
    const saveRes = await apiFetch('/summaries', {
      method: 'POST',
      headers: HEADERS_JSON,
      body: JSON.stringify({
        content,
        videoId: state.videoId,
        videoTitle: videoTitle || '',
        fileId: state.selectedFileId,
      }),
    });
    if (!saveRes.ok) await saveRes.text();
  } catch (err) {
    console.error('Auto-summary save error:', err);
  }
}
