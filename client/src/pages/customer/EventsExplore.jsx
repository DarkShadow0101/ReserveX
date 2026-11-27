import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Grid, ArrowUpDown, Calendar, X } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import EventCard from '../../components/customer/EventCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import SelectDropdown from '../../components/ui/SelectDropdown';

const LOCATION_OPTIONS = [
  { value: '', label: 'All Cities' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Bengaluru', label: 'Bengaluru' },
  { value: 'Hyderabad', label: 'Hyderabad' }
];

const DATE_OPTIONS = [
  { value: '', label: 'Any Date' },
  { value: 'weekend', label: 'This Weekend' },
  { value: 'month', label: 'This Month' }
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

function matchesCity(venue, selectedCity) {
  const v = (venue || '').toLowerCase();
  const c = selectedCity.toLowerCase();
  if (c === 'bengaluru' || c === 'bangalore') {
    return v.includes('bengaluru') || v.includes('bangalore');
  }
  return v.includes(c);
}

function matchesDateWindow(startsAt, windowKey) {
  if (!windowKey || !startsAt) return true;
  const eventTime = new Date(startsAt).getTime();
  if (Number.isNaN(eventTime)) return true;
  const now = new Date();
  const nowMs = now.getTime();
  if (windowKey === 'weekend') {
    const day = now.getDay(); // 0 Sun .. 6 Sat
    const daysUntilFriday = day <= 5 ? 5 - day : 6;
    const weekendStart = new Date(now);
    weekendStart.setDate(now.getDate() + (day === 0 || day === 6 ? 0 : daysUntilFriday));
    weekendStart.setHours(0, 0, 0, 0);
    const weekendEnd = new Date(weekendStart);
    weekendEnd.setDate(weekendStart.getDate() + (day === 0 ? 1 : day === 6 ? 2 : 3));
    weekendEnd.setHours(23, 59, 59, 999);
    return eventTime >= nowMs && eventTime <= weekendEnd.getTime();
  }
  if (windowKey === 'month') {
    const monthEnd = nowMs + 30 * 86400000;
    return eventTime >= nowMs && eventTime <= monthEnd;
  }
  return true;
}

export default function EventsExplore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'soonest');

  const searchKeyword = searchParams.get('search') || '';
  const locationParam = searchParams.get('location') || '';
  const dateParam = searchParams.get('date') || '';
  const categoryParam = searchParams.get('category') || '';

  useEffect(() => {
    setSearchTerm(searchKeyword);
    setLocationFilter(locationParam);
    setDateFilter(dateParam);
    setCategoryFilter(categoryParam);
  }, [searchKeyword, locationParam, dateParam, categoryParam]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const params = {};
        if (searchKeyword) params.search = searchKeyword;

        const res = await eventsApi.getPublicEvents(params);
        let list = res.data?.events || [];

        if (locationParam) {
          list = list.filter((e) => matchesCity(e.venue, locationParam));
        }

        if (dateParam) {
          list = list.filter((e) => matchesDateWindow(e.startsAt, dateParam));
        }

        if (categoryParam) {
          list = list.filter(
            (e) =>
              (e.title || '').toLowerCase().includes(categoryParam.toLowerCase()) ||
              (e.description || '').toLowerCase().includes(categoryParam.toLowerCase()) ||
              (e.categoryLabel || '').toLowerCase().includes(categoryParam.toLowerCase())
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
  }, [searchKeyword, locationParam, dateParam, categoryParam]);

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
    if (dateFilter) params.set('date', dateFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    if (sortBy && sortBy !== 'soonest') params.set('sort', sortBy);
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setDateFilter('');
    setCategoryFilter('');
    setSortBy('soonest');
    setSearchParams({});
  };

  const hasActiveFilters = !!(searchKeyword || locationParam || dateParam || categoryParam);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <h1 className="font-display uppercase text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Discover Events
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Browse upcoming live concerts, comedy shows, sports, and festivals across India.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          {!loading && (
            <span>
              Showing <strong className="text-white">{sortedEvents.length}</strong> published{' '}
              {sortedEvents.length === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>
      </div>

      {/* Obsidian Search, Filter & Sort Bar */}
      <form
        onSubmit={handleApplyFilters}
        className="bg-[#101219] p-3 rounded-2xl border border-white/15 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center"
      >
        <div className="lg:col-span-4 relative flex items-center bg-[#090A0E] border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#FF4D2D]">
          <Search className="w-4 h-4 text-[#FF4D2D] shrink-0 mr-2.5" />
          <input
            type="text"
            aria-label="Search events"
            placeholder="Search event, artist, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-[#F4F1EA] placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="lg:col-span-2">
          <SelectDropdown
            value={locationFilter}
            onChange={setLocationFilter}
            options={LOCATION_OPTIONS}
            icon={MapPin}
            iconClassName="text-[#FF4D2D]"
            theme="dark"
            variant="boxed"
            ariaLabel="Filter by location"
          />
        </div>

        <div className="lg:col-span-2">
          <SelectDropdown
            value={dateFilter}
            onChange={setDateFilter}
            options={DATE_OPTIONS}
            icon={Calendar}
            iconClassName="text-slate-300"
            theme="dark"
            variant="boxed"
            ariaLabel="Filter by date"
          />
        </div>

        <div className="lg:col-span-2">
          <SelectDropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={CATEGORY_OPTIONS}
            icon={Grid}
            iconClassName="text-slate-300"
            theme="dark"
            variant="boxed"
            ariaLabel="Filter by category"
          />
        </div>

        <div className="lg:col-span-2 flex items-center gap-2">
          <Button type="submit" variant="primary" size="md" className="flex-1 rounded-xl">
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

      {/* Secondary Sort Strip */}
      <div className="flex items-center justify-end -mt-4">
        <div className="w-44">
          <SelectDropdown
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
            icon={ArrowUpDown}
            theme="dark"
            variant="boxed"
            ariaLabel="Sort events"
            menuAlign="right"
          />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner theme="dark" text="Searching live events..." />
      ) : sortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {sortedEvents.map((event) => (
            <EventCard key={event._id || event.id} event={event} variant="dark-grid" />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-[#101219] rounded-2xl border border-white/10 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FF4D2D]/15 border border-[#FF4D2D]/30 text-[#FF4D2D] flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-sans font-bold text-white">No matching events found</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {hasActiveFilters
              ? "We couldn't find any published events matching your current search filters. Try clearing filters or searching another city."
              : 'There are no published events available right now. Check back soon or create one in Organizer Studio.'}
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
