import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  History,
  User,
  LogOut,
  Sparkles,
  Search,
  Home,
  ExternalLink,
} from 'lucide-react';
import { Github } from '../components/common/Icons';

export const StudentLayout = () => {
  const { user, logout, mustChangePassword, needsGithubSetup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard, exact: true },
    // { name: 'Current Task', path: '/student#current-task', icon: CheckSquare },
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

  // Force first-time users to set a permanent password and GitHub link on the profile page
  if ((mustChangePassword || needsGithubSetup) && location.pathname !== '/student/profile') {
    return <Navigate to="/student/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#242424] flex flex-col md:flex-row antialiased selection:bg-[#233DFF]/30 selection:text-[#233DFF]">
      {/* Desktop Pale Mint Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-[#E5DED2] border-r border-[#D6CEC1] flex-col justify-between h-screen sticky top-0 shrink-0 z-30">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-[#D6CEC1] flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#233DFF] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-[#233DFF] tracking-tight leading-tight">
                  AI Engineer
                </h1>
                <span className="text-[11px] font-bold text-[#233DFF] tracking-wider uppercase block">
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#77766F] hover:text-[#233DFF] hover:bg-[#F5F0E8]/70 transition-all text-left"
                  >
                    <Icon className="w-4 h-4 shrink-0 text-[#233DFF]" />
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
                        ? 'bg-[#233DFF] text-white'
                        : 'text-[#77766F] hover:text-[#233DFF] hover:bg-[#F5F0E8]/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Profile Page Item */}
            <NavLink
              to="/student/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#233DFF] text-white'
                    : 'text-[#77766F] hover:text-[#233DFF] hover:bg-[#F5F0E8]/70'
                }`
              }
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profile &amp; Settings</span>
            </NavLink>
          </nav>
        </div>

        {/* User Card & Logout Button */}
        <div className="p-4 border-t border-[#D6CEC1] space-y-2">
          <Link
            to="/student/profile"
            className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#D6CEC1] hover:border-[#233DFF] transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#233DFF] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#233DFF] truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-[#77766F] font-mono truncate">
                {user?.registerNumber}
              </p>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-[#77766F] hover:text-[#E86A5B] hover:bg-[#FFF0ED] rounded-xl transition-colors border border-transparent hover:border-[#FAD3CC]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Top Bar matching reference */}
        <header className="sticky top-0 z-20 bg-[#F5F0E8]/90 backdrop-blur-md border-b border-[#D6CEC1] px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Mobile Brand / Search */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Link to="/student" className="md:hidden flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#233DFF] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </Link>

            {/* Task Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#77766F]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assigned tasks, topics..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D6CEC1] rounded-xl text-xs sm:text-sm text-[#242424] placeholder-[#77766F]/60 focus:outline-none focus:ring-2 focus:ring-[#233DFF]/20 focus:border-[#233DFF] transition-all"
              />
            </div>
          </div>

          {/* Top Actions: GitHub Link, User Profile Avatar */}
          <div className="flex items-center gap-3 shrink-0">
            {user?.githubRepoUrl && (
              <a
                href={user.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D6CEC1] text-xs font-bold text-[#233DFF] hover:bg-[#E5DED2] transition-colors"
                title="Open GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Repo</span>
                <ExternalLink className="w-3 h-3 text-[#77766F]" />
              </a>
            )}

            {/* Student Avatar and Role */}
            <Link
              to="/student/profile"
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white border border-[#D6CEC1] hover:border-[#233DFF] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-[#E5DED2] border border-[#D6CEC1] text-[#233DFF] flex items-center justify-center text-xs font-black shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-[#233DFF] block leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] font-semibold text-[#233DFF] block leading-tight">
                  AI Engineer Trainee
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar matching reference */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D6CEC1] px-3 py-2 flex items-center justify-around">
        <NavLink
          to="/student"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
              isActive ? 'text-[#233DFF] bg-[#E5DED2]' : 'text-[#77766F]'
            }`
          }
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </NavLink>

        <button
          type="button"
          onClick={() => handleNavClick('#current-task')}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold text-[#77766F] hover:text-[#233DFF]"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks</span>
        </button>

        <NavLink
          to="/student/history"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
              isActive ? 'text-[#233DFF] bg-[#E5DED2]' : 'text-[#77766F]'
            }`
          }
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </NavLink>

        <NavLink
          to="/student/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
              isActive ? 'text-[#233DFF] bg-[#E5DED2]' : 'text-[#77766F]'
            }`
          }
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </NavLink>

        <button
          type="button"
          onClick={logout}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold text-[#E86A5B]"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit</span>
        </button>
      </nav>
    </div>
  );
};
