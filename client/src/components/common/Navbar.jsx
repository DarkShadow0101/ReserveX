import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, LogOut, Ticket, Calendar, ShieldCheck, ChevronDown, Menu, X } from 'lucide-react';
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

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  // When transparent prop is active and not scrolled, show glass-dark style over hero
  const navBg = isHomePage && !isScrolled
    ? 'bg-transparent text-white'
    : 'bg-brand-navy/95 backdrop-blur-md text-white border-b border-slate-800/80 shadow-md';

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Logo light={true} />
          
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link
              to="/events"
              className="text-slate-200 hover:text-white transition-colors duration-150 flex items-center gap-1"
            >
              Explore <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </Link>
            <a
              href="#categories"
              onClick={(e) => {
                if (location.pathname !== '/') {
                  navigate('/#categories');
                }
              }}
              className="text-slate-200 hover:text-white transition-colors duration-150 flex items-center gap-1"
            >
              Categories <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </a>
            <Link
              to="/my-tickets"
              className="text-slate-200 hover:text-white transition-colors duration-150"
            >
              My Tickets
            </Link>
          </nav>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="hidden md:flex items-center gap-5">
          <button
            onClick={() => navigate('/events')}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Search events"
          >
            <Search className="w-4 h-4" />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 transition-colors cursor-pointer text-sm font-medium"
              >
                <div className="w-7 h-7 rounded-full bg-brand-purple flex items-center justify-center font-bold text-xs text-white">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user.fullName || user.email}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-slate-900">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-brand-purple">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/my-tickets"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-purple"
                  >
                    <Ticket className="w-4 h-4" /> My Tickets
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-purple"
                  >
                    <Calendar className="w-4 h-4" /> My Bookings
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <Link
                    to="/organizer"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-brand-purple hover:bg-indigo-50/70"
                  >
                    <ShieldCheck className="w-4 h-4" /> Organizer Portal
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-200 hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="primary" size="pill" className="bg-brand-purple shadow-glow">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-navy border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 font-medium"
          >
            Explore Events
          </Link>
          <Link
            to="/my-tickets"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 font-medium"
          >
            My Tickets
          </Link>
          <Link
            to="/organizer"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-brand-purple font-semibold"
          >
            Organizer Dashboard
          </Link>
          
          <div className="pt-3 border-t border-slate-800">
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
                  className="w-full text-white border-slate-700 bg-transparent hover:bg-slate-800"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-white border-slate-700 bg-transparent">
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
