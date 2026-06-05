import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Settings, LogOut, User } from 'lucide-react';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const initials = (user?.name || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-medium flex items-center justify-center hover:bg-indigo-500/30 transition-colors focus:ring-2 focus:ring-indigo-500/50"
      >
        {initials}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1">
            <div className="px-3 py-2 border-b border-gray-700">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>

            <button
              onClick={() => { setOpen(false); navigate('/settings'); }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 w-full text-left transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-gray-700 w-full text-left transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
