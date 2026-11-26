import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Calendar, MapPin, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import {
  HERO_IMAGE,
  PROMO_BANNER_IMAGE,
  FALLBACK_EVENT_IMAGE,
  CATEGORIES,
  getEventImage
} from '../../mocks/eventImages';
import { formatEventDate } from '../../utils/date';
import { formatPriceStarting } from '../../utils/currency';
import EventCard from '../../components/customer/EventCard';
import CategoryCard from '../../components/customer/CategoryCard';
import SearchFilterBar from '../../components/customer/SearchFilterBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

// Clearly labelled demo fallback events used only when the backend has fewer than 3 published events
const DEMO_FEATURED_EVENTS = [
  {
    _id: 'demo-midnight-echoes',
    isDemo: true,
    title: 'Midnight Echoes Electronic Live',
    venue: 'Mumbai, India',
    startsAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'published',
    ticketTypes: [{ name: 'General', price: 99900, isActive: true }]
  },
  {
    _id: 'demo-acoustic-nights',
    isDemo: true,
    title: 'Acoustic Nights Under the Stars',
    venue: 'Delhi, India',
    startsAt: new Date(Date.now() + 86400000 * 14).toISOString(),
    status: 'published',
    ticketTypes: [{ name: 'Silver', price: 149900, isActive: true }]
  },
  {
    _id: 'demo-solstice-festival',
    isDemo: true,
    title: 'Solstice Music & Arts Festival',
    venue: 'Goa, India',
    startsAt: new Date(Date.now() + 86400000 * 21).toISOString(),
    status: 'published',
    ticketTypes: [{ name: 'Festival Pass', price: 249900, isActive: true }]
  }
];

