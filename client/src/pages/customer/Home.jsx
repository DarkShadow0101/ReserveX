import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Play } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import {
  HERO_IMAGE,
  PROMO_BANNER_IMAGE,
  FALLBACK_EVENT_IMAGE,
  CATEGORIES
} from '../../mocks/eventImages';
import { formatEventDate } from '../../utils/date';
import EventCard from '../../components/customer/EventCard';
import CategoryCard from '../../components/customer/CategoryCard';
import SearchFilterBar from '../../components/customer/SearchFilterBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

// Clearly labelled demo fallback events used only when the backend returns fewer than 4 events
const DEMO_EVENTS = [
  {
    _id: 'demo-arijit-pune',
    isDemo: true,
    categoryLabel: 'Featured',
    title: 'Arijit Singh Live in Pune',
    venue: 'Balewadi Stadium, Pune',
    startsAt: new Date(Date.now() + 86400000 * 10).toISOString(),
    status: 'published',
    ticketTypes: [{ name: 'General', price: 149900, isActive: true }]
  },
  {
    _id: 'demo-sunburn-festival',
    isDemo: true,
    categoryLabel: 'Festival',
    title: 'Sunburn Music Festival',
    venue: 'Pune, Maharashtra',
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
  const [promoImgSrc, setPromoImgSrc] = useState(PROMO_BANNER_IMAGE);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await eventsApi.getPublicEvents({ limit: 6 });
        const list = res.data?.events || [];

        if (list.length >= 4) {
          setEvents(list.slice(0, 4));
          setHasDemoFallback(false);
        } else if (list.length > 0) {
          setEvents([...list, ...DEMO_EVENTS.slice(0, 4 - list.length)]);
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

  const handleSearch = ({ search, location, category }) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    if (category) params.set('category', category);
    navigate(`/events?${params.toString()}`);
  };

  const heroSpotlightEvent = events[0] || DEMO_EVENTS[0];
  const featuredMainEvent = events[1] || events[0] || DEMO_EVENTS[1];
  const featuredStackedEvents = events.length >= 4 ? events.slice(2, 4) : DEMO_EVENTS.slice(2, 4);

  const heroSpotlightHref = heroSpotlightEvent.isDemo
    ? `/events?search=${encodeURIComponent(heroSpotlightEvent.title || '')}`
    : `/events/${heroSpotlightEvent._id || heroSpotlightEvent.id}`;

  return (
    <div className="bg-brand-navy text-white relative overflow-hidden">
      {/* Continuous Atmospheric Lighting & Subtle Orbital Arcs */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            'radial-gradient(circle at 12% 10%, rgba(91, 76, 242, 0.24), transparent 36%)',
            'radial-gradient(circle at 75% 18%, rgba(214, 70, 150, 0.16), transparent 38%)',
            'radial-gradient(circle at 22% 48%, rgba(91, 76, 242, 0.14), transparent 35%)',
            'radial-gradient(circle at 82% 62%, rgba(91, 76, 242, 0.16), transparent 38%)',
            'radial-gradient(circle at 50% 90%, rgba(168, 85, 247, 0.18), transparent 40%)'
          ].join(', ')
        }}
      />

      {/* Subtle Decorative Orbital Hairlines (matching reference atmosphere) */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full border border-indigo-400/15 z-0" />
      <div className="pointer-events-none absolute top-[340px] -right-32 w-[480px] h-[480px] rounded-full border border-purple-400/10 z-0" />

      {/* 1. ASYMMETRIC CINEMATIC HERO */}
      <section className="relative pt-24 pb-20 lg:pt-28 lg:pb-24">
        {/* Full-bleed Right-weighted Photography (smoothly masked on left & bottom—no hard edge) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, black 68%, transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, black 68%, transparent 100%)'
          }}
        >
          <img
            src={heroImgSrc}
            alt="Live stage performer under purple and indigo concert lighting"
            onError={() => {
              if (heroImgSrc !== FALLBACK_EVENT_IMAGE) {
                setHeroImgSrc(FALLBACK_EVENT_IMAGE);
              }
            }}
            className="w-full h-full object-cover object-[72%_center] opacity-75 lg:opacity-90 animate-hero-zoom"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent 18%, rgba(0,0,0,0.45) 40%, black 66%)',
              maskImage:
                'linear-gradient(to right, transparent 18%, rgba(0,0,0,0.45) 40%, black 66%)'
            }}
          />
          {/* Top-to-bottom & left-to-right gradient depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-brand-navy/70" />
          {/* Atmospheric indigo/coral lighting tint */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 68% 42%, rgba(124, 58, 237, 0.25), rgba(255, 90, 95, 0.12) 45%, transparent 72%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[430px]">
            {/* Left Column: Editorial Headline + CTAs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="animate-fade-up flex items-center gap-3">
                <span className="w-7 h-[1px] bg-indigo-400/70" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300">
                  Live Events, Unforgettable Experiences
                </span>
              </div>

              <h1 className="animate-fade-up-delay-1 text-4xl sm:text-6xl lg:text-[4.25rem] font-serif font-bold tracking-tight leading-[1.03] text-white">
                Discover <br />
                Events that <br />
                <span className="italic font-normal bg-gradient-to-r from-[#FF7A8A] via-[#E16BFF] to-[#8C7BFF] bg-clip-text text-transparent">
                  Move You.
                </span>
              </h1>

              <p className="animate-fade-up-delay-1 text-sm sm:text-base text-slate-300 max-w-md font-normal leading-relaxed">
                From electrifying concerts to inspiring festivals, find, book and experience the best events around you.
              </p>

              <div className="animate-fade-up-delay-2 flex flex-wrap items-center gap-3.5 pt-2">
                <Link to="/events">
                  <Button
                    variant="primary"
                    size="pill"
                    className="bg-brand-purple hover:bg-indigo-500 text-white px-6 py-3 shadow-glow"
                  >
                    <span>Explore Events</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <a
                  href="#featured-experiences"
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs sm:text-sm font-semibold text-white transition-all"
                >
                  <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </span>
                  <span>Watch How it Works</span>
                </a>
              </div>
            </div>

            {/* Right Column: Floating Glass Featured Event Overlay */}
            <div className="lg:col-span-6 flex lg:justify-end items-end lg:pt-20">
              <Link
                to={heroSpotlightHref}
                className="group w-full max-w-xs p-5 rounded-2xl bg-[#10162B]/75 backdrop-blur-xl border border-white/15 hover:border-indigo-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.55)] transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-brand-coral to-purple-500 text-white">
                    {heroSpotlightEvent.isDemo ? 'Featured • Preview' : 'Featured'}
                  </span>
                </div>

                <h2 className="text-xl font-serif font-bold text-white leading-snug group-hover:text-indigo-200 transition-colors">
                  {heroSpotlightEvent.title}
                </h2>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="space-y-1 text-xs text-slate-300 min-w-0">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                      <span>{formatEventDate(heroSpotlightEvent.startsAt, 'EEE, dd MMM yyyy')}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-brand-coral shrink-0" />
                      <span className="truncate">{heroSpotlightEvent.venue || 'Venue TBD'}</span>
                    </p>
                  </div>

                  <span className="w-8 h-8 rounded-full bg-white text-brand-navy flex items-center justify-center shrink-0 shadow-md group-hover:bg-brand-purple group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING DARK GLASS SEARCH BAR */}
      <section className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8">
        <SearchFilterBar onSearch={handleSearch} variant="dark-glass" />
      </section>

      {/* 3. FEATURED EXPERIENCES (Asymmetric 1 Large + 2 Stacked Dark Cards) */}
      <section id="featured-experiences" className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end mb-8">
            <div className="lg:col-span-5 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-coral">
                  Curated For You
                </span>
                <span className="w-6 h-[1px] bg-brand-coral/60" />
                {hasDemoFallback && !loading && (
                  <span className="text-[10px] font-medium text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/10">
                    Demo preview
                  </span>
                )}
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                Featured Experiences
              </h2>
            </div>

            <div className="lg:col-span-5">
              <p className="text-xs sm:text-sm text-slate-300/85 max-w-sm leading-relaxed">
                A handpicked selection of the most exciting events happening near you.
              </p>
            </div>

            <div className="lg:col-span-2 lg:text-right">
              <Link
                to="/events"
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-300 hover:text-white transition-colors"
              >
                <span>View All Events</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading featured experiences..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-7">
                <EventCard event={featuredMainEvent} variant="dark-spotlight" />
              </div>

              <div className="lg:col-span-5 flex flex-col gap-5">
                {featuredStackedEvents.map((event) => (
                  <EventCard
                    key={event._id || event.id}
                    event={event}
                    variant="dark-compact"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. BROWSE BY CATEGORY (6 Photographic Tiles on Continuous Dark Canvas) */}
      <section id="categories" className="relative z-10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end mb-8">
            <div className="lg:col-span-6 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-coral">
                  Explore More
                </span>
                <span className="w-6 h-[1px] bg-brand-coral/60" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                Browse by Category
              </h2>
            </div>

            <div className="lg:col-span-6 lg:text-right">
              <p className="text-xs sm:text-sm text-slate-300/85">
                Discover events across music, comedy, sports, workshops and more, all in one place.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} category={cat} variant="dark-tile" />
            ))}
          </div>
        </div>
      </section>

      {/* 5. SEAMLESS PROMOTIONAL CROWD SECTION ("Live the Moment.") */}
      <section className="relative z-10 pt-20 pb-20 overflow-hidden">
        {/* Blended Crowd Silhouette Background (smooth top & bottom gradient mask) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 35%, black 100%)',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 35%, black 100%)'
          }}
        >
          <img
            src={promoImgSrc}
            alt="Concert crowd with hands raised in celebration"
            onError={() => {
              if (promoImgSrc !== FALLBACK_EVENT_IMAGE) {
                setPromoImgSrc(FALLBACK_EVENT_IMAGE);
              }
            }}
            className="w-full h-full object-cover object-bottom opacity-60"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-brand-navy/45 to-[#060911]" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 75% 60% at 50% 60%, rgba(124, 58, 237, 0.28), rgba(255, 90, 95, 0.16) 55%, transparent 80%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-4 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-coral">
                  More Than Events
                </span>
                <span className="w-6 h-[1px] bg-brand-coral/60" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                Live the{' '}
                <span className="italic font-normal bg-gradient-to-r from-[#FF7A8A] via-[#E16BFF] to-[#8C7BFF] bg-clip-text text-transparent">
                  Moment.
                </span>
              </h2>
            </div>

            <div className="lg:col-span-4">
              <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-sm">
                Book tickets, discover new experiences and be part of events that bring people together.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-wrap lg:flex-nowrap lg:justify-end items-center gap-3">
              <Link to="/events">
                <Button
                  variant="primary"
                  size="pill"
                  className="bg-brand-purple hover:bg-indigo-500 text-white px-5 py-2.5 shadow-glow whitespace-nowrap"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link
                to="/organizer"
                className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-xs sm:text-sm font-semibold text-white transition-all whitespace-nowrap"
              >
                Host an Event
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
