import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FileCheck2,
  History,
  LogOut,
  Sparkles,
  UploadCloud,
  X,
  User,
} from 'lucide-react';

export const Sidebar = ({ mobileOpen = false, onClose = () => {} }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Students', path: '/admin/students', icon: Users, exact: true },
    { name: 'Import CSV', path: '/admin/students/import', icon: UploadCloud },
    { name: 'Daily Tasks', path: '/admin/tasks', icon: CheckSquare },
    { name: 'Review Queue', path: '/admin/reviews', icon: FileCheck2 },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
    { name: 'Profile & Settings', path: '/admin/profile', icon: User },
  ];

  return (
    <aside
      className={`fixed md:sticky top-0 left-0 h-screen w-64 lg:w-72 bg-[#EAF7EF] border-r border-[#DDE8DF] flex flex-col justify-between shrink-0 z-40 transition-transform duration-300 ease-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#DDE8DF] flex items-center justify-between gap-3">
          <Link to="/admin" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 rounded-2xl bg-[#064E45] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-[#064E45] tracking-tight leading-tight">
                AI Engineer
              </h1>
              <span className="text-[11px] font-bold text-[#2D806B] tracking-wider uppercase block">
                Mentor Console
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-[#71817B] hover:text-[#064E45] hover:bg-white/70 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#064E45] text-white'
                      : 'text-[#71817B] hover:text-[#064E45] hover:bg-white/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User info & Logout */}
      <div className="p-4 border-t border-[#DDE8DF] space-y-2">
        <Link
          to="/admin/profile"
          onClick={onClose}
          className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#DDE8DF] hover:border-[#2D806B] transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-[#064E45] text-white flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#064E45] truncate">
              {user?.name}
            </p>
            <p className="text-[10px] text-[#71817B] font-mono truncate">
              {user?.registerNumber}
            </p>
          </div>
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-[#71817B] hover:text-[#E86A5B] hover:bg-[#FFF0ED] rounded-xl transition-colors border border-transparent hover:border-[#FAD3CC]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
