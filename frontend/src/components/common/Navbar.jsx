import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  LogOut,
  ExternalLink,
  BookOpen,
  History,
  User,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/90 border-b border-[#D6CEC1] sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-6">
            <NavLink to="/student" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#233DFF] to-[#233DFF] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-[#233DFF] uppercase block">
                  AI Engineer Roadmap
                </span>
                <span className="text-[11px] text-[#233DFF] font-medium">Student Portal</span>
              </div>
            </NavLink>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink
                to="/student"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E5DED2] text-[#233DFF] border border-[#D6CEC1]'
                      : 'text-[#77766F] hover:text-[#233DFF] hover:bg-[#E5DED2]'
                  }`
                }
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>My Tasks</span>
              </NavLink>
              <NavLink
                to="/student/history"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E5DED2] text-[#233DFF] border border-[#D6CEC1]'
                      : 'text-[#77766F] hover:text-[#233DFF] hover:bg-[#E5DED2]'
                  }`
                }
              >
                <History className="w-3.5 h-3.5" />
                <span>Submissions & Feedback</span>
              </NavLink>
            </nav>
          </div>

          {/* User info & actions */}
          <div className="flex items-center gap-3">
            {user?.githubRepoUrl && (
              <a
                href={user.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-[#77766F] hover:text-[#233DFF] transition-colors px-2.5 py-1 rounded-lg bg-[#F5F0E8] border border-[#D6CEC1]"
              >
                <span>Repo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#F5F0E8] border border-[#D6CEC1]">
              <div className="w-7 h-7 rounded-lg bg-[#E5DED2] border border-[#D6CEC1] flex items-center justify-center text-xs font-bold text-[#233DFF]">
                {user?.name?.slice(0, 2) || 'ST'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-[#242424] leading-tight">{user?.name}</p>
                <p className="text-[10px] text-[#77766F] leading-tight">{user?.registerNumber}</p>
              </div>
            </div>

            <NavLink
              to="/student/profile"
              className="p-2 text-[#77766F] hover:text-[#233DFF] hover:bg-[#E5DED2] rounded-lg transition-colors border border-transparent hover:border-[#D6CEC1]"
              title="Profile & Password"
            >
              <User className="w-4 h-4" />
            </NavLink>

            <button
              onClick={logout}
              className="p-2 text-[#77766F] hover:text-[#E86A5B] hover:bg-[#FFF0ED] rounded-lg transition-colors border border-transparent hover:border-[#FAD3CC]"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
  );
};
