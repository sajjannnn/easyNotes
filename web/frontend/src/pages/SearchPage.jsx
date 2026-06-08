import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import { Search, FileText, Folder, MessageSquare, FileSymlink, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const groupLabels = {
  files: { icon: FileText, label: 'Files', color: 'text-blue-400' },
  folders: { icon: Folder, label: 'Folders', color: 'text-amber-400' },
  comments: { icon: MessageSquare, label: 'Comments', color: 'text-purple-400' },
  summaries: { icon: FileSymlink, label: 'Summaries', color: 'text-cyan-400' },
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await client.get('/search', { params: { q: query } });
        setResults(data);
      } catch {
        setError('Search failed');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="w-full lg:max-w-4xl lg:mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Search className="h-5 w-5 text-indigo-400" />
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        {query && !loading && results && (
          <p className="text-sm text-gray-400 mt-1">
            {Object.values(results).flat().length} result{Object.values(results).flat().length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {!loading && !error && (!query || (results && Object.values(results).flat().length === 0)) && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">{query ? 'No results found' : 'Type a query to search'}</p>
        </div>
      )}

      {!loading && results && (
        <div className="space-y-8">
          {Object.entries(groupLabels).map(([key, { icon: Icon, label, color }]) => {
            const items = results[key];
            if (!items || items.length === 0) return null;
            return (
              <div key={key}>
                <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  {label}
                  <span className="text-gray-500 font-normal">({items.length})</span>
                </h2>
                <div className="space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item._id || item.id}
                      to={key === 'folders' ? `/file/${item._id || item.id}` : key === 'files' ? `/file/${item._id || item.id}` : `/file/${item.fileId || item.file?._id || item.file}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`h-4 w-4 ${color} shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-200 group-hover:text-white transition-colors truncate">
                            {item.name || item.text || item.title || 'Untitled'}
                          </p>
                          {item.folderPath && (
                            <p className="text-xs text-gray-500 truncate">{item.folderPath}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">
                        {formatDistanceToNow(new Date(item.updatedAt || item.createdAt), { addSuffix: true })}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
