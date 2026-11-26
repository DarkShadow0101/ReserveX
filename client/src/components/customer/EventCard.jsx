import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ArrowUpRight, Users } from 'lucide-react';
import { formatDateBadge } from '../../utils/date';
import { formatPriceStarting } from '../../utils/currency';
import { getEventImage, FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';

export default function EventCard({ event }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => getEventImage(event));

  const dateBadge = formatDateBadge(event.startsAt);
  const priceDisplay = formatPriceStarting(event.ticketTypes);
  const eventHref = event.isDemo
    ? `/events?search=${encodeURIComponent(event.title || '')}`
    : `/events/${event._id || event.id}`;

  const verifiedAttendeeCount = event.attendeeCount ?? event.goingCount ?? null;

  return (
    <article className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Event Photography */}
      <Link to={eventHref} className="relative aspect-[16/10] overflow-hidden bg-brand-navy block">
        <img
          src={imgSrc}
          alt={event.title || 'Event cover'}
          onError={() => {
            if (imgSrc !== FALLBACK_EVENT_IMAGE) {
              setImgSrc(FALLBACK_EVENT_IMAGE);
            }
          }}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/20 to-black/25" />

        {/* Date Badge (Top-Left) */}
        <div className="absolute top-3.5 left-3.5 bg-brand-navy/85 backdrop-blur-md text-white rounded-2xl px-3 py-1.5 text-center shadow-lg border border-white/15 select-none">
          <span className="block text-[9px] font-bold tracking-widest text-slate-300">
            {dateBadge.day}
          </span>
          <span className="block text-base font-extrabold leading-tight text-white">
            {dateBadge.date}
          </span>
          <span className="block text-[9px] font-bold tracking-wider text-indigo-300">
            {dateBadge.month}
          </span>
        </div>

        {/* Favorite Heart (Top-Right) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite((prev) => !prev);
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-3.5 right-3.5 p-2.5 rounded-full backdrop-blur-md border transition-all duration-200 cursor-pointer ${
            isFavorite
              ? 'bg-brand-coral border-brand-coral text-white shadow-md scale-105'
              : 'bg-black/35 border-white/15 text-white/90 hover:bg-black/60 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Badges */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
          {event.status && event.status !== 'published' ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/95 text-white shadow-sm">
              {event.status}
            </span>
          ) : (
            <span />
          )}

          {event.isDemo && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md text-slate-200 border border-white/15">
              Demo Preview
            </span>
          )}
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <Link to={eventHref} className="block">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-purple transition-colors line-clamp-1 font-sans">
              {event.title}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-brand-coral shrink-0" />
            <span className="truncate">{event.venue || 'Venue to be announced'}</span>
          </div>
        </div>

        {/* Card Footer: Starting Price & Verified Action */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Tickets
            </span>
            <span className="text-sm font-bold text-slate-900">{priceDisplay}</span>
          </div>

          {verifiedAttendeeCount ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-warm-100 px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5 text-brand-purple" />
              <span>{verifiedAttendeeCount}</span>
            </div>
          ) : (
            <Link
              to={eventHref}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-purple group-hover:text-indigo-700 transition-colors"
            >
              <span>View Event</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
