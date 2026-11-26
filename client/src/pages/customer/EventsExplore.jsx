import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Grid, ArrowUpDown, X } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import EventCard from '../../components/customer/EventCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import SelectDropdown from '../../components/ui/SelectDropdown';

const LOCATION_OPTIONS = [
  { value: '', label: 'All Locations' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Bangalore', label: 'Bengaluru' },
  { value: 'Hyderabad', label: 'Hyderabad' }
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'concerts', label: 'Concerts' },
  { value: 'festivals', label: 'Festivals' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'sports', label: 'Sports' },
  { value: 'workshops', label: 'Workshops' },
  { value: 'arts', label: 'Arts & Culture' }
];

const SORT_OPTIONS = [
  { value: 'soonest', label: 'Sort: Soonest' },
  { value: 'latest', label: 'Sort: Newest' },
  { value: 'title', label: 'Sort: Title A–Z' }
];

export default function EventsExplore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'soonest');

  const searchKeyword = searchParams.get('search') || '';
  const locationParam = searchParams.get('location') || '';
  const categoryParam = searchParams.get('category') || '';

  useEffect(() => {
    setSearchTerm(searchKeyword);
    setLocationFilter(locationParam);
    setCategoryFilter(categoryParam);
  }, [searchKeyword, locationParam, categoryParam]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const params = {};
        if (searchKeyword) params.search = searchKeyword;

        const res = await eventsApi.getPublicEvents(params);
        let list = res.data?.events || [];

        if (locationParam) {
          list = list.filter((e) =>
            (e.venue || '').toLowerCase().includes(locationParam.toLowerCase())
          );
        }

        if (categoryParam) {
          list = list.filter(
            (e) =>
              (e.title || '').toLowerCase().includes(categoryParam.toLowerCase()) ||
              (e.description || '').toLowerCase().includes(categoryParam.toLowerCase())
          );
        }

        setEvents(list);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [searchKeyword, locationParam, categoryParam]);

  const sortedEvents = useMemo(() => {
    const copy = [...events];
    if (sortBy === 'soonest') {
      copy.sort((a, b) => new Date(a.startsAt || 0) - new Date(b.startsAt || 0));
    } else if (sortBy === 'latest') {
      copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'title') {
      copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return copy;
  }, [events, sortBy]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (locationFilter) params.set('location', locationFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    if (sortBy && sortBy !== 'soonest') params.set('sort', sortBy);
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCategoryFilter('');
    setSortBy('soonest');
    setSearchParams({});
  };

  const hasActiveFilters = !!(searchKeyword || locationParam || categoryParam);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-coral">
              ReserveX Marketplace
            </span>
            <span className="w-6 h-[1px] bg-brand-coral/60" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Discover Events
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Browse upcoming live concerts, tech summits, standup shows, and festivals with guaranteed authentic tickets.
          </p>
        </div>

        <div className="text-xs font-medium text-slate-400">
          {!loading && (
            <span>
              Showing <strong className="text-white">{sortedEvents.length}</strong> published{' '}
              {sortedEvents.length === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>
      </div>

      {/* Dark Glass Search, Filter & Sort Bar */}
      <form
        onSubmit={handleApplyFilters}
        className="bg-[#12172A]/90 backdrop-blur-xl p-3 rounded-2xl border border-white/15 shadow-2xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
      >
        <div className="sm:col-span-4 relative flex items-center bg-brand-navy/70 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-brand-purple">
          <Search className="w-4 h-4 text-indigo-400 shrink-0 mr-2.5" />
          <input
            type="text"
            aria-label="Search events"
            placeholder="Search event, artist, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <SelectDropdown
            value={locationFilter}
            onChange={setLocationFilter}
            options={LOCATION_OPTIONS}
            icon={MapPin}
            iconClassName="text-brand-coral"
            theme="dark"
            variant="boxed"
            ariaLabel="Filter by location"
          />
        </div>

        <div className="sm:col-span-2">
          <SelectDropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={CATEGORY_OPTIONS}
            icon={Grid}
            iconClassName="text-indigo-300"
            theme="dark"
            variant="boxed"
            ariaLabel="Filter by category"
          />
        </div>

        <div className="sm:col-span-2">
          <SelectDropdown
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
            icon={ArrowUpDown}
            theme="dark"
            variant="boxed"
            ariaLabel="Sort events"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <Button type="submit" variant="primary" size="md" className="flex-1 rounded-xl bg-brand-purple hover:bg-indigo-500 shadow-glow">
            Apply
          </Button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="p-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Clear all filters"
              aria-label="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner theme="dark" text="Searching live experiences..." />
      ) : sortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {sortedEvents.map((event) => (
            <EventCard key={event._id || event.id} event={event} variant="dark-grid" />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-[#12172A]/80 rounded-3xl border border-white/10 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-white">No matching events found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {hasActiveFilters
              ? "We couldn't find any published events matching your current search filters. Try clearing filters or searching another city."
              : 'There are no published events available right now. Check back soon or create one in the Organizer Portal.'}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="bg-white/[0.06] border-white/20 text-white hover:bg-white/10"
            >
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
