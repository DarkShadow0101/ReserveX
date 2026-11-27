import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ThemeToggle from '../common/ThemeToggle';

export default function Topbar({ onToggleMobile }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'OR';

  const handleLogout = () => {
    logout();
    showToast('Signed out of Organizer Studio', 'info');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#0D0F14]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
      {/* Left: Mobile hamburger & quick nav search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          type="button"
          onClick={onToggleMobile}
          aria-label="Open sidebar menu"
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/[0.06]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Filter organizer views"
            placeholder="Search events or bookings..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                navigate('/organizer/events');
              }
            }}
            className="w-full bg-[#12151E] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#F4F1EA] placeholder-slate-500 focus:outline-none focus:border-[#FF4D2D]"
          />
        </div>
      </div>

      {/* Right: Theme Toggle, Gate Scanner shortcut & Profile menu */}
      <div className="flex items-center gap-3">
        <ThemeToggle compact={true} />

        <Link
          to="/organizer/check-in"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12151E] border border-white/10 hover:border-[#10B981]/50 text-xs font-semibold text-slate-200 hover:text-white transition-all active:scale-95"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>Gate Scanner</span>
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 cursor-pointer focus:outline-none active:scale-95 transition-transform"
            aria-label="Open organizer profile menu"
          >
            <div className="w-9 h-9 rounded-xl bg-[#12151E] border border-white/15 hover:border-[#FF4D2D] text-[#F4F1EA] font-mono font-bold flex items-center justify-center text-xs transition-colors">
              {initials}
            </div>
          </button>

          {profileOpen && (
            <div
              className="animate-dropdown-in absolute right-0 mt-2 w-56 bg-[#101219] text-[#F4F1EA] rounded-xl shadow-2xl border border-white/15 py-2 z-50"
              onClick={() => setProfileOpen(false)}
            >
              <div className="px-4 py-2 border-b border-white/10">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Organizer Profile</p>
                <p className="text-sm font-semibold truncate text-white mt-0.5">{user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/"
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white"
              >
                <ExternalLink className="w-4 h-4 text-[#FF4D2D]" /> Customer Storefront
              </Link>

              <div className="border-t border-white/10 my-1" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
