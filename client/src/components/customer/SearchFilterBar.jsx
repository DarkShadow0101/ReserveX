import React, { useState } from 'react';
import { Search, MapPin, Grid, Calendar, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import SelectDropdown from '../ui/SelectDropdown';

const LOCATION_OPTIONS = [
  { value: '', label: 'Select Location' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Bangalore', label: 'Bengaluru' },
  { value: 'Goa', label: 'Goa' }
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

export default function SearchFilterBar({
  onSearch,
  initialSearch = '',
  initialLocation = '',
  initialCategory = '',
  variant = 'pill'
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [dateRange, setDateRange] = useState('');
  const [category, setCategory] = useState(initialCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ search: searchTerm, location, category });
    }
  };

  if (variant === 'dark-glass') {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl mx-auto bg-[#11172A]/85 backdrop-blur-2xl rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.55)] border border-white/15 flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/10 focus-within:border-indigo-400/50 transition-colors"
      >
        <div className="w-full lg:flex-[1.5] flex items-center px-4 py-2.5 lg:py-2">
          <Search className="w-4 h-4 text-slate-300 shrink-0 mr-3" />
          <input
            type="text"
            aria-label="Search events"
            placeholder="Search events, artists, venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="w-full lg:w-48">
          <SelectDropdown
            value={location}
            onChange={setLocation}
            options={LOCATION_OPTIONS}
            icon={MapPin}
            theme="dark"
            variant="inline"
            ariaLabel="Filter by location"
          />
        </div>

        <div className="w-full lg:w-40">
          <SelectDropdown
            value={dateRange}
            onChange={setDateRange}
            options={DATE_OPTIONS}
            icon={Calendar}
            theme="dark"
            variant="inline"
            ariaLabel="Filter by date"
          />
        </div>

        <div className="w-full lg:w-44">
          <SelectDropdown
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS}
            icon={Grid}
            theme="dark"
            variant="inline"
            ariaLabel="Filter by category"
          />
        </div>

        <div className="w-full lg:w-auto lg:pl-2 pt-1 lg:pt-0">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full lg:w-auto bg-brand-purple hover:bg-indigo-500 text-white rounded-xl px-6 py-2.5 shadow-glow gap-2 whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            <span>Search Events</span>
          </Button>
        </div>
      </form>
    );
  }

  if (variant === 'editorial') {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/15 p-3 shadow-2xl space-y-2.5 focus-within:border-brand-purple/60 transition-colors"
      >
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <SelectDropdown
            value={location}
            onChange={setLocation}
            options={LOCATION_OPTIONS}
            icon={MapPin}
            iconClassName="text-brand-coral"
            theme="dark"
            variant="boxed"
            ariaLabel="Filter by location"
          />

          <SelectDropdown
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS}
            icon={Grid}
            iconClassName="text-indigo-300"
            theme="dark"
            variant="boxed"
            ariaLabel="Filter by category"
          />
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl sm:rounded-full p-2.5 sm:p-2 shadow-2xl border border-white/30 flex flex-col sm:flex-row items-center gap-2 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-brand-purple/40"
    >
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

      <div className="w-full sm:w-52">
        <SelectDropdown
          value={location}
          onChange={setLocation}
          options={LOCATION_OPTIONS}
          icon={MapPin}
          iconClassName="text-brand-coral"
          theme="light"
          variant="inline"
          ariaLabel="Filter by location"
        />
      </div>

      <div className="w-full sm:w-52">
        <SelectDropdown
          value={category}
          onChange={setCategory}
          options={CATEGORY_OPTIONS}
          icon={Grid}
          theme="light"
          variant="inline"
          ariaLabel="Filter by category"
        />
      </div>

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
