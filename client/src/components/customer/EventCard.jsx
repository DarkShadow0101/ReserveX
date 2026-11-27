import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ArrowRight, Users } from 'lucide-react';
import { formatDateBadge } from '../../utils/date';
import { formatPaiseToINR, formatPriceStarting } from '../../utils/currency';
import { getEventImage, FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';
import { useToast } from '../../context/ToastContext';

const FAVORITES_KEY = 'reservex-favorites';

function readSavedFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getCompactPriceLabel(ticketTypes) {
  if (!ticketTypes || !Array.isArray(ticketTypes) || ticketTypes.length === 0) {
    return 'View Tiers';
  }
  const activeTiers = ticketTypes.filter((t) => t.isActive !== false);
  if (activeTiers.length === 0) return 'Sold Out';
  const minPrice = Math.min(...activeTiers.map((t) => Number(t.price || 0)));
  if (minPrice === 0) return 'Free';
  return formatPaiseToINR(minPrice);
}

export default function EventCard({ event, variant = 'default' }) {
  const { showToast } = useToast();
  const eventKey = String(event._id || event.id || event.title || '');
  const [isFavorite, setIsFavorite] = useState(() => readSavedFavorites().includes(eventKey));
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

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      const current = readSavedFavorites();
      const updated = nextState
        ? Array.from(new Set([...current, eventKey]))
        : current.filter((item) => item !== eventKey);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
    showToast(
      nextState ? `Saved "${event.title}"` : `Removed "${event.title}" from saved`,
      nextState ? 'accent' : 'info'
    );
  };

  const isComedyStage =
    !event.image &&
    (`${event.categoryLabel || ''} ${event.title || ''} ${event.description || ''}`
      .toLowerCase()
      .match(/comedy|standup|laughter/) !== null);

  // REFINED 3B EQUAL BENTO CARD (Used in the 3-column Home fold grid)
  if (variant === 'bento-open') {
    return (
      <article
        data-photo-overlay="true"
        className="group relative h-48 sm:h-52 rounded-2xl overflow-hidden bg-[#101219] border border-white/15 hover:border-white/35 focus-within:ring-2 focus-within:ring-[#FF4D2D] shadow-card transition-all duration-300 active:scale-[0.985] flex flex-col justify-between p-4"
      >
        <Link
          to={eventHref}
          aria-label={`View ${event.title || 'event'} in ${event.venue || 'India'} starting ${minPriceFormatted}`}
          className="absolute inset-0 z-10 rounded-2xl focus:outline-none"
        />

        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={imgSrc}
            alt={event.title || 'Featured live event'}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
              isComedyStage
                ? 'object-[center_82%] sepia-[0.42] hue-rotate-[-8deg] saturate-[1.45] contrast-[1.1] brightness-[1.06]'
                : 'object-center contrast-[1.06] saturate-[1.12]'
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-[#060709]/40 to-black/25" />
        </div>

        {/* Top Row: High-Contrast Live Pill + Date Tag */}
        <div className="relative z-20 pointer-events-none flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981] text-[#04140D] font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#04140D]" />
            OPEN
          </span>

          {dateBadge && dateBadge.date !== '--' && (
            <span className="px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 font-mono text-[11px] font-medium text-slate-200">
              {dateBadge.date} {dateBadge.month}
            </span>
          )}
        </div>

        {/* Bottom Metadata Row: Title + City on Left, Price on Right */}
        <div className="relative z-20 pointer-events-none flex items-end justify-between gap-3 pt-8">
          <div className="min-w-0">
            <h3 className="font-sans text-base sm:text-lg font-bold tracking-tight text-white truncate group-hover:text-[#F4F1EA]">
              {event.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="truncate">{event.venue || 'Venue TBD'}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="block font-mono text-[11px] uppercase tracking-wider text-slate-300 leading-none mb-0.5">
              {minPriceFormatted.startsWith('₹') ? 'From' : ''}
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-white">
              {minPriceFormatted}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // GRID CARD (Used in EventsExplore)
  return (
    <article className="group relative bg-[#101219] rounded-2xl overflow-hidden border border-white/10 hover:border-[#FF4D2D]/55 shadow-soft hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 flex flex-col">
      <Link data-photo-overlay="true" to={eventHref} className="relative aspect-[16/10] overflow-hidden bg-[#060709] block">
        <img
          src={imgSrc}
          alt={event.title || 'Event cover'}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101219] via-[#060709]/25 to-black/25 pointer-events-none" />

        <div className="absolute top-3.5 left-3.5 bg-[#090A0E]/90 text-white rounded-xl px-3 py-1.5 text-center border border-white/15 select-none">
          <span className="block font-mono text-[9px] font-bold tracking-widest text-slate-300">
            {dateBadge.day}
          </span>
          <span className="block font-mono text-base font-bold leading-tight text-white">
            {dateBadge.date}
          </span>
          <span className="block font-mono text-[9px] font-bold tracking-wider text-[#FF4D2D]">
            {dateBadge.month}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-3.5 right-3.5 p-2 rounded-full border transition-all duration-200 active:scale-125 cursor-pointer ${
            isFavorite
              ? 'bg-[#D9381E] border-[#D9381E] text-white scale-105'
              : 'bg-[#090A0E]/75 border-white/15 text-white/85 hover:bg-[#090A0E] hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-current scale-110' : ''}`} />
        </button>

        {event.isDemo && (
          <div className="absolute bottom-3 right-3.5">
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider bg-[#090A0E]/85 text-slate-200 border border-white/15">
              Demo Preview
            </span>
          </div>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={eventHref} className="block">
            <h3 className="text-lg font-sans font-bold tracking-tight text-white group-hover:text-[#D9381E] transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-[#D9381E] shrink-0" />
            <span className="truncate">{event.venue || 'Venue to be announced'}</span>
          </div>
        </div>

        <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between gap-3">
          <div>
            <span className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Tickets
            </span>
            <span className="font-mono text-sm font-bold text-white">{priceDisplay}</span>
          </div>

          {verifiedAttendeeCount ? (
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300 bg-white/[0.06] px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{verifiedAttendeeCount}</span>
            </div>
          ) : (
            <Link
              to={eventHref}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 group-hover:text-white transition-colors"
            >
              <span>View Event</span>
              <span className="w-7 h-7 rounded-full bg-[#D9381E] text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
