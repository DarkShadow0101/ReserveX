import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Compass, Calendar, Award } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import { HERO_IMAGE, CATEGORIES, getEventImage } from '../../mocks/eventImages';
import EventCard from '../../components/customer/EventCard';
import CategoryCard from '../../components/customer/CategoryCard';
import SearchFilterBar from '../../components/customer/SearchFilterBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

// Default curated fallback events matching Design 1 if DB has not been seeded yet
const FALLBACK_FEATURED = [
  {
    _id: 'seed-edm-2025',
    title: 'EDM Paradise 2025',
    venue: 'Mumbai, India',
    startsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'published',
    goingCount: '2.5K+ going',
    ticketTypes: [{ name: 'General', price: 99900, isActive: true }]
  },
  {
    _id: 'seed-arijit-live',
    title: 'Arijit Singh Live',
    venue: 'Delhi, India',
    startsAt: new Date(Date.now() + 86400000 * 18).toISOString(),
    status: 'published',
    goingCount: '5K+ going',
    ticketTypes: [{ name: 'Silver', price: 149900, isActive: true }]
  },
  {
    _id: 'seed-sunburn-goa',
    title: 'Sunburn Festival',
    venue: 'Goa, India',
    startsAt: new Date(Date.now() + 86400000 * 25).toISOString(),
    status: 'published',
    goingCount: '8K+ going',
    ticketTypes: [{ name: 'VIP Pass', price: 249900, isActive: true }]
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await eventsApi.getPublicEvents({ limit: 6 });
        const list = res.data?.events || [];
        if (list.length >= 3) {
          setFeaturedEvents(list.slice(0, 3));
        } else if (list.length > 0) {
          // Combine real events with curated items so layout stays full
          setFeaturedEvents([...list, ...FALLBACK_FEATURED.slice(list.length, 3)]);
        } else {
          setFeaturedEvents(FALLBACK_FEATURED);
        }
      } catch (err) {
        // Fallback for visual fidelity when backend is fresh
        setFeaturedEvents(FALLBACK_FEATURED);
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
      {/* 1. HERO SECTION (Cinematic Concert Photograph with Dark Overlay) */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-brand-navy">
        {/* Cinematic Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Concert stage crowd"
            className="w-full h-full object-cover object-center scale-105 animate-pulse duration-10000"
          />
          {/* Multi-layer gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-black/75" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/40 to-black/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-200 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
            <span>Discover Top Rated Live Events in 2025</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-lg">
            Find your next <br className="hidden sm:block" />
            <span className="italic font-normal text-slate-100">unforgettable</span> experience.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Discover and book the best events, concerts, comedy shows, and cultural experiences around you with zero wait times.
          </p>

          {/* Floating Hero Search Filter Bar */}
          <div className="pt-4">
            <SearchFilterBar onSearch={handleSearch} />
          </div>

          {/* Quick Category Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-300 font-medium">
            <span className="text-slate-400">Popular:</span>
            {['EDM Festivals', 'Arijit Singh', 'Standup Comedy', 'Tech Conferences'].map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/events?search=${encodeURIComponent(term)}`)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. FEATURED EVENTS SECTION (Warm off-white background) */}
      <section className="py-20 bg-warm-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
                Handpicked Experiences
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-1">
                Featured Events
              </h2>
            </div>
            <Link
              to="/events"
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-800 hover:text-brand-purple transition-colors"
            >
              See all events
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Events Grid (3 prominent cards matching Design 1) */}
          {loading ? (
            <LoadingSpinner text="Curating top experiences..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <EventCard key={event._id || event.id} event={event} featured={true} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. EXPLORE BY CATEGORY SECTION */}
      <section id="categories" className="py-20 bg-white border-y border-slate-100">
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
              See all
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Horizontal Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROMOTIONAL BANNER SECTION ("Live the Moment" matching Design 1) */}
      <section className="py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-brand-navy min-h-[220px] flex items-center justify-between p-8 sm:p-12">
            {/* Background Crowd Photography */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80"
                alt="Concert crowd cheering"
                className="w-full h-full object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/85 to-transparent" />
            </div>

            {/* Banner Content */}
            <div className="relative z-10 max-w-xl space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                Live the Moment
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-light">
                Unforgettable events. Unbeatable vibes. Exclusive access to premium seats and early bird pricing.
              </p>
            </div>

            {/* Action Button */}
            <div className="relative z-10 shrink-0 hidden sm:block">
              <Link to="/events">
                <Button
                  variant="primary"
                  size="pill"
                  className="bg-white hover:bg-slate-100 text-slate-900 font-semibold px-6 shadow-lg"
                >
                  Explore Events <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
