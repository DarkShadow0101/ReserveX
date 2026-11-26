import React, { useState } from 'react';
import { Search, MapPin, Grid, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';

export default function SearchFilterBar({
  onSearch,
  initialSearch = '',
  initialLocation = '',
  initialCategory = ''
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
