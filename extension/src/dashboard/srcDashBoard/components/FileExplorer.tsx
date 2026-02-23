import { useState } from "react";
import { FolderOpen, Folder, FileText, ChevronRight, ChevronDown, MoreHorizontal,ChevronsRightIcon, ChevronsLeftIcon } from "lucide-react";

interface FileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
}

const mockTree: FileNode[] = [
  {
    id: "1",
    name: "Machine Learning",
    type: "folder",
    children: [
      { id: "1a", name: "Neural Networks Basics", type: "file" },
      { id: "1b", name: "Backpropagation Notes", type: "file" },
      { id: "1c", name: "CNN Architecture", type: "file" },
    ],
  },
  {
    id: "2",
    name: "Data Structures",
    type: "folder",
    children: [
      { id: "2a", name: "Binary Trees", type: "file" },
      { id: "2b", name: "Graph Algorithms", type: "file" },
    ],
  },
  {
    id: "3",
    name: "Algorithms",
    type: "folder",
    children: [
      { id: "3a", name: "Big-O Notation", type: "file" },
      { id: "3b", name: "Dynamic Programming", type: "file" },
      { id: "3c", name: "Sorting Algorithms", type: "file" },
    ],
  },
  { id: "4", name: "Quick Reference", type: "file" },
];

const FileExplorer = () => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["1"]));
  const [activeFile, setActiveFile] = useState("1a");
  const [isOpen, setIsOpen] = useState(true);

  const toggleFolder = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expanded.has(node.id);
    const isActive = activeFile === node.id;
    if(!isOpen)return (
      <div key={node.id}>
        <button
          onClick={() => (node.type === "folder" ? toggleFolder(node.id) : setActiveFile(node.id))}
          className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-[13px] rounded-md transition-all duration-150 group
            ${isActive ? "bg-accent text-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-secondary/60 hover:text-foreground"}
          `}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          {node.type === "folder" ? (
            <>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
              {isExpanded ? <FolderOpen className="w-4 h-4 shrink-0 text-primary/70" /> : <Folder className="w-4 h-4 shrink-0 text-muted-foreground" />}
            </>
          ) : (
            <>
              <span className="w-3.5" />
              <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
            </>
          )}
          <span className="truncate">{node.name}</span>
          <MoreHorizontal className="w-3.5 h-3.5 ml-auto shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
        </button>
        {node.type === "folder" && isExpanded && node.children && <div className="animate-fade-in">{node.children.map((child) => renderNode(child, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <aside className="border-r border-border/50 bg-sidebar flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-3 flex items-center justify-between border-b border-border/30">
        {!isOpen && <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explorer</span>}
        <div className="flex gap-0.5">
          {/* <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="New File">
            <Plus className="w-4 h-4" />
          </button> */}
          <button onClick={() => setIsOpen(!isOpen)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="New Folder">
            {isOpen ? <ChevronsLeftIcon className="w-4 h-4" /> : <ChevronsRightIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">{mockTree.map((node) => renderNode(node))}</div>
    </aside>
  );
};

export default FileExplorer;
