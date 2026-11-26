import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ArrowUpRight, ArrowRight, Users, Calendar } from 'lucide-react';
import { formatDateBadge, formatEventDate } from '../../utils/date';
import { formatPaiseToINR, formatPriceStarting } from '../../utils/currency';
import { getEventImage, FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';

function getCompactPriceLabel(ticketTypes) {
  if (!ticketTypes || !Array.isArray(ticketTypes) || ticketTypes.length === 0) {
    return 'Free';
  }
  const activeTiers = ticketTypes.filter((t) => t.isActive !== false);
  if (activeTiers.length === 0) return 'Sold Out';
  const minPrice = Math.min(...activeTiers.map((t) => Number(t.price || 0)));
  if (minPrice === 0) return 'Free';
  return formatPaiseToINR(minPrice);
}

export default function EventCard({ event, variant = 'default' }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => getEventImage(event));

  const dateBadge = formatDateBadge(event.startsAt);
  const priceDisplay = formatPriceStarting(event.ticketTypes);
  const minPriceFormatted = getCompactPriceLabel(event.ticketTypes);
  const eventHref = event.isDemo
    ? `/events?search=${encodeURIComponent(event.title || '')}`
    : `/events/${event._id || event.id}`;

  const verifiedAttendeeCount = event.attendeeCount ?? event.goingCount ?? null;

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_EVENT_IMAGE) {
      setImgSrc(FALLBACK_EVENT_IMAGE);
    }
  };

  // 1. DARK SPOTLIGHT CARD (Large Featured Card on Left)
  if (variant === 'dark-spotlight') {
    const tagText = event.categoryLabel || (event.isDemo ? 'Festival • Preview' : 'Featured');

    return (
      <article className="group relative h-full min-h-[340px] lg:min-h-[380px] rounded-2xl overflow-hidden bg-[#10162B] border border-indigo-400/30 hover:border-indigo-400/60 shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-all duration-300 flex flex-col justify-between p-6">
        <Link to={eventHref} className="absolute inset-0 z-0">
          <img
            src={imgSrc}
            alt={event.title || 'Featured event'}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D1A] via-[#090D1A]/50 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090D1A]/75 via-transparent to-transparent" />
        </Link>

        {/* Top Row: Category Badge + Favorite */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-navy/75 backdrop-blur-md text-slate-200 border border-white/15">
            {tagText}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorite((prev) => !prev);
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className={`p-2 rounded-full backdrop-blur-md border transition-all duration-200 cursor-pointer ${
              isFavorite
                ? 'bg-brand-coral border-brand-coral text-white'
                : 'bg-black/40 border-white/15 text-white/80 hover:bg-black/70 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Metadata + Price + Circular Arrow */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-16">
          <div className="space-y-2 min-w-0">
            <Link to={eventHref} className="block">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white group-hover:text-indigo-200 transition-colors leading-tight">
                {event.title}
              </h3>
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-coral" />
                {formatEventDate(event.startsAt, 'dd MMM yyyy')}
              </span>
              <span className="inline-flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                {event.venue || 'Venue TBD'}
              </span>
            </div>
          </div>

          <Link to={eventHref} className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 mr-1.5">From</span>
              <span className="text-lg font-extrabold text-white">{minPriceFormatted}</span>
            </div>
            <span className="w-9 h-9 rounded-full bg-white text-brand-navy flex items-center justify-center shadow-md group-hover:bg-brand-purple group-hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </article>
    );
  }

  // 2. DARK COMPACT STACKED CARD (Two stacked cards on Right)
  if (variant === 'dark-compact') {
    const tagText = event.categoryLabel || (event.isDemo ? 'Preview' : 'Live Event');

    return (
      <article className="group relative flex-1 min-h-[175px] rounded-2xl overflow-hidden bg-[#10162B] border border-indigo-400/25 hover:border-indigo-400/55 shadow-lg transition-all duration-300 flex flex-col justify-between p-5">
        {/* Right-weighted blended photography */}
        <Link to={eventHref} className="absolute inset-0 z-0">
          <img
            src={imgSrc}
            alt={event.title || 'Event cover'}
            onError={handleImageError}
            className="w-full h-full object-cover object-right transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C1122] via-[#0C1122]/90 to-[#0C1122]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C1122]/85 via-transparent to-black/20" />
        </Link>

        {/* Top Row: Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md text-slate-200 border border-white/15">
            {tagText}
          </span>
        </div>

        {/* Bottom Row: Title + Meta on Left, Price + Arrow on Right */}
        <div className="relative z-10 flex items-end justify-between gap-4 pt-6">
          <div className="space-y-1.5 min-w-0">
            <Link to={eventHref} className="block">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white group-hover:text-indigo-200 transition-colors leading-snug line-clamp-2">
                {event.title}
              </h3>
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-brand-coral" />
                {formatEventDate(event.startsAt, 'dd MMM yyyy')}
              </span>
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-indigo-300" />
                {event.venue || 'Venue TBD'}
              </span>
            </div>
          </div>

          <Link to={eventHref} className="flex items-center gap-2.5 shrink-0">
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 leading-none">From</span>
              <span className="text-base font-extrabold text-white">{minPriceFormatted}</span>
            </div>
            <span className="w-8 h-8 rounded-full bg-white text-brand-navy flex items-center justify-center shadow-md group-hover:bg-brand-purple group-hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </article>
    );
  }

  // 3. DEFAULT CARD (Preserved for EventsExplore.jsx and other light surfaces)
  return (
    <article className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <Link to={eventHref} className="relative aspect-[16/10] overflow-hidden bg-brand-navy block">
        <img
          src={imgSrc}
          alt={event.title || 'Event cover'}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/20 to-black/25" />

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
