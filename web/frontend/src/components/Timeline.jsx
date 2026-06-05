import { useState, useEffect, useCallback } from 'react';
import { Clock, FileText, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState';
import client from '../api/client';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}>
        {message}
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="text-base font-semibold text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-5">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-1.5 text-sm text-gray-300 hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

const cardStyles = `
  relative rounded-xl border border-gray-800 bg-gray-900/50
  transition-all duration-200
  hover:border-indigo-500/30 hover:bg-gray-900 hover:shadow-lg hover:shadow-indigo-500/5
  cursor-pointer overflow-hidden print:overflow-visible
`;

export default function Timeline({ items = [], onItemDeleted }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { id, type } = confirmDelete;
    setDeletingId(id);
    try {
      const endpoint = type === 'screenshot' ? `/screenshots/${id}` : `/comments/${id}`;
      await client.delete(endpoint);
      if (onItemDeleted) onItemDeleted(id);
      showToast(type === 'screenshot' ? 'Screenshot deleted' : 'Comment deleted');
      setConfirmDelete(null);
    } catch {
      showToast('Failed to delete', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No content yet"
        description="Screenshots, comments, and summaries will appear here"
      />
    );
  }

  return (
    <div className="space-y-5">
      {items.map((item, idx) => {
        const timestamp = item.timestamp || item.videoTimestamp || 0;
        const videoId = item.videoId || item.video?.id || '';
        const videoTitle = item.videoTitle || item.video?.title || 'Untitled';
        const youtubeUrl = videoId
          ? `https://www.youtube.com/watch?v=${videoId}${timestamp ? `&t=${Math.floor(timestamp)}` : ''}`
          : '#';
        const timeStr = timestamp > 0 ? formatTime(timestamp) : null;
        const isDeleting = deletingId === item.id;

        if (item.type === 'screenshot') {
          return (
            <div
              key={item._id || item.id || idx}
              className={`${cardStyles} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt="Screenshot"
                    className="w-full max-h-[75vh] object-contain bg-gray-950 print:max-h-none"
                    loading="lazy"
                  />
                )}
                {timeStr && (
                  <div className="flex items-center gap-1.5 px-5 py-3 text-xs text-gray-400 border-t border-gray-800/50">
                    <Clock className="h-3 w-3" />
                    {timeStr}
                  </div>
                )}
              </a>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: item.id, type: 'screenshot' }); }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-900/80 border border-gray-700/50 text-gray-500 hover:text-red-400 hover:border-red-500/40 transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Delete screenshot"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        }

        if (item.type === 'comment') {
          return (
            <div
              key={item._id || item.id || idx}
              className={`${cardStyles} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5"
              >
                {item.text && (
                  <p className="text-sm text-gray-200 leading-relaxed mb-3">{item.text}</p>
                )}
                {timeStr && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {timeStr}
                  </div>
                )}
              </a>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: item.id, type: 'comment' }); }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-900/80 border border-gray-700/50 text-gray-500 hover:text-red-400 hover:border-red-500/40 transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Delete comment"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        }

        if (item.type === 'summary') {
          return (
            <a
              key={item._id || item.id || idx}
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${cardStyles} p-5 block`}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-sm font-medium text-gray-100">{videoTitle}</span>
              </div>
              {item.content && (
                <ul className="space-y-1.5">
                  {item.content.split('\n').filter(Boolean).map((point, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-indigo-400 mt-1 shrink-0">•</span>
                      {point.replace(/^[-•*]\s*/, '')}
                    </li>
                  ))}
                </ul>
              )}
            </a>
          );
        }

        return null;
      })}

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete this ${confirmDelete.type}?`}
          message={`This action cannot be undone.${confirmDelete.type === 'screenshot' ? ' The image will also be removed from storage.' : ''}`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
          loading={deletingId === confirmDelete.id}
        />
      )}

      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
