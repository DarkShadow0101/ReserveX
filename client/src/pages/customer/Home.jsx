import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import {
  HERO_IMAGE,
  PROMO_BANNER_IMAGE,
  FALLBACK_EVENT_IMAGE,
  CATEGORIES
} from '../../mocks/eventImages';
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
  { label: 'Standup Comedy', query: 'category=comedy' },
  { label: 'Workshops', query: 'category=workshops' }
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDemoFallback, setHasDemoFallback] = useState(false);
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

  return (
    <div className="space-y-0">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[88vh] flex items-center justify-center pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-brand-navy">
        {/* Full-bleed Event Photography */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt="Live concert crowd facing illuminated stage"
            className="w-full h-full object-cover object-center animate-hero-zoom"
          />
          {/* Layered Dark Gradients for Depth & Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-black/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/80 via-transparent to-brand-navy/70" />
          {/* Subtle Indigo Atmospheric Lighting */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 50% 25%, rgba(91, 76, 242, 0.24), transparent 70%)'
            }}
          />
        </div>

        {/* Hero Composition */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-7">
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-100 tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Curated Live Experiences</span>
          </div>

          <h1 className="animate-fade-up-delay-1 text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.08] drop-shadow-lg">
            Find your next <br className="hidden sm:block" />
            <span className="italic font-normal text-indigo-100">unforgettable</span> experience.
          </h1>

          <p className="animate-fade-up-delay-1 text-base sm:text-lg text-slate-200/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover and book live concerts, festivals, comedy nights, and cultural workshops with instant digital ticketing.
          </p>

          {/* Floating Glass Search Bar */}
          <div className="animate-fade-up-delay-2 pt-3">
            <SearchFilterBar onSearch={handleSearch} />
          </div>

          {/* Interactive Popular Genre Chips */}
          <div className="animate-fade-up-delay-3 pt-1 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-slate-300 font-medium">
            <span className="text-slate-400 mr-1">Popular:</span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => navigate(`/events?${tag.query}`)}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-100 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. FEATURED EVENTS SECTION (Warm off-white editorial surface) */}
      <section className="py-20 bg-warm-100">
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
                  <span className="text-[11px] font-medium text-slate-500 bg-warm-200 px-2.5 py-0.5 rounded-full border border-warm-300/70">
                    Includes demo preview items
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/events"
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-800 hover:text-brand-purple transition-colors"
            >
              <span>See all events</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Curating top experiences..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <EventCard key={event._id || event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. EXPLORE BY CATEGORY SECTION */}
      <section id="categories" className="py-20 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
                Browse Genres
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-1">
                Explore by Category
              </h2>
            </div>
            <Link
              to="/events"
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-800 hover:text-brand-purple transition-colors"
            >
              <span>See all</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROMOTIONAL BANNER ("Live the Moment") */}
      <section className="py-16 sm:py-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-brand-navy min-h-[240px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 sm:p-12 lg:p-14">
            {/* Background Crowd Photography */}
            <div className="absolute inset-0 z-0">
              <img
                src={promoImgSrc}
                alt="Festival crowd enjoying live music"
                onError={() => {
                  if (promoImgSrc !== FALLBACK_EVENT_IMAGE) {
                    setPromoImgSrc(FALLBACK_EVENT_IMAGE);
                  }
                }}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/85 to-brand-navy/35" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 20% 50%, rgba(91, 76, 242, 0.25), transparent 55%)'
                }}
              />
            </div>

            {/* Editorial Copy */}
            <div className="relative z-10 max-w-xl space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
                Reserve Your Spot
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                Live the Moment
              </h2>
              <p className="text-sm sm:text-base text-slate-200/90 font-normal leading-relaxed">
                Unforgettable events and unbeatable vibes. Secure verified passes in seconds with instant QR delivery.
              </p>
            </div>

            {/* Clearly Visible CTA */}
            <div className="relative z-10 shrink-0">
              <Link to="/events">
                <Button
                  variant="secondary"
                  size="pill"
                  className="bg-white hover:bg-warm-100 text-brand-navy font-semibold px-7 py-3 shadow-lg hover:shadow-xl"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
