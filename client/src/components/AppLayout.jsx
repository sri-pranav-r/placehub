import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  CalendarDays,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { Avatar } from './ui';

const NAV = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/companies', label: 'Companies', icon: Building2 },
    { to: '/admin/drives', label: 'Drives', icon: CalendarDays },
    { to: '/admin/applications', label: 'Applications', icon: FileText },
    { to: '/admin/jobs', label: 'Live Jobs', icon: Globe },
  ],
  student: [
    { to: '/student', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/student/drives', label: 'Drives', icon: Briefcase },
    { to: '/student/profile', label: 'Profile & Resume', icon: UserRound },
    { to: '/student/jobs', label: 'Live Jobs', icon: Globe },
  ],
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]); // close the mobile menu after navigating

  return (
    <div className={`app-shell ${open ? 'nav-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <Logo to={user.role === 'admin' ? '/admin' : '/student'} />
          <button className="icon-btn mobile-only" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-section">{user.role === 'admin' ? 'Placement office' : 'Student portal'}</div>
        <nav className="sidebar-nav">
          {NAV[user.role].map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-item">
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <Avatar name={user.name} size={34} />
          <div className="sidebar-user-text">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button
            className="icon-btn"
            title="Log out"
            aria-label="Log out"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
        <div className="sidebar-legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </aside>
      <div className="backdrop" onClick={() => setOpen(false)} />

      <div className="app-main">
        <header className="mobile-bar">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <Logo />
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
