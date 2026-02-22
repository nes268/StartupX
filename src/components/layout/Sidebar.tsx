import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  LogOut,
  Building2,
  UserCheck,
  CalendarDays,
  UserCog,
  DollarSign
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/dashboard/data-room', icon: FolderOpen, label: 'Data Room' },
    { path: '/dashboard/mentors', icon: Users, label: 'Mentors' },
    { path: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/dashboard/pitch-deck', icon: BarChart3, label: 'Pitch Deck' },
    { path: '/dashboard/fundraising', icon: TrendingUp, label: 'Fundraising' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/admin/review', icon: UserCheck, label: 'Review' },
    { path: '/admin/events', icon: CalendarDays, label: 'Events' },
    { path: '/admin/mentors', icon: UserCog, label: 'Mentor Manage' },
    { path: '/admin/investors', icon: DollarSign, label: 'Investor Manage' },
    { path: '/admin/startups', icon: Building2, label: 'Startups' },
    { path: '/admin/data-room', icon: FolderOpen, label: 'Data Room' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <div className="fixed left-0 top-0 w-56 bg-[var(--bg-surface)] border-r border-[var(--border-muted)] flex flex-col h-screen overflow-hidden z-10 shadow-[var(--shadow-sm)]">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-muted)] flex-shrink-0">
        <div className="flex items-center">
          <span className="text-xl font-semibold text-[var(--text)]">StartupX</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard' || item.path === '/admin/dashboard'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-muted)]'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[var(--border-muted)] flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-2.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-red-50 hover:text-red-600 w-full transition-colors font-medium"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
