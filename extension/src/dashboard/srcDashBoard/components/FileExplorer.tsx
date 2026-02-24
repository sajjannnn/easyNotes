import { useState, useEffect } from "react";
import {
  FolderOpen,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  ChevronsRightIcon,
  ChevronsLeftIcon,
  Plus,
  FolderPlus
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  getAllFolders,
  getAllFiles,
  createFile,
  createFolder,
  setActiveFile
} from "../../../utilis/db";
import { nowOpenNoteId } from "../utilis/notesSlice";

interface FileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
}

const FileExplorer = () => {
  const dispatch = useDispatch();

  const [tree, setTree] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeFile, setActiveFileState] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // 🔥 Build Tree from DB
  const loadTree = async () => {
    const folders = await getAllFolders();
    const files = await getAllFiles();

    const folderNodes: FileNode[] = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      type: "folder" as const,
      children: files
        .filter(file => file.folderId === folder.id)
        .map(file => ({
          id: file.id,
          name: file.name,
          type: "file" as const
        }))
    }));

    const rootFiles: FileNode[] = files
      .filter(file => !file.folderId)
      .map(file => ({
        id: file.id,
        name: file.name,
        type: "file" as const
      }));

    setTree([...folderNodes, ...rootFiles]);
  };

  useEffect(() => {
    loadTree();
  }, []);

  // Toggle expand
  const toggleFolder = (id: string) => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // Create Folder
  const handleCreateFolder = async () => {
    const name = prompt("Folder name?");
    if (!name) return;

    await createFolder(name);
    await loadTree();
  };

  // Create File
  const handleCreateFile = async () => {
    const name = prompt("File name?");
    if (!name) return;

    const fileId = await createFile(name, selectedFolder);
    await setActiveFile(fileId);
    dispatch(nowOpenNoteId(fileId));
    setActiveFileState(fileId);

    await loadTree();
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expanded.has(node.id);
    const isActive = activeFile === node.id;

    return (
      <div key={node.id}>
        <button
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.id);
              setSelectedFolder(node.id);
            } else {
              setActiveFileState(node.id);
              dispatch(nowOpenNoteId(node.id));
              setActiveFile(node.id);
            }
          }}
          className={`w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded-md group transition
            ${
              isActive
                ? "bg-purple-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }
          `}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {node.type === "folder" ? (
            <>
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              {isExpanded ? (
                <FolderOpen size={16} />
              ) : (
                <Folder size={16} />
              )}
            </>
          ) : (
            <>
              <span className="w-4" />
              <FileText size={16} />
            </>
          )}

          <span className="truncate">{node.name}</span>

          <MoreHorizontal
            size={14}
            className="ml-auto opacity-0 group-hover:opacity-100"
          />
        </button>

        {node.type === "folder" &&
          isExpanded &&
          node.children &&
          node.children.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <aside className="w-64 border-r bg-white flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-xs font-semibold uppercase text-gray-500">
          Explorer
        </span>

        <div className="flex gap-1">
          <button onClick={handleCreateFile} title="New File">
            <Plus size={16} />
          </button>

          <button onClick={handleCreateFolder} title="New Folder">
            <FolderPlus size={16} />
          </button>

          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <ChevronsLeftIcon size={16} />
            ) : (
              <ChevronsRightIcon size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {tree.map(node => renderNode(node))}
      </div>
    </aside>
  );
};

export default FileExplorer;