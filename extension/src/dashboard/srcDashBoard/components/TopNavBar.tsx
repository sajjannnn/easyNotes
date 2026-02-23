import {Moon, User } from "lucide-react";

const TopNavBar = () => {
  return (
    <header className="h-14 border-b border-border/50 glass-surface flex items-center px-4 gap-4 z-50 shrink-0 flex justify-between">
      {/* App name  */}
      <div className="flex items-center gap-2 min-w-[180px]">
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
          <span className="text-gradient font-bold text-sm">E</span>
        </div>
        <span className="font-semibold text-foreground tracking-tight">Easy Notes</span>
      </div>

      <div className="flex items-center gap-1">
        <div className="w-px h-5 bg-border/50 mx-1" />
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
          <Moon className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center cursor-pointer hover:bg-primary/25 transition-colors">
          <User className="w-4 h-4 text-primary" />
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
