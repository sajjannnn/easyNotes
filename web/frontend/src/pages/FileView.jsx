import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import Timeline from '../components/Timeline';
import { FileText, AlertCircle, ArrowLeft, Download } from 'lucide-react';

export default function FileView() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isPrinting, setIsPrinting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [fileRes, timelineRes] = await Promise.all([
          client.get(`/files/${id}`).catch(() => ({ data: null })),
          client.get(`/timeline/file/${id}`).catch(() => ({ data: [] })),
        ]);
        setFile(fileRes.data);
        const rawItems = Array.isArray(timelineRes.data)
          ? timelineRes.data
          : Array.isArray(timelineRes.data?.items)
            ? timelineRes.data.items
            : [];
        setItems(rawItems);
      } catch {
        setError('Failed to load file');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const filteredItems = filter === 'all' ? items : items.filter((item) => item.type === filter.slice(0, -1));
  const timelineItems = isPrinting ? items : filteredItems;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 print:space-y-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="text-gray-400 hover:text-gray-200 transition-colors shrink-0 print:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 print:hidden">
              <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
              {file?.folderPath && (
                <>
                  <span>/</span>
                  <span className="text-gray-400">{file.folderPath}</span>
                </>
              )}
            </div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5 print-file-title">
              <FileText className="h-5 w-5 text-indigo-400 shrink-0 print:hidden" />
              <span className="truncate">{file?.name || 'File'}</span>
            </h1>
          </div>
        </div>
        <button
          onClick={() => {
            setIsPrinting(true);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                window.print();
                setIsPrinting(false);
              });
            });
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all duration-200 shrink-0 print:hidden"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-800 pb-3 print:hidden">
        {['all', 'screenshots', 'comments', 'summaries'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === f
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <Timeline items={timelineItems} onItemDeleted={(id) => setItems((prev) => prev.filter((i) => i.id !== id))} />
    </div>
  );
}
