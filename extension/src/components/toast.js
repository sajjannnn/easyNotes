export function showToast(msg, duration = 2000) {
  const existing = document.getElementById('yt-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'yt-toast';
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
    background: '#3ea6ff', color: '#0f0f0f', padding: '8px 20px',
    borderRadius: '20px', fontSize: '14px', fontWeight: '500',
    zIndex: '999999', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'opacity 0.2s',
  });
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 200);
  }, duration);
}
