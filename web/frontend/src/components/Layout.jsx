import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

export default function Layout({ children }) {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem('ytstudy_sidebar_open');
    return stored !== null ? stored === 'true' : true;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('ytstudy_sidebar_open', String(next));
      return next;
    });
  }, []);

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden print:h-auto print:overflow-visible">
      <div className="hidden lg:block">
        <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full">
            <Sidebar open={true} onToggle={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-200 transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1 max-w-lg">
              <SearchBar />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4 shrink-0">
            {user && <UserMenu />}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
