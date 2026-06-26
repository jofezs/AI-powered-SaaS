import { LogOut, PenLine } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside className="w-52 h-screen bg-bark-dark flex flex-col fixed left-0 top-0 border-r border-bark-mid">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-bark-mid">
        <div className="flex items-center gap-2">
          <PenLine size={16} className="text-bark-cream" />
          <span className="text-bark-cream font-serif font-bold text-base tracking-tight">
            WorkspaceAI
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-bark-mid rounded text-bark-cream text-sm font-serif">
          <span className="text-bark-pale text-xs">◉</span>
          Dashboard
        </div>
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-bark-mid space-y-2">
        <div className="px-3 py-2">
          <p className="text-bark-cream text-xs font-serif font-semibold truncate">
            {user?.name}
          </p>
          <p className="text-bark-pale text-[10px] font-sans truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded text-bark-pale hover:text-bark-cream hover:bg-bark-mid transition-colors text-sm font-serif"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;