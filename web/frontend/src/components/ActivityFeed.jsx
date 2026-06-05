import { Link } from 'react-router-dom';
import { Image, MessageSquare, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeIcons = {
  screenshot: { icon: Image, color: 'text-green-400', bg: 'bg-green-500/10' },
  comment: { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  summary: { icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

export default function ActivityFeed({ items = [] }) {
  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const config = typeIcons[item.type] || typeIcons.comment;
        const Icon = config.icon;
        const fileId = item.fileId || item.file?._id || item.file;

        return (
          <div key={item._id || item.id || idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
            <div className={`p-1.5 rounded-lg ${config.bg} shrink-0 mt-0.5`}>
              <Icon className={`h-3.5 w-3.5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium uppercase ${config.color}`}>{item.type}</span>
                <span className="text-xs text-gray-500">·</span>
                {fileId ? (
                  <Link to={`/file/${fileId}`} className="text-sm text-gray-200 hover:text-indigo-400 transition-colors truncate block">
                    {item.videoTitle || item.video?.title || 'Untitled'}
                  </Link>
                ) : (
                  <span className="text-sm text-gray-200 truncate block">
                    {item.videoTitle || item.video?.title || 'Untitled'}
                  </span>
                )}
              </div>
              {item.text && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.text}</p>}
              {item.points && Array.isArray(item.points) && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{item.points[0]}{item.points.length > 1 ? '...' : ''}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
