import React, { useState } from 'react';
import { Search, MapPin, Grid, ChevronDown, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

export default function SearchFilterBar({
  onSearch,
  initialSearch = '',
  initialLocation = '',
  initialCategory = '',
  variant = 'pill'
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [category, setCategory] = useState(initialCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ search: searchTerm, location, category });
    }
  };

  if (variant === 'editorial') {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/15 p-3 shadow-2xl space-y-2.5 focus-within:border-brand-purple/60 transition-colors"
      >
        {/* Top row: Primary keyword search + submit */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1 flex items-center bg-brand-navy/80 border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand-purple transition-colors">
            <Search className="w-4 h-4 text-indigo-400 shrink-0 mr-3" />
            <input
              type="text"
              aria-label="Search events"
              placeholder="Search artists, festivals, venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="bg-brand-purple hover:bg-indigo-500 text-white rounded-xl px-6 py-3 shadow-glow shrink-0"
          >
            <span>Find Events</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Bottom row: Location + Category inline filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative flex items-center bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5">
            <MapPin className="w-4 h-4 text-brand-coral shrink-0 mr-2.5" />
            <select
              aria-label="Filter by location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full appearance-none bg-transparent text-xs sm:text-sm font-medium text-slate-200 pr-5 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-brand-navy text-white">All Locations</option>
              <option value="Mumbai" className="bg-brand-navy text-white">Mumbai, India</option>
              <option value="Delhi" className="bg-brand-navy text-white">Delhi, India</option>
              <option value="Goa" className="bg-brand-navy text-white">Goa, India</option>
              <option value="Bangalore" className="bg-brand-navy text-white">Bangalore, India</option>
              <option value="Hyderabad" className="bg-brand-navy text-white">Hyderabad, India</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3.5" />
          </div>

          <div className="relative flex items-center bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5">
            <Grid className="w-4 h-4 text-indigo-300 shrink-0 mr-2.5" />
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none bg-transparent text-xs sm:text-sm font-medium text-slate-200 pr-5 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-brand-navy text-white">All Categories</option>
              <option value="concerts" className="bg-brand-navy text-white">Concerts</option>
              <option value="festivals" className="bg-brand-navy text-white">Festivals</option>
              <option value="comedy" className="bg-brand-navy text-white">Comedy</option>
              <option value="sports" className="bg-brand-navy text-white">Sports</option>
              <option value="workshops" className="bg-brand-navy text-white">Workshops</option>
              <option value="arts" className="bg-brand-navy text-white">Arts & Culture</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3.5" />
          </div>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl sm:rounded-full p-2.5 sm:p-2 shadow-2xl border border-white/30 flex flex-col sm:flex-row items-center gap-2 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-brand-purple/40"
    >
      {/* Search keyword input */}
      <div className="w-full sm:flex-1 flex items-center px-4 py-2 sm:py-1.5">
        <Search className="w-4 h-4 text-brand-purple shrink-0 mr-3" />
        <input
          type="text"
          aria-label="Search events"
          placeholder="Search events, artists, venues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Location Selector */}
      <div className="w-full sm:w-52 relative flex items-center px-4 py-2 sm:py-1.5">
        <MapPin className="w-4 h-4 text-brand-coral shrink-0 mr-2.5" />
        <select
          aria-label="Filter by location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full appearance-none bg-transparent text-sm font-medium text-slate-800 pr-5 focus:outline-none cursor-pointer"
        >
          <option value="">All Locations</option>
          <option value="Mumbai">Mumbai, India</option>
          <option value="Delhi">Delhi, India</option>
          <option value="Goa">Goa, India</option>
          <option value="Bangalore">Bangalore, India</option>
          <option value="Hyderabad">Hyderabad, India</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-4" />
      </div>

      {/* Category Dropdown */}
      <div className="w-full sm:w-52 relative flex items-center px-4 py-2 sm:py-1.5">
        <Grid className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full appearance-none bg-transparent text-sm font-medium text-slate-800 pr-5 focus:outline-none cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="concerts">Concerts</option>
          <option value="festivals">Festivals</option>
          <option value="comedy">Comedy</option>
          <option value="sports">Sports</option>
          <option value="workshops">Workshops</option>
          <option value="arts">Arts & Culture</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-4" />
      </div>

      {/* Submit Button */}
      <div className="w-full sm:w-auto p-1">
        <Button
          type="submit"
          variant="primary"
          size="pill"
          className="w-full sm:w-auto bg-brand-purple hover:bg-indigo-600 px-7 py-2.5 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
