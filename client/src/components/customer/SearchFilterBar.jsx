import React, { useState } from 'react';
import { Search, MapPin, Grid, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';

export default function SearchFilterBar({ onSearch, initialSearch = '', initialLocation = '', initialCategory = '' }) {
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
      className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl sm:rounded-full p-2.5 sm:p-2 shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-2 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100"
    >
      {/* Search keyword input */}
      <div className="w-full sm:flex-1 flex items-center px-4 py-2 sm:py-1">
        <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
        <input
          type="text"
          placeholder="Search events, artists, venues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Location Selector */}
      <div className="w-full sm:w-52 flex items-center px-4 py-2 sm:py-1">
        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="">All Locations</option>
          <option value="Mumbai">Mumbai, India</option>
          <option value="Delhi">Delhi, India</option>
          <option value="Goa">Goa, India</option>
          <option value="Bangalore">Bangalore, India</option>
          <option value="Hyderabad">Hyderabad, India</option>
        </select>
      </div>

      {/* Category Dropdown */}
      <div className="w-full sm:w-52 flex items-center px-4 py-2 sm:py-1">
        <Grid className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="concerts">Concerts</option>
          <option value="festivals">Festivals</option>
          <option value="comedy">Comedy</option>
          <option value="sports">Sports</option>
          <option value="workshops">Workshops</option>
          <option value="arts">Arts & Culture</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="w-full sm:w-auto p-1">
        <Button
          type="submit"
          variant="primary"
          size="pill"
          className="w-full sm:w-auto bg-brand-purple hover:bg-indigo-600 px-7 shadow-md"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
