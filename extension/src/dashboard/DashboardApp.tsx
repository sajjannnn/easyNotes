
import TopNavBar from "./srcDashBoard/components/TopNavBar";
import FileExplorer from "./srcDashBoard/components/FileExplorer";
import Notes from "./srcDashBoard/components/Notes";
import AIchat from "./srcDashBoard/components/AIchat";
import type { RootState } from "./srcDashBoard/utilis/dashBoardStore";
import { useSelector } from "react-redux";

const DashBoardApp = () => {
  const isAIopen = useSelector((state: RootState) => state.ai.isOpen);
 

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopNavBar />

      <div className="flex flex-1 min-h-0">
        <FileExplorer />
        <Notes />
        {isAIopen && <AIchat/>}
      </div>
    </div>
  );
};

export default DashBoardApp;
