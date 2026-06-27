import { LogOut, PenLine, LayoutDashboard, Timer } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import ConfirmationModal from '../ui/ConfirmationModal';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Pomodoro', icon: Timer, path: '/pomodoro' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-serif transition-colors duration-150 ${
                isActive
                  ? 'bg-bark-mid text-bark-cream'
                  : 'text-bark-pale hover:text-bark-cream hover:bg-bark-mid/50'
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          );
        })}
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
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded text-bark-pale hover:text-bark-cream hover:bg-bark-mid transition-colors text-sm font-serif"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Log Out"
        message="Are you sure you want to log out of WorkspaceAI?"
        confirmText="Log Out"
        type="info"
      />
    </aside>
  );
};

export default Sidebar;