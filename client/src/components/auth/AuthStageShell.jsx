import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, QrCode, ShieldCheck, Ticket } from 'lucide-react';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

/**
 * Shared full-bleed concert backdrop & split glass layout for Sign In / Register views.
 */
export default function AuthStageShell({
  mode = 'login',
  redirectUrl = '/',
  backgroundImage,
  displayTitle,
  displaySerif,
  subtitle,
  children
}) {
  const { isDark } = useTheme();
  const redirectQuery = redirectUrl && redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : '';

  return (
    <div
      className={`min-h-screen relative flex flex-col justify-between overflow-x-hidden ${
        isDark ? 'bg-[#06080E] text-[#F4F1EA]' : 'bg-[#F8FAFC] text-[#0F172A]'
      }`}
    >
      {isDark ? (
        /* Dark Mode: Full-bleed atmospheric stage backdrop */
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center scale-[1.02] opacity-70 contrast-[1.08] saturate-[1.15]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, rgba(5,7,12,0.92) 0%, rgba(5,7,12,0.68) 48%, rgba(6,8,14,0.88) 100%)'
            }}
          />
        </div>
      ) : (
        /* Light Mode: Clean daylight architectural wash */
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 25% 15%, rgba(217, 56, 30, 0.06), transparent 65%), linear-gradient(135deg, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%)'
          }}
        />
      )}

      {/* Minimal Top Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 flex items-center justify-between gap-4">
        <Logo />

        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <ThemeToggle compact={true} />
          <Link
            to="/events"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border transition-all active:scale-95 ${
              isDark
                ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/15 text-slate-200 hover:text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-950 shadow-xs'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-[#D9381E]" />
            <span>Explore Shows</span>
          </Link>
          <Link
            to="/"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full backdrop-blur-md border transition-all active:scale-95 ${
              isDark
                ? 'bg-black/45 hover:bg-black/65 border-white/15 text-slate-200 hover:text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:text-slate-950 shadow-xs'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Centered Split Editorial Showcase & Elevated Auth Card */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Editorial Stage Copy */}
          <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] leading-[0.95]">
              <span
                className={`block font-display uppercase font-bold tracking-tight ${
                  isDark ? 'text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]' : 'text-[#0F172A]'
                }`}
              >
                {displayTitle}
              </span>
              <span
                className={`block font-serif italic font-normal mt-1 ${
                  isDark ? 'text-[#F4F1EA] drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]' : 'text-[#D9381E]'
                }`}
              >
                {displaySerif}
              </span>
            </h1>

            <p
              className={`text-sm sm:text-base max-w-md mx-auto lg:mx-0 leading-relaxed ${
                isDark ? 'text-slate-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]' : 'text-slate-600'
              }`}
            >
              {subtitle}
            </p>

            {/* In Light Mode show a compact crisp stage thumbnail preview for visual life */}
            {!isDark && backgroundImage && (
              <div
                data-photo-overlay="true"
                className="hidden sm:block relative h-32 max-w-md mx-auto lg:mx-0 rounded-2xl overflow-hidden bg-[#090B11] shadow-md border border-slate-200"
              >
                <img
                  src={backgroundImage}
                  alt="ReserveX live concert atmosphere"
                  className="w-full h-full object-cover object-center contrast-[1.08] saturate-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-mono">
                  <span className="uppercase tracking-wider">Instant Pass Sync</span>
                  <span className="text-[#10B981] font-semibold">Live Portal</span>
                </div>
              </div>
            )}

            {/* Concise Venue Capabilities (desktop + tablet) */}
            <div className="hidden sm:grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0 pt-1 text-left">
              <div
                className={`px-3.5 py-3 rounded-xl backdrop-blur-md border space-y-1 ${
                  isDark ? 'bg-black/45 border-white/15' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className={`flex items-center gap-2 text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <QrCode className="w-4 h-4 text-[#D9381E] shrink-0" />
                  <span>Digital QR Wallet</span>
                </div>
                <p className={`text-xs leading-snug text-pretty ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Signed single-use gate passes ready offline.
                </p>
              </div>
              <div
                className={`px-3.5 py-3 rounded-xl backdrop-blur-md border space-y-1 ${
                  isDark ? 'bg-black/45 border-white/15' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className={`flex items-center gap-2 text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>10-Min Seat Holds</span>
                </div>
                <p className={`text-xs leading-snug text-pretty ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Inventory held safely during Razorpay checkout.
                </p>
              </div>
            </div>
          </div>

          {/* Crisp Auth Form Panel (using valid Tailwind alpha modifiers) */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
            <div
              key={mode}
              className={`animate-swap-in backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border space-y-5 ${
                isDark
                  ? 'bg-[#090C14]/85 border-white/15 shadow-2xl'
                  : 'bg-white border-slate-200 shadow-[0_24px_56px_rgba(15,23,42,0.09)]'
              }`}
            >
              {/* Segmented Sign In / Create Account Tab Switcher */}
              <div
                role="tablist"
                aria-label="Account access mode"
                className={`grid grid-cols-2 gap-1 p-1 rounded-xl border ${
                  isDark ? 'bg-[#05070B]/85 border-white/10' : 'bg-slate-100 border-slate-900/10'
                }`}
              >
                <Link
                  to={`/login${redirectQuery}`}
                  role="tab"
                  aria-selected={mode === 'login'}
                  className={`py-2 rounded-lg text-center text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] ${
                    mode === 'login'
                      ? 'bg-[#D9381E] text-white shadow-sm'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to={`/register${redirectQuery}`}
                  role="tab"
                  aria-selected={mode === 'register'}
                  className={`py-2 rounded-lg text-center text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] ${
                    mode === 'register'
                      ? 'bg-[#D9381E] text-white shadow-sm'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                  }`}
                >
                  Create Account
                </Link>
              </div>

              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Bottom Note */}
      <footer
        className={`relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 flex items-center justify-between text-xs font-mono ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        <span>© {new Date().getFullYear()} ReserveX</span>
        <Link to="/organizer" className="hover:text-[#D9381E] transition-colors">
          Organizer Studio →
        </Link>
      </footer>
    </div>
  );
}
