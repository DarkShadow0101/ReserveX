import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Ticket, Calendar, ShieldCheck, ChevronDown, ArrowRight, Menu, X } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';

export default function Navbar({ transparent = false }) {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const focusCategories = () => {
    const el = document.getElementById('categories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.classList.remove('animate-section-ping');
      void el.offsetWidth;
      el.classList.add('animate-section-ping');
    }
  };

  const handleCategoriesClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(focusCategories, 180);
    } else {
      focusCategories();
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    showToast('Signed out of ReserveX', 'info');
    navigate('/');
  };

  const isActive = (path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`));

  const capsuleStyle = isDark
    ? transparent && isHomePage && !isScrolled
      ? 'bg-[#0C0E14]/80 border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_40px_rgba(0,0,0,0.55)]'
      : 'bg-[#080A0F]/95 border-white/[0.16] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_48px_rgba(0,0,0,0.82)]'
    : transparent && isHomePage && !isScrolled
    ? 'bg-white/90 border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
    : 'bg-white/95 border-slate-200 shadow-[0_14px_38px_rgba(15,23,42,0.1)]';

  const navLinkClass = (active) =>
    `px-3.5 py-1.5 rounded-full transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
      active
        ? isDark
          ? 'bg-white/[0.12] text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
          : 'bg-slate-900 text-white font-semibold shadow-sm'
        : isDark
        ? 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-900/[0.06]'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
      {/* Machined Capsule Top Bar */}
      <div
        className={`pointer-events-auto max-w-6xl mx-auto h-[58px] pl-4 pr-2.5 sm:pl-5 sm:pr-3 rounded-full border backdrop-blur-2xl transition-all duration-300 flex items-center justify-between gap-4 ${capsuleStyle}`}
      >
        <Logo />

        {/* Center Segmented Navigation Rail */}
        <nav
          aria-label="Primary navigation"
          className={`hidden lg:flex items-center gap-0.5 rounded-full p-1 text-[13px] font-medium border ${
            isDark
              ? 'bg-white/[0.035] border-white/[0.08]'
              : 'bg-slate-900/[0.04] border-slate-900/[0.08]'
          }`}
        >
          <Link to="/events" className={navLinkClass(isActive('/events'))}>
            Explore Events
          </Link>
          <a href="#categories" onClick={handleCategoriesClick} className={navLinkClass(false)}>
            Categories
          </a>
          <Link to="/my-tickets" className={navLinkClass(isActive('/my-tickets'))}>
            My Tickets
          </Link>
          <Link to="/organizer" className={`inline-flex items-center gap-1.5 ${navLinkClass(isActive('/organizer'))}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9381E]" aria-hidden="true" />
            <span>For Organizers</span>
          </Link>
        </nav>

        {/* Compact mid-width nav links (md..lg) */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex lg:hidden items-center gap-4 text-xs font-medium"
        >
          <Link
            to="/events"
            className={`transition-transform active:scale-95 ${
              isActive('/events') ? 'font-semibold underline' : ''
            } ${isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-950'}`}
          >
            Explore
          </Link>
          <a
            href="#categories"
            onClick={handleCategoriesClick}
            className={`transition-transform active:scale-95 ${
              isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Categories
          </a>
          <Link
            to="/my-tickets"
            className={`transition-transform active:scale-95 ${
              isActive('/my-tickets') ? 'font-semibold underline' : ''
            } ${isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-950'}`}
          >
            Tickets
          </Link>
          <Link
            to="/organizer"
            className={`transition-transform active:scale-95 ${
              isActive('/organizer') ? 'font-semibold underline' : ''
            } ${isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-950'}`}
          >
            Organizers
          </Link>
        </nav>

        {/* Right Theme + Auth Action Cluster */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <ThemeToggle compact={true} />

          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border transition-all active:scale-95 cursor-pointer text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
                  isDark
                    ? 'bg-white/[0.07] hover:bg-white/[0.13] border-white/15 text-white'
                    : 'bg-slate-900/[0.06] hover:bg-slate-900/[0.11] border-slate-900/12 text-slate-900'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#D9381E] flex items-center justify-center font-bold text-xs text-white">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[110px] truncate">{user.fullName || user.email}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className={`animate-dropdown-in absolute right-0 mt-3 w-60 rounded-2xl shadow-2xl border py-2 z-50 ${
                    isDark
                      ? 'bg-[#101219] text-[#F4F1EA] border-white/15'
                      : 'bg-white text-slate-900 border-slate-900/12'
                  }`}
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className={`px-4 py-2.5 border-b ${isDark ? 'border-white/10' : 'border-slate-900/10'}`}>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold truncate mt-0.5">{user.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#D9381E]/15 text-[#D9381E] border border-[#D9381E]/30">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/my-tickets"
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                      isDark ? 'text-slate-200 hover:bg-white/[0.06] hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <Ticket className="w-4 h-4 text-[#D9381E]" /> My Tickets
                  </Link>
                  <Link
                    to="/my-bookings"
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                      isDark ? 'text-slate-200 hover:bg-white/[0.06] hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-slate-400" /> My Bookings
                  </Link>

                  <div className={`border-t my-1 ${isDark ? 'border-white/10' : 'border-slate-900/10'}`} />

                  <Link
                    to="/organizer"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#D9381E] hover:bg-[#D9381E]/10 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" /> Organizer Studio
                  </Link>

                  <div className={`border-t my-1 ${isDark ? 'border-white/10' : 'border-slate-900/10'}`} />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 text-left cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className={`px-3.5 py-2 rounded-full text-xs sm:text-[13px] font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
                  isDark
                    ? 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-900/[0.06]'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`group inline-flex items-center gap-1.5 pl-4 pr-3 py-2 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
                  isDark
                    ? 'bg-[#F4F1EA] hover:bg-white text-[#060709] shadow-[0_4px_16px_rgba(244,241,234,0.18)]'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                }`}
              >
                <span>Get Started</span>
                <span className="w-5 h-5 rounded-full bg-[#D9381E] text-white flex items-center justify-center transition-transform duration-150 group-hover:translate-x-0.5">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile theme toggle + menu toggle */}
        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle compact={true} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-full transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
              isDark
                ? 'text-slate-200 hover:text-white hover:bg-white/[0.06]'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-900/[0.06]'
            }`}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div
          className={`pointer-events-auto animate-dropdown-in md:hidden max-w-6xl mx-auto mt-2 rounded-2xl backdrop-blur-xl border px-5 pt-3 pb-5 space-y-2 shadow-2xl ${
            isDark
              ? 'bg-[#090A0E]/95 border-white/15 text-slate-200'
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
        >
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium hover:text-[#D9381E] transition-colors"
          >
            Explore Events
          </Link>
          <a
            href="#categories"
            onClick={handleCategoriesClick}
            className="block py-2 font-medium hover:text-[#D9381E] transition-colors"
          >
            Categories
          </a>
          <Link
            to="/my-tickets"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium hover:text-[#D9381E] transition-colors"
          >
            My Tickets
          </Link>
          <Link
            to="/organizer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-[#D9381E] font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9381E]" aria-hidden="true" />
            For Organizers
          </Link>

          <div className={`pt-3 border-t ${isDark ? 'border-white/10' : 'border-slate-900/10'}`}>
            {user ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Signed in as {user.email}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
