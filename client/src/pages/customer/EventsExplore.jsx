import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Sparkles, X } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import EventCard from '../../components/customer/EventCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

export default function EventsExplore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');

  const searchKeyword = searchParams.get('search') || '';
  const locationParam = searchParams.get('location') || '';
  const categoryParam = searchParams.get('category') || '';

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const params = {};
        if (searchKeyword) params.search = searchKeyword;

        const res = await eventsApi.getPublicEvents(params);
        let list = res.data?.events || [];

        // In-memory filter for location if specified
        if (locationParam) {
          list = list.filter((e) =>
            (e.venue || '').toLowerCase().includes(locationParam.toLowerCase())
          );
        }

        // In-memory filter for category if specified
        if (categoryParam) {
          list = list.filter(
            (e) =>
              (e.title || '').toLowerCase().includes(categoryParam.toLowerCase()) ||
              (e.description || '').toLowerCase().includes(categoryParam.toLowerCase())
          );
        }

        setEvents(list);
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [searchKeyword, locationParam, categoryParam]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (locationFilter) params.set('location', locationFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCategoryFilter('');
    setSearchParams({});
  };

  const hasActiveFilters = !!(searchKeyword || locationParam || categoryParam);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
          ReserveX Marketplace
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900">
          Discover All Events
        </h1>
        <p className="text-sm text-slate-500 max-w-xl">
          Browse upcoming live concerts, tech summits, standup shows, and festivals with guaranteed authentic tickets.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <form
        onSubmit={handleApplyFilters}
        className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
      >
        <div className="sm:col-span-5 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            placeholder="Search by event title, artist or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-purple"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-purple cursor-pointer text-slate-700"
          >
            <option value="">All Locations</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Goa">Goa</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-purple cursor-pointer text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="concerts">Concerts</option>
            <option value="festivals">Festivals</option>
            <option value="comedy">Comedy</option>
            <option value="sports">Sports</option>
            <option value="workshops">Workshops</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <Button type="submit" variant="primary" size="md" className="flex-1 rounded-2xl">
            Filter
          </Button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner text="Searching live experiences..." />
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard key={event._id || event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-brand-purple flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-800">No events found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            We couldn't find any events matching your current search criteria. Try removing filters or searching for another city.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
