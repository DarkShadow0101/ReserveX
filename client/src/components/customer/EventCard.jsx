import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ArrowUpRight, Users, Calendar } from 'lucide-react';
import { formatDateBadge, formatEventDate } from '../../utils/date';
import { formatPriceStarting } from '../../utils/currency';
import { getEventImage, FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';

export default function EventCard({ event, variant = 'default' }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => getEventImage(event));

  const dateBadge = formatDateBadge(event.startsAt);
  const priceDisplay = formatPriceStarting(event.ticketTypes);
  const eventHref = event.isDemo
    ? `/events?search=${encodeURIComponent(event.title || '')}`
    : `/events/${event._id || event.id}`;

  const verifiedAttendeeCount = event.attendeeCount ?? event.goingCount ?? null;

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_EVENT_IMAGE) {
      setImgSrc(FALLBACK_EVENT_IMAGE);
    }
  };

  // 1. SPOTLIGHT EDITORIAL CARD (Large immersive feature card)
  if (variant === 'spotlight') {
    return (
      <article className="group relative h-full min-h-[420px] lg:min-h-[500px] rounded-3xl overflow-hidden bg-brand-navy shadow-card hover:shadow-2xl transition-all duration-300 flex flex-col justify-end">
        <Link to={eventHref} className="absolute inset-0 z-0">
          <img
            src={imgSrc}
            alt={event.title || 'Featured event'}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/55 to-black/20" />
        </Link>

        {/* Top Row: Date Badge + Favorite */}
        <div className="absolute top-5 left-5 right-5 z-10 flex items-start justify-between">
          <div className="bg-brand-navy/85 backdrop-blur-md text-white rounded-2xl px-3.5 py-2 text-center shadow-lg border border-white/15 select-none">
            <span className="block text-[10px] font-bold tracking-widest text-slate-300">
              {dateBadge.day}
            </span>
            <span className="block text-xl font-extrabold leading-tight text-white">
              {dateBadge.date}
            </span>
            <span className="block text-[10px] font-bold tracking-wider text-indigo-300">
              {dateBadge.month}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {event.isDemo && (
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md text-slate-200 border border-white/15">
                Demo Preview
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite((prev) => !prev);
              }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all duration-200 cursor-pointer ${
                isFavorite
                  ? 'bg-brand-coral border-brand-coral text-white shadow-md'
                  : 'bg-black/40 border-white/15 text-white/90 hover:bg-black/70'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Editorial Content */}
        <div className="relative z-10 p-6 sm:p-8 space-y-4">
          <div className="space-y-2">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-indigo-300">
              Headline Spotlight
            </span>
            <Link to={eventHref} className="block">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white group-hover:text-indigo-100 transition-colors leading-tight">
                {event.title}
              </h3>
            </Link>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200/90 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-coral" />
                {event.venue || 'Venue to be announced'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-300" />
                {formatEventDate(event.startsAt, 'EEE, dd MMM • hh:mm a')}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 flex items-center justify-between gap-4">
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-300">
                Starting from
              </span>
              <span className="text-lg font-extrabold text-white">{priceDisplay}</span>
            </div>

            <Link
              to={eventHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-brand-navy hover:bg-warm-100 text-xs sm:text-sm font-bold shadow-lg transition-all"
            >
              <span>Reserve Pass</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // 2. COMPACT HORIZONTAL EDITORIAL CARD (Stacked alongside spotlight)
  if (variant === 'compact') {
    return (
      <article className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col sm:flex-row">
        <Link
          to={eventHref}
          className="relative sm:w-44 md:w-48 aspect-[16/10] sm:aspect-auto overflow-hidden bg-brand-navy shrink-0 block"
        >
          <img
            src={imgSrc}
            alt={event.title || 'Event cover'}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-black/20" />

          {/* Date Badge */}
          <div className="absolute top-3 left-3 bg-brand-navy/85 backdrop-blur-md text-white rounded-xl px-2.5 py-1 text-center border border-white/15 select-none">
            <span className="block text-[9px] font-bold tracking-widest text-slate-300">
              {dateBadge.day}
            </span>
            <span className="block text-sm font-extrabold leading-tight text-white">
              {dateBadge.date} {dateBadge.month}
            </span>
          </div>
        </Link>

        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5 min-w-0">
              {event.isDemo && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-warm-200 text-slate-600">
                  Demo Preview
                </span>
              )}
              <Link to={eventHref} className="block">
                <h3 className="text-lg font-serif font-bold text-slate-900 group-hover:text-brand-purple transition-colors line-clamp-2 leading-snug">
                  {event.title}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-brand-coral shrink-0" />
                <span className="truncate">{event.venue || 'Venue to be announced'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite((prev) => !prev);
              }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              className={`p-2 rounded-full border transition-all shrink-0 cursor-pointer ${
                isFavorite
                  ? 'bg-brand-coral border-brand-coral text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-sm font-bold text-slate-900">{priceDisplay}</span>
            </div>

            <Link
              to={eventHref}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple group-hover:text-indigo-700 transition-colors"
            >
              <span>View Event</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // 3. DEFAULT CARD (Used in EventsExplore and general grids)
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
