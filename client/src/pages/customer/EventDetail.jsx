import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Building,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import { ticketTypesApi } from '../../api/ticketTypes.api';
import { bookingsApi } from '../../api/bookings.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatEventDate } from '../../utils/date';
import { formatPaiseToINR } from '../../utils/currency';
import { getEventImage, FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';
import { extractErrorMessage } from '../../utils/errors';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imgSrc, setImgSrc] = useState(FALLBACK_EVENT_IMAGE);

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        setLoading(true);
        setError(null);

        const [eventRes, ticketsRes] = await Promise.all([
          eventsApi.getPublicEventById(id),
          ticketTypesApi.getTicketTypesForEvent(id)
        ]);

        const ev = eventRes.data?.event;
        const tiers = ticketsRes.data?.ticketTypes || [];

        setEvent(ev);
        setImgSrc(getEventImage(ev));
        setTicketTypes(tiers);

        const initialQty = {};
        tiers.forEach((t) => {
          initialQty[t._id] = 0;
        });
        setQuantities(initialQty);
      } catch (err) {
        setError(extractErrorMessage(err, 'Could not load event details'));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const handleQuantityChange = (ticketTypeId, delta, maxAvailable) => {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] || 0;
      const next = Math.max(0, Math.min(maxAvailable, current + delta));
      return { ...prev, [ticketTypeId]: next };
    });
  };

  const calculateTotalPaise = () => {
    let total = 0;
    ticketTypes.forEach((tier) => {
      const qty = quantities[tier._id] || 0;
      total += qty * (tier.price || 0);
    });
    return total;
  };

  const totalSelectedTickets = Object.values(quantities).reduce((acc, q) => acc + q, 0);
  const totalAmountPaise = calculateTotalPaise();

  const handleBookingHold = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events/${id}`);
      return;
    }

    if (totalSelectedTickets === 0) {
      setError('Please select at least 1 ticket to proceed.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const items = ticketTypes
        .filter((tier) => (quantities[tier._id] || 0) > 0)
        .map((tier) => ({
          ticketTypeId: tier._id,
          quantity: quantities[tier._id]
        }));

      const res = await bookingsApi.createBookingHold({
        eventId: event._id,
        items
      });

      const booking = res.data?.booking;
      if (booking?._id) {
        showToast('Seats held for 10 minutes! Complete checkout.');
        navigate(`/checkout/${booking._id}`);
      } else {
        throw new Error('No booking returned from server');
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to reserve ticket hold. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    const eventAlreadyStarted = !!(event?.startsAt && new Date(event.startsAt) <= new Date());

  return (
      <div className="pt-32 pb-20">
        <LoadingSpinner text="Loading event details..." size="lg" />
      </div>
    );
  }

  if (error && !event) {
    const eventAlreadyStarted = !!(event?.startsAt && new Date(event.startsAt) <= new Date());

  return (
      <div className="pt-32 pb-24 max-w-xl mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-sans font-bold text-white">Event Not Found</h2>
        <p className="text-sm text-slate-400">{error}</p>
        <Link to="/events" className="inline-block pt-2">
          <Button variant="primary" size="md" className="bg-[#FF4D2D] hover:bg-[#E63E20]">
            Back to All Events
          </Button>
        </Link>
      </div>
    );
  }

  const eventAlreadyStarted = !!(event?.startsAt && new Date(event.startsAt) <= new Date());

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore Events
        </Link>
      </div>

      {/* 1. Stage Cover Banner */}
      <div
        data-photo-overlay="true"
        className="relative rounded-2xl overflow-hidden shadow-card border border-white/10 aspect-[21/9] min-h-[340px] max-h-[480px] bg-[#0B0D12]"
      >
        <img
          src={imgSrc}
          alt={event.title}
          onError={() => {
            if (imgSrc !== FALLBACK_EVENT_IMAGE) {
              setImgSrc(FALLBACK_EVENT_IMAGE);
            }
          }}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-[#060709]/45 to-black/25" />

        <div className="absolute top-6 left-6 flex items-center gap-3">
          <Badge variant={event.status || 'published'} theme="dark" dot={true} className="backdrop-blur-md">
            {event.status || 'Published'}
          </Badge>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2.5 max-w-3xl">
            <h1 className="font-display uppercase text-3xl sm:text-5xl font-bold text-white tracking-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm text-slate-200">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FF4D2D]" />
                {formatEventDate(event.startsAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {event.venue || 'Venue TBD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Two-Column Main Content & Booking Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Event Description, Schedule, Organizer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#101219] rounded-2xl p-7 sm:p-8 border border-white/10 space-y-4">
            <h2 className="text-xl font-sans font-bold text-white">About this Event</h2>
            <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {event.description ||
                'Join us for an unforgettable live show featuring live performances and stage production. Reserve your tickets early to lock in your tier.'}
            </div>
          </div>

          <div className="bg-[#101219] rounded-2xl p-7 sm:p-8 border border-white/10 space-y-6">
            <h2 className="text-xl font-sans font-bold text-white">Schedule & Venue</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-[#FF4D2D] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Date & Time
                  </h4>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {formatEventDate(event.startsAt)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ends: {formatEventDate(event.endsAt, 'EEE, dd MMM • hh:mm a')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-[#FF4D2D] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Location
                  </h4>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {event.venue || 'Venue Address TBD'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Official venue gate entry</p>
                </div>
              </div>
            </div>
          </div>

          {/* Organizer Trust Card */}
          <div className="bg-[#101219] rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#F4F1EA] shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Organized by
                </p>
                <h4 className="text-base font-bold text-white">
                  {event.organization?.name || 'Verified Event Organizer'}
                </h4>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#34D399] font-semibold bg-[#10B981]/15 border border-[#10B981]/30 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4" /> Verified Organizer
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Ticket Tier Selection Panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-[#101219] rounded-2xl border border-white/15 shadow-card p-6 sm:p-8 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-2xl font-sans font-bold text-white">Select Tickets</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your seats are held for 10 minutes while you complete payment.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/15 border border-rose-400/30 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3.5">
              {ticketTypes.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-white/10 rounded-xl">
                  No ticket tiers currently active for this event.
                </div>
              ) : (
                ticketTypes.map((tier) => {
                  const available =
                    tier.availableCapacity !== undefined
                      ? tier.availableCapacity
                      : Math.max(0, tier.totalCapacity - ((tier.reservedCount || 0) + (tier.soldCount || 0)));
                  const isSoldOut = available <= 0;
                  const qty = quantities[tier._id] || 0;

                  const eventAlreadyStarted = !!(event?.startsAt && new Date(event.startsAt) <= new Date());

  return (
                    <div
                      key={tier._id}
                      className={`p-4 rounded-xl border transition-all ${
                        qty > 0
                          ? 'border-[#FF4D2D] bg-[#FF4D2D]/10'
                          : 'border-white/10 bg-[#090A0E] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">{tier.name}</h4>
                          <p className="text-xs text-slate-400">
                            {tier.description || 'General Admission'}
                          </p>
                          <div className="pt-1.5 flex items-center gap-2.5">
                            <span className="font-mono text-base font-bold text-white">
                              {formatPaiseToINR(tier.price)}
                            </span>
                            <span
                              className={`font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                isSoldOut
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-400/30'
                                  : available < 10
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                                  : 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30'
                              }`}
                            >
                              {isSoldOut ? 'Sold Out' : `${available} left`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-[#12151E] rounded-lg border border-white/15 p-1">
                          <button
                            type="button"
                            disabled={qty === 0}
                            onClick={() => handleQuantityChange(tier._id, -1, available)}
                            aria-label={`Decrease quantity for ${tier.name}`}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono w-6 text-center text-sm font-bold text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            disabled={isSoldOut || qty >= available || qty >= 10}
                            onClick={() => handleQuantityChange(tier._id, 1, available)}
                            aria-label={`Increase quantity for ${tier.name}`}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-white/10 pt-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium">Selected Tickets</span>
                <span className="font-mono font-bold text-white">{totalSelectedTickets}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="font-bold text-white">Total Amount</span>
                <span className="font-mono text-2xl font-bold text-white">
                  {formatPaiseToINR(totalAmountPaise)}
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={submitting}
                disabled={eventAlreadyStarted || totalSelectedTickets === 0 || submitting}
                onClick={handleBookingHold}
                className="w-full rounded-xl bg-[#D9381E] hover:bg-[#C92C12] shadow-glow py-3.5 text-base"
              >
                {eventAlreadyStarted
                  ? 'Booking Closed (Event Started)'
                  : isAuthenticated
                  ? 'Continue to Checkout'
                  : 'Sign In to Reserve'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Instant digital QR passes issued upon confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