const POPULAR_TAGS = [
  { label: 'Concerts', query: 'category=concerts' },
  { label: 'Festivals', query: 'category=festivals' },
  { label: 'Comedy', query: 'category=comedy' },
  { label: 'Workshops', query: 'category=workshops' }
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
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

        if (list.length >= 3) {
          setFeaturedEvents(list.slice(0, 3));
          setHasDemoFallback(false);
        } else if (list.length > 0) {
          setFeaturedEvents([
            ...list,
            ...DEMO_FEATURED_EVENTS.slice(0, 3 - list.length)
          ]);
          setHasDemoFallback(true);
        } else {
          setFeaturedEvents(DEMO_FEATURED_EVENTS);
          setHasDemoFallback(true);
        }
      } catch {
        setFeaturedEvents(DEMO_FEATURED_EVENTS);
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

  const leadEvent = featuredEvents[0] || DEMO_FEATURED_EVENTS[0];
  const secondaryEvents = featuredEvents.slice(1, 3);
  const leadHref = leadEvent.isDemo
    ? `/events?search=${encodeURIComponent(leadEvent.title || '')}`
    : `/events/${leadEvent._id || leadEvent.id}`;

  return (
    <div className="space-y-0">
      {/* 1. ASYMMETRIC EDITORIAL HERO */}
      <section className="relative bg-brand-navy text-white pt-28 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Subtle atmospheric lighting & architectural hairline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 18% 25%, rgba(91, 76, 242, 0.22), transparent 48%), radial-gradient(circle at 85% 75%, rgba(255, 90, 95, 0.12), transparent 45%)'
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT COLUMN: Expressive Typography + Integrated Search */}
            <div className="lg:col-span-7 space-y-8">
              <div className="animate-fade-up flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-coral" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-300">
                  01 / Live Event Discovery
                </span>
              </div>

              <div className="animate-fade-up-delay-1 space-y-5">
                <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] xl:text-[4.65rem] font-serif font-bold tracking-tight leading-[1.04] text-white">
                  Find your next{' '}
                  <span className="italic font-normal text-indigo-200 block sm:inline">
                    unforgettable
                  </span>{' '}
                  experience.
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                  Curated concerts, festivals, comedy tours, and workshops—backed by atomic seat holds and instant QR passes.
                </p>
              </div>

              {/* Integrated Architectural Search Module */}
              <div className="animate-fade-up-delay-2 max-w-2xl">
                <SearchFilterBar onSearch={handleSearch} variant="editorial" />
              </div>

              {/* Quick Genre Links */}
              <div className="animate-fade-up-delay-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium mr-1">Trending genres:</span>
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => navigate(`/events?${tag.query}`)}
                    className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-slate-200 transition-colors cursor-pointer"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Dominant Editorial Concert Photograph with Layered Depth */}
            <div className="lg:col-span-5 relative">
              {/* Offset architectural frame behind image */}
              <div className="hidden sm:block absolute -inset-3 translate-x-3 translate-y-3 rounded-[2rem] border border-indigo-400/25 pointer-events-none" />

              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-brand-surface aspect-[4/5] max-h-[540px] w-full">
                <img
                  src={heroImgSrc}
                  alt="Crowd at an atmospheric live concert stage"
                  onError={() => {
                    if (heroImgSrc !== FALLBACK_EVENT_IMAGE) {
                      setHeroImgSrc(FALLBACK_EVENT_IMAGE);
                    }
                  }}
                  className="w-full h-full object-cover object-center animate-hero-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-black/15" />

                {/* Top-right Editorial Tag */}
                <div className="absolute top-5 right-5 px-3 py-1.5 rounded-full bg-brand-navy/75 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-coral" />
                  <span>{leadEvent.isDemo ? 'Featured Preview' : 'On Sale Now'}</span>
                </div>

                {/* Bottom Anchored Spotlight Caption */}
                <Link
                  to={leadHref}
                  className="group absolute bottom-4 left-4 right-4 p-5 rounded-2xl bg-brand-navy/85 backdrop-blur-xl border border-white/15 hover:border-brand-purple/60 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                        Spotlight Event
                      </span>
                      <h2 className="text-lg sm:text-xl font-serif font-bold text-white truncate group-hover:text-indigo-200 transition-colors">
                        {leadEvent.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                          {formatEventDate(leadEvent.startsAt, 'EEE, dd MMM')}
                        </span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-brand-coral" />
                          {leadEvent.venue || 'Venue TBD'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right space-y-1">
                      <span className="block text-xs font-bold text-white">
                        {formatPriceStarting(leadEvent.ticketTypes)}
                      </span>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-purple text-white group-hover:bg-indigo-500 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL TRANSITION STRIP */}
      <div className="bg-warm-100 border-b border-warm-300/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          <span className="text-slate-800">02 / Featured Lineup</span>
          <div className="flex flex-wrap items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-purple" />
              Zero Overselling Holds
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-brand-coral" />
              Signed QR Passes
            </span>
          </div>
        </div>
      </div>

      {/* 3. FEATURED EVENTS — ASYMMETRIC EDITORIAL SHOWCASE */}
      <section className="py-16 sm:py-20 bg-warm-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
                Handpicked Experiences
              </span>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
                  Featured Events
                </h2>
                {hasDemoFallback && !loading && (
                  <span className="text-[11px] font-medium text-slate-600 bg-warm-200 px-2.5 py-0.5 rounded-full border border-warm-300/80">
                    Includes demo preview items
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/events"
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:text-brand-purple transition-colors"
            >
              <span>See all events</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Curating featured lineup..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
              {/* Lead Spotlight Card (7 cols) */}
              <div className="lg:col-span-7">
                <EventCard event={leadEvent} variant="spotlight" />
              </div>

              {/* Stacked Compact Editorial Cards (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                {secondaryEvents.map((event) => (
                  <EventCard key={event._id || event.id} event={event} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. EXPLORE BY CATEGORY — SPLIT VISUAL DESTINATION */}
      <section id="categories" className="py-20 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Editorial Intro */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-purple">
                03 / Browse Genres
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
                Explore by Category
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                From arena concerts and multi-day festivals to intimate comedy clubs and hands-on workshops, find the atmosphere that fits your night.
              </p>
              <div className="pt-2">
                <Link
                  to="/events"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-brand-navy hover:text-brand-purple transition-colors"
                >
                  <span>Browse all categories</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right Staggered Photographic Mosaic */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CATEGORIES.slice(0, 2).map((cat) => (
                  <CategoryCard key={cat.id} category={cat} featured={true} />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {CATEGORIES.slice(2).map((cat) => (
                  <CategoryCard key={cat.id} category={cat} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROMOTIONAL SECTION — SPLIT EDITORIAL COMPOSITION */}
      <section className="py-16 sm:py-24 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl bg-brand-navy border border-slate-800/80">
            {/* Left: Dramatic Crowd Photography */}
            <div className="lg:col-span-6 relative min-h-[260px] lg:min-h-[380px] overflow-hidden">
              <img
                src={promoImgSrc}
                alt="Festival crowd cheering under stage lights"
                onError={() => {
                  if (promoImgSrc !== FALLBACK_EVENT_IMAGE) {
                    setPromoImgSrc(FALLBACK_EVENT_IMAGE);
                  }
                }}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-brand-navy/30 via-transparent to-brand-navy/90" />
            </div>

            {/* Right: Deep Navy Editorial Callout */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center space-y-6 relative">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 80% 20%, rgba(91, 76, 242, 0.2), transparent 60%)'
                }}
              />

              <div className="relative z-10 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                  04 / Reserve Your Spot
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
                  Live the <span className="italic font-normal text-indigo-200">Moment</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-md">
                  Unforgettable events and unbeatable vibes. Lock in your seats with a 10-minute checkout hold and receive verified QR tickets immediately.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-4 pt-2">
                <Link to="/events">
                  <Button
                    variant="secondary"
                    size="pill"
                    className="bg-white hover:bg-warm-100 text-brand-navy font-semibold px-7 py-3 shadow-lg"
                  >
                    <span>Explore Events</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link
                  to="/organizer"
                  className="text-sm font-semibold text-slate-200 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors px-2 py-2"
                >
                  Host an Event
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
