import React, { useRef, useState, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const DOT_COUNT = 12;
const DOT_RADIUS = 4;
const ORBIT_RADIUS = 28;

const LogoDot: React.FC<{
  index: number;
  smoothX: MotionValue<number>;
  smoothY: MotionValue<number>;
}> = ({ index, smoothX, smoothY }) => {
  const angle = (index / DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
  const baseX = ORBIT_RADIUS * Math.cos(angle);
  const baseY = ORBIT_RADIUS * Math.sin(angle);
  const x = useTransform(smoothX, (v) => baseX + v);
  const y = useTransform(smoothY, (v) => baseY + v);
  return (
    <motion.span
      className="absolute left-1/2 top-1/2 rounded-full bg-[var(--accent)]/60 pointer-events-none"
      style={{
        width: DOT_RADIUS * 2,
        height: DOT_RADIUS * 2,
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
      }}
    />
  );
};

const StartupXLogo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set((e.clientX - centerX) * 0.12);
      mouseY.set((e.clientY - centerY) * 0.12);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center py-1 pr-2"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {Array.from({ length: DOT_COUNT }).map((_, i) => (
        <LogoDot key={i} index={i} smoothX={smoothX} smoothY={smoothY} />
      ))}
      <motion.span
        className="relative z-10 text-2xl font-semibold text-[var(--accent)] tracking-tight"
        animate={{ scale: isHovered ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        StartupX
      </motion.span>
    </div>
  );
};

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNavItems = [
    { path: '/dashboard', label: 'Overview' },
    { path: '/dashboard/data-room', label: 'Data Room' },
    { path: '/dashboard/mentors', label: 'Mentors' },
    { path: '/dashboard/calendar', label: 'Calendar' },
    { path: '/dashboard/pitch-deck', label: 'Pitch Deck' },
    { path: '/dashboard/fundraising', label: 'Fundraising' },
    { path: '/dashboard/settings', label: 'Settings' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Overview' },
    { path: '/admin/review', label: 'Review' },
    { path: '/admin/events', label: 'Events' },
    { path: '/admin/mentors', label: 'Mentor Manage' },
    { path: '/admin/investors', label: 'Investor Manage' },
    { path: '/admin/startups', label: 'Startups' },
    { path: '/admin/data-room', label: 'Data Room' },
    { path: '/admin/settings', label: 'Settings' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="h-[72px] min-h-[72px] bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-[var(--accent-muted-border)]/60 flex items-center justify-between px-6 lg:px-8 sticky top-4 z-10 mx-4 lg:mx-6 rounded-2xl shadow-[0_4px_24px_-2px_rgba(79,70,229,0.12),0_8px_32px_-4px_rgba(0,0,0,0.04)]">
      {/* Logo with mouse-following dots */}
      <div className="flex items-center">
        <StartupXLogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex items-center justify-center gap-2 overflow-x-auto mx-4 py-1">
        {navItems.map((item) => {
          const active = isActive(item.path, item.path === '/dashboard' || item.path === '/admin/dashboard');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard' || item.path === '/admin/dashboard'}
              className="relative flex items-center px-5 py-3 rounded-xl text-base font-medium whitespace-nowrap transition-colors duration-200"
            >
              {active && (
                <motion.span
                  layoutId="header-nav-highlight"
                  className="absolute inset-0 rounded-xl bg-[var(--accent-muted)] border border-[var(--accent-muted-border)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className={`relative z-10 ${active ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Right side - User & Logout */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--text-muted)] hidden sm:inline font-medium">
          {user?.role === 'admin' ? 'Admin' : user?.fullName || user?.username}
        </span>
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-all hover:shadow-lg hover:shadow-[var(--accent)]/25"
        >
          Logout
        </motion.button>
      </div>
    </header>
  );
};

export default Header;
