import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  LogOut,
  KeyRound,
  ExternalLink,
  BookOpen,
  History,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <header className="bg-slate-950/80 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-6">
            <NavLink to="/student" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-white uppercase block">
                  AI Engineer Roadmap
                </span>
                <span className="text-[11px] text-purple-400 font-medium">
                  Student Portal
                </span>
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
                      ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
                      ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
                className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition-colors px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800"
              >
                <span>Repo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-700/50 flex items-center justify-center text-xs font-bold text-purple-300">
                {user?.name?.slice(0, 2) || 'ST'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {user?.registerNumber}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="p-2 text-slate-400 hover:text-purple-300 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
              title="Change Password"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/40"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};

