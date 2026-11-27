import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import {
  HERO_IMAGE,
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
    <div className="bg-[#060709] text-[#F4F1EA] relative overflow-hidden">
      {/* 1. FIRST VIEWPORT: Laser Stage Backdrop + Display Typography + Search + 3-Col Bento Cards */}
      <section className="relative pt-20 sm:pt-24 pb-8">
        {/* Full-bleed Stage Concert Photography Backdrop fading cleanly into #060709 */}
        <div
          className="absolute inset-x-0 top-0 h-[490px] z-0 pointer-events-none overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 54%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 54%, transparent 100%)'
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
            className="w-full h-full object-cover object-center opacity-80 contrast-[1.08] saturate-[1.15] animate-hero-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060709]/65 via-[#060709]/35 to-[#060709]" />
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

      {/* 2. BROWSE BY CATEGORY */}
      <section id="categories" className="relative z-10 py-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <h2 className="font-display uppercase tracking-tight text-2xl sm:text-3xl font-bold text-white">
              Browse by Category
            </h2>
            <Link
              to="/events"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
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
    </div>
  );
}
