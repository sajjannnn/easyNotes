const SUMMARY_PROMPT = `You are an expert study assistant.

Analyze the following YouTube transcript and create a concise, well-structured summary.

Return only bullet points.

Requirements:
* Capture the most important ideas.
* Remove repetition.
* Keep the information accurate.
* Use clear language.
* Generate 10-20 bullet points depending on transcript length.`;

export const ID = 'yt-transcript-sidebar';
export const TAB_TRANSCRIPT = 'transcript';
export const TAB_SUMMARY = 'summary';
export const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
export const STORAGE_KEY = 'groqApiKey';
export { SUMMARY_PROMPT };
export const API_BASE = typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:5000/api';
export const AUTH_TOKEN_KEY = 'authJwt';
export const FILE_SEL_KEY = 'selectedFiles';
export const HEADERS_JSON = { 'Content-Type': 'application/json' };
export const MIN_TRANSCRIPT_LEN = 20;
