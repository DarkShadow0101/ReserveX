import React, { useState } from 'react';
import { Search, MapPin, Grid, Calendar, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import SelectDropdown from '../ui/SelectDropdown';
import { useTheme } from '../../context/ThemeContext';

const LOCATION_OPTIONS = [
  { value: '', label: 'All Cities' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Bengaluru', label: 'Bengaluru' },
  { value: 'Goa', label: 'Goa' },
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

export default function SearchFilterBar({
  onSearch,
  initialSearch = '',
  initialLocation = '',
  initialDate = '',
  initialCategory = '',
  variant = 'pill'
}) {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [dateRange, setDateRange] = useState(initialDate);
  const [category, setCategory] = useState(initialCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ search: searchTerm, location, date: dateRange, category });
    }
  };

  if (variant === 'dark-glass') {
    return (
      <form
        onSubmit={handleSubmit}
        className={`w-full backdrop-blur-xl rounded-xl p-1.5 shadow-card border flex flex-col lg:flex-row items-stretch lg:items-center gap-1.5 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x transition-colors ${
          isDark
            ? 'bg-[#11131B]/95 border-white/15 divide-white/10 focus-within:border-white/35'
            : 'bg-white/95 border-slate-900/12 divide-slate-900/10 focus-within:border-[#D9381E]/50 shadow-[0_14px_34px_rgba(15,23,42,0.09)]'
        }`}
      >
        <div className="w-full lg:flex-1 min-w-0 flex items-center gap-2.5 px-3.5 py-2">
          <Search className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} aria-hidden="true" />
          <input
            type="text"
            aria-label="Search events"
            placeholder="Search events, artists, venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none ${
              isDark
                ? 'text-[#F4F1EA] placeholder-slate-400 focus-visible:text-white'
                : 'text-slate-900 placeholder-slate-500'
            }`}
          />
        </div>

        <div className="w-full lg:w-40 shrink-0">
          <SelectDropdown
            value={location}
            onChange={setLocation}
            options={LOCATION_OPTIONS}
            icon={MapPin}
            variant="inline"
            ariaLabel="Filter by location"
          />
        </div>

        <div className="w-full lg:w-40 shrink-0">
          <SelectDropdown
            value={dateRange}
            onChange={setDateRange}
            options={DATE_OPTIONS}
            icon={Calendar}
            variant="inline"
            ariaLabel="Filter by date"
          />
        </div>

        <div className="w-full lg:w-48 shrink-0">
          <SelectDropdown
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS}
            icon={Grid}
            variant="inline"
            ariaLabel="Filter by category"
          />
        </div>

        <div className="w-full lg:w-auto lg:pl-1.5 pt-1 lg:pt-0">
          <Button
            type="submit"
            variant="ivory"
            size="md"
            title="Search events"
            aria-label="Search Events"
            className="w-full lg:w-10 lg:h-10 lg:p-0 rounded-lg flex items-center justify-center shrink-0"
          >
            <span className="lg:hidden mr-2">Search Events</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full rounded-2xl border p-3 shadow-card space-y-2.5 transition-colors ${
        isDark
          ? 'bg-[#101219] border-white/15 focus-within:border-[#FF4D2D]/60'
          : 'bg-white border-slate-900/12 focus-within:border-[#D9381E]/60'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div
          className={`flex-1 flex items-center border rounded-xl px-4 py-3 transition-colors ${
            isDark
              ? 'bg-[#090A0E] border-white/10 focus-within:border-[#FF4D2D]'
              : 'bg-slate-50 border-slate-900/12 focus-within:border-[#D9381E]'
          }`}
        >
          <Search className="w-4 h-4 text-[#D9381E] shrink-0 mr-3" />
          <input
            type="text"
            aria-label="Search events"
            placeholder="Search artists, festivals, venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-transparent text-sm font-medium focus:outline-none ${
              isDark ? 'text-[#F4F1EA] placeholder-slate-400' : 'text-slate-900 placeholder-slate-500'
            }`}
          />
        </div>

        <Button type="submit" variant="primary" size="md" className="rounded-xl px-6 py-3 shrink-0">
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
          iconClassName="text-[#D9381E]"
          variant="boxed"
          ariaLabel="Filter by location"
        />

        <SelectDropdown
          value={category}
          onChange={setCategory}
          options={CATEGORY_OPTIONS}
          icon={Grid}
          variant="boxed"
          ariaLabel="Filter by category"
        />
      </div>
    </form>
  );
}
