import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Users } from 'lucide-react';
import { formatDateBadge } from '../../utils/date';
import { formatPriceStarting } from '../../utils/currency';
import { getEventImage } from '../../mocks/eventImages';

export default function EventCard({ event, featured = false }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const imageUrl = getEventImage(event);
  const dateBadge = formatDateBadge(event.startsAt);
  const priceDisplay = formatPriceStarting(event.ticketTypes);

  // Generate fake attendee count for visual fidelity matching Design 1
  const goingCount = event.goingCount || `${((event.title?.length || 10) * 0.3 + 1.2).toFixed(1)}K+ going`;

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col">
      {/* Event Photography with Date Badge & Favorite Button */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={imageUrl}
          alt={event.title || 'Event image'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Date Badge (Top-Left) */}
        <div className="absolute top-3.5 left-3.5 bg-black/75 backdrop-blur-md text-white rounded-xl px-2.5 py-1.5 text-center shadow-lg border border-white/10 select-none">
          <span className="block text-[9px] font-bold tracking-widest text-slate-300">
            {dateBadge.day}
          </span>
          <span className="block text-base font-extrabold leading-none text-white my-0.5">
            {dateBadge.date}
          </span>
          <span className="block text-[9px] font-bold tracking-wider text-brand-purple">
            {dateBadge.month}
          </span>
        </div>

        {/* Favorite Heart (Top-Right) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-black/40 text-white/90 hover:bg-black/70 hover:text-white'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom image overlay: Status if not published */}
        {event.status && event.status !== 'published' && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow">
              {event.status}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/events/${event._id || event.id}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-purple transition-colors line-clamp-1 font-sans">
              {event.title}
            </h3>
          </Link>

          {/* Venue & Location */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.venue || 'Venue to be announced'}</span>
          </div>
        </div>

        {/* Card Footer: Starting Price & Going Badge */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900">{priceDisplay}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Avatar cluster */}
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-indigo-500 text-[9px] font-bold text-white flex items-center justify-center">
                A
              </span>
              <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center">
                R
              </span>
              <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-emerald-500 text-[9px] font-bold text-white flex items-center justify-center">
                S
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">{goingCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
