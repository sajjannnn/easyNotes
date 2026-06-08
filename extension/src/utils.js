export function qs(selector, ctx = document) {
  return ctx.querySelector(selector);
}

export function qsa(selector, ctx = document) {
  return Array.from(ctx.querySelectorAll(selector));
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
