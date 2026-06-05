import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Settings, FolderPlus, BookOpen, PanelLeftClose, PanelLeft } from 'lucide-react';
import client from '../api/client';
import FolderExplorer from './FolderExplorer';

const navLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ open, onToggle }) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFilePage = location.pathname.startsWith('/files/');

  const fetchTree = async () => {
    setLoading(true);
    try {
      const folderRes = await client.get('/folders');
      const rawFolders = folderRes.data?.folders || folderRes.data || [];
      const flatFolders = Array.isArray(rawFolders) ? rawFolders : [];

      const map = {};
      const roots = [];
      flatFolders.forEach(f => { const id = f._id || f.id; map[id] = { ...f, children: [] }; });
      flatFolders.forEach(f => {
        const id = f._id || f.id;
        const p = f.parentId;
        if (p && map[p]) map[p].children.push(map[id]);
        else if (!p) roots.push(map[id]);
      });

      let files = [];
      try {
        const filesRes = await client.get('/files');
        const rawFiles = filesRes.data?.files || filesRes.data || [];
        files = Array.isArray(rawFiles) ? rawFiles : [];
      } catch (e) {
        console.warn('Files fetch failed, showing folders only', e);
      }

      if (files.length > 0) {
        const allMap = { ...map };
        const crawl = items => { items.forEach(n => { allMap[n._id || n.id] = n; if (n.children) crawl(n.children); }); };
        crawl(roots);
        files.forEach(f => {
          const pid = f.folderId;
          const p = pid && allMap[pid];
          const target = p ? p.children : roots;
          if (target) target.push({ ...f, type: 'file' });
        });
      }

      setNodes(roots);
    } catch (err) {
      console.error('Sidebar error:', err);
      setNodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTree(); }, []);

  const handleNewRootFolder = async () => {
    const name = prompt('Folder name:');
    if (!name?.trim()) return;
    try {
      await client.post('/folders', { name: name.trim() });
      fetchTree();
    } catch (err) {
      console.error('Failed to create folder', err);
    }
  };

  return (
    <aside
      className={`${
        open ? 'w-64' : 'w-14'
      } bg-gray-950 border-r border-gray-800 flex flex-col shrink-0 h-screen transition-[width] duration-300 overflow-hidden print:hidden`}
    >
      {open ? (
        <>
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="h-6 w-6 text-indigo-400 shrink-0" />
              <span className="font-bold text-lg text-white truncate">StudyHub</span>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-200 transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <nav className="p-2 space-y-0.5 shrink-0">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center justify-between px-4 py-2 mt-2 shrink-0">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Files</span>
            <button
              onClick={handleNewRootFolder}
              className="text-gray-400 hover:text-indigo-400 transition-colors"
              title="New Folder"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-indigo-500" />
              </div>
            ) : nodes.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-4">No files yet</p>
            ) : (
              <FolderExplorer folders={nodes} onRefresh={fetchTree} level={0} />
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center pt-3 gap-3">
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            title="Expand sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`
              }
              title={label}
            >
              <Icon className="h-5 w-5" />
            </NavLink>
          ))}
        </div>
      )}
    </aside>
  );
}
