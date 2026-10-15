import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#242424] flex antialiased selection:bg-[#233DFF]/30 selection:text-[#233DFF]">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#242424]/40 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden sticky top-0 z-20 bg-[#F5F0E8]/90 backdrop-blur-md border-b border-[#D6CEC1] px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl bg-white border border-[#D6CEC1] text-[#233DFF] hover:bg-[#E5DED2] transition-colors"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#233DFF] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-extrabold text-[#233DFF]">Mentor Console</span>
            </Link>
          </div>

          <Link
            to="/admin/profile"
            className="w-8 h-8 rounded-xl bg-[#E5DED2] border border-[#D6CEC1] text-[#233DFF] flex items-center justify-center text-xs font-black shrink-0 hover:border-[#233DFF] transition-colors"
            aria-label="Open profile"
          >
            {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
          </Link>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
