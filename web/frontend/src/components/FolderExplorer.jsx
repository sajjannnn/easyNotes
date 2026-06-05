import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, MoreHorizontal, Pencil, Trash2, Plus, FolderPlus } from 'lucide-react';
import client from '../api/client';

export default function FolderExplorer({ folders, onRefresh, level = 0 }) {
  if (!folders || folders.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {folders.map((item) => (
        <Item key={item._id || item.id} item={item} onRefresh={onRefresh} level={level} />
      ))}
    </div>
  );
}

function Item({ item, onRefresh, level }) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isFile = item.type === 'file';
  const hasChildren = !isFile && Array.isArray(item.children) && item.children.length > 0;
  const endpoint = isFile ? '/files' : '/folders';

  const doRename = async () => {
    setMenuOpen(false);
    const name = prompt('New name:', item.name);
    if (!name?.trim() || name.trim() === item.name) return;
    try {
      await client.patch(`${endpoint}/${item._id || item.id}`, { name: name.trim() });
      onRefresh();
    } catch (err) {
      console.error('Rename failed', err);
    }
  };

  const doDelete = async () => {
    setMenuOpen(false);
    if (!confirm(`Delete "${item.name}"${isFile ? '' : ' and all contents'}?`)) return;
    try {
      await client.delete(`${endpoint}/${item._id || item.id}`);
      onRefresh();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const doNewFolder = async () => {
    setMenuOpen(false);
    const name = prompt('Folder name:');
    if (!name?.trim()) return;
    try {
      await client.post('/folders', { name: name.trim(), parentId: item._id || item.id });
      setExpanded(true);
      onRefresh();
    } catch (err) {
      console.error('Create folder failed', err);
    }
  };

  const doNewFile = async () => {
    setMenuOpen(false);
    const name = prompt('File name:');
    if (!name?.trim()) return;
    try {
      await client.post('/files', { name: name.trim(), folderId: item._id || item.id });
      setExpanded(true);
      onRefresh();
    } catch (err) {
      console.error('Create file failed', err);
    }
  };

  return (
    <div>
      <div
        className="group flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-200 text-sm"
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className={`p-0.5 rounded transition-colors ${hasChildren ? 'text-gray-400 hover:text-gray-200' : 'text-transparent cursor-default'}`}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 opacity-0" />
          )}
        </button>

        {isFile ? (
          <>
            <span className="text-gray-400 shrink-0">
              <FileText className="h-4 w-4" />
            </span>
            <button
              onClick={() => navigate(`/file/${item._id || item.id}`)}
              className="flex-1 text-left text-gray-300 hover:text-white transition-colors truncate"
            >
              {item.name}
            </button>
          </>
        ) : (
          <>
            <span className="text-gray-400 shrink-0">
              {expanded ? (
                <FolderOpen className="h-4 w-4 text-indigo-400" />
              ) : (
                <Folder className="h-4 w-4 text-amber-400" />
              )}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-1 text-left text-gray-300 hover:text-white transition-colors truncate"
            >
              {item.name}
            </button>
          </>
        )}

        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-gray-400 hover:text-gray-200 rounded transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1">
                {!isFile && (
                  <>
                    <button onClick={doNewFolder} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 w-full text-left transition-colors">
                      <FolderPlus className="h-3.5 w-3.5" /> New Folder
                    </button>
                    <button onClick={doNewFile} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 w-full text-left transition-colors">
                      <Plus className="h-3.5 w-3.5" /> New File
                    </button>
                    <div className="border-t border-gray-700 my-1" />
                  </>
                )}
                <button onClick={doRename} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 w-full text-left transition-colors">
                  <Pencil className="h-3.5 w-3.5" /> Rename
                </button>
                <button onClick={doDelete} className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-gray-700 w-full text-left transition-colors">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="animate-[fadeIn_150ms_ease-out]">
          <FolderExplorer folders={item.children} onRefresh={onRefresh} level={level + 1} />
        </div>
      )}
    </div>
  );
}
