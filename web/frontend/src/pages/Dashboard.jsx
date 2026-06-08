import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import StatsCard from '../components/StatsCard';
import ActivityFeed from '../components/ActivityFeed';
import EmptyState from '../components/EmptyState';
import { FileText, Folder, Camera, MessageSquare, FileSymlink, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes, filesRes] = await Promise.all([
          client.get('/dashboard/stats').catch(() => ({ data: {} })),
          client.get('/dashboard/recent').catch(() => ({ data: [] })),
          client.get('/dashboard/recent-files').catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data?.stats || statsRes.data);
        const recentData = recentRes.data?.items || recentRes.data;
        setRecent(Array.isArray(recentData) ? recentData : []);
        const recentFilesData = filesRes.data?.files || filesRes.data;
        setRecentFiles(Array.isArray(recentFilesData) ? recentFilesData : []);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const statCards = [
    { icon: FileText, label: 'Total Files', value: stats?.totalFiles ?? 0, color: 'text-blue-400' },
    { icon: Folder, label: 'Folders', value: stats?.totalFolders ?? 0, color: 'text-amber-400' },
    { icon: Camera, label: 'Screenshots', value: stats?.totalScreenshots ?? 0, color: 'text-green-400' },
    { icon: MessageSquare, label: 'Comments', value: stats?.totalComments ?? 0, color: 'text-purple-400' },
    { icon: FileSymlink, label: 'Summaries', value: stats?.totalSummaries ?? 0, color: 'text-cyan-400' },
  ];

  return (
    <div className="w-full lg:max-w-5xl lg:mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-gray-400 text-sm mt-1">Here's your study overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            Recent Files
          </h2>
          {recentFiles.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No files yet"
              description="Start by creating a file or folder"
            />
          ) : (
            <div className="space-y-2">
              {recentFiles.map((file) => (
                <Link
                  key={file._id || file.id}
                  to={`/file/${file._id || file.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 group-hover:text-white transition-colors truncate">{file.name}</p>
                      {file.folderPath && (
                        <p className="text-xs text-gray-500 truncate">{file.folderPath}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">
                    {formatDistanceToNow(new Date(file.updatedAt || file.createdAt), { addSuffix: true })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            Recent Activity
          </h2>
          {recent.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No activity yet"
              description="Your recent activity will appear here"
            />
          ) : (
            <ActivityFeed items={recent} />
          )}
        </div>
      </div>
    </div>
  );
}
