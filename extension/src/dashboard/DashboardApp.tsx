// import { useState } from "react";

// import { Sparkles } from "lucide-react";
import TopNavBar from "./srcDashBoard/components/TopNavBar";
import FileExplorer from "./srcDashBoard/components/FileExplorer";
import Notes from "./srcDashBoard/components/Notes";

const DashBoardApp = () => {
  // const [aiPanelOpen, setAiPanelOpen] = useState(true);
  // const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopNavBar />

      <div className="flex flex-1 min-h-0">
        <FileExplorer />
<Notes/>
        {/* Center: Notes Timeline */}
        {/* <NotesTimeline onScreenshotClick={(src) => setModalImage(src)} /> */}

        {/* Right: AI Panel */}
        {/* {aiPanelOpen ? (
          <AISummaryPanel onCollapse={() => setAiPanelOpen(false)} />
        ) : (
          <button
            onClick={() => setAiPanelOpen(true)}
            className="w-12 border-l border-border/50 bg-sidebar flex flex-col items-center pt-3 hover:bg-secondary/40 transition-colors"
            title="Open AI Assistant"
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </button>
        )} */}
      </div>

      {/* Screenshot Modal */}
      {/* {modalImage && (
        <ScreenshotModal src={modalImage} onClose={() => setModalImage(null)} />
      )} */}
    </div>
  );
};

export default DashBoardApp;
