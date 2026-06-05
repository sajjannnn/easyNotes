import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem('ytstudy_sidebar_open');
    return stored !== null ? stored === 'true' : true;
  });

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('ytstudy_sidebar_open', String(next));
      return next;
    });
  }, []);

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden print:h-auto print:overflow-visible">
      <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 print:hidden">
          <div className="flex-1 max-w-lg">
            <SearchBar />
          </div>
          <div className="flex items-center gap-3 ml-4">
            {user && <UserMenu />}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
