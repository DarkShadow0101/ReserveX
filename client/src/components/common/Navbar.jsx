import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Ticket, Calendar, ShieldCheck, ChevronDown, ArrowRight, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function Navbar({ transparent = false }) {
  const { user, logout } = useAuth();
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

  const handleCategoriesClick = (e) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      e.preventDefault();
      navigate('/');
      setTimeout(() => {
        document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
      }, 140);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`));

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
      {/* Machined Anodized Smoked Capsule Bar */}
      <div
        className={`pointer-events-auto max-w-6xl mx-auto h-[58px] pl-4 pr-2.5 sm:pl-5 sm:pr-3 rounded-full border backdrop-blur-2xl transition-all duration-300 flex items-center justify-between gap-4 ${
          transparent && isHomePage && !isScrolled
            ? 'bg-[#0C0E14]/78 border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_40px_rgba(0,0,0,0.55)]'
            : 'bg-[#080A0F]/94 border-white/[0.16] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_48px_rgba(0,0,0,0.82)]'
        }`}
      >
        <Logo light={true} />

        {/* Center Segmented Navigation Rail */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-0.5 rounded-full bg-white/[0.035] border border-white/[0.08] p-1 text-[13px] font-medium"
        >
          <Link
            to="/events"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
              isActive('/events')
                ? 'bg-white/[0.12] text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Explore Events
          </Link>
          <a
            href="#categories"
            onClick={handleCategoriesClick}
            className="px-3.5 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D]"
          >
            Categories
          </a>
          <Link
            to="/my-tickets"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
              isActive('/my-tickets')
                ? 'bg-white/[0.12] text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            My Tickets
          </Link>
          <Link
            to="/organizer"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
              isActive('/organizer')
                ? 'bg-white/[0.12] text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D2D]" aria-hidden="true" />
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
            className={isActive('/events') ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}
          >
            Explore
          </Link>
          <a
            href="#categories"
            onClick={handleCategoriesClick}
            className="text-slate-300 hover:text-white"
          >
            Categories
          </a>
          <Link
            to="/my-tickets"
            className={isActive('/my-tickets') ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}
          >
            Tickets
          </Link>
          <Link
            to="/organizer"
            className={isActive('/organizer') ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}
          >
            Organizers
          </Link>
        </nav>

        {/* Right Action Cluster */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white/[0.07] hover:bg-white/[0.13] border border-white/15 transition-colors cursor-pointer text-xs sm:text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D]"
              >
                <div className="w-7 h-7 rounded-full bg-[#D9381E] flex items-center justify-center font-bold text-xs text-white">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[110px] truncate">{user.fullName || user.email}</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-60 bg-[#101219] text-[#F4F1EA] rounded-2xl shadow-2xl border border-white/15 py-2 z-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-white mt-0.5">{user.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FF4D2D]/15 text-[#FF4D2D] border border-[#FF4D2D]/30">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/my-tickets"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Ticket className="w-4 h-4 text-[#FF4D2D]" /> My Tickets
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Calendar className="w-4 h-4 text-slate-400" /> My Bookings
                  </Link>

                  <div className="border-t border-white/10 my-1" />

                  <Link
                    to="/organizer"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#FF4D2D] hover:bg-[#FF4D2D]/10"
                  >
                    <ShieldCheck className="w-4 h-4" /> Organizer Studio
                  </Link>

                  <div className="border-t border-white/10 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 text-left cursor-pointer"
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
                className="px-3.5 py-2 rounded-full text-xs sm:text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center gap-1.5 pl-4 pr-3 py-2 rounded-full bg-[#F4F1EA] hover:bg-white text-[#060709] text-xs sm:text-[13px] font-semibold shadow-[0_4px_16px_rgba(244,241,234,0.18)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D]"
              >
                <span>Get Started</span>
                <span className="w-5 h-5 rounded-full bg-[#D9381E] text-white flex items-center justify-center transition-transform duration-150 group-hover:translate-x-0.5">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-slate-200 hover:text-white hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D]"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden max-w-6xl mx-auto mt-2 rounded-2xl bg-[#090A0E]/96 backdrop-blur-xl border border-white/15 px-5 pt-3 pb-5 space-y-2 shadow-2xl">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-white font-medium"
          >
            Explore Events
          </Link>
          <a
            href="#categories"
            onClick={handleCategoriesClick}
            className="block py-2 text-slate-200 hover:text-white font-medium"
          >
            Categories
          </a>
          <Link
            to="/my-tickets"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-white font-medium"
          >
            My Tickets
          </Link>
          <Link
            to="/organizer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-[#FF4D2D] font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D2D]" aria-hidden="true" />
            For Organizers
          </Link>

          <div className="pt-3 border-t border-white/10">
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
                  className="w-full text-white border-white/15 bg-transparent hover:bg-white/10"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-white border-white/15 bg-transparent hover:bg-white/10">
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
