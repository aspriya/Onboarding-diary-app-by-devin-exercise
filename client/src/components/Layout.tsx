import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  AlertCircle,
  MessageSquare,
  FileText,
  BarChart3,
  PieChart,
  Settings,
  LogOut,
  Menu,
  X,
  CheckSquare,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../lib/cn';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/issues', icon: AlertCircle, label: 'Issues' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/analytics', icon: PieChart, label: 'Analytics' },
  { to: '/checklist', icon: CheckSquare, label: 'Checklist' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const managerNavItems = [
  { to: '/manager', icon: Users, label: 'Recruits' },
];

const adminNavItems = [
  { to: '/admin/users', icon: Users, label: 'Users' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background dark:bg-background-dark transition-colors duration-200">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-sidebar dark:bg-sidebar-dark',
          'flex flex-col transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <h1 className="text-lg font-semibold text-white">Onboarding Diary</h1>
          <button
            className="lg:hidden text-sidebar-text hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-sidebar-text dark:text-sidebar-text-dark hover:bg-white/10 hover:text-white'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {(user?.role === 'manager' || user?.role === 'admin') && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-sidebar-text/50 dark:text-sidebar-text-dark/50 uppercase tracking-wider">
                  Management
                </p>
              </div>
              {managerNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-sidebar-text dark:text-sidebar-text-dark hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-sidebar-text/50 dark:text-sidebar-text-dark/50 uppercase tracking-wider">
                  Admin
                </p>
              </div>
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-sidebar-text dark:text-sidebar-text-dark hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Settings & Logout */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-sidebar-text dark:text-sidebar-text-dark hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium w-full
                       text-sidebar-text dark:text-sidebar-text-dark hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark flex items-center justify-between px-4 lg:px-6 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center">
              <div className="relative cursor-pointer" onClick={() => window.location.href = '/search'}>
                <input
                  type="text"
                  placeholder="Search..."
                  readOnly
                  className="input-field w-64 pl-10 cursor-pointer"
                  onFocus={(e) => { e.preventDefault(); window.location.href = '/search'; }}
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary dark:bg-primary-dark flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-text-primary dark:text-text-primary-dark">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
