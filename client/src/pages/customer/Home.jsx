import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, QrCode, ShieldCheck } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import {
  HERO_IMAGE,
  CATEGORY_HORIZON_IMAGE,
  SHOWCASE_CROWD_IMAGE,
  FALLBACK_EVENT_IMAGE,
  CATEGORIES
} from '../../mocks/eventImages';
import EventCard from '../../components/customer/EventCard';
import CategoryCard from '../../components/customer/CategoryCard';
import SearchFilterBar from '../../components/customer/SearchFilterBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';

// Demo showcase matches the featured festival/concert/comedy cards when DB has fewer than 3 events
const DEMO_EVENTS = [
  {
    _id: 'demo-sunburn-festival',
    isDemo: true,
    categoryLabel: 'Festival',
    title: 'Sunburn Music Festival',
    venue: 'Pune',
    startsAt: new Date(Date.now() + 86400000 * 18).toISOString(),
    status: 'published',
    ticketTypes: [{ name: 'Festival Pass', price: 299900, isActive: true }]
  },
  {
    _id: 'demo-diljit-tour',
    isDemo: true,
    categoryLabel: 'Concert',
    title: 'Diljit Dosanjh India Tour',
    venue: 'Mumbai',
    startsAt: new Date(Date.now() + 86400000 * 6).toISOString(),
    status: 'published',
    ticketTypes: [{ name: 'Silver', price: 349900, isActive: true }]
  },
  {
    _id: 'demo-standup-bengaluru',
    isDemo: true,
    categoryLabel: 'Comedy',
    title: 'Midnight Comedy Live',
    venue: 'Bengaluru',
    startsAt: new Date(Date.now() + 86400000 * 13).toISOString(),
    status: 'published',
    ticketTypes: [{ name: 'Standard', price: 89900, isActive: true }]
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDemoFallback, setHasDemoFallback] = useState(false);
  const [heroImgSrc, setHeroImgSrc] = useState(HERO_IMAGE);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await eventsApi.getPublicEvents({ limit: 6 });
        const list = res.data?.events || [];

        if (list.length >= 3) {
          setEvents(list.slice(0, 3));
          setHasDemoFallback(false);
        } else if (list.length > 0) {
          setEvents([...list, ...DEMO_EVENTS.slice(0, 3 - list.length)]);
          setHasDemoFallback(true);
        } else {
          setEvents(DEMO_EVENTS);
          setHasDemoFallback(true);
        }
      } catch {
        setEvents(DEMO_EVENTS);
        setHasDemoFallback(true);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const handleSearch = ({ search, location, date, category }) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    if (date) params.set('date', date);
    if (category) params.set('category', category);
    const qs = params.toString();
    navigate(qs ? `/events?${qs}` : '/events');
  };

  const featuredCards = events.length >= 3 ? events.slice(0, 3) : DEMO_EVENTS;

  return (
    <div className={`bg-transparent relative overflow-hidden ${isDark ? 'text-[#F4F1EA]' : 'text-[#0F172A]'}`}>
      {/* 1. FIRST VIEWPORT: Stage Backdrop + Display Typography + Search + 3-Col Bento Cards */}
      <section className="relative pt-20 sm:pt-24 pb-16">
        {isDark ? (
          <div
            className="absolute inset-x-0 top-0 h-[820px] z-0 pointer-events-none overflow-hidden"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, black 32%, rgba(0, 0, 0, 0.56) 68%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 32%, rgba(0, 0, 0, 0.56) 68%, transparent 100%)'
            }}
          >
            <img
              src={heroImgSrc}
              alt="Concert stage lasers and illuminated arena silhouettes"
              onError={() => {
                if (heroImgSrc !== FALLBACK_EVENT_IMAGE) {
                  setHeroImgSrc(FALLBACK_EVENT_IMAGE);
                }
              }}
              className="w-full h-full object-cover object-center animate-hero-zoom opacity-90 contrast-[1.08] saturate-[1.15]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#06080E]/55 via-[#06080E]/30 to-[#06080E]/65" />
          </div>
        ) : (
          <div
            className="absolute inset-x-0 top-0 h-[720px] z-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 65% 45% at 50% 0%, rgba(217, 56, 30, 0.08), transparent 72%), linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)'
            }}
          />
        )}

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          {/* Customer-focused stage eyebrow */}
          <div
            className={`animate-fade-up max-w-full inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-full border backdrop-blur-md font-mono text-[11px] uppercase tracking-[0.08em] sm:tracking-[0.18em] whitespace-nowrap ${
              isDark
                ? 'bg-black/55 border-white/15 text-[#F4F1EA]'
                : 'bg-white border-slate-200 text-slate-700 shadow-xs'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" aria-hidden="true" />
            <span>[ Live Shows • Comedy • QR Pass ]</span>
          </div>

          {/* Towering Condensed + Sculpted Editorial Italic Headline */}
          <h1 className="animate-fade-up-delay-1 mt-3 w-full text-center text-[2.45rem] sm:text-6xl lg:text-[4.55rem] leading-none">
            <span
              className={`block font-display uppercase font-bold tracking-tight leading-[0.94] ${
                isDark ? 'text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.85)]' : 'text-[#0F172A]'
              }`}
            >
              Unforgettable Live
            </span>
            <span
              className={`block font-serif italic font-normal text-[2.15rem] sm:text-5xl lg:text-[4.15rem] leading-[1.0] mt-1 ${
                isDark ? 'text-[#F4F1EA] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]' : 'text-[#D9381E]'
              }`}
            >
              Nights, Reserved.
            </span>
          </h1>

          {/* Accessible Primary Coral CTA + My Tickets Button */}
          <div className="animate-fade-up-delay-2 mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link to="/events">
              <Button
                variant="primary"
                size="md"
                className="bg-[#D9381E] hover:bg-[#C92C12] text-white px-5 py-2 rounded-xl shadow-lg border border-[#FF6B4A]/30 text-sm font-semibold"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link
              to="/my-tickets"
              className={`px-5 py-2 rounded-xl border text-sm font-semibold transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
                isDark
                  ? 'bg-[#141720]/90 hover:bg-[#1C202C] border-white/20 hover:border-white/35 text-[#F4F1EA]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900 shadow-xs'
              }`}
            >
              My Tickets
            </Link>
          </div>

          {/* Compact Integrated Search Strip */}
          <div className="w-full max-w-4xl mt-5 animate-fade-up-delay-2">
            <SearchFilterBar onSearch={handleSearch} variant="dark-glass" />
          </div>

          {/* 3-Column Vibrant Stage Photography Bento Cards inside Hero Fold */}
          <div className="w-full mt-6 space-y-2.5">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <h2
                  className={`font-mono text-xs uppercase tracking-[0.14em] sm:tracking-[0.18em] font-semibold whitespace-nowrap ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Featured Shows
                </h2>
                {hasDemoFallback && !loading && (
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                      isDark
                        ? 'text-slate-300 bg-white/[0.06] border-white/10'
                        : 'text-slate-600 bg-white border-slate-200'
                    }`}
                  >
                    Sample Lineup
                  </span>
                )}
              </div>

              <Link
                to="/events"
                className={`group inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap shrink-0 ${
                  isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D9381E] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12">
                <LoadingSpinner theme={isDark ? 'dark' : 'light'} text="Loading featured events..." />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-swap-in">
                {featuredCards.map((event) => (
                  <EventCard
                    key={event._id || event.id}
                    event={event}
                    variant="bento-open"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. BROWSE BY CATEGORY */}
      <section
        id="categories"
        className={`relative z-10 overflow-hidden ${
          isDark ? '-mt-12 pt-16 pb-20 rounded-3xl' : 'pt-4 pb-16'
        }`}
      >
        {isDark && (
          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)'
            }}
          >
            <img
              src={CATEGORY_HORIZON_IMAGE}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-center opacity-[0.4] saturate-125"
            />
            <div className="absolute inset-0 bg-[#07090F]/55" />
          </div>
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2
                className={`font-display uppercase tracking-tight text-2xl sm:text-3xl font-bold ${
                  isDark ? 'text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]' : 'text-[#0F172A]'
                }`}
              >
                Browse by Category
              </h2>
              <p className={`mt-1 text-xs sm:text-sm ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
                Explore curated nights across live music, stand-up, stadium sports, and cultural stages.
              </p>
            </div>
            <Link
              to="/events"
              className={`group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <span>View All Events</span>
              <ArrowRight className="w-4 h-4 text-[#D9381E] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} category={cat} variant="dark-tile" />
            ))}
          </div>
        </div>
      </section>

      {/* 3. VENUE GATE SHOWCASE (Full-Bleed in Dark Mode / Crisp Editorial Photo Split in Light Mode) */}
      {isDark ? (
        <section className="relative z-10 -mt-14 pt-20 pb-24 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 22%, black 80%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 22%, black 80%, transparent 100%)'
            }}
          >
            <img
              src={SHOWCASE_CROWD_IMAGE}
              alt="Night stadium crowd illuminated under concert confetti and stage lights"
              className="w-full h-full object-cover object-center contrast-[1.08] saturate-110 opacity-85"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(5,7,12,0.92) 0%, rgba(5,7,12,0.6) 55%, transparent 100%)'
              }}
            />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl space-y-5">
              <h2 className="font-display uppercase tracking-tight text-3xl sm:text-5xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
                Built for the Venue Gate
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-slate-200 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                Every confirmed booking issues signed single-use QR entry passes inside your ticket wallet, while organizers track live capacity and door check-ins from Organizer Studio.
              </p>

              <div className="flex flex-wrap gap-3 pt-1 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl backdrop-blur-md border bg-black/50 border-white/15 text-slate-100">
                  <QrCode className="w-4 h-4 text-[#D9381E] shrink-0" />
                  <span>Instant verified QR ticket wallet</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl backdrop-blur-md border bg-black/50 border-white/15 text-slate-100">
                  <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Real-time Razorpay &amp; gate sync</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/organizer">
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-[#D9381E] hover:bg-[#C92C12] text-white rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-lg"
                  >
                    <span>Open Organizer Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link
                  to="/events"
                  className="px-4 py-2.5 rounded-xl backdrop-blur-md border text-xs sm:text-sm font-semibold transition-all active:scale-95 bg-black/45 hover:bg-black/65 border-white/20 text-white"
                >
                  Browse All Events
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative z-10 pt-2 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.07)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-center space-y-5">
                <h2 className="font-display uppercase tracking-tight text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#0F172A]">
                  Built for the Venue Gate
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 max-w-xl">
                  Every confirmed booking issues signed single-use QR entry passes inside your ticket wallet, while organizers track live capacity and door check-ins from Organizer Studio.
                </p>

                <div className="flex flex-wrap gap-3 pt-1 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-800">
                    <QrCode className="w-4 h-4 text-[#D9381E] shrink-0" />
                    <span>Instant verified QR ticket wallet</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Real-time Razorpay &amp; gate sync</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link to="/organizer">
                    <Button
                      variant="primary"
                      size="md"
                      className="bg-[#D9381E] hover:bg-[#C92C12] text-white rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-sm"
                    >
                      <span>Open Organizer Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link
                    to="/events"
                    className="px-4 py-2.5 rounded-xl border bg-white hover:bg-slate-50 border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-all active:scale-95"
                  >
                    Browse All Events
                  </Link>
                </div>
              </div>

              <div data-photo-overlay="true" className="lg:col-span-5 relative min-h-[240px] lg:min-h-full bg-[#090B11] overflow-hidden">
                <img
                  src={SHOWCASE_CROWD_IMAGE}
                  alt="Night stadium crowd illuminated under concert confetti and stage lights"
                  className="w-full h-full object-cover object-center contrast-[1.08] saturate-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white">
                  <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/15">
                    Live Gate Check-In
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#10B981]">
                    99.9% Uptime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
