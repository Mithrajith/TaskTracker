import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordModal } from '../components/common/ChangePasswordModal';
import {
  LayoutDashboard,
  CheckSquare,
  History,
  User,
  LogOut,
  Sparkles,
  Search,
  Bell,
  Home,
  BookOpen,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { Github } from '../components/common/Icons';

export const StudentLayout = () => {
  const { user, logout, mustChangePassword } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard, exact: true },
    { name: 'Current Task', path: '/student#current-task', icon: CheckSquare },
    { name: 'Task History', path: '/student/history', icon: History },
  ];

  const handleNavClick = (path) => {
    if (path.includes('#')) {
      navigate('/student');
      setTimeout(() => {
        const el = document.getElementById('current-task');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F0] text-[#172E2A] flex flex-col md:flex-row antialiased selection:bg-[#FFA77E]/30 selection:text-[#064E45]">
      {/* Desktop Pale Mint Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-[#EAF7EF] border-r border-[#DDE8DF] flex-col justify-between h-screen sticky top-0 shrink-0 z-30">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-[#DDE8DF] flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#064E45] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#FFA77E]" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-[#064E45] tracking-tight leading-tight">
                  AI Engineer
                </h1>
                <span className="text-[11px] font-bold text-[#2D806B] tracking-wider uppercase block">
                  Task Tracker
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isHashLink = item.path.includes('#');

              if (isHashLink) {
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#71817B] hover:text-[#064E45] hover:bg-[#FAF8F0]/70 transition-all text-left"
                  >
                    <Icon className="w-4 h-4 shrink-0 text-[#2D806B]" />
                    <span>{item.name}</span>
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#FFA77E] text-[#172E2A] shadow-xs'
                        : 'text-[#71817B] hover:text-[#064E45] hover:bg-[#FAF8F0]/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Profile / Change Password Item */}
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#71817B] hover:text-[#064E45] hover:bg-[#FAF8F0]/70 transition-all text-left"
            >
              <User className="w-4 h-4 shrink-0 text-[#2D806B]" />
              <span>Profile &amp; Password</span>
            </button>
          </nav>
        </div>

        {/* User Card & Logout Button */}
        <div className="p-4 border-t border-[#DDE8DF] space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#DDE8DF] shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#064E45] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#064E45] truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-[#71817B] font-mono truncate">
                {user?.registerNumber}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-[#71817B] hover:text-[#E86A5B] hover:bg-[#FFF0ED] rounded-xl transition-colors border border-transparent hover:border-[#FAD3CC]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Top Bar matching reference */}
        <header className="sticky top-0 z-20 bg-[#FAF8F0]/90 backdrop-blur-md border-b border-[#DDE8DF] px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Mobile Brand / Search */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Link to="/student" className="md:hidden flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#064E45] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-[#FFA77E]" />
              </div>
            </Link>

            {/* Task Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#71817B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assigned tasks, topics..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#DDE8DF] rounded-xl text-xs sm:text-sm text-[#172E2A] placeholder-[#71817B]/60 focus:outline-none focus:ring-2 focus:ring-[#2D806B]/20 focus:border-[#2D806B] transition-all"
              />
            </div>
          </div>

          {/* Top Actions: GitHub Link, Notification, User Profile Avatar */}
          <div className="flex items-center gap-3 shrink-0">
            {user?.githubRepoUrl && (
              <a
                href={user.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDE8DF] text-xs font-bold text-[#064E45] hover:bg-[#EAF7EF] transition-colors"
                title="Open GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Repo</span>
                <ExternalLink className="w-3 h-3 text-[#71817B]" />
              </a>
            )}

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => navigate('/student/history')}
              className="relative p-2 rounded-xl bg-white border border-[#DDE8DF] text-[#71817B] hover:text-[#064E45] hover:bg-[#EAF7EF] transition-colors"
              title="Recent Review Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FFA77E] ring-2 ring-white" />
            </button>

            {/* Student Avatar and Role */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white border border-[#DDE8DF] hover:border-[#2D806B] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] border border-[#CDE5D6] text-[#064E45] flex items-center justify-center text-xs font-black shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-[#064E45] block leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] font-semibold text-[#2D806B] block leading-tight">
                  AI Engineer Trainee
                </span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar matching reference */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DDE8DF] px-3 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(23,46,42,0.06)]">
        <NavLink
          to="/student"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
              isActive ? 'text-[#064E45] bg-[#EAF7EF]' : 'text-[#71817B]'
            }`
          }
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </NavLink>

        <button
          type="button"
          onClick={() => handleNavClick('#current-task')}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold text-[#71817B] hover:text-[#064E45]"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks</span>
        </button>

        <NavLink
          to="/student/history"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
              isActive ? 'text-[#064E45] bg-[#EAF7EF]' : 'text-[#71817B]'
            }`
          }
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setShowPasswordModal(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold text-[#71817B] hover:text-[#064E45]"
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold text-[#E86A5B]"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit</span>
        </button>
      </nav>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal || mustChangePassword}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};
