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
  FolderPlus,
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  getAllFolders,
  getAllFiles,
  createFile,
  createFolder,
  setActiveFile,
  deleteFile,
  deleteFolder,
  renameFile,
  renameFolder,
} from "../../../utilis/db";
import { setActiveFileId } from "../../srcDashBoard/utilis/fileSlice";

interface FileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
}

const FileExplorer = () => {
  const dispatch = useDispatch();

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [tree, setTree] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeFile, setActiveFileState] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // ==========================
  // LOAD TREE
  // ==========================
  const loadTree = async () => {
    const folders = await getAllFolders();
    const files = await getAllFiles();

    const folderNodes: FileNode[] = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      type: "folder",
      children: files
        .filter((file) => file.folderId === folder.id)
        .map((file) => ({
          id: file.id,
          name: file.name,
          type: "file",
        })),
    }));

    const rootFiles: FileNode[] = files
      .filter((file) => !file.folderId)
      .map((file) => ({
        id: file.id,
        name: file.name,
        type: "file",
      }));

    setTree([...folderNodes, ...rootFiles]);
  };

  useEffect(() => {
    loadTree();
  }, []);

  // ==========================
  // TOGGLE FOLDER
  // ==========================
  const toggleFolder = (id: string) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // ==========================
  // CREATE FOLDER
  // ==========================
  const handleCreateFolder = async () => {
    const name = prompt("Folder name?");
    if (!name) return;

    await createFolder(name, selectedFolder);
    await loadTree();
  };

  // ==========================
  // CREATE FILE
  // ==========================
  const handleCreateFile = async () => {
    const name = prompt("File name?");
    if (!name) return;

    const fileId = await createFile(name, selectedFolder);

    await setActiveFile(fileId);
    dispatch(setActiveFileId(fileId));
    setActiveFileState(fileId);

    await loadTree();
  };

  // ==========================
  // DELETE
  // ==========================
  const handleDelete = async (node: FileNode) => {
    if (!confirm("Delete this?")) return;

    if (node.type === "file") {
      await deleteFile(node.id);
    } else {
      await deleteFolder(node.id);
    }

    setMenuOpen(null);
    await loadTree();
  };

  // ==========================
  // RENAME
  // ==========================
  const handleRename = async (node: FileNode) => {
    const newName = prompt("New name?", node.name);
    if (!newName) return;

    if (node.type === "file") {
      await renameFile(node.id, newName);
    } else {
      await renameFolder(node.id, newName);
    }

    setMenuOpen(null);
    await loadTree();
  };

  // ==========================
  // RENDER NODE
  // ==========================
  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expanded.has(node.id);
    const isActive = activeFile === node.id;

    return (
      <div
        key={node.id}
        className="relative group"
        onMouseLeave={() => setMenuOpen(null)}
      >
        <button
          onClick={async () => {
            if (node.type === "folder") {
              toggleFolder(node.id);
              setSelectedFolder(node.id);
            } else {
              setActiveFileState(node.id);
              dispatch(setActiveFileId(node.id));
              await setActiveFile(node.id);
            }
          }}
          className={`w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded-md transition
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
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
            </>
          ) : (
            <>
              <span className="w-4" />
              <FileText size={16} />
            </>
          )}

          <span className="truncate">{node.name}</span>

          {/* 3 DOT ICON */}
          <MoreHorizontal
            size={14}
            className="ml-auto opacity-0 group-hover:opacity-100 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(menuOpen === node.id ? null : node.id);
            }}
          />
        </button>

        {/* DROPDOWN */}
        {menuOpen === node.id && (
          <div className="absolute right-2 top-8 bg-white shadow-lg border rounded text-sm z-[999] w-28">
            <button
              className="block px-3 py-2 hover:bg-gray-100 w-full text-left"
              onClick={() => handleRename(node)}
            >
              Rename
            </button>

            <button
              className="block px-3 py-2 hover:bg-red-100 text-red-600 w-full text-left"
              onClick={() => handleDelete(node)}
            >
              Delete
            </button>
          </div>
        )}

        {node.type === "folder" &&
          isExpanded &&
          node.children &&
          node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  // ==========================
  // UI
  // ==========================
  return (
    <aside className="border-r bg-white flex flex-col h-full overflow-visible">
      {isOpen ? (
        <div className="w-64 flex flex-col h-full">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Explorer
            </span>

            <div className="flex gap-2">
              <button onClick={handleCreateFile}>
                <Plus size={16} />
              </button>

              <button onClick={handleCreateFolder}>
                <FolderPlus size={16} />
              </button>

              <button onClick={() => setIsOpen(false)}>
                <ChevronsLeftIcon size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {tree.map((node) => renderNode(node))}
          </div>
        </div>
      ) : (
        <div className="w-8 flex justify-center items-start pt-2">
          <button onClick={() => setIsOpen(true)}>
            <ChevronsRightIcon size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default FileExplorer;