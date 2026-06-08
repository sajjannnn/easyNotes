import { state } from '../state.js';
import { GROQ_ENDPOINT, GROQ_MODEL, SUMMARY_PROMPT } from '../constants.js';
import { render } from '../components/sidebar.js';
import { showToast } from '../components/toast.js';

export async function generateSummary() {
  if (!state.apiKeyExists || !state.apiKey) {
    state.summaryState = 'error';
    state.summaryError = 'No API key configured. Add your Groq API key in settings.';
    render();
    return;
  }

  if (!state.transcript || state.status !== 'success') {
    state.summaryState = 'error';
    state.summaryError = 'No transcript available. Please generate a transcript first.';
    render();
    return;
  }

  state.summaryState = 'loading';
  render();

  const transcriptText = state.transcript.map(e => e.text).join(' ');

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
      try {
        const errBody = await response.json();
        detail = errBody.error?.message || JSON.stringify(errBody);
      } catch { detail = response.statusText; }
      throw new Error(`Groq API error (${response.status}): ${detail}`);
    }

    const data = await response.json();
    state.summary = data.choices[0].message.content.trim();
    state.summaryState = 'success';
    render();
  } catch (err) {
    state.summaryState = 'error';
    state.summaryError = err.message || 'Failed to generate summary';
    render();
  }
}

export async function copySummary() {
  if (!state.summary) return;
  try {
    await navigator.clipboard.writeText(state.summary);
    showToast('Copied!');
  } catch {
    showToast('Failed to copy');
  }
}
