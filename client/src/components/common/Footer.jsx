import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from './Logo';
import { useTheme } from '../../context/ThemeContext';

export default function Footer() {
  const { isDark } = useTheme();

  return (
    <footer
      className={`relative z-10 ${
        isDark
          ? '-mt-10 pt-14 pb-8 bg-gradient-to-b from-transparent via-[#05070C]/85 via-[25%] to-[#040508] text-slate-300'
          : 'pt-12 pb-8 bg-[#F1F5F9] border-t border-slate-200 text-slate-700'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 md:grid-cols-12 gap-8 pb-6 border-b items-start ${
            isDark ? 'border-white/10' : 'border-slate-900/12'
          }`}
        >
          {/* Col 1: Brand Info */}
          <div className="md:col-span-4 space-y-2.5">
            <Logo />
            <p className={`text-xs sm:text-sm max-w-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Stage-side ticketing for live music, comedy, sports, and festivals across India.
            </p>
          </div>

          {/* Col 2: Compact 2-Column Categories */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className={`text-xs font-mono font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Explore
            </h4>
            <ul className={`grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <li>
                <Link to="/events" className="hover:text-[#D9381E] transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link to="/events?category=concerts" className="hover:text-[#D9381E] transition-colors">
                  Concerts
                </Link>
              </li>
              <li>
                <Link to="/events?category=festivals" className="hover:text-[#D9381E] transition-colors">
                  Festivals
                </Link>
              </li>
              <li>
                <Link to="/events?category=comedy" className="hover:text-[#D9381E] transition-colors">
                  Comedy
                </Link>
              </li>
              <li>
                <Link to="/events?category=sports" className="hover:text-[#D9381E] transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link to="/events?category=workshops" className="hover:text-[#D9381E] transition-colors">
                  Workshops
                </Link>
              </li>
              <li className="col-span-2">
                <Link to="/events?category=arts" className="hover:text-[#D9381E] transition-colors">
                  Arts &amp; Culture
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Account & Gate */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className={`text-xs font-mono font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Account
            </h4>
            <ul className={`space-y-1.5 text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <li>
                <Link to="/my-tickets" className="hover:text-[#D9381E] transition-colors">
                  My Tickets
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-[#D9381E] transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/organizer" className="hover:text-[#D9381E] transition-colors">
                  Organizer Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Host CTA */}
          <div className="md:col-span-3 space-y-3">
            <h4 className={`text-xs font-mono font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Host an Event
            </h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage tiered ticket drops and live QR check-in gates.
            </p>
            <div className="flex items-center gap-2.5">
              <Link
                to="/organizer/events/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D9381E] hover:bg-[#C92C12] text-white text-xs font-semibold transition-all active:scale-95 whitespace-nowrap"
              >
                <span>Create Event</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/events"
                className={`inline-flex items-center px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all active:scale-95 whitespace-nowrap ${
                  isDark
                    ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/15 text-slate-200'
                    : 'bg-white/80 hover:bg-white border-slate-900/15 text-slate-800'
                }`}
              >
                Browse
              </Link>
            </div>
          </div>
        </div>

        <div className={`pt-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <p className="font-mono text-[11px]">© {new Date().getFullYear()} ReserveX. Verified live ticketing.</p>
          <div className="flex items-center gap-5 font-mono text-[11px]">
            <Link to="/events" className="hover:text-[#D9381E] transition-colors">
              Live Lineup
            </Link>
            <Link to="/my-tickets" className="hover:text-[#D9381E] transition-colors">
              Ticket Wallet
            </Link>
            <Link to="/organizer" className="hover:text-[#D9381E] transition-colors">
              Studio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
