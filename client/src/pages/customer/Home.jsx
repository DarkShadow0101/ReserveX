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

// Demo showcase matches the exact 3 featured festival/concert/comedy cards when DB has fewer than 3 events
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
    <div className="bg-transparent text-[#F4F1EA] relative overflow-hidden">
      {/* 1. FIRST VIEWPORT: Laser Stage Backdrop + Display Typography + Search + 3-Col Bento Cards */}
      <section className="relative pt-20 sm:pt-24 pb-16">
        {/* Seamless Full-bleed Stage Concert Photography Backdrop fading cleanly into Categories */}
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
            className="w-full h-full object-cover object-center opacity-90 contrast-[1.08] saturate-[1.15] animate-hero-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06080E]/55 via-[#06080E]/28 to-[#06080E]/65" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          {/* Customer-focused stage eyebrow */}
          <div className="animate-fade-up max-w-full inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-black/55 border border-white/15 backdrop-blur-md font-mono text-[11px] uppercase tracking-[0.08em] sm:tracking-[0.18em] text-[#F4F1EA] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" aria-hidden="true" />
            <span>[ Live Shows • Comedy • QR Pass ]</span>
          </div>

          {/* Towering Condensed + Sculpted Editorial Italic Headline */}
          <h1 className="animate-fade-up-delay-1 mt-3 w-full text-center text-[2.45rem] sm:text-6xl lg:text-[4.55rem] leading-none">
            <span className="block font-display uppercase font-bold tracking-tight text-white leading-[0.94] drop-shadow-[0_6px_30px_rgba(0,0,0,0.85)]">
              Unforgettable Live
            </span>
            <span className="block font-serif italic font-normal text-[#F4F1EA] text-[2.15rem] sm:text-5xl lg:text-[4.15rem] leading-[1.0] mt-1 drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
              Nights, Reserved.
            </span>
          </h1>

          {/* Accessible Primary Coral CTA + Dark My Tickets Button */}
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
              className="px-5 py-2 rounded-xl bg-[#141720]/90 hover:bg-[#1C202C] border border-white/20 hover:border-white/35 text-sm font-semibold text-[#F4F1EA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D]"
            >
              My Tickets
            </Link>
          </div>

          {/* Compact Integrated Dark Search Strip */}
          <div className="w-full max-w-4xl mt-5 animate-fade-up-delay-2">
            <SearchFilterBar onSearch={handleSearch} variant="dark-glass" />
          </div>

          {/* 3-Column Vibrant Stage Photography Bento Cards inside Hero Fold */}
          <div className="w-full mt-6 space-y-2.5">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-mono text-xs uppercase tracking-[0.14em] sm:tracking-[0.18em] text-slate-300 font-semibold whitespace-nowrap">
                  Featured Shows
                </h2>
                {hasDemoFallback && !loading && (
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300 bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                    Sample Lineup
                  </span>
                )}
              </div>

              <Link
                to="/events"
                className="group inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF4D2D] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner theme="dark" text="Loading featured events..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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

      {/* 2. BROWSE BY CATEGORY (Overlapping Feathered Arena Horizon — zero gap or horizontal line) */}
      <section id="categories" className="relative z-10 -mt-12 pt-16 pb-20 overflow-hidden">
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display uppercase tracking-tight text-2xl sm:text-3xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                Browse by Category
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-200">
                Explore curated nights across live music, stand-up, stadium sports, and cultural stages.
              </p>
            </div>
            <Link
              to="/events"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors"
            >
              <span>View All Events</span>
              <ArrowRight className="w-4 h-4 text-[#FF4D2D] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} category={cat} variant="dark-tile" />
            ))}
          </div>
        </div>
      </section>

      {/* 3. FULL-BLEED OPEN VENUE GATE STAGE (Unboxed typography floating cleanly over 100vw stadium crowd) */}
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
            className="w-full h-full object-cover object-center opacity-85 contrast-[1.08] saturate-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070C]/92 via-[#05070C]/60 via-[55%] to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-5">
            <h2 className="font-display uppercase tracking-tight text-3xl sm:text-5xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
              Built for the Venue Gate
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
              Every confirmed booking issues signed single-use QR entry passes inside your ticket wallet, while organizers track live capacity and door check-ins from Organizer Studio.
            </p>

            <div className="flex flex-wrap gap-3 pt-1 text-xs sm:text-sm text-slate-100">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/15">
                <QrCode className="w-4 h-4 text-[#FF4D2D] shrink-0" />
                <span>Instant verified QR ticket wallet</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/15">
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
                className="px-4 py-2.5 rounded-xl bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                Browse All Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
